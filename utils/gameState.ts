/**
 * Global game state management
 *
 * This module replaces the window.* global state anti-pattern.
 * It provides a centralized, type-safe way to manage game state
 * that needs to be accessed across components outside of React context.
 */

// Using flexible types to match actual usage in components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SelectedCardType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GameStateType = any;

interface GlobalGameState {
  gameStarted: boolean;
  roomId: string | null;
  userId: string | null;
  results: boolean;
  isConnectionClosed: boolean;
  selectedCard: SelectedCardType | null;
  state: GameStateType | null;
  user: string | null; // JSON string of user object
}

const initialState: GlobalGameState = {
  gameStarted: false,
  roomId: null,
  userId: null,
  results: false,
  isConnectionClosed: false,
  selectedCard: null,
  state: null,
  user: null,
};

// Internal state object
let gameState: GlobalGameState = { ...initialState };

/**
 * Get the current game state
 */
export const getGameState = (): Readonly<GlobalGameState> => {
  return { ...gameState };
};

/**
 * Update game state with partial updates
 */
export const setGameState = (updates: Partial<GlobalGameState>): void => {
  gameState = { ...gameState, ...updates };
};

/**
 * Reset game state to initial values
 */
export const resetGameState = (): void => {
  gameState = { ...initialState };
};

// Convenience getters for common operations
export const isGameStarted = (): boolean => gameState.gameStarted;
export const getRoomId = (): string | null => gameState.roomId;
export const getUserId = (): string | null => gameState.userId;
export const hasResults = (): boolean => gameState.results;
export const isConnectionClosed = (): boolean => gameState.isConnectionClosed;
export const getSelectedCard = (): SelectedCardType | null => gameState.selectedCard;
export const getState = (): GameStateType | null => gameState.state;
export const getUser = (): string | null => gameState.user;

// Convenience setters for common operations
export const setGameStarted = (started: boolean): void => {
  gameState.gameStarted = started;
};

export const setRoomId = (roomId: string | null): void => {
  gameState.roomId = roomId;
};

export const setUserId = (userId: string | null): void => {
  gameState.userId = userId;
};

export const setResults = (results: boolean): void => {
  gameState.results = results;
};

export const setConnectionClosed = (closed: boolean): void => {
  gameState.isConnectionClosed = closed;
};

export const setSelectedCard = (card: SelectedCardType | null): void => {
  gameState.selectedCard = card;
};

export const setState = (state: GameStateType | null): void => {
  gameState.state = state;
};

export const setUser = (user: string | null): void => {
  gameState.user = user;
};
