import { FC, useState, useEffect, useCallback, HTMLAttributes } from "react";
import Card from "../../components/CardNew";
import { getCard } from "../../components/Cards";

import CardEmpty from "../../components/CardEmpty";
import { useGame } from "../GameProvider";
import { useWS } from "../WsProvider";
import interact from "interactjs";

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
    // eslint-disable-next-line
    // @ts-ignore
    window.selectedCard = selectedCard;
  }, [selectedCard]);

  useEffect(() => {
    // eslint-disable-next-line
    // @ts-ignore
    window.state = gameState;
  }, [gameState]);

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
          // alert("Not allowed to place card there.");
          setCardError([rowIndex, columnIndex]);
          console.log("card error");
          setTimeout(() => {
            setCardError([]);
          }, 2000);

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
    [WSProvider, selectedCard, setCardError]
  );

  const addCardToBoard = (
    rowIndex: number,
    columnIndex: number,
    card: any = selectedCard
  ) => {
    const row = Number(rowIndex);
    const column = Number(columnIndex);

    const localBoard = [...board];

    const placeToPutCard = localBoard[row][column];

    if (
      placeToPutCard &&
      placeToPutCard !== "empty" &&
      Array.isArray(placeToPutCard)
    ) {
      if (
        !placeToPutCard.find(
          (existingCard) =>
            existingCard.value === card.value && existingCard.suit === card.suit
        )
      ) {
        localBoard[row][column].push(card);
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

    setBoard([...localBoard]);

    removeCard ? removeCard(card) : null;
  };

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
      Object.keys(gameState.allowedUserCardsPlacement?.additionalProperties)
        .length === 0,
      "length"
    );

    if (
      Object.keys(gameState.allowedUserCardsPlacement?.additionalProperties)
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

    setLastPlayedCard(
      gameState.lastPlayedCard ? gameState.lastPlayedCard : null
    );

    setTimeout(() => {
      const latestCard = document.getElementsByClassName("game-latest-card")[0];

      // const container = document.getElementsByClassName("scroll-container")[0];

      if (!latestCard) {
              // const latestCard = document.getElementsByClassName("game-latest-card")[0];

        return;
      }

      latestCard.scrollIntoView({ block: "center", behavior: "smooth" });

      // setTimeout(
      //   () => latestCard.classList.add("game-latest-card__animation"),
      //   1000
      // );
    }, 0);
  }, [gameState]);

  


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
        // eslint-disable-next-line
        // @ts-ignore
        addCard(
          Number(target[0]),
          Number(target[1]),
        // eslint-disable-next-line
        // @ts-ignore
          window.selectedCard,
        // eslint-disable-next-line
        // @ts-ignore
          window.state
        )();
        event.stopImmediatePropagation();
      },

      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove("drop-active");
        event.target.classList.remove("drop-target");
      },
    });
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
                      outline:
                        cardError[0] === rowIndex &&
                        cardError[1] === columnIndex
                          ? "#FA5252 6px solid!important"
                          : "none",
                    })}
                  >
                    {!column && (
                      <div style={{ width: "210px", height: "300px" }}></div>
                    )}

                    {column &&
                      column[column.length - 1].suit &&
                      column[column.length - 1].value &&
                      column[column.length - 1].id &&
                      lastPlayedCard?.value ===
                        column[column.length - 1].value &&
                      lastPlayedCard?.suit ===
                        column[column.length - 1].suit && lastPlayedCard?.id ===
                        column[column.length - 1].id && (
                        <div
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
                        css={{
                          transition: "all 300ms",
                          borderRadius: 10,
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
                                lastPlayedCard?.value === card.value &&
                                lastPlayedCard?.suit === card.suit
                                  ? 0
                                  : 1,
                              animation:
                                lastPlayedCard?.value === card.value &&
                                lastPlayedCard?.suit === card.suit
                                  ? "example3  0.3s linear 0.3s 1 normal forwards"
                                  : "",
                              animationDelay: "1.6s",
                              // animationName: 'example3',
                              transform: getSkew(index)(),
                              "&::after": {
                                opacity: card.id ? 1 : 0,
                                content: `"${card.power}"`,
                                display: card ? "flex" : "none",
                                justifyContent: "center",
                                alignItems: "center",
                                transition: "all  400ms",
                                zIndex: 999 + index,
                                transform: getSkew(index)(),

                                color: "#fff",
                                fontFamily: "Aldrich",
                                background: `#FAB005`,
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
