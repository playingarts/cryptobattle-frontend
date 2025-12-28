/**
 * Game State Reducer
 *
 * Pure reducer function that manages all game state transitions.
 * This is the single source of truth for:
 * - Board state (derived from server)
 * - Animation state (pending animations, processed move keys)
 * - Optimistic moves (local moves awaiting confirmation)
 */

import {
  NormalizedCard,
  GameMove,
  PendingAnimation,
  GameBoard,
  BoardCell,
  GamePlayer,
} from '../types/game';
import { GameAction, GameStatePayload, ServerTableCard, ServerLastPlayedCard, GameUserWithCardsInfo, AllowedUserCardsPlacement } from './gameActions';
import { generateMoveKey, normalizeCard, findCardPosition } from '../utils/moveUtils';
import { logAnimation, logGameState } from '../utils/debug';

// ============================================================
// STATE SHAPE
// ============================================================

export interface GameReducerState {
  // Server state (single source of truth)
  serverState: {
    gameId: string | null;
    state: 'opened' | 'inGame' | 'started' | 'results' | 'ended' | null;
    turnForPlayer: string | null;
    tableSizeX: number;
    tableSizeY: number;
    allGamePlayers: GamePlayer[];
    gameTableCards: Record<string, NormalizedCard[]>;  // "x-y" -> cards
    allowedPlacements: Record<string, boolean>;        // "x-y" -> allowed
    currentPoints: Record<string, number>;             // userId -> points
    playersCurrentPoints: Record<string, number>;      // alias for backwards compat
    lastPlayedCard: NormalizedCard | null;
    lastPlayedPosition: { x: number; y: number } | null;
    // Player hands - needed for GameInventory
    gameUsersWithCards: GameUserWithCardsInfo[];
    // Raw allowed placements - needed for card validation
    allowedUserCardsPlacement: AllowedUserCardsPlacement | null;
  };

  // Derived state
  board: GameBoard;
  isMyTurn: boolean;
  currentPlayerId: string | null;

  // Animation state
  pendingAnimation: PendingAnimation | null;
  processedMoveKeys: Set<string>;

  // Optimistic state
  optimisticMoves: GameMove[];

  // Meta
  isLoading: boolean;
  error: string | null;
}

// ============================================================
// INITIAL STATE
// ============================================================

export const initialGameState: GameReducerState = {
  serverState: {
    gameId: null,
    state: null,
    turnForPlayer: null,
    tableSizeX: 7,
    tableSizeY: 5,
    allGamePlayers: [],
    gameTableCards: {},
    allowedPlacements: {},
    currentPoints: {},
    playersCurrentPoints: {},
    lastPlayedCard: null,
    lastPlayedPosition: null,
    gameUsersWithCards: [],
    allowedUserCardsPlacement: null,
  },
  board: [],
  isMyTurn: false,
  currentPlayerId: null,
  pendingAnimation: null,
  processedMoveKeys: new Set(),
  optimisticMoves: [],
  isLoading: false,
  error: null,
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Normalize server table cards to our internal format
 */
function normalizeTableCards(
  serverTableCards?: { additionalProperties?: Record<string, ServerTableCard[]> }
): Record<string, NormalizedCard[]> {
  if (!serverTableCards?.additionalProperties) {
    return {};
  }

  const result: Record<string, NormalizedCard[]> = {};

  for (const [key, cards] of Object.entries(serverTableCards.additionalProperties)) {
    if (Array.isArray(cards)) {
      result[key] = cards.map((card) => {
        // Check if this is an NFT card BEFORE we generate a fallback id
        const isNft = !!card.id && card.id !== '';
        return {
          id: card.id || `${card.suit}-${card.value}-${card.userId}`,
          suit: card.suit.toLowerCase(),
          value: String(card.value).toLowerCase(),
          userId: card.userId,
          powerLevel: card.powerLevel,
          scoringLevel: card.scoringLevel,
          imageUrl: card.imageUrl,
          videoUrl: card.videoUrl,
          isNft,
        };
      });
    }
  }

  return result;
}

/**
 * Normalize server lastPlayedCard to our format
 */
function normalizeLastPlayedCard(serverCard?: ServerLastPlayedCard): NormalizedCard | null {
  if (!serverCard) return null;

  // Check if this is an NFT card BEFORE we generate a fallback id
  const isNft = !!serverCard.id && serverCard.id !== '';

  return {
    id: serverCard.id || `${serverCard.suit}-${serverCard.value}-${serverCard.userId}`,
    suit: serverCard.suit.toLowerCase(),
    value: String(serverCard.value).toLowerCase(),
    userId: serverCard.userId,
    powerLevel: serverCard.powerLevel,
    scoringLevel: serverCard.scoringLevel,
    imageUrl: serverCard.imageUrl,
    videoUrl: serverCard.videoUrl,
    isNft,
  };
}

/**
 * Normalize allowed placements from server format
 */
function normalizeAllowedPlacements(
  serverPlacements?: { additionalProperties?: Record<string, unknown[]> }
): Record<string, boolean> {
  if (!serverPlacements?.additionalProperties) {
    return {};
  }

  const result: Record<string, boolean> = {};
  for (const key of Object.keys(serverPlacements.additionalProperties)) {
    result[key] = true;
  }
  return result;
}

/**
 * Normalize player points from server format
 * Server sends points directly as Record<userId, number> (not wrapped in additionalProperties)
 */
function normalizePoints(
  serverPoints?: Record<string, unknown>
): Record<string, number> {
  console.log('[DEBUG normalizePoints] input:', serverPoints);
  if (!serverPoints) {
    console.log('[DEBUG normalizePoints] no serverPoints, returning {}');
    return {};
  }

  // Handle wrapped format: { additionalProperties: { "userId1": 10, "userId2": 20 } }
  if ('additionalProperties' in serverPoints &&
      serverPoints.additionalProperties &&
      typeof serverPoints.additionalProperties === 'object') {
    const additionalProps = serverPoints.additionalProperties as Record<string, number>;
    const result = { ...additionalProps };
    console.log('[DEBUG normalizePoints] wrapped format, result:', result);
    return result;
  }

  // Direct format: { "userId1": 10, "userId2": 20 }
  // Filter out non-numeric values for safety
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(serverPoints)) {
    if (typeof value === 'number') {
      result[key] = value;
    }
  }
  console.log('[DEBUG normalizePoints] direct format, result:', result);
  return result;
}

