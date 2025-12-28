/**
 * Game Action Types and Creators
 *
 * These actions represent all state changes in the game system.
 * The reducer handles each action type to produce a new state.
 */

import { NormalizedCard, GameMove, PendingAnimation, GamePlayer } from '../types/game';

// ============================================================
// ACTION TYPES
// ============================================================

export type GameAction =
  | { type: 'GAME_STATE_RECEIVED'; payload: GameStatePayload }
  | { type: 'LOCAL_MOVE_INITIATED'; payload: GameMove }
  | { type: 'LOCAL_MOVE_CONFIRMED'; payload: { moveKey: string } }
  | { type: 'LOCAL_MOVE_REJECTED'; payload: { moveKey: string; error: string } }
  | { type: 'ANIMATION_STARTED'; payload: { moveKey: string } }
  | { type: 'ANIMATION_COMPLETED'; payload: { moveKey: string } }
  | { type: 'SET_CURRENT_PLAYER'; payload: { userId: string } }
  | { type: 'RESET_GAME' };

// ============================================================
// PAYLOAD TYPES
// ============================================================

/**
 * Payload for GAME_STATE_RECEIVED action
 * This matches the structure of the game-updated event from the server
 */
export interface GameStatePayload {
  gameId: string;
  tableSizeX: number;
  tableSizeY: number;
  state: 'opened' | 'inGame' | 'started' | 'results' | 'ended';
  turnForPlayer: string;
  gameUsersWithCards?: GameUserWithCardsInfo[];
  allGamePlayers: GamePlayer[];
  gameTableCards?: ServerGameTableCards;
  allowedUserCardsPlacement?: AllowedUserCardsPlacement;
  playersCurrentPoints?: PlayersCurrentPoints;
  lastPlayedCard?: ServerLastPlayedCard;
}

/**
 * Server format for player hands
 */
export interface GameUserWithCardsInfo {
  oddsForWin?: number;
  oddsForLose?: number;
  oddsForTie?: number;
  oddsForHalfGame?: number;
  oddsForHalfGameSurpass?: number;
  oddsForHalfGameNotReach?: number;
  oddsForGameSurpass?: number;
  oddsForGameNotReach?: number;
  oddsForExact?: number;
  userId: string;
  username?: string;
  color?: string;
  cards?: ServerCard[];
}

export interface ServerCard {
  id: string;
  name?: string;
  xp?: number;
  power?: number;
  scoring?: number;
  suit: string;
  value: string;
  onSale?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  powerLevel?: number;
  scoringLevel?: number;
}

export interface ServerGameTableCards {
  additionalProperties?: Record<string, ServerTableCard[]>;
}

export interface ServerTableCard {
  id: string;
  name?: string;
  suit: string;
  value: string;
  imageUrl?: string;
  videoUrl?: string;
  powerLevel?: number;
  scoringLevel?: number;
  userId: string;
}

export interface AllowedUserCardsPlacement {
  additionalProperties?: Record<string, AllowedCard[]>;
}

export interface AllowedCard {
  suit: string;
  value: string;
}

/**
 * Server sends points in one of two formats:
 * 1. Direct: { "userId1": 10, "userId2": 20 }
 * 2. Wrapped: { additionalProperties: { "userId1": 10, "userId2": 20 } }
 */
export type PlayersCurrentPoints = Record<string, unknown>;

export interface ServerLastPlayedCard {
  id: string;
  name?: string;
  xp?: number;
  power?: number;
  scoring?: number;
  suit: string;
  value: string;
  onSale?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  powerLevel?: number;
  scoringLevel?: number;
  userId: string;
  score?: number;
}

// ============================================================
// ACTION CREATORS
// ============================================================

/**
 * Called when server sends game-updated event
 */
export function gameStateReceived(payload: GameStatePayload): GameAction {
  return { type: 'GAME_STATE_RECEIVED', payload };
}

/**
 * Called when local player initiates a move (optimistic update)
 */
export function localMoveInitiated(move: GameMove): GameAction {
  return { type: 'LOCAL_MOVE_INITIATED', payload: move };
}

/**
 * Called when server confirms a local move
 */
export function localMoveConfirmed(moveKey: string): GameAction {
  return { type: 'LOCAL_MOVE_CONFIRMED', payload: { moveKey } };
}

/**
 * Called when server rejects a local move
 */
export function localMoveRejected(moveKey: string, error: string): GameAction {
  return { type: 'LOCAL_MOVE_REJECTED', payload: { moveKey, error } };
}

/**
 * Called when animation starts playing
 */
export function animationStarted(moveKey: string): GameAction {
  return { type: 'ANIMATION_STARTED', payload: { moveKey } };
}

/**
 * Called when animation finishes
 */
export function animationCompleted(moveKey: string): GameAction {
  return { type: 'ANIMATION_COMPLETED', payload: { moveKey } };
}

/**
 * Set the current player's user ID
 */
export function setCurrentPlayer(userId: string): GameAction {
  return { type: 'SET_CURRENT_PLAYER', payload: { userId } };
}

/**
 * Reset all game state
 */
export function resetGame(): GameAction {
  return { type: 'RESET_GAME' };
}
