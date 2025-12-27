/**
 * Tests for WebSocket Event Handlers
 */

import {
  handleTimer,
  handleUserSocketIdle,
  handleUserInfo,
  handleCreateRoom,
  handleCloseRoomTimeout,
  handleCloseRoomByOwner,
  handleRoomUpdatedWithResults,
  handleRoomUpdate,
  handleQuitRoom,
  handleJoiningWhileHostingError,
  handleGameResults,
  handlePlayerNotInRoomError,
  handleWSClose,
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

describe('wsEventHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleTimer', () => {
    it('should set timer and total seconds', () => {
      const setters = {
        setTimer: jest.fn(),
        setTotalSeconds: jest.fn(),
      };

      handleTimer({ secondsLeft: 30, totalSeconds: 60 }, setters);

      expect(setters.setTimer).toHaveBeenCalledWith(30);
      expect(setters.setTotalSeconds).toHaveBeenCalledWith(60);
    });
  });

  describe('handleUserSocketIdle', () => {
    it('should set user socket idle data', () => {
      const setters = { setUserSocketIdle: jest.fn() };
      const data = { userId: 'user123' };

      handleUserSocketIdle(data, setters);

      expect(setters.setUserSocketIdle).toHaveBeenCalledWith(data);
    });
  });

  describe('handleUserInfo', () => {
    it('should set user info and mark backend as ready', () => {
      const setters = {
        setUserInfo: jest.fn(),
        setIsBackendReady: jest.fn(),
      };
      const data = { userId: 'user123', username: 'testuser' };

      handleUserInfo(data, setters);

      expect(setters.setUserInfo).toHaveBeenCalledWith(data);
      expect(gameState.setUserId).toHaveBeenCalledWith('user123');
      expect(setters.setIsBackendReady).toHaveBeenCalledWith(true);
    });
  });

  describe('handleCreateRoom', () => {
    it('should set room id and request room info', () => {
      const setters = { setRoomId: jest.fn() };
      const wsProvider = { send: jest.fn(), close: jest.fn() };
      const data = { roomId: 'room123' };

      handleCreateRoom(data, setters, wsProvider);

      expect(setters.setRoomId).toHaveBeenCalledWith('room123');
      expect(wsProvider.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'room-info', data: {} })
      );
    });
  });

  describe('handleCloseRoomTimeout', () => {
    it('should call quit and return true for TIMEOUT', () => {
      const uiActions = { quit: jest.fn() };

      const result = handleCloseRoomTimeout({ reason: 'TIMEOUT' }, uiActions);

      expect(uiActions.quit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call quit and return true for NEXT_GAME_VOTE_FAILED', () => {
      const uiActions = { quit: jest.fn() };

      const result = handleCloseRoomTimeout({ reason: 'NEXT_GAME_VOTE_FAILED' }, uiActions);

      expect(uiActions.quit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false for other reasons', () => {
      const uiActions = { quit: jest.fn() };

      const result = handleCloseRoomTimeout({ reason: 'OTHER' }, uiActions);

      expect(uiActions.quit).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleCloseRoomByOwner', () => {
    it('should open notification when closed by different owner without results', () => {
      (gameState.getUserId as jest.Mock).mockReturnValue('user456');
      (gameState.hasResults as jest.Mock).mockReturnValue(false);

      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };
      const renderWarningIcon = jest.fn().mockReturnValue('warning-icon');
      const renderQuitButton = jest.fn().mockReturnValue('quit-button');

      handleCloseRoomByOwner(
        { ownderId: 'user123' },
        notifications,
        renderWarningIcon,
        renderQuitButton
      );

      expect(notifications.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Ooopps',
          dark: false,
        })
      );
    });

    it('should not open notification when owner is the same user', () => {
      (gameState.getUserId as jest.Mock).mockReturnValue('user123');
      (gameState.hasResults as jest.Mock).mockReturnValue(false);

      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };

      handleCloseRoomByOwner(
        { ownderId: 'user123' },
        notifications,
        jest.fn(),
        jest.fn()
      );

      expect(notifications.openNotification).not.toHaveBeenCalled();
    });

    it('should not open notification when there are results', () => {
      (gameState.getUserId as jest.Mock).mockReturnValue('user456');
      (gameState.hasResults as jest.Mock).mockReturnValue(true);

      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };

      handleCloseRoomByOwner(
        { ownderId: 'user123' },
        notifications,
        jest.fn(),
        jest.fn()
      );

      expect(notifications.openNotification).not.toHaveBeenCalled();
    });
  });

  describe('handleRoomUpdatedWithResults', () => {
    it('should update state and navigate when has results', () => {
      (gameState.hasResults as jest.Mock).mockReturnValue(true);

      const setters = {
        setResults: jest.fn(),
        setRoomInfo: jest.fn(),
        setPlayers: jest.fn(),
        setPlayingAgain: jest.fn(),
      };
      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };
      const router = { push: jest.fn() } as any;
      const data = { roomId: 'room123', roomUsers: [] };

      const result = handleRoomUpdatedWithResults(data, setters, notifications, router);

      expect(result).toBe(true);
      expect(setters.setResults).toHaveBeenCalledWith(null);
      expect(notifications.closeNotification).toHaveBeenCalled();
      expect(setters.setRoomInfo).toHaveBeenCalledWith(data);
      expect(setters.setPlayers).toHaveBeenCalledWith([]);
      expect(setters.setPlayingAgain).toHaveBeenCalledWith(null);
      expect(gameState.setResults).toHaveBeenCalledWith(false);
      expect(router.push).toHaveBeenCalledWith('/game/room123');
    });

    it('should return false when no results', () => {
      (gameState.hasResults as jest.Mock).mockReturnValue(false);

      const result = handleRoomUpdatedWithResults(
        {},
        {} as any,
        { openNotification: jest.fn(), closeNotification: jest.fn() },
        { push: jest.fn() } as any
      );

      expect(result).toBe(false);
    });
  });

  describe('handleRoomUpdate', () => {
    it('should update room info and players', () => {
      const setters = {
        setRoomInfo: jest.fn(),
        setPlayers: jest.fn(),
      };
      const data = { roomUsers: ['player1', 'player2'] };

      handleRoomUpdate(data, setters);

      expect(setters.setRoomInfo).toHaveBeenCalledWith(data);
      expect(setters.setPlayers).toHaveBeenCalledWith(data.roomUsers);
    });

    it('should not call setPlayers if roomUsers is undefined', () => {
      const setters = {
        setRoomInfo: jest.fn(),
        setPlayers: jest.fn(),
      };
      const data = {};

      handleRoomUpdate(data, setters);

      expect(setters.setRoomInfo).toHaveBeenCalledWith(data);
      expect(setters.setPlayers).not.toHaveBeenCalled();
    });
  });

  describe('handleQuitRoom', () => {
    it('should open notification when kicked by room owner', () => {
      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };
      const renderQuitButton = jest.fn().mockReturnValue('quit-button');

      handleQuitRoom({ reason: 'KICKED_BY_ROOM_OWNER' }, notifications, renderQuitButton);

      expect(notifications.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'You were kicked!',
          dark: true,
        })
      );
    });

    it('should not open notification for other reasons', () => {
      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };

      handleQuitRoom({ reason: 'LEFT' }, notifications, jest.fn());

      expect(notifications.openNotification).not.toHaveBeenCalled();
    });
  });

  describe('handleJoiningWhileHostingError', () => {
    it('should show notification and return true for hosting error', () => {
      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };
      const renderWarningIcon = jest.fn().mockReturnValue('warning-icon');
      const renderQuitButton = jest.fn().mockReturnValue('quit-button');

      const result = handleJoiningWhileHostingError(
        { error: { message: 'Joining while hosting a game is forbidden' } },
        notifications,
        renderWarningIcon,
        renderQuitButton
      );

      expect(result).toBe(true);
      expect(notifications.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sorry',
        })
      );
    });

    it('should return false for other errors', () => {
      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };

      const result = handleJoiningWhileHostingError(
        { error: { message: 'Some other error' } },
        notifications,
        jest.fn(),
        jest.fn()
      );

      expect(result).toBe(false);
      expect(notifications.openNotification).not.toHaveBeenCalled();
    });
  });

  describe('handleGameResults', () => {
    it('should set results and global results flag', () => {
      const setters = { setResults: jest.fn() };
      const data = { winners: ['user1'] };

      handleGameResults(data, setters);

      expect(setters.setResults).toHaveBeenCalledWith(data);
      expect(gameState.setResults).toHaveBeenCalledWith(true);
    });
  });

  describe('handlePlayerNotInRoomError', () => {
    it('should redirect to dashboard for player not in room error', () => {
      const router = { push: jest.fn() } as any;

      const result = handlePlayerNotInRoomError(
        { error: { message: 'Player must be in a room' } },
        router
      );

      expect(result).toBe(true);
      expect(router.push).toHaveBeenCalledWith('/dashboard');
    });

    it('should return false for other errors', () => {
      const router = { push: jest.fn() } as any;

      const result = handlePlayerNotInRoomError(
        { error: { message: 'Some other error' } },
        router
      );

      expect(result).toBe(false);
      expect(router.push).not.toHaveBeenCalled();
    });

    it('should return false when no error', () => {
      const router = { push: jest.fn() } as any;

      const result = handlePlayerNotInRoomError({}, router);

      expect(result).toBe(false);
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
      const setters = { setIsAlreadyConnected: jest.fn() };
      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };
      const wsProvider = { send: jest.fn(), close: jest.fn() };

      handleWSClose(
        4000,
        setters,
        notifications,
        wsProvider,
        jest.fn(),
        jest.fn()
      );

      expect(setters.setIsAlreadyConnected).toHaveBeenCalledWith(true);
      expect(wsProvider.close).toHaveBeenCalled();
    });

    it('should not set already connected for code 4000 when adding metamask', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('true');

      const setters = { setIsAlreadyConnected: jest.fn() };
      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };
      const wsProvider = { send: jest.fn(), close: jest.fn() };

      handleWSClose(
        4000,
        setters,
        notifications,
        wsProvider,
        jest.fn(),
        jest.fn()
      );

      expect(setters.setIsAlreadyConnected).not.toHaveBeenCalled();
      expect(wsProvider.close).toHaveBeenCalled();
    });

    it('should show notification and set connection closed for code 4001', () => {
      const setters = { setIsAlreadyConnected: jest.fn() };
      const notifications = {
        openNotification: jest.fn(),
        closeNotification: jest.fn(),
      };
      const wsProvider = { send: jest.fn(), close: jest.fn() };
      const renderWarningIcon = jest.fn().mockReturnValue('warning-icon');
      const renderReloadButton = jest.fn().mockReturnValue('reload-button');

      handleWSClose(
        4001,
        setters,
        notifications,
        wsProvider,
        renderWarningIcon,
        renderReloadButton
      );

      expect(notifications.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Already connected!',
        })
      );
      expect(gameState.setConnectionClosed).toHaveBeenCalledWith(true);
      expect(wsProvider.close).toHaveBeenCalled();
    });
  });
});
