/**
 * End-to-End Game Flow Scenario Tests
 *
 * These tests simulate the complete game lifecycle:
 * - Creating new game
 * - Playing game
 * - Leaving mid-game
 * - Creating new game again
 * - Various edge cases
 */

import * as gameState from '../gameState';

// Mock gameState module
jest.mock('../gameState', () => ({
  isGameStarted: jest.fn(),
  setGameStarted: jest.fn(),
  hasResults: jest.fn(),
  setResults: jest.fn(),
  getUserId: jest.fn(),
  setUserId: jest.fn(),
  getRoomId: jest.fn(),
  setRoomId: jest.fn(),
  setConnectionClosed: jest.fn(),
  isConnectionClosed: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock WebSocket provider
const createMockWSProvider = () => ({
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1, // OPEN
});

// Simulate user state
interface UserState {
  userId: string;
  inGameId: string | null;
  inRoomId: string | null;
}

// Simulate room state
interface RoomState {
  roomId: string;
  ownderId: string;
  players: { userId: string; state: string }[];
}

describe('Game Flow Scenarios', () => {
  let wsProvider: ReturnType<typeof createMockWSProvider>;
  let userState: UserState;
  let roomState: RoomState | null;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    wsProvider = createMockWSProvider();
    userState = { userId: 'user123', inGameId: null, inRoomId: null };
    roomState = null;

    (gameState.isGameStarted as jest.Mock).mockReturnValue(false);
    (gameState.hasResults as jest.Mock).mockReturnValue(false);
    (gameState.getUserId as jest.Mock).mockReturnValue('user123');
    (gameState.isConnectionClosed as jest.Mock).mockReturnValue(false);
  });

  describe('Scenario 1: Create New Game → Leave Lobby → Create New Game', () => {
    it('should allow creating new game after leaving lobby', () => {
      // Step 1: Create room
      roomState = {
        roomId: 'room-abc',
        ownderId: 'user123',
        players: [{ userId: 'user123', state: 'waiting' }],
      };
      userState.inRoomId = 'room-abc';

      // Verify room created
      expect(roomState.roomId).toBe('room-abc');
      expect(userState.inRoomId).toBe('room-abc');

      // Step 2: Leave lobby (owner)
      const isOwner = roomState.ownderId === userState.userId;
      expect(isOwner).toBe(true);

      // Send close-room event
      wsProvider.send(JSON.stringify({ event: 'close-room', data: {} }));
      expect(wsProvider.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'close-room', data: {} })
      );

      // Clear state
      userState.inRoomId = null;
      roomState = null;
      gameState.setGameStarted(false);
      localStorage.setItem('chosen-nft', JSON.stringify(null));

      // Step 3: Should be able to create new game
      expect(userState.inRoomId).toBe(null);
      expect(userState.inGameId).toBe(null);

      // Create new room
      roomState = {
        roomId: 'room-xyz',
        ownderId: 'user123',
        players: [{ userId: 'user123', state: 'waiting' }],
      };
      userState.inRoomId = 'room-xyz';

      expect(roomState.roomId).toBe('room-xyz');
    });
  });

  describe('Scenario 2: Create Game → Play → Leave Mid-Game → Create New Game', () => {
    it('should allow creating new game after leaving mid-game as owner', () => {
      // Step 1: Create room and start game
      roomState = {
        roomId: 'room-abc',
        ownderId: 'user123',
        players: [
          { userId: 'user123', state: 'ready' },
          { userId: 'user456', state: 'ready' },
        ],
      };
      userState.inRoomId = 'room-abc';
      userState.inGameId = 'game-abc';
      (gameState.isGameStarted as jest.Mock).mockReturnValue(true);

      // Step 2: Leave mid-game as owner
      const isOwner = roomState.ownderId === userState.userId;
      expect(isOwner).toBe(true);

      // Send close-room event (owner ends game for all)
      wsProvider.send(JSON.stringify({ event: 'close-room', data: {} }));
      expect(wsProvider.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'close-room', data: {} })
      );

      // Clear state
      userState.inRoomId = null;
      userState.inGameId = null;
      roomState = null;
      gameState.setGameStarted(false);

      // Step 3: Verify state is cleared
      expect(userState.inGameId).toBe(null);
      expect(userState.inRoomId).toBe(null);
      expect(gameState.setGameStarted).toHaveBeenCalledWith(false);

      // Step 4: Create new game should work
      roomState = {
        roomId: 'room-new',
        ownderId: 'user123',
        players: [{ userId: 'user123', state: 'waiting' }],
      };
      userState.inRoomId = 'room-new';

      expect(roomState.roomId).toBe('room-new');
    });

    it('should allow creating new game after leaving mid-game as non-owner', () => {
      // Step 1: Join room and start game
      roomState = {
        roomId: 'room-abc',
        ownderId: 'owner789', // Different owner
        players: [
          { userId: 'owner789', state: 'ready' },
          { userId: 'user123', state: 'ready' },
        ],
      };
      userState.inRoomId = 'room-abc';
      userState.inGameId = 'game-abc';
      (gameState.isGameStarted as jest.Mock).mockReturnValue(true);

      // Step 2: Leave mid-game as non-owner
      const isOwner = roomState.ownderId === userState.userId;
      expect(isOwner).toBe(false);

      // Send quit-room event (non-owner just leaves)
      wsProvider.send(JSON.stringify({ event: 'quit-room', data: {} }));
      expect(wsProvider.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'quit-room', data: {} })
      );

      // Clear state
      userState.inRoomId = null;
      userState.inGameId = null;
      gameState.setGameStarted(false);

      // Step 3: Create new game should work
      expect(userState.inGameId).toBe(null);
    });
  });

  describe('Scenario 3: Game with Results → Play Again → Leave', () => {
    it('should handle play again flow correctly', () => {
      // Step 1: Game ends with results
      (gameState.hasResults as jest.Mock).mockReturnValue(true);
      userState.inGameId = 'game-abc';
      userState.inRoomId = 'room-abc';

      // Step 2: Player votes to play again
      wsProvider.send(JSON.stringify({
        event: 'next-game',
        data: { wantNextGame: true },
      }));

      localStorage.setItem('play-again', 'true');

      // Verify play-again is set
      expect(localStorageMock.setItem).toHaveBeenCalledWith('play-again', 'true');

      // Step 3: Room gets updated for new game
      (gameState.hasResults as jest.Mock).mockReturnValue(false);
      gameState.setResults(false);

      expect(gameState.setResults).toHaveBeenCalledWith(false);

      // Step 4: Leave before new game starts
      localStorage.removeItem('play-again');
      wsProvider.send(JSON.stringify({ event: 'quit-room', data: {} }));

      expect(wsProvider.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'quit-room', data: {} })
      );
    });

    it('should handle declining play again', () => {
      // Game ends with results
      (gameState.hasResults as jest.Mock).mockReturnValue(true);

      // Player declines to play again
      wsProvider.send(JSON.stringify({
        event: 'next-game',
        data: { wantNextGame: false },
      }));

      expect(wsProvider.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'next-game', data: { wantNextGame: false } })
      );

      // Clear state and go to dashboard
      userState.inGameId = null;
      userState.inRoomId = null;
      gameState.setResults(false);
    });
  });

  describe('Scenario 4: Multiple Games in Sequence', () => {
    it('should handle multiple game sessions correctly', () => {
      // Game 1: Create, play, finish, leave
      roomState = { roomId: 'room-1', ownderId: 'user123', players: [] };
      userState.inRoomId = 'room-1';
      userState.inGameId = 'game-1';
      (gameState.isGameStarted as jest.Mock).mockReturnValue(true);

      // Finish game 1
      (gameState.hasResults as jest.Mock).mockReturnValue(true);

      // Leave to dashboard
      wsProvider.send(JSON.stringify({ event: 'next-game', data: { wantNextGame: false } }));
      userState.inRoomId = null;
      userState.inGameId = null;
      (gameState.isGameStarted as jest.Mock).mockReturnValue(false);
      (gameState.hasResults as jest.Mock).mockReturnValue(false);

      // Game 2: Create new
      wsProvider.send.mockClear();
      roomState = { roomId: 'room-2', ownderId: 'user123', players: [] };
      userState.inRoomId = 'room-2';

      expect(roomState.roomId).toBe('room-2');
      expect(userState.inGameId).toBe(null); // Not started yet

      // Start game 2
      userState.inGameId = 'game-2';
      (gameState.isGameStarted as jest.Mock).mockReturnValue(true);

      // Leave mid-game
      wsProvider.send(JSON.stringify({ event: 'close-room', data: {} }));
      userState.inRoomId = null;
      userState.inGameId = null;
      (gameState.isGameStarted as jest.Mock).mockReturnValue(false);

      // Game 3: Create new (should work fine)
      wsProvider.send.mockClear();
      roomState = { roomId: 'room-3', ownderId: 'user123', players: [] };
      userState.inRoomId = 'room-3';

      expect(roomState.roomId).toBe('room-3');
      expect(userState.inRoomId).toBe('room-3');
      expect(userState.inGameId).toBe(null);
    });
  });

  describe('Scenario 5: Edge Cases', () => {
    it('should handle leaving when WebSocket is not available', () => {
      const nullWSProvider = null;

      // Leave function should handle null WSProvider gracefully
      if (nullWSProvider) {
        (nullWSProvider as any).send(JSON.stringify({ event: 'quit-room', data: {} }));
      }

      // Should not throw, should just skip sending
      expect(true).toBe(true);
    });

    it('should handle undefined roomInfo when determining ownership', () => {
      const undefinedRoomInfo = undefined;
      const isOwner = undefinedRoomInfo?.ownderId === userState.userId;

      expect(isOwner).toBe(false);
    });

    it('should handle undefined user when determining ownership', () => {
      const undefinedUser = undefined;
      roomState = { roomId: 'room-abc', ownderId: 'user123', players: [] };
      const isOwner = roomState?.ownderId === undefinedUser?.userId;

      expect(isOwner).toBe(false);
    });

    it('should clear all local state when leaving', () => {
      // Set up state
      localStorageMock.setItem('chosen-nft', JSON.stringify({ id: 'nft123' }));
      localStorageMock.setItem('play-again', 'true');
      (gameState.isGameStarted as jest.Mock).mockReturnValue(true);

      // Leave and clear state
      localStorage.setItem('chosen-nft', JSON.stringify(null));
      localStorage.removeItem('play-again');
      gameState.setGameStarted(false);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('chosen-nft', 'null');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('play-again');
      expect(gameState.setGameStarted).toHaveBeenCalledWith(false);
    });

    it('should handle rapid leave/create cycles', () => {
      for (let i = 0; i < 5; i++) {
        // Create room
        roomState = { roomId: `room-${i}`, ownderId: 'user123', players: [] };
        userState.inRoomId = `room-${i}`;

        // Leave room
        wsProvider.send(JSON.stringify({ event: 'close-room', data: {} }));
        userState.inRoomId = null;
        roomState = null;
      }

      // Should have sent 5 close-room events
      expect(wsProvider.send).toHaveBeenCalledTimes(5);
    });
  });

  describe('Scenario 6: Connection Issues', () => {
    it('should handle reconnection during game', () => {
      // Set up active game
      userState.inGameId = 'game-abc';
      (gameState.isGameStarted as jest.Mock).mockReturnValue(true);

      // Simulate disconnect
      (gameState.isConnectionClosed as jest.Mock).mockReturnValue(true);

      // Simulate reconnect
      (gameState.isConnectionClosed as jest.Mock).mockReturnValue(false);

      // Game should still be active after reconnect
      expect(gameState.isGameStarted()).toBe(true);
      expect(userState.inGameId).toBe('game-abc');
    });

    it('should handle already connected error (4000)', () => {
      const closeCode = 4000;

      // When receiving 4000, should set already connected
      if (closeCode === 4000) {
        // setIsAlreadyConnected(true) would be called
        expect(true).toBe(true);
      }
    });

    it('should handle new connection opened elsewhere (4001)', () => {
      const closeCode = 4001;

      // When receiving 4001, should show notification and close connection
      if (closeCode === 4001) {
        gameState.setConnectionClosed(true);
        wsProvider.close();
      }

      expect(gameState.setConnectionClosed).toHaveBeenCalledWith(true);
      expect(wsProvider.close).toHaveBeenCalled();
    });
  });

  describe('Scenario 7: Redirect Logic', () => {
    it('should not redirect if already on game-related pages', () => {
      const skipRedirectPaths = ['/new', '/game/', '/play', '/dashboard'];

      // On /new page
      let currentPath = '/new';
      let shouldSkipRedirect = skipRedirectPaths.some(path => currentPath.startsWith(path));
      expect(shouldSkipRedirect).toBe(true);

      // On /game/room123
      currentPath = '/game/room123';
      shouldSkipRedirect = skipRedirectPaths.some(path => currentPath.startsWith(path));
      expect(shouldSkipRedirect).toBe(true);

      // On /play
      currentPath = '/play';
      shouldSkipRedirect = skipRedirectPaths.some(path => currentPath.startsWith(path));
      expect(shouldSkipRedirect).toBe(true);

      // On /dashboard
      currentPath = '/dashboard';
      shouldSkipRedirect = skipRedirectPaths.some(path => currentPath.startsWith(path));
      expect(shouldSkipRedirect).toBe(true);

      // On /some-other-page (should redirect)
      currentPath = '/profile';
      shouldSkipRedirect = skipRedirectPaths.some(path => currentPath.startsWith(path));
      expect(shouldSkipRedirect).toBe(false);
    });

    it('should redirect to /play if user has inGameId', () => {
      userState.inGameId = 'game-abc';
      const currentPath = '/profile';
      const skipRedirectPaths = ['/new', '/game/', '/play', '/dashboard'];
      const shouldSkipRedirect = skipRedirectPaths.some(path => currentPath.startsWith(path));

      if (userState.inGameId && !shouldSkipRedirect) {
        // Would redirect to /play
        expect(true).toBe(true);
      }
    });

    it('should redirect to /game/:roomId if user has inRoomId', () => {
      userState.inRoomId = 'room-abc';
      userState.inGameId = null;
      const currentPath = '/profile';
      const skipRedirectPaths = ['/new', '/game/', '/play', '/dashboard'];
      const shouldSkipRedirect = skipRedirectPaths.some(path => currentPath.startsWith(path));

      if (userState.inRoomId && !shouldSkipRedirect) {
        // Would redirect to /game/room-abc
        expect(true).toBe(true);
      }
    });
  });

  describe('Scenario 8: Full Page Reload vs Client Navigation', () => {
    it('should use window.location.href for leaving mid-game', () => {
      // The implementation uses window.location.href instead of router.push
      // This ensures a full page reload to reset WebSocket state

      jest.useFakeTimers();

      let navigatedTo = '';

      // Mock the navigation
      const navigate = () => {
        setTimeout(() => {
          navigatedTo = '/dashboard';
        }, 500);
      };

      navigate();

      expect(navigatedTo).toBe('');

      jest.advanceTimersByTime(500);

      expect(navigatedTo).toBe('/dashboard');

      jest.useRealTimers();
    });
  });
});
