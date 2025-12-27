import { FC, useState, useEffect, useCallback, useRef, HTMLAttributes } from "react";
import Card from "../../components/CardNew";
import { getCard } from "../../components/Cards";

import CardEmpty from "../../components/CardEmpty";
import { useGame } from "../GameProvider";
import { useWS } from "../WsProvider";
import interact from "interactjs";
import {
  setSelectedCard as setGlobalSelectedCard,
  getSelectedCard as getGlobalSelectedCard,
  setState as setGlobalState,
  getState as getGlobalState,
  setGameStarted,
} from "../../utils/gameState";

interface Props extends HTMLAttributes<HTMLElement> {
  removeCard?: (cardId: string) => void;
}

const GameBoard: FC<Props> = ({ children, removeCard }) => {
  const WSProvider = useWS();

  const generateBoard = (x: number, y: number) => {
    const columns: any = Array(x)
      .fill(0)
      .map(() => null);

    const rows: any = Array(y)
      .fill(0)
      .map(() => [...columns]);

    return rows;
  };
  const { gameState, isMyTurn, players, selectedCard } = useGame();

  const [board, setBoard] = useState(generateBoard(7, 5));
  const [cardError, setCardError] = useState<any>([]);
  const [lastPlayedCard, setLastPlayedCard] = useState<any>(null);

  // Track which card we're currently animating - stored as "suit-value" string
  // This ref is the SINGLE SOURCE OF TRUTH for animation state
  const animatingCardIdRef = useRef<string | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track the last card we processed from gameState to detect new cards from opponents
  const lastProcessedServerCardRef = useRef<string | null>(null);

  const playCardBeep = new Audio("../../sounds/play-card.mp3");

  const getColor = useCallback(
    (userId) => () => {
      if (userId === "system") {
        return "#2D3038";
      }
      const foundPlayer = players.find(
        (player: any) => player.userId === userId
      );

      return foundPlayer ? foundPlayer.color : "gray";
    },
    [players]
  );

  const getSkew = useCallback(
    (index) => () => {
      if (!index || index === 0) {
        return "";
      }
      return `rotate(${index * 4}deg)`;
    },
    []
  );

  useEffect(() => {
    setGlobalSelectedCard(selectedCard);
  }, [selectedCard]);

  useEffect(() => {
    setGlobalState(gameState);
  }, [gameState]);

  // Start animation for a card - this is the ONLY function that should set lastPlayedCard
  const startAnimation = useCallback((card: any, playSound = true) => {
    const cardId = `${card.suit}-${card.value}`;

    // If we're already animating this exact card, do nothing
    if (animatingCardIdRef.current === cardId) {
      return;
    }

    // Clear any existing animation timer
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }

    // Set the animation state
    animatingCardIdRef.current = cardId;
    setLastPlayedCard(card);

    if (playSound) {
      playCardBeep.play();
    }

    // Scroll to card if needed
    setTimeout(() => {
      const latestCard = document.getElementsByClassName("game-latest-card")[0];
      if (latestCard) {
        const rect = latestCard.getBoundingClientRect();
        const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!inView) {
          latestCard.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
    }, 0);

    // End animation after 2 seconds
    animationTimerRef.current = setTimeout(() => {
      setLastPlayedCard(null);
      animatingCardIdRef.current = null;
    }, 2000);
  }, []);

  const addCardToBoard = useCallback(
    (rowIndex: number, columnIndex: number, card: any = selectedCard) => {
      const row = Number(rowIndex);
      const column = Number(columnIndex);

      setBoard((prevBoard: any) => {
        const localBoard = [...prevBoard];

        const placeToPutCard = localBoard[row][column];

        if (
          placeToPutCard &&
          placeToPutCard !== "empty" &&
          Array.isArray(placeToPutCard)
        ) {
          if (
            !placeToPutCard.find(
              (existingCard) =>
                existingCard.value === card.value &&
                existingCard.suit === card.suit
            )
          ) {
            localBoard[row][column] = [...localBoard[row][column], card];
          }
        } else {
          localBoard[row][column] = [card];
        }

        if (
          localBoard[row][column + 1] !== undefined &&
          localBoard[row][column + 1] === null
        ) {
          localBoard[row][column + 1] = "empty";
        }

        if (
          localBoard[row][column - 1] !== undefined &&
          localBoard[row][column - 1] === null
        ) {
          localBoard[row][column - 1] = "empty";
        }

        if (
          localBoard[row - 1] !== undefined &&
          localBoard[row - 1][column] === null
        ) {
          localBoard[row - 1][column] = "empty";
        }

        if (
          localBoard[row + 1] !== undefined &&
          localBoard[row + 1][column] === null
        ) {
          localBoard[row + 1][column] = "empty";
        }

        return [...localBoard];
      });

      removeCard ? removeCard(card) : null;
    },
    [selectedCard, removeCard]
  );

  const addCard = useCallback(
    (rowIndex, columnIndex, card = selectedCard, state = gameState) =>
      () => {
        if (!card) {
          console.log("addCard no card", card, rowIndex, columnIndex);

          return;
        }
        console.log("addCard", card, rowIndex, columnIndex);

        const allowedPlacement =
          state.allowedUserCardsPlacement.additionalProperties[
            `${columnIndex}-${rowIndex}`
          ];

        console.log(rowIndex, columnIndex, state);

        if (!card || !allowedPlacement) {
          setCardError([rowIndex, columnIndex]);
          console.log("card error", rowIndex, columnIndex);
          setTimeout(() => {
            setCardError([]);
          }, 1000);

          return;
        }

        console.log(
          rowIndex,
          columnIndex,
          allowedPlacement,
          "allowedPlacement"
        );

        if (
          allowedPlacement &&
          !allowedPlacement.find(
            (allowedCard: any) =>
              allowedCard.value === "joker" && allowedCard.value === card.value
          ) &&
          !allowedPlacement.find(
            (allowedCard: any) =>
              allowedCard.suit.toLowerCase() === card.suit.toLowerCase() &&
              allowedCard.value === card.value
          )
        ) {
          // alert("Not allowed to place card there.");
          setCardError([rowIndex, columnIndex]);
          console.log("card error 2");
          console.log(rowIndex, columnIndex);

          setTimeout(() => {
            setCardError([]);
          }, 1000);
          return;
        }

        console.log("Playing card: ", card);

        // Optimistic UI - immediately add card to board and show animation
        // Use turnForPlayer from gameState as the current user's ID for proper color
        const cardWithUserId = {
          ...card,
          userId: state.turnForPlayer,
          scoringLevel: 0, // Will show 0 initially
        };
        addCardToBoard(rowIndex, columnIndex, cardWithUserId);

        // Start animation immediately for instant feedback (optimistic UI)
        startAnimation(cardWithUserId, true);

        WSProvider.send(
          JSON.stringify({
            event: "play-card",
            data: {
              action: "move",
              x: columnIndex,
              y: rowIndex,
              suit: card.suit,
              value: card.value.toString(),
              nftId: card.id ? card.id : "",
            },
          })
        );
      },
    [WSProvider, selectedCard, setCardError, addCardToBoard, startAnimation]
  );

  useEffect(() => {
    console.log("gameState:", gameState);
    if (!gameState) {
      return;
    }

    const tableCards = gameState.gameTableCards?.additionalProperties;
    if (!tableCards) {
      return;
    }

    console.log(
      Object.keys(gameState.allowedUserCardsPlacement?.additionalProperties || {})
        .length === 0,
      "length"
    );

    if (
      Object.keys(gameState.allowedUserCardsPlacement?.additionalProperties || {})
        .length === 0
    ) {
      setTimeout(() => {
        WSProvider.send(
          JSON.stringify({
            event: "play-card",
            data: {
              action: "pass",
            },
          })
        );
      }, 2000);
    }

    Object.keys(tableCards).forEach((key) => {
      const cards = gameState.gameTableCards?.additionalProperties;
      const indexes = key.split("-");

      cards[key].forEach((card: any) => {
        const cardF = getCard(card.suit, card.value, card);
        addCardToBoard(Number(indexes[1]), Number(indexes[0]), cardF);
      });
    });

    if (gameState.lastPlayedCard) {
      setGameStarted(true);
      const serverCardId = `${gameState.lastPlayedCard.suit}-${gameState.lastPlayedCard.value}`;

      // Only trigger animation if:
      // 1. This is a NEW card from server (different from last processed server card)
      // 2. AND we're not already animating this card (from optimistic UI)
      if (serverCardId !== lastProcessedServerCardRef.current &&
          serverCardId !== animatingCardIdRef.current) {
        // This is an opponent's card - animate it
        startAnimation(gameState.lastPlayedCard, true);
      }
      // Always update the last processed server card
      lastProcessedServerCardRef.current = serverCardId;
    }
  }, [gameState, startAnimation]);

  useEffect(() => {
    console.log("interact happens");
    interact.dynamicDrop(true);

    const position = { x: 0, y: 0 };

    interact(".draggable").draggable({
      autoScroll: { container: ".scroll-container", margin: 70, speed: 1000 },

      inertia: true,
      max: 1,

      listeners: {
        start(event) {
          console.log("start");

          event.target.style.transform = `translate(0px, 0px)`;
        },
        end(event) {
          console.log("ended", event);
          // event.target.style.display = `none`;
          position.x = 0;
          position.y = 0;

          event.target.style.transform = `translate(0px, 0px)`;
        },
        move(event) {
          position.x += event.dx;
          position.y += event.dy;

          // event.target.style.position = "absolute";
          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
        },
      },
    });

    interact(".dropzone").dropzone({
      // only accept elements matching this CSS selector
      accept: ".draggable",
      // Require a 75% element overlap for a drop to be possible
      overlap: 0.4,

      // listen for drop related events:

      // ondropactivate: function (event) {
      //   // add active dropzone feedback
      //   event.target.classList.add("drop-active");
      // },
      ondragenter: function (event) {
        // const draggableElement = event.relatedTarget;
        const dropzoneElement = event.target;
        // event.stopImmediatePropagation()

        // feedback the possibility of a drop
        dropzoneElement.classList.add("drop-target");
        // draggableElement.classList.add("can-drop");
        // draggableElement.textContent = 'Dragged in'
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove("drop-target");
      },
      ondrop: function (event) {
        console.log(selectedCard, "ondrop");
        console.log(event, "ondrop event");

        const target = event.currentTarget.id.split("-");
        addCard(
          Number(target[0]),
          Number(target[1]),
          getGlobalSelectedCard(),
          getGlobalState()
        )();
        event.stopImmediatePropagation();
      },

      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove("drop-active");
        event.target.classList.remove("drop-target");
      },
    });

    return () => {
      interact(".dropzone").unset();
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      css={() => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px",
        minHeight: "100vh",
      })}
    >
      <div>
        {board.map((row: any, rowIndex: number) => {
          return (
            <div
              key={rowIndex}
              css={() => ({
                display: "flex",
                justifyContent: "center",
              })}
            >
              {row.map((column: any, columnIndex: number) => {
                return (
                  <div
                    key={`${columnIndex}${rowIndex}-${columnIndex}${rowIndex}`}
                    css={() => ({
                      margin: column ? "20px" : "20px",
                      borderRadius: 10,
                      position: "relative",
                    })}
                  >
                    {!column && (
                      <div style={{ width: "210px", height: "300px" }}></div>
                    )}

                    {column &&
                      column[column.length - 1].suit &&
                      column[column.length - 1].value &&
                      lastPlayedCard?.value ===
                        column[column.length - 1].value &&
                      lastPlayedCard?.suit === column[column.length - 1].suit &&
                      (lastPlayedCard?.id || column[column.length - 1].id
                        ? lastPlayedCard?.id === column[column.length - 1].id
                        : true) && (
                        <div
                          key={animatingCardIdRef.current}
                          className="game-latest-card"
                          css={{
                            background: getColor(
                              column[column.length - 1].userId
                            )(),
                            outlineColor: getColor(
                              column[column.length - 1].userId
                            )(),
                            zIndex: 9999,
                          }}
                        >
                          <div className="game-latest-card__score">
                            {" "}
                            +{lastPlayedCard.scoringLevel}
                          </div>
                        </div>
                      )}

                    {column === "empty" && (
                      <CardEmpty
                        selectedCard={selectedCard}
                        key={`${columnIndex}${rowIndex}-${columnIndex}${rowIndex}`}
                        containerStyles={{
                          border:
                            cardError[0] === rowIndex &&
                            cardError[1] === columnIndex
                              ? "3px solid #FA5252"
                              : "3px dashed #222",
                          transition: "all 300ms",

                          "&:hover": {
                            border:
                              cardError[0] === rowIndex &&
                              cardError[1] === columnIndex
                                ? "3px solid #FA5252"
                                : "3px dashed #222",
                          },
                          "&::before": {
                            transition: "all 300ms",
                            position: "absolute",
                            content: `' '`,
                            background: "#000",
                            zIndex: 99999,
                            borderRadius: 20,
                            backgroundImage:
                              "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzIxMTZfMjU1MCkiPgo8cGF0aCBkPSJNMjUgMEMyMC4wNTU1IDAgMTUuMjIyIDEuNDY2MjIgMTEuMTEwOCA0LjIxMzI2QzYuOTk5NTMgNi45NjAyOSAzLjc5NTIxIDEwLjg2NDggMS45MDMwMiAxNS40MzI5QzAuMDEwODMyMiAyMC4wMDExIC0wLjQ4NDI1MSAyNS4wMjc3IDAuNDgwMzc5IDI5Ljg3NzNDMS40NDUwMSAzNC43MjY4IDMuODI2MDMgMzkuMTgxNCA3LjMyMjM0IDQyLjY3NzdDMTAuODE4NyA0Ni4xNzQgMTUuMjczMiA0OC41NTUgMjAuMTIyOCA0OS41MTk2QzI0Ljk3MjMgNTAuNDg0MyAyOS45OTg5IDQ5Ljk4OTIgMzQuNTY3MSA0OC4wOTdDMzkuMTM1MyA0Ni4yMDQ4IDQzLjAzOTcgNDMuMDAwNSA0NS43ODY3IDM4Ljg4OTNDNDguNTMzOCAzNC43NzggNTAgMjkuOTQ0NSA1MCAyNUM0OS45OTI4IDE4LjM3MTggNDcuMzU2NiAxMi4wMTcxIDQyLjY2OTggNy4zMzAyNUMzNy45ODI5IDIuNjQzMzkgMzEuNjI4MiAwLjAwNzE2ODkyIDI1IDBWMFpNMjUgNDUuODMzM0MyMC44Nzk2IDQ1LjgzMzMgMTYuODUxNyA0NC42MTE1IDEzLjQyNTYgNDIuMzIyM0M5Ljk5OTYxIDQwLjAzMzEgNy4zMjkzNSAzNi43Nzk0IDUuNzUyNTIgMzIuOTcyNkM0LjE3NTcgMjkuMTY1OCAzLjc2MzEzIDI0Ljk3NjkgNC41NjY5OCAyMC45MzU2QzUuMzcwODQgMTYuODk0MyA3LjM1NTAzIDEzLjE4MjIgMTAuMjY4NiAxMC4yNjg2QzEzLjE4MjIgNy4zNTUwMSAxNi44OTQ0IDUuMzcwODMgMjAuOTM1NiA0LjU2Njk3QzI0Ljk3NjkgMy43NjMxMSAyOS4xNjU4IDQuMTc1NjggMzIuOTcyNiA1Ljc1MjUxQzM2Ljc3OTQgNy4zMjkzNCA0MC4wMzMxIDkuOTk5NiA0Mi4zMjIzIDEzLjQyNTZDNDQuNjExNSAxNi44NTE2IDQ1LjgzMzMgMjAuODc5NiA0NS44MzMzIDI1QzQ1LjgyNzMgMzAuNTIzNSA0My42MzA0IDM1LjgxOSAzOS43MjQ3IDM5LjcyNDdDMzUuODE5IDQzLjYzMDQgMzAuNTIzNSA0NS44MjczIDI1IDQ1LjgzMzNaIiBmaWxsPSIjRkU1NjIxIi8+CjxwYXRoIGQ9Ik0zNC44MDYxIDE1LjE5MzhDMzQuNDE1NSAxNC44MDMyIDMzLjg4NTYgMTQuNTgzOCAzMy4zMzMyIDE0LjU4MzhDMzIuNzgwOCAxNC41ODM4IDMyLjI1MSAxNC44MDMyIDMxLjg2MDMgMTUuMTkzOEwyNC45OTk5IDIyLjA1NDJMMTguMTM5NSAxNS4xOTM4QzE3Ljk0NzMgMTQuOTk0OCAxNy43MTc0IDE0LjgzNjEgMTcuNDYzMiAxNC43MjY5QzE3LjIwOTEgMTQuNjE3NyAxNi45MzU3IDE0LjU2MDIgMTYuNjU5MSAxNC41NTc4QzE2LjM4MjQgMTQuNTU1NCAxNi4xMDgxIDE0LjYwODEgMTUuODUyMSAxNC43MTI5QzE1LjU5NiAxNC44MTc2IDE1LjM2MzQgMTQuOTcyMyAxNS4xNjc4IDE1LjE2NzlDMTQuOTcyMiAxNS4zNjM1IDE0LjgxNzUgMTUuNTk2MiAxNC43MTI4IDE1Ljg1MjJDMTQuNjA4IDE2LjEwODIgMTQuNTU1MyAxNi4zODI2IDE0LjU1NzcgMTYuNjU5MkMxNC41NjAxIDE2LjkzNTggMTQuNjE3NiAxNy4yMDkyIDE0LjcyNjggMTcuNDYzM0MxNC44MzU5IDE3LjcxNzUgMTQuOTk0NyAxNy45NDc0IDE1LjE5MzYgMTguMTM5NkwyMi4wNTQxIDI1TDE1LjE5MzYgMzEuODYwNEMxNC45OTQ3IDMyLjA1MjYgMTQuODM1OSAzMi4yODI1IDE0LjcyNjggMzIuNTM2N0MxNC42MTc2IDMyLjc5MDggMTQuNTYwMSAzMy4wNjQyIDE0LjU1NzcgMzMuMzQwOEMxNC41NTUzIDMzLjYxNzUgMTQuNjA4IDMzLjg5MTggMTQuNzEyOCAzNC4xNDc4QzE0LjgxNzUgMzQuNDAzOSAxNC45NzIyIDM0LjYzNjUgMTUuMTY3OCAzNC44MzIxQzE1LjM2MzQgMzUuMDI3NyAxNS41OTYgMzUuMTgyNCAxNS44NTIxIDM1LjI4NzFDMTYuMTA4MSAzNS4zOTE5IDE2LjM4MjQgMzUuNDQ0NiAxNi42NTkxIDM1LjQ0MjJDMTYuOTM1NyAzNS40Mzk4IDE3LjIwOTEgMzUuMzgyMyAxNy40NjMyIDM1LjI3MzFDMTcuNzE3NCAzNS4xNjM5IDE3Ljk0NzMgMzUuMDA1MiAxOC4xMzk1IDM0LjgwNjNMMjQuOTk5OSAyNy45NDU4TDMxLjg2MDMgMzQuODA2M0MzMi4yNTMyIDM1LjE4NTggMzIuNzc5NSAzNS4zOTU3IDMzLjMyNTcgMzUuMzkxQzMzLjg3MiAzNS4zODYyIDM0LjM5NDUgMzUuMTY3MSAzNC43ODA4IDM0Ljc4MDlDMzUuMTY3IDM0LjM5NDYgMzUuMzg2MSAzMy44NzIxIDM1LjM5MDkgMzMuMzI1OEMzNS4zOTU2IDMyLjc3OTYgMzUuMTg1NiAzMi4yNTMzIDM0LjgwNjEgMzEuODYwNEwyNy45NDU3IDI1TDM0LjgwNjEgMTguMTM5NkMzNS4xOTY3IDE3Ljc0ODkgMzUuNDE2MSAxNy4yMTkxIDM1LjQxNjEgMTYuNjY2N0MzNS40MTYxIDE2LjExNDIgMzUuMTk2NyAxNS41ODQ0IDM0LjgwNjEgMTUuMTkzOFoiIGZpbGw9IiNGRTU2MjEiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8yMTE2XzI1NTAiPgo8cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==)",
                            backgroundPosition: "center center",
                            backgroundRepeat: "no-repeat",
                            opacity:
                              cardError[0] === rowIndex &&
                              cardError[1] === columnIndex
                                ? 0.75
                                : 0,
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                          },
                        }}
                        css={{
                          transition: "all 300ms",
                          borderRadius: 10,
                          position: "relative",
                        }}
                        style={{
                          pointerEvents: isMyTurn ? "unset" : "none",
                        }}
                        onClick={addCard(rowIndex, columnIndex)}
                        id={rowIndex + "-" + columnIndex}
                      ></CardEmpty>
                    )}
                    {column && column !== "empty" && (
                      <div className="stack">
                        {[...column].map((card: any, index) => (
                          <Card
                            selectedCard={selectedCard}
                            key={`${card.value} ${card.suit}`}
                            onClick={addCard(rowIndex, columnIndex)}
                            animated={card.id ? true : false}
                            card={card}
                            index={index}
                            className={`${
                              index + 1 === column.length ? "dropzone" : ""
                            }`}
                            id={rowIndex + "-" + columnIndex}
                            data-row={rowIndex}
                            data-column={columnIndex}
                            isGameBoard={true}
                            css={{
                              pointerEvents: isMyTurn ? "unset" : "none",
                              zIndex: 10 + index,
                              outline:
                                index + 1 === column.length &&
                                cardError[0] === rowIndex &&
                                cardError[1] === columnIndex
                                  ? "#FA5252 6px solid"
                                  : `6px solid ${getColor(card.userId)()}`,
                              borderRadius: 16,
                              position: "relative",
                              // animationDuration: "10s",
                              opacity:
                                column &&
                                column.length - 1 === index &&
                                column[column.length - 1].suit &&
                                column[column.length - 1].value &&
                                lastPlayedCard?.value ===
                                  column[column.length - 1].value &&
                                lastPlayedCard?.suit ===
                                  column[column.length - 1].suit &&
                                (lastPlayedCard?.id ||
                                column[column.length - 1].id
                                  ? lastPlayedCard?.id ===
                                    column[column.length - 1].id
                                  : true)
                                  ? 0
                                  : 1,
                              animation:
                                column &&
                                column[column.length - 1].suit &&
                                column[column.length - 1].value &&
                                lastPlayedCard?.value ===
                                  column[column.length - 1].value &&
                                lastPlayedCard?.suit ===
                                  column[column.length - 1].suit &&
                                (column[column.length - 1].id
                                  ? lastPlayedCard?.id ===
                                    column[column.length - 1].id
                                  : true)
                                  ? "example3  0.3s linear 0.3s 1 normal forwards"
                                  : "",
                              animationDelay: "1.6s",
                              transition: "all 300ms",
                              // animationName: 'example3',
                              transform: getSkew(index)(),
                              "&::before": {
                                transition: "all 300ms",
                                position: "absolute",
                                content: `' '`,
                                background: "rgba(0, 0, 0, 0.75)",
                                zIndex: 99999,
                                borderRadius: 20,
                                backgroundImage:
                                  "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzIxMTZfMjU1MCkiPgo8cGF0aCBkPSJNMjUgMEMyMC4wNTU1IDAgMTUuMjIyIDEuNDY2MjIgMTEuMTEwOCA0LjIxMzI2QzYuOTk5NTMgNi45NjAyOSAzLjc5NTIxIDEwLjg2NDggMS45MDMwMiAxNS40MzI5QzAuMDEwODMyMiAyMC4wMDExIC0wLjQ4NDI1MSAyNS4wMjc3IDAuNDgwMzc5IDI5Ljg3NzNDMS40NDUwMSAzNC43MjY4IDMuODI2MDMgMzkuMTgxNCA3LjMyMjM0IDQyLjY3NzdDMTAuODE4NyA0Ni4xNzQgMTUuMjczMiA0OC41NTUgMjAuMTIyOCA0OS41MTk2QzI0Ljk3MjMgNTAuNDg0MyAyOS45OTg5IDQ5Ljk4OTIgMzQuNTY3MSA0OC4wOTdDMzkuMTM1MyA0Ni4yMDQ4IDQzLjAzOTcgNDMuMDAwNSA0NS43ODY3IDM4Ljg4OTNDNDguNTMzOCAzNC43NzggNTAgMjkuOTQ0NSA1MCAyNUM0OS45OTI4IDE4LjM3MTggNDcuMzU2NiAxMi4wMTcxIDQyLjY2OTggNy4zMzAyNUMzNy45ODI5IDIuNjQzMzkgMzEuNjI4MiAwLjAwNzE2ODkyIDI1IDBWMFpNMjUgNDUuODMzM0MyMC44Nzk2IDQ1LjgzMzMgMTYuODUxNyA0NC42MTE1IDEzLjQyNTYgNDIuMzIyM0M5Ljk5OTYxIDQwLjAzMzEgNy4zMjkzNSAzNi43Nzk0IDUuNzUyNTIgMzIuOTcyNkM0LjE3NTcgMjkuMTY1OCAzLjc2MzEzIDI0Ljk3NjkgNC41NjY5OCAyMC45MzU2QzUuMzcwODQgMTYuODk0MyA3LjM1NTAzIDEzLjE4MjIgMTAuMjY4NiAxMC4yNjg2QzEzLjE4MjIgNy4zNTUwMSAxNi44OTQ0IDUuMzcwODMgMjAuOTM1NiA0LjU2Njk3QzI0Ljk3NjkgMy43NjMxMSAyOS4xNjU4IDQuMTc1NjggMzIuOTcyNiA1Ljc1MjUxQzM2Ljc3OTQgNy4zMjkzNCA0MC4wMzMxIDkuOTk5NiA0Mi4zMjIzIDEzLjQyNTZDNDQuNjExNSAxNi44NTE2IDQ1LjgzMzMgMjAuODc5NiA0NS44MzMzIDI1QzQ1LjgyNzMgMzAuNTIzNSA0My42MzA0IDM1LjgxOSAzOS43MjQ3IDM5LjcyNDdDMzUuODE5IDQzLjYzMDQgMzAuNTIzNSA0NS44MjczIDI1IDQ1LjgzMzNaIiBmaWxsPSIjRkU1NjIxIi8+CjxwYXRoIGQ9Ik0zNC44MDYxIDE1LjE5MzhDMzQuNDE1NSAxNC44MDMyIDMzLjg4NTYgMTQuNTgzOCAzMy4zMzMyIDE0LjU4MzhDMzIuNzgwOCAxNC41ODM4IDMyLjI1MSAxNC44MDMyIDMxLjg2MDMgMTUuMTkzOEwyNC45OTk5IDIyLjA1NDJMMTguMTM5NSAxNS4xOTM4QzE3Ljk0NzMgMTQuOTk0OCAxNy43MTc0IDE0LjgzNjEgMTcuNDYzMiAxNC43MjY5QzE3LjIwOTEgMTQuNjE3NyAxNi45MzU3IDE0LjU2MDIgMTYuNjU5MSAxNC41NTc4QzE2LjM4MjQgMTQuNTU1NCAxNi4xMDgxIDE0LjYwODEgMTUuODUyMSAxNC43MTI5QzE1LjU5NiAxNC44MTc2IDE1LjM2MzQgMTQuOTcyMyAxNS4xNjc4IDE1LjE2NzlDMTQuOTcyMiAxNS4zNjM1IDE0LjgxNzUgMTUuNTk2MiAxNC43MTI4IDE1Ljg1MjJDMTQuNjA4IDE2LjEwODIgMTQuNTU1MyAxNi4zODI2IDE0LjU1NzcgMTYuNjU5MkMxNC41NjAxIDE2LjkzNTggMTQuNjE3NiAxNy4yMDkyIDE0LjcyNjggMTcuNDYzM0MxNC44MzU5IDE3LjcxNzUgMTQuOTk0NyAxNy45NDc0IDE1LjE5MzYgMTguMTM5NkwyMi4wNTQxIDI1TDE1LjE5MzYgMzEuODYwNEMxNC45OTQ3IDMyLjA1MjYgMTQuODM1OSAzMi4yODI1IDE0LjcyNjggMzIuNTM2N0MxNC42MTc2IDMyLjc5MDggMTQuNTYwMSAzMy4wNjQyIDE0LjU1NzcgMzMuMzQwOEMxNC41NTUzIDMzLjYxNzUgMTQuNjA4IDMzLjg5MTggMTQuNzEyOCAzNC4xNDc4QzE0LjgxNzUgMzQuNDAzOSAxNC45NzIyIDM0LjYzNjUgMTUuMTY3OCAzNC44MzIxQzE1LjM2MzQgMzUuMDI3NyAxNS41OTYgMzUuMTgyNCAxNS44NTIxIDM1LjI4NzFDMTYuMTA4MSAzNS4zOTE5IDE2LjM4MjQgMzUuNDQ0NiAxNi42NTkxIDM1LjQ0MjJDMTYuOTM1NyAzNS40Mzk4IDE3LjIwOTEgMzUuMzgyMyAxNy40NjMyIDM1LjI3MzFDMTcuNzE3NCAzNS4xNjM5IDE3Ljk0NzMgMzUuMDA1MiAxOC4xMzk1IDM0LjgwNjNMMjQuOTk5OSAyNy45NDU4TDMxLjg2MDMgMzQuODA2M0MzMi4yNTMyIDM1LjE4NTggMzIuNzc5NSAzNS4zOTU3IDMzLjMyNTcgMzUuMzkxQzMzLjg3MiAzNS4zODYyIDM0LjM5NDUgMzUuMTY3MSAzNC43ODA4IDM0Ljc4MDlDMzUuMTY3IDM0LjM5NDYgMzUuMzg2MSAzMy44NzIxIDM1LjM5MDkgMzMuMzI1OEMzNS4zOTU2IDMyLjc3OTYgMzUuMTg1NiAzMi4yNTMzIDM0LjgwNjEgMzEuODYwNEwyNy45NDU3IDI1TDM0LjgwNjEgMTguMTM5NkMzNS4xOTY3IDE3Ljc0ODkgMzUuNDE2MSAxNy4yMTkxIDM1LjQxNjEgMTYuNjY2N0MzNS40MTYxIDE2LjExNDIgMzUuMTk2NyAxNS41ODQ0IDM0LjgwNjEgMTUuMTkzOFoiIGZpbGw9IiNGRTU2MjEiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8yMTE2XzI1NTAiPgo8cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==)",
                                backgroundPosition: "center center",
                                backgroundRepeat: "no-repeat",
                                opacity:
                                  cardError[0] === rowIndex &&
                                  cardError[1] === columnIndex
                                    ? 1
                                    : 0,
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                              },
                              "&::after": {
                                opacity: card.id ? 1 : 0,
                                content: `"${card.powerLevel}"`,
                                display: card ? "flex" : "none",
                                justifyContent: "center",
                                alignItems: "center",
                                transition: "all  400ms",
                                zIndex: 999 + index,
                                transform: getSkew(index)(),

                                color: "#fff",
                                fontFamily: "Aldrich",
                                background: `${getColor(card.userId)()}`,
                                backgroundImage:
                                  'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAxNCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzLjkxNzIgNy4zMTE4Mkw3LjU1MzU3IDE4Ljc2NjRDNy40MzkwMyAxOC45NyA3LjIyOTAzIDE5LjA5MDkgNi45OTk5NCAxOS4wOTA5QzYuOTQ5MDMgMTkuMDkwOSA2Ljg5MTc1IDE5LjA4NDUgNi44NDA4NCAxOS4wNzE4QzYuNTYwODQgMTguOTk1NCA2LjM2MzU3IDE4Ljc0NzMgNi4zNjM1NyAxOC40NTQ1VjExLjQ1NDVIMC42MzYzMDFDMC40MTk5MzggMTEuNDU0NSAwLjIyMjY2NSAxMS4zNDY0IDAuMTAxNzU2IDExLjE2ODJDLTAuMDEyNzg5NSAxMC45OSAtMC4wMzE4ODAzIDEwLjc2MDkgMC4wNTA4NDY5IDEwLjU2MzZMNC41MDUzOSAwLjM4MTgxOEM0LjYwNzIxIDAuMTUyNzI3IDQuODM2MyAwIDUuMDkwODUgMEg4LjkwOTAzQzkuMTE5MDMgMCA5LjMxNjMgMC4xMDE4MTggOS40MzcyMSAwLjI4QzkuNTUxNzUgMC40NTE4MTggOS41NzcyMSAwLjY3NDU0NSA5LjUwMDg0IDAuODcxODE4TDcuMzA1MzkgNi4zNjM2M0gxMy4zNjM2QzEzLjU4NjMgNi4zNjM2MyAxMy43OTYzIDYuNDg0NTQgMTMuOTEwOCA2LjY3NTQ1QzE0LjAyNTQgNi44NzI3MiAxNC4wMzE4IDcuMTE0NTQgMTMuOTE3MiA3LjMxMTgyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==")',
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "12px 8px",
                                position: "absolute",
                                borderRadius: 20,
                                fontSize: 24,
                                top: -10,
                                right: 0,
                                left: 160,
                                padding: "14px 0",
                                paddingTop: 18,
                                paddingLeft: 20,
                                width: 40,
                                minWidth: 62,
                                height: 38,
                                pointerEvents: "none",
                                textTransform: "uppercase",
                              },
                            }}
                          ></Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
};

export default GameBoard;
