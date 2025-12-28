/**
 * Tests for WebSocket Event Handlers
 *
 * Updated to use standardized handleX(eventData, deps) pattern.
 */

import {
  handleTimer,
  handleUserSocketIdle,
  handleUserInfo,
  handleCreateRoom,
  handleCloseRoom,
  handleRoomUpdated,
  handleRoomInfo,
  handleQuitRoom,
  handleGameResults,
  handleWSClose,
  HandlerDeps,
} from '../wsEventHandlers';
import * as gameState from '../gameState';

// Mock gameState module
jest.mock('../gameState', () => ({
  isGameStarted: jest.fn(),
  setGameStarted: jest.fn(),
  hasResults: jest.fn(),
  setResults: jest.fn(),
  getUserId: jest.fn(),
  setUserId: jest.fn(),
  setConnectionClosed: jest.fn(),
}));

/**
 * Create mock deps object for testing
 */
function createMockDeps(overrides: Partial<HandlerDeps> = {}): HandlerDeps {
  return {
    notifications: {
      openNotification: jest.fn(),
      closeNotification: jest.fn(),
    },
    stateSetters: {
      setTimer: jest.fn(),
      setTotalSeconds: jest.fn(),
      setUserSocketIdle: jest.fn(),
      setUserInfo: jest.fn(),
      setIsBackendReady: jest.fn(),
      setRoomId: jest.fn(),
      setResults: jest.fn(),
      setRoomInfo: jest.fn(),
      setPlayers: jest.fn(),
      setPlayingAgain: jest.fn(),
      setIsAlreadyConnected: jest.fn(),
      setGameState: jest.fn(),
    },
    router: { push: jest.fn() } as any,
    wsProvider: { send: jest.fn(), close: jest.fn() },
    uiActions: {
      quit: jest.fn(),
      reload: jest.fn(),
      newGame: jest.fn(),
      playStartGameSound: jest.fn(),
    },
    render: {
      renderWarningIcon: jest.fn().mockReturnValue('warning-icon'),
      renderQuitButton: jest.fn().mockReturnValue('quit-button'),
      renderNewGameButton: jest.fn().mockReturnValue('new-game-button'),
      renderReloadButton: jest.fn().mockReturnValue('reload-button'),
      renderDashboardButton: jest.fn().mockReturnValue('dashboard-button'),
      renderGameEndedNotification: jest.fn().mockReturnValue('game-ended'),
    },
    getGameState: jest.fn().mockReturnValue(null),
    ...overrides,
  };
}