/**
 * Derive the game board from server table cards
 */
function deriveBoard(
  tableCards: Record<string, NormalizedCard[]>,
  tableSizeX: number,
  tableSizeY: number,
  allowedPlacements: Record<string, boolean>
): GameBoard {
  const board: GameBoard = [];

  for (let y = 0; y < tableSizeY; y++) {
    const row: BoardCell[] = [];
    for (let x = 0; x < tableSizeX; x++) {
      const key = `${x}-${y}`;
      const cards = tableCards[key] || [];
      const isDropTarget = allowedPlacements[key] || false;

      // A cell is considered "empty" (droppable placeholder) if it has no cards
      // but is adjacent to a cell with cards
      const hasAdjacentCards = hasCardsAdjacent(tableCards, x, y, tableSizeX, tableSizeY);
      const isEmpty = cards.length === 0 && hasAdjacentCards;

      row.push({
        x,
        y,
        cards,
        isEmpty,
        isDropTarget,
      });
    }
    board.push(row);
  }

  return board;
}

/**
 * Check if any adjacent cell has cards
 */
function hasCardsAdjacent(
  tableCards: Record<string, NormalizedCard[]>,
  x: number,
  y: number,
  tableSizeX: number,
  tableSizeY: number
): boolean {
  const adjacent = [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ];

  for (const [ax, ay] of adjacent) {
    if (ax >= 0 && ax < tableSizeX && ay >= 0 && ay < tableSizeY) {
      const key = `${ax}-${ay}`;
      if (tableCards[key] && tableCards[key].length > 0) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Add a card to the board (for optimistic updates)
 */
function addCardToBoard(
  board: GameBoard,
  position: { x: number; y: number },
  card: NormalizedCard
): GameBoard {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell, cards: [...cell.cards] })));

  if (newBoard[position.y] && newBoard[position.y][position.x]) {
    newBoard[position.y][position.x].cards.push(card);
    newBoard[position.y][position.x].isEmpty = false;
  }

  return newBoard;
}

/**
 * Check if a move matches the server's last played card
 */
function isMatchingMove(
  move: GameMove,
  serverCard: NormalizedCard | null
): boolean {
  if (!serverCard) return false;

  return (
    move.card.suit.toLowerCase() === serverCard.suit.toLowerCase() &&
    move.card.value.toLowerCase() === serverCard.value.toLowerCase() &&
    move.card.userId === serverCard.userId
  );
}

// ============================================================
// REDUCER
// ============================================================

