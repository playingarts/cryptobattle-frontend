/**
 * GameBoard Component - Phase 3 Refactored
 *
 * Responsibilities:
 * - Render the game board grid from reducer state
 * - Handle drag & drop for card placement
 * - Dispatch local moves to reducer
 * - Render AnimationOverlay for move animations
 *
 * Key changes from previous version:
 * - Board state derived from reducer (not local state)
 * - Animation managed via reducer + useAnimationQueue hook
 * - Single code path for local and remote moves
 * - Move key-based animation deduplication
 */

import { FC, useState, useEffect, useCallback, useRef, HTMLAttributes } from "react";
import Card from "../../components/CardNew";
import { getCard } from "../../components/Cards";
import CardEmpty from "../../components/CardEmpty";
import { useGame } from "../GameProvider";
import { useWS } from "../WsProvider";
import interact from "interactjs";
import AnimationOverlay from "./AnimationOverlay";
import { useAnimationQueue } from "../../hooks/useAnimationQueue";
import { localMoveInitiated } from "../../store/gameActions";
import { generateMoveKey } from "../../utils/moveUtils";
import { NormalizedCard, GamePlayer } from "../../types/game";
import { logAnimation, logGameState } from "../../utils/debug";

interface Props extends HTMLAttributes<HTMLElement> {
  removeCard?: (cardId: string) => void;
}

