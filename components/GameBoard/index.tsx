/**
 * GameBoard Component - Phase 2 Refactored
 *
 * Responsibilities:
 * - Container for the game board
 * - Handle drag & drop for card placement (interact.js)
 * - Dispatch local moves to reducer
 * - Render AnimationOverlay for move animations
 *
 * Rendering delegated to:
 * - BoardGrid: Renders the grid of cells
 * - BoardCell: Renders individual cells (empty, drop target, or cards)
 * - CardStack: Renders a stack of cards at a position
 */

import { FC, useState, useEffect, useCallback, useRef, HTMLAttributes } from "react";
import { useGame } from "../GameProvider";
import { useWS } from "../WsProvider";
import AnimationOverlay from "./AnimationOverlay";
import BoardGrid from "./BoardGrid";
import { useAnimationQueue } from "../../hooks/useAnimationQueue";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { localMoveInitiated } from "../../store/gameActions";
import { generateMoveKey } from "../../utils/moveUtils";
import { NormalizedCard } from "../../types/game";
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

  // The last played card - used to hide board card while animation overlay shows it
  // Use pendingAnimation (set immediately) not currentAnimation (set after scroll)
  const lastPlayedCard = state.pendingAnimation?.card || currentAnimation?.card || null;
  const lastPlayedPosition = state.pendingAnimation?.position || currentAnimation?.position || null;

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
        return;
      }

      const allowedPlacement = state.allowedUserCardsPlacement?.additionalProperties?.[
        `${columnIndex}-${rowIndex}`
      ];

      if (!card || !allowedPlacement) {
        setCardError([rowIndex, columnIndex]);
        setTimeout(() => setCardError([]), 1000);
        return;
      }

      // Check if card is allowed at this position
      // A card is valid if it's a joker OR matches suit+value of an allowed card
      const isJokerMove = card.value === "joker" && allowedPlacement.some(
        (allowedCard: { suit: string; value: string }) => allowedCard.value === "joker"
      );
      const isStandardMove = allowedPlacement.some(
        (allowedCard: { suit: string; value: string }) =>
          allowedCard.suit.toLowerCase() === card.suit.toLowerCase() &&
          allowedCard.value === card.value
      );

      if (!isJokerMove && !isStandardMove) {
        setCardError([rowIndex, columnIndex]);
        setTimeout(() => setCardError([]), 1000);
        return;
      }

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

  // Handle cell click from BoardGrid
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      addCard(y, x)();
    },
    [addCard]
  );

  // Handle auto-pass when no valid placements available
  useEffect(() => {
    // Only auto-pass when game is actively in progress
    const isGameActive = gameState?.state === 'inGame' || gameState?.state === 'started';
    if (!gameState?.gameId || !isGameActive) {
      return;
    }

    // Auto-pass if no valid placements and it's my turn
    // Check that allowedPlacements is actually defined (not just empty during loading)
    // Also check that we have cards in hand (gameUsersWithCards should have our cards)
    const placements = gameState.allowedPlacements;
    const hasCards = gameState.gameUsersWithCards?.some(
      (u) => u.cards && u.cards.length > 0
    );
    const placementsCount = placements ? Object.keys(placements).length : -1;

    if (isMyTurn && placements && placementsCount === 0 && hasCards) {
      setTimeout(() => {
        WSProvider.send(
          JSON.stringify({
            event: "play-card",
            data: { action: "pass" },
          })
        );
      }, 2000);
    }
  }, [gameState?.gameId, gameState?.state, gameState?.allowedPlacements, gameState?.gameUsersWithCards, isMyTurn, WSProvider]);

  // Handle drop from drag and drop
  const handleDrop = useCallback(
    (rowIndex: number, columnIndex: number) => {
      addCard(rowIndex, columnIndex, selectedCardRef.current, gameStateRef.current)();
    },
    [addCard]
  );

  // Check if placement is valid for the selected card at a given position
  const isPlacementValid = useCallback(
    (rowIndex: number, columnIndex: number): boolean => {
      const card = selectedCardRef.current;
      const state = gameStateRef.current;

      if (!card) {
        return false;
      }

      const allowedPlacement = state.allowedUserCardsPlacement?.additionalProperties?.[
        `${columnIndex}-${rowIndex}`
      ];

      if (!allowedPlacement) {
        return false;
      }

      // Check if card is allowed at this position
      const isJokerMove = card.value === "joker" && allowedPlacement.some(
        (allowedCard: { suit: string; value: string }) => allowedCard.value === "joker"
      );
      const isStandardMove = allowedPlacement.some(
        (allowedCard: { suit: string; value: string }) =>
          allowedCard.suit.toLowerCase() === card.suit.toLowerCase() &&
          allowedCard.value === card.value
      );

      return isJokerMove || isStandardMove;
    },
    []
  );

  // Set up drag and drop via hook
  useDragAndDrop({ onDrop: handleDrop, isPlacementValid });

  // Calculate board position for animation overlay
  const boardRef = useRef<HTMLDivElement>(null);

  // Convert cardError array to position object for BoardGrid
  const errorPosition = cardError.length === 2
    ? { x: cardError[1], y: cardError[0] }
    : null;

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

        {/* Board Grid - delegated rendering */}
        <BoardGrid
          board={board}
          players={players}
          isMyTurn={isMyTurn}
          lastPlayedCard={lastPlayedCard}
          lastPlayedPosition={lastPlayedPosition}
          selectedCard={selectedCard}
          errorPosition={errorPosition}
          onCellClick={handleCellClick}
        />
      </div>
      {children}
    </div>
  );
};

export default GameBoard;