export function gameReducer(state: GameReducerState, action: GameAction): GameReducerState {
  switch (action.type) {
    case 'GAME_STATE_RECEIVED': {
      const serverData = action.payload;

      // Normalize server state
      const gameTableCards = normalizeTableCards(serverData.gameTableCards);
      const lastPlayedCard = normalizeLastPlayedCard(serverData.lastPlayedCard);
      const allowedPlacements = normalizeAllowedPlacements(serverData.allowedUserCardsPlacement);

      // Find position of last played card
      const lastPlayedPosition = lastPlayedCard
        ? findCardPosition(gameTableCards, lastPlayedCard)
        : null;

      // Generate move key for new card (if any)
      const newMoveKey = lastPlayedCard && lastPlayedPosition
        ? generateMoveKey(lastPlayedCard, lastPlayedPosition)
        : null;

      // Check if this is a new move we haven't processed
      const isNewMove = newMoveKey && !state.processedMoveKeys.has(newMoveKey);

      logAnimation('STATE_RECEIVED', {
        moveKey: newMoveKey,
        isNewMove,
        processedKeys: state.processedMoveKeys.size,
        card: lastPlayedCard ? `${lastPlayedCard.suit}-${lastPlayedCard.value}` : null,
      });

      // Derive board from server state
      const board = deriveBoard(
        gameTableCards,
        serverData.tableSizeX,
        serverData.tableSizeY,
        allowedPlacements
      );

      // Build new processed keys set
      const newProcessedKeys = new Set(state.processedMoveKeys);
      if (newMoveKey) {
        newProcessedKeys.add(newMoveKey);
      }

      // Check if we already have this animation pending (from optimistic update)
      // If so, update it with the server's scoringLevel but don't start a new one
      let pendingAnimation = state.pendingAnimation;

      if (isNewMove && newMoveKey && lastPlayedCard && lastPlayedPosition) {
        // Only set pending animation if we don't already have one for this move
        if (!state.pendingAnimation || state.pendingAnimation.moveKey !== newMoveKey) {
          pendingAnimation = {
            moveKey: newMoveKey,
            card: lastPlayedCard,
            position: lastPlayedPosition,
            scoringLevel: lastPlayedCard.scoringLevel || 0,
            playerId: lastPlayedCard.userId,
          };
        } else {
          // Update existing animation with server's scoringLevel
          pendingAnimation = {
            ...state.pendingAnimation,
            scoringLevel: lastPlayedCard.scoringLevel || 0,
          };
        }
      }

      return {
        ...state,
        serverState: {
          gameId: serverData.gameId,
          state: serverData.state,
          turnForPlayer: serverData.turnForPlayer,
          tableSizeX: serverData.tableSizeX,
          tableSizeY: serverData.tableSizeY,
          allGamePlayers: serverData.allGamePlayers || [],
          gameTableCards,
          allowedPlacements,
          currentPoints: normalizePoints(serverData.playersCurrentPoints),
          playersCurrentPoints: normalizePoints(serverData.playersCurrentPoints),
          lastPlayedCard,
          lastPlayedPosition,
          // Store raw data needed by consumers
          gameUsersWithCards: serverData.gameUsersWithCards || [],
          allowedUserCardsPlacement: serverData.allowedUserCardsPlacement || null,
        },
        board,
        isMyTurn: serverData.turnForPlayer === state.currentPlayerId,
        pendingAnimation,
        processedMoveKeys: newProcessedKeys,
        // Remove confirmed optimistic moves
        optimisticMoves: state.optimisticMoves.filter(
          (m) => !isMatchingMove(m, lastPlayedCard)
        ),
      };
    }

    case 'LOCAL_MOVE_INITIATED': {
      const move = action.payload;

      logAnimation('LOCAL_MOVE', {
        moveKey: move.moveKey,
        card: `${move.card.suit}-${move.card.value}`,
        position: move.position,
      });

      // Pre-register the move key so we don't animate again on server confirm
      const newProcessedKeys = new Set(state.processedMoveKeys);
      newProcessedKeys.add(move.moveKey);

      return {
        ...state,
        // Add to optimistic moves
        optimisticMoves: [...state.optimisticMoves, move],
        // Pre-register the move key
        processedMoveKeys: newProcessedKeys,
        // Set pending animation for local move
        pendingAnimation: {
          moveKey: move.moveKey,
          card: move.card,
          position: move.position,
          scoringLevel: 0, // Will be updated on server confirm
          playerId: move.playerId,
        },
        // Optimistically update board
        board: addCardToBoard(state.board, move.position, move.card),
      };
    }

    case 'LOCAL_MOVE_CONFIRMED': {
      return {
        ...state,
        optimisticMoves: state.optimisticMoves.map((m) =>
          m.moveKey === action.payload.moveKey ? { ...m, confirmed: true } : m
        ),
      };
    }

    case 'LOCAL_MOVE_REJECTED': {
      // Remove the rejected move from optimistic state
      // Board will be corrected on next server state
      return {
        ...state,
        optimisticMoves: state.optimisticMoves.filter(
          (m) => m.moveKey !== action.payload.moveKey
        ),
        error: action.payload.error,
      };
    }

    case 'ANIMATION_STARTED': {
      logAnimation('ANIM_START', {
        moveKey: action.payload.moveKey,
      });

      return state;
    }

    case 'ANIMATION_COMPLETED': {
      logAnimation('ANIM_COMPLETE', {
        moveKey: action.payload.moveKey,
      });

      return {
        ...state,
        pendingAnimation:
          state.pendingAnimation?.moveKey === action.payload.moveKey
            ? null
            : state.pendingAnimation,
      };
    }

    case 'SET_CURRENT_PLAYER': {
      return {
        ...state,
        currentPlayerId: action.payload.userId,
        isMyTurn: state.serverState.turnForPlayer === action.payload.userId,
      };
    }

    case 'RESET_GAME': {
      return {
        ...initialGameState,
        currentPlayerId: state.currentPlayerId,
      };
    }

    default:
      return state;
  }
}