const GameBoard: FC<Props> = ({ children, removeCard }) => {
  const WSProvider = useWS();
  // Use context state and dispatch from GameProvider
  const { state, dispatch, players, selectedCard } = useGame();

  // Derive values from context state
  const gameState = state.serverState;
  const isMyTurn = state.isMyTurn;

  // USE REDUCER STATE for board - single source of truth
  const board = state.board;

  // UI state (not game state - stays local)
  const [cardError, setCardError] = useState<number[]>([]);

  // Animation queue management - uses context state
  const { currentAnimation } = useAnimationQueue({
    pendingAnimation: state.pendingAnimation,
    dispatch,
  });

  // Use currentAnimation from useAnimationQueue for animation state
  // This replaces the old lastPlayedCard state system
  const lastPlayedCard = currentAnimation?.card || null;

  // Refs to hold current values for interact.js callbacks (outside React lifecycle)
  const selectedCardRef = useRef(selectedCard);
  const gameStateRef = useRef(gameState);

  // Keep refs in sync with current values
  useEffect(() => {
    selectedCardRef.current = selectedCard;
  }, [selectedCard]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Get player color by userId
  const getColor = useCallback(
    (userId: string) => () => {
      if (userId === "system") {
        return "#2D3038";
      }
      const foundPlayer = players.find((player: GamePlayer) => player.userId === userId);
      return foundPlayer ? foundPlayer.color : "gray";
    },
    [players]
  );

  // Get rotation for stacked cards
  const getSkew = useCallback(
    (index: number) => () => {
      if (!index || index === 0) {
        return "";
      }
      return `rotate(${index * 4}deg)`;
    },
    []
  );

  // Log game state changes (dispatch handled by GameProvider)
  useEffect(() => {
    if (!gameState?.gameId) {
      return;
    }

    logGameState("State from context", {
      state: gameState.state,
      turnForPlayer: gameState.turnForPlayer,
      hasLastPlayedCard: !!gameState.lastPlayedCard,
    });
  }, [gameState?.gameId, gameState?.state, gameState?.turnForPlayer, gameState?.lastPlayedCard]);

  // Handle card placement
  const addCard = useCallback(
    (rowIndex: number, columnIndex: number, card = selectedCard, state = gameState) => () => {
      if (!card) {
        console.log("addCard no card", card, rowIndex, columnIndex);
        return;
      }
      console.log("addCard", card, rowIndex, columnIndex);

      const allowedPlacement = state.allowedUserCardsPlacement?.additionalProperties?.[
        `${columnIndex}-${rowIndex}`
      ];

      if (!card || !allowedPlacement) {
        setCardError([rowIndex, columnIndex]);
        console.log("card error", rowIndex, columnIndex);
        setTimeout(() => setCardError([]), 1000);
        return;
      }

      // Check if card is allowed at this position
      if (
        allowedPlacement &&
        !allowedPlacement.find(
          (allowedCard: { suit: string; value: string }) =>
            allowedCard.value === "joker" && allowedCard.value === card.value
        ) &&
        !allowedPlacement.find(
          (allowedCard: { suit: string; value: string }) =>
            allowedCard.suit.toLowerCase() === card.suit.toLowerCase() &&
            allowedCard.value === card.value
        )
      ) {
        setCardError([rowIndex, columnIndex]);
        console.log("card error 2");
        setTimeout(() => setCardError([]), 1000);
        return;
      }

      console.log("Playing card: ", card);

      // Create normalized card with user ID
      const normalizedCard: NormalizedCard = {
        id: card.id || `${card.suit}-${card.value}-${state.turnForPlayer}`,
        suit: card.suit.toLowerCase(),
        value: String(card.value).toLowerCase(),
        userId: state.turnForPlayer,
        powerLevel: card.powerLevel,
        scoringLevel: 0,
        imageUrl: card.imageUrl || card.img,
        videoUrl: card.videoUrl || card.video,
        isNft: !!card.id && card.id !== "",
      };

      const position = { x: columnIndex, y: rowIndex };

      // Generate move key for this move
      const moveKey = generateMoveKey(normalizedCard, position);

      logAnimation("LOCAL_MOVE", {
        moveKey,
        card: `${normalizedCard.suit}-${normalizedCard.value}`,
        position,
      });

      // Dispatch to reducer (updates board + triggers animation via useAnimationQueue)
      dispatch(localMoveInitiated({
        moveKey,
        card: normalizedCard,
        position,
        playerId: state.turnForPlayer,
        timestamp: Date.now(),
        isLocal: true,
        confirmed: false,
      }));

      // Remove card from hand
      removeCard?.(card as unknown as string);

      // Send to server
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
    [WSProvider, selectedCard, gameState, dispatch, removeCard]
  );

  // Handle auto-pass when no valid placements available
  useEffect(() => {
    // Only auto-pass when game is actively in progress
    if (!gameState?.gameId || gameState.state !== 'inGame') {
      return;
    }

    // Auto-pass if no valid placements and it's my turn
    // Check that allowedPlacements is actually defined (not just empty during loading)
    const placements = gameState.allowedPlacements;
    if (isMyTurn && placements && Object.keys(placements).length === 0) {
      console.log('[DEBUG GameBoard] Auto-pass: no valid placements available');
      setTimeout(() => {
        WSProvider.send(
          JSON.stringify({
            event: "play-card",
            data: { action: "pass" },
          })
        );
      }, 2000);
    }
  }, [gameState?.gameId, gameState?.state, gameState?.allowedPlacements, isMyTurn, WSProvider]);

  // Set up drag and drop
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
          event.target.style.transform = `translate(0px, 0px)`;
        },
        end(event) {
          position.x = 0;
          position.y = 0;
          event.target.style.transform = `translate(0px, 0px)`;
        },
        move(event) {
          position.x += event.dx;
          position.y += event.dy;
          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
        },
      },
    });

    interact(".dropzone").dropzone({
      accept: ".draggable",
      overlap: 0.4,
      ondragenter: function (event) {
        event.target.classList.add("drop-target");
      },
      ondragleave: function (event) {
        event.target.classList.remove("drop-target");
      },
      ondrop: function (event) {
        const target = event.currentTarget.id.split("-");
        // Use refs to access current values (interact.js runs outside React lifecycle)
        addCard(
          Number(target[0]),
          Number(target[1]),
          selectedCardRef.current,
          gameStateRef.current
        )();
        event.stopImmediatePropagation();
      },
      ondropdeactivate: function (event) {
        event.target.classList.remove("drop-active");
        event.target.classList.remove("drop-target");
      },
    });

    return () => {
      interact(".dropzone").unset();
    };
  }, []);

  // Calculate board position for animation overlay
  const boardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      css={() => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px",
        minHeight: "100vh",
        position: "relative",
      })}
    >
      <div ref={boardRef} css={{ position: "relative" }}>
        {/* Animation Overlay - renders above the board */}
        {currentAnimation && (
          <AnimationOverlay
            animation={currentAnimation}
            players={players}
          />
        )}

        {/* Board Grid */}
        {board.map((row, rowIndex) => (
          <div
            key={rowIndex}
            css={() => ({
              display: "flex",
              justifyContent: "center",
            })}
          >
            {row.map((cell) => {
              const { x: columnIndex, y: cellRowIndex, cards, isEmpty, isDropTarget } = cell;
              const hasCards = cards.length > 0;

              // Determine what to render:
              // - hasCards: render card stack
              // - isDropTarget (no cards): render droppable CardEmpty with border
              // - isEmpty (adjacent to cards, no cards, not drop target): render faded placeholder
              // - none of above: render invisible placeholder to maintain grid structure
              const showDropTarget = !hasCards && isDropTarget;
              const showFadedPlaceholder = !hasCards && isEmpty && !isDropTarget;
              const showInvisiblePlaceholder = !hasCards && !isEmpty && !isDropTarget;

              return (
              <div
                key={`${columnIndex}-${cellRowIndex}`}
                css={() => ({
                  margin: "20px",
                  borderRadius: 10,
                  position: "relative",
                  // Fixed size to maintain grid structure
                  width: "210px",
                  height: "300px",
                })}
              >
                {/* Invisible placeholder for cells outside the active area */}
                {showInvisiblePlaceholder && (
                  <div style={{ width: "100%", height: "100%" }} />
                )}

                {/* Faded placeholder for adjacent cells that aren't drop targets */}
                {showFadedPlaceholder && (
                  <CardEmpty
                    key={`placeholder-${columnIndex}-${cellRowIndex}`}
                    isPlaceholder={true}
                    containerStyles={{
                      opacity: 0.3,
                      border: "3px dashed #222",
                    }}
                    css={{
                      pointerEvents: "none",
                    }}
                  />
                )}


                {/* Drop target cell (can place cards here) */}
                {showDropTarget && (
                  <CardEmpty
                    selectedCard={selectedCard}
                    key={`drop-${columnIndex}-${cellRowIndex}`}
                    containerStyles={{
                      border:
                        cardError[0] === cellRowIndex && cardError[1] === columnIndex
                          ? "3px solid #FA5252"
                          : "3px dashed #222",
                      transition: "all 300ms",
                      "&:hover": {
                        border:
                          cardError[0] === cellRowIndex && cardError[1] === columnIndex
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
                          cardError[0] === cellRowIndex && cardError[1] === columnIndex
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
                    onClick={addCard(cellRowIndex, columnIndex)}
                    id={cellRowIndex + "-" + columnIndex}
                  ></CardEmpty>
                )}

                {/* Card stack */}
                {hasCards && (
                  <div className="stack">
                    {cards.map((card, index) => {
                      // Transform NormalizedCard to Card component's expected format
                      // Use getCard to look up the image from cards.json for regular cards
                      const cardWithImage = getCard(card.suit, card.value, card);
                      const cardForComponent = cardWithImage || {
                        ...card,
                        img: card.imageUrl || '',
                        video: card.videoUrl,
                      };
                      return (
                      <Card
                        selectedCard={selectedCard}
                        key={`${card.value} ${card.suit}`}
                        onClick={addCard(cellRowIndex, columnIndex)}
                        animated={card.isNft === true}
                        card={cardForComponent}
                        index={index}
                        className={`${index + 1 === cards.length ? "dropzone" : ""}`}
                        id={cellRowIndex + "-" + columnIndex}
                        data-row={cellRowIndex}
                        data-column={columnIndex}
                        isGameBoard={true}
                        css={{
                          pointerEvents: isMyTurn ? "unset" : "none",
                          zIndex: 10 + index,
                          outline:
                            index + 1 === cards.length &&
                            cardError[0] === cellRowIndex &&
                            cardError[1] === columnIndex
                              ? "#FA5252 3px solid"
                              : `3px solid ${getColor(card.userId || '')()}`,
                          borderRadius: 16,
                          position: "relative",
                          opacity:
                            cards.length - 1 === index &&
                            cards[cards.length - 1]?.suit &&
                            cards[cards.length - 1]?.value &&
                            lastPlayedCard?.value === cards[cards.length - 1].value &&
                            lastPlayedCard?.suit?.toLowerCase() === cards[cards.length - 1].suit?.toLowerCase() &&
                            (lastPlayedCard?.id || cards[cards.length - 1].id
                              ? lastPlayedCard?.id === cards[cards.length - 1].id
                              : true)
                              ? 0
                              : 1,
                          animation:
                            cards[cards.length - 1]?.suit &&
                            cards[cards.length - 1]?.value &&
                            lastPlayedCard?.value === cards[cards.length - 1].value &&
                            lastPlayedCard?.suit?.toLowerCase() === cards[cards.length - 1].suit?.toLowerCase() &&
                            (cards[cards.length - 1].id
                              ? lastPlayedCard?.id === cards[cards.length - 1].id
                              : true)
                              ? "example3 0.3s linear 0.3s 1 normal forwards"
                              : "",
                          animationDelay: "1.6s",
                          transition: "all 300ms",
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
                              cardError[0] === cellRowIndex && cardError[1] === columnIndex
                                ? 1
                                : 0,
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                          },
                          "&::after": {
                            opacity: card.isNft ? 1 : 0,
                            content: `"${card.powerLevel}"`,
                            display: card ? "flex" : "none",
                            justifyContent: "center",
                            alignItems: "center",
                            transition: "all 400ms",
                            zIndex: 999 + index,
                            transform: getSkew(index)(),
                            color: "#fff",
                            fontFamily: "Aldrich",
                            background: `${getColor(card.userId || '')()}`,
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
                      );
                    })}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
};

export default GameBoard;
