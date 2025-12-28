/**
 * Store exports
 *
 * Central export point for game state management
 */

export { gameReducer, initialGameState } from './gameReducer';
export type { GameReducerState } from './gameReducer';

export {
  gameStateReceived,
  localMoveInitiated,
  localMoveConfirmed,
  localMoveRejected,
  animationStarted,
  animationCompleted,
  setCurrentPlayer,
  resetGame,
} from './gameActions';
export type { GameAction, GameStatePayload } from './gameActions';
