import {
  getGameState,
  setGameState,
  resetGameState,
  isGameStarted,
  getRoomId,
  getUserId,
  hasResults,
  isConnectionClosed,
  getSelectedCard,
  getState,
  getUser,
  setGameStarted,
  setRoomId,
  setUserId,
  setResults,
  setConnectionClosed,
  setSelectedCard,
  setState,
  setUser,
} from '../gameState';

describe('gameState', () => {
  // Reset state before each test
  beforeEach(() => {
    resetGameState();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = getGameState();
      expect(state.gameStarted).toBe(false);
      expect(state.roomId).toBeNull();
      expect(state.userId).toBeNull();
      expect(state.results).toBe(false);
      expect(state.isConnectionClosed).toBe(false);
      expect(state.selectedCard).toBeNull();
      expect(state.state).toBeNull();
      expect(state.user).toBeNull();
    });
  });

  describe('setGameState', () => {
    it('should update partial state', () => {
      setGameState({ gameStarted: true, roomId: 'room-123' });

      const state = getGameState();
      expect(state.gameStarted).toBe(true);
      expect(state.roomId).toBe('room-123');
      expect(state.userId).toBeNull(); // unchanged
    });

    it('should merge updates with existing state', () => {
      setGameState({ gameStarted: true });
      setGameState({ roomId: 'room-456' });

      const state = getGameState();
      expect(state.gameStarted).toBe(true);
      expect(state.roomId).toBe('room-456');
    });
  });

  describe('resetGameState', () => {
    it('should reset all values to initial state', () => {
      setGameState({
        gameStarted: true,
        roomId: 'room-123',
        userId: 'user-456',
        results: true,
      });

      resetGameState();

      const state = getGameState();
      expect(state.gameStarted).toBe(false);
      expect(state.roomId).toBeNull();
      expect(state.userId).toBeNull();
      expect(state.results).toBe(false);
    });
  });

  describe('convenience getters', () => {
    it('isGameStarted should return gameStarted value', () => {
      expect(isGameStarted()).toBe(false);
      setGameStarted(true);
      expect(isGameStarted()).toBe(true);
    });

    it('getRoomId should return roomId value', () => {
      expect(getRoomId()).toBeNull();
      setRoomId('room-123');
      expect(getRoomId()).toBe('room-123');
    });

    it('getUserId should return userId value', () => {
      expect(getUserId()).toBeNull();
      setUserId('user-456');
      expect(getUserId()).toBe('user-456');
    });

    it('hasResults should return results value', () => {
      expect(hasResults()).toBe(false);
      setResults(true);
      expect(hasResults()).toBe(true);
    });

    it('isConnectionClosed should return isConnectionClosed value', () => {
      expect(isConnectionClosed()).toBe(false);
      setConnectionClosed(true);
      expect(isConnectionClosed()).toBe(true);
    });

    it('getSelectedCard should return selectedCard value', () => {
      expect(getSelectedCard()).toBeNull();
      const card = { id: 'card-1', name: 'Test Card' };
      setSelectedCard(card);
      expect(getSelectedCard()).toEqual(card);
    });

    it('getState should return state value', () => {
      expect(getState()).toBeNull();
      const gameState = { state: 'started', players: [] };
      setState(gameState);
      expect(getState()).toEqual(gameState);
    });

    it('getUser should return user value', () => {
      expect(getUser()).toBeNull();
      const userJson = JSON.stringify({ id: 'user-1', name: 'Test' });
      setUser(userJson);
      expect(getUser()).toBe(userJson);
    });
  });

  describe('immutability', () => {
    it('getGameState should return a copy, not the original', () => {
      setGameState({ gameStarted: true });
      const state = getGameState();

      // Modifying the returned object should not affect internal state
      (state as { gameStarted: boolean }).gameStarted = false;

      expect(isGameStarted()).toBe(true);
    });
  });
});