describe('wsEventHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleTimer', () => {
    it('should set timer and total seconds', () => {
      const deps = createMockDeps();

      handleTimer({ secondsLeft: 30, totalSeconds: 60 }, deps);

      expect(deps.stateSetters.setTimer).toHaveBeenCalledWith(30);
      expect(deps.stateSetters.setTotalSeconds).toHaveBeenCalledWith(60);
    });
  });

  describe('handleUserSocketIdle', () => {
    it('should set user socket idle data', () => {
      const deps = createMockDeps();
      const data = { userId: 'user123' };

      handleUserSocketIdle(data, deps);

      expect(deps.stateSetters.setUserSocketIdle).toHaveBeenCalledWith(data);
    });
  });

  describe('handleUserInfo', () => {
    it('should set user info and mark backend as ready', () => {
      const deps = createMockDeps();
      const data = { userId: 'user123', username: 'testuser' };

      handleUserInfo(data, deps);

      expect(deps.stateSetters.setUserInfo).toHaveBeenCalledWith(data);
      expect(gameState.setUserId).toHaveBeenCalledWith('user123');
      expect(deps.stateSetters.setIsBackendReady).toHaveBeenCalledWith(true);
    });
  });

  describe('handleCreateRoom', () => {
    it('should set room id and request room info on success', () => {
      const deps = createMockDeps();
      const data = { roomId: 'room123' };

      handleCreateRoom(data, deps);

      expect(deps.stateSetters.setRoomId).toHaveBeenCalledWith('room123');
      expect(deps.wsProvider.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'room-info', data: {} })
      );
      expect(deps.router.push).not.toHaveBeenCalled();
    });

    it('should redirect to dashboard on error', () => {
      const deps = createMockDeps();
      const data = { error: { message: 'User already in room' } };

      handleCreateRoom(data, deps);

      expect(deps.stateSetters.setRoomId).not.toHaveBeenCalled();
      expect(deps.wsProvider.send).not.toHaveBeenCalled();
      expect(deps.router.push).toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect to dashboard when no roomId in response', () => {
      const deps = createMockDeps();
      const data = {};

      handleCreateRoom(data, deps);

      expect(deps.stateSetters.setRoomId).not.toHaveBeenCalled();
      expect(deps.router.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('handleCloseRoom', () => {
    it('should call quit and return STOP for TIMEOUT', () => {
      const deps = createMockDeps();

      const result = handleCloseRoom({ reason: 'TIMEOUT' }, deps);

      expect(deps.uiActions.quit).toHaveBeenCalled();
      expect(result.handled).toBe(true);
    });

    it('should call quit and return STOP for NEXT_GAME_VOTE_FAILED', () => {
      const deps = createMockDeps();

      const result = handleCloseRoom({ reason: 'NEXT_GAME_VOTE_FAILED' }, deps);

      expect(deps.uiActions.quit).toHaveBeenCalled();
      expect(result.handled).toBe(true);
    });

    it('should show notification when closed by different owner', () => {
      (gameState.getUserId as jest.Mock).mockReturnValue('user456');
      (gameState.hasResults as jest.Mock).mockReturnValue(false);

      const deps = createMockDeps();

      handleCloseRoom({ ownderId: 'user123' }, deps);

      expect(deps.notifications.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Ooopps',
          dark: false,
        })
      );
    });

    it('should not show notification when owner is same user', () => {
      (gameState.getUserId as jest.Mock).mockReturnValue('user123');
      (gameState.hasResults as jest.Mock).mockReturnValue(false);

      const deps = createMockDeps();

      handleCloseRoom({ ownderId: 'user123' }, deps);

      expect(deps.notifications.openNotification).not.toHaveBeenCalled();
    });
  });

  describe('handleRoomUpdated', () => {
    it('should update state and navigate when has results (play again)', () => {
      (gameState.hasResults as jest.Mock).mockReturnValue(true);

      const deps = createMockDeps();
      const data = { roomId: 'room123', roomUsers: [] };

      const result = handleRoomUpdated(data, deps);

      expect(result.handled).toBe(true);
      expect(deps.stateSetters.setResults).toHaveBeenCalledWith(null);
      expect(deps.notifications.closeNotification).toHaveBeenCalled();
      expect(deps.stateSetters.setRoomInfo).toHaveBeenCalledWith(data);
      expect(deps.stateSetters.setPlayers).toHaveBeenCalledWith([]);
      expect(deps.stateSetters.setPlayingAgain).toHaveBeenCalledWith(null);
      expect(gameState.setResults).toHaveBeenCalledWith(false);
      expect(deps.router.push).toHaveBeenCalledWith('/game/room123');
    });

    it('should update room info normally when no results', () => {
      (gameState.hasResults as jest.Mock).mockReturnValue(false);

      const deps = createMockDeps();
      const data = { roomUsers: ['player1', 'player2'] };

      const result = handleRoomUpdated(data, deps);

      expect(result.handled).toBe(false);
      expect(deps.stateSetters.setRoomInfo).toHaveBeenCalledWith(data);
      expect(deps.stateSetters.setPlayers).toHaveBeenCalledWith(data.roomUsers);
    });
  });

  describe('handleRoomInfo', () => {
    it('should update room info and players', () => {
      const deps = createMockDeps();
      const data = { roomUsers: ['player1', 'player2'] };

      handleRoomInfo(data, deps);

      expect(deps.stateSetters.setRoomInfo).toHaveBeenCalledWith(data);
      expect(deps.stateSetters.setPlayers).toHaveBeenCalledWith(data.roomUsers);
    });

    it('should not call setPlayers if roomUsers is undefined', () => {
      const deps = createMockDeps();
      const data = {};

      handleRoomInfo(data, deps);

      expect(deps.stateSetters.setRoomInfo).toHaveBeenCalledWith(data);
      expect(deps.stateSetters.setPlayers).not.toHaveBeenCalled();
    });
  });

  describe('handleQuitRoom', () => {
    it('should show notification when kicked by room owner', () => {
      const deps = createMockDeps();

      handleQuitRoom({ reason: 'KICKED_BY_ROOM_OWNER' }, deps);

      expect(deps.notifications.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'You were kicked!',
          dark: true,
        })
      );
    });

    it('should show notification when player left', () => {
      const deps = createMockDeps();

      handleQuitRoom({ reason: 'PLAYER_LEFT' }, deps);

      expect(deps.notifications.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Opponent left',
        })
      );
    });

    it('should not show notification for other reasons', () => {
      const deps = createMockDeps();

      handleQuitRoom({ reason: 'LEFT' }, deps);

      expect(deps.notifications.openNotification).not.toHaveBeenCalled();
    });
  });

  describe('handleGameResults', () => {
    it('should set results and global results flag', () => {
      const deps = createMockDeps();
      const data = { winnerPlayersUserIds: ['user1'] };

      handleGameResults(data, deps);

      expect(deps.stateSetters.setResults).toHaveBeenCalledWith(data);
      expect(gameState.setResults).toHaveBeenCalledWith(true);
    });
  });

  describe('handleWSClose', () => {
    beforeEach(() => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });
    });

    it('should set already connected for code 4000', () => {
      const deps = createMockDeps();

      handleWSClose({ code: 4000 }, deps);

      expect(deps.stateSetters.setIsAlreadyConnected).toHaveBeenCalledWith(true);
      expect(deps.wsProvider.close).toHaveBeenCalled();
    });

    it('should not set already connected for code 4000 when adding metamask', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('true');

      const deps = createMockDeps();

      handleWSClose({ code: 4000 }, deps);

      expect(deps.stateSetters.setIsAlreadyConnected).not.toHaveBeenCalled();
      expect(deps.wsProvider.close).toHaveBeenCalled();
    });

    it('should show notification and set connection closed for code 4001', () => {
      const deps = createMockDeps();

      handleWSClose({ code: 4001 }, deps);

      expect(deps.notifications.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Already connected!',
        })
      );
      expect(gameState.setConnectionClosed).toHaveBeenCalledWith(true);
      expect(deps.wsProvider.close).toHaveBeenCalled();
    });
  });
});
