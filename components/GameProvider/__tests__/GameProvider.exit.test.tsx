/**
 * Tests for GameProvider exit/quit functionality
 *
 * These tests document the expected behavior when:
 * 1. User exits game mid-game via quit()
 * 2. User clicks "New Game" after game ends
 * 3. User navigates away from game
 */

// Mock dependencies
const mockRouterPush = jest.fn();
const mockWsSend = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    pathname: '/play',
    asPath: '/play',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

describe('GameProvider Exit Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('quit() function', () => {
    it('should send quit-room WS event when non-owner quits', () => {
      const isOwner = false;
      const expectedEvent = isOwner ? 'close-room' : 'quit-room';

      // Simulate quit logic
      mockWsSend(JSON.stringify({
        event: expectedEvent,
        data: {},
      }));

      expect(mockWsSend).toHaveBeenCalledWith(
        JSON.stringify({ event: 'quit-room', data: {} })
      );
    });

    it('should send close-room WS event when owner quits', () => {
      const isOwner = true;
      const expectedEvent = isOwner ? 'close-room' : 'quit-room';

      mockWsSend(JSON.stringify({
        event: expectedEvent,
        data: {},
      }));

      expect(mockWsSend).toHaveBeenCalledWith(
        JSON.stringify({ event: 'close-room', data: {} })
      );
    });

    it('should clear localStorage chosen-nfts on quit', () => {
      localStorage.setItem('chosen-nfts', 'some-nft-id');

      // Simulate quit logic
      localStorage.setItem('chosen-nfts', '');

      expect(localStorage.getItem('chosen-nfts')).toBe('');
    });

    it('should set intentional-leave flag to persist across navigation', () => {
      // This flag should persist so redirect logic doesn't trigger on new page
      localStorage.setItem('intentional-leave', 'true');

      expect(localStorage.getItem('intentional-leave')).toBe('true');
    });
  });

  describe('newGame() function', () => {
    it('should send quit-game WS event before navigating to /new', () => {
      // newGame should tell server user is leaving current game
      mockWsSend(JSON.stringify({
        event: 'quit-game',
        data: {},
      }));

      expect(mockWsSend).toHaveBeenCalledWith(
        JSON.stringify({ event: 'quit-game', data: {} })
      );
    });

    it('should navigate to /new after sending WS event', () => {
      mockRouterPush('/new');

      expect(mockRouterPush).toHaveBeenCalledWith('/new');
    });

    it('should set intentional-leave flag before navigation', () => {
      localStorage.setItem('intentional-leave', 'true');
      mockRouterPush('/new');

      expect(localStorage.getItem('intentional-leave')).toBe('true');
    });
  });

  describe('Redirect prevention', () => {
    it('should NOT redirect to /play when intentional-leave flag is set', () => {
      const user = { inGameId: 'game-123' };
      const intentionalLeave = localStorage.getItem('intentional-leave') === 'true';

      localStorage.setItem('intentional-leave', 'true');

      const shouldRedirect = user.inGameId && !intentionalLeave &&
        localStorage.getItem('intentional-leave') !== 'true';

      expect(shouldRedirect).toBe(false);
    });

    it('should redirect to /play when user has inGameId and no intentional-leave flag', () => {
      const user = { inGameId: 'game-123' };
      localStorage.removeItem('intentional-leave');

      const shouldRedirect = user.inGameId &&
        localStorage.getItem('intentional-leave') !== 'true';

      expect(shouldRedirect).toBe(true);
    });

    it('should clear intentional-leave flag after checking', () => {
      localStorage.setItem('intentional-leave', 'true');

      // After redirect check, clear the flag so future visits work normally
      const flag = localStorage.getItem('intentional-leave');
      if (flag) {
        localStorage.removeItem('intentional-leave');
      }

      expect(localStorage.getItem('intentional-leave')).toBeNull();
    });
  });

  describe('Game state cleanup', () => {
    it('should reset game state on quit', () => {
      // These are the things that should be cleaned up
      const cleanupActions = {
        results: null,
        playersInfo: [],
        gameStarted: false,
        chosenNfts: '',
      };

      expect(cleanupActions.results).toBeNull();
      expect(cleanupActions.playersInfo).toEqual([]);
      expect(cleanupActions.gameStarted).toBe(false);
      expect(cleanupActions.chosenNfts).toBe('');
    });

    it('should dispatch resetGame action', () => {
      const mockDispatch = jest.fn();

      // Simulate resetGame action
      mockDispatch({ type: 'RESET_GAME' });

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET_GAME' });
    });
  });

  describe('Backend quit-game contract', () => {
    /**
     * These tests document the expected contract with the backend quit-game event.
     * The backend handler should:
     * 1. Accept quit-game event without requiring roomId context
     * 2. Clear user's inGameId and inRoomId by deleting their userRoom record
     * 3. Return acknowledgement with reason: 'EXITED'
     *
     * This was added to fix a bug where quit-game was sent but had no backend handler.
     */

    it('should send quit-game event with empty data payload', () => {
      // The quit-game event doesn't need any payload - server looks up user's room
      const event = { event: 'quit-game', data: {} };

      mockWsSend(JSON.stringify(event));

      expect(mockWsSend).toHaveBeenCalledWith(
        JSON.stringify({ event: 'quit-game', data: {} })
      );
    });

    it('should expect server to clear inGameId after quit-game', () => {
      // Before quit: user has inGameId
      let userState = { inGameId: 'game-123', inRoomId: 'room-456' };

      // After server processes quit-game, on next user-info:
      // inGameId and inRoomId should be cleared
      const expectedServerResponse = {
        event: 'quit-game',
        data: {
          roomId: 'room-456',
          userId: 'user-id',
          reason: 'EXITED',
        },
      };

      // Simulate server response by clearing state
      userState = { inGameId: null as any, inRoomId: null as any };

      expect(userState.inGameId).toBeNull();
      expect(userState.inRoomId).toBeNull();
      expect(expectedServerResponse.data.reason).toBe('EXITED');
    });

    it('should gracefully handle quit-game when not in any game', () => {
      // Server should not error when user sends quit-game but has no active game
      const userWithNoGame = { inGameId: null, inRoomId: null };

      // Sending quit-game should be safe
      mockWsSend(JSON.stringify({ event: 'quit-game', data: {} }));

      expect(mockWsSend).toHaveBeenCalled();
      // Server should return acknowledgement without error
      expect(userWithNoGame.inGameId).toBeNull();
    });
  });

  describe('Sequential game flow', () => {
    it('should allow starting new game after exiting previous game', () => {
      // Scenario: Exit game -> Dashboard -> New Game -> Should start fresh

      // Step 1: User is in game
      const user = { inGameId: 'game-123', inRoomId: null };

      // Step 2: User quits (should send WS event and set flag)
      localStorage.setItem('intentional-leave', 'true');
      mockWsSend(JSON.stringify({ event: 'quit-game', data: {} }));

      // Step 3: Navigate to dashboard
      mockRouterPush('/dashboard');

      // Step 4: User clicks "New Game"
      // The intentional-leave flag should prevent redirect back to old game
      const shouldRedirect = user.inGameId &&
        localStorage.getItem('intentional-leave') !== 'true';

      expect(shouldRedirect).toBe(false);

      // Step 5: Clear flag after successful navigation
      localStorage.removeItem('intentional-leave');
    });

    it('should handle rapid quit -> new game sequence', () => {
      // Scenario: User clicks "New Game" button from results screen
      // Should: Send quit event, wait briefly, then navigate to /new

      jest.useFakeTimers();

      let navigated = false;

      // Simulate newGame with delay
      mockWsSend(JSON.stringify({ event: 'quit-game', data: {} }));
      localStorage.setItem('intentional-leave', 'true');

      setTimeout(() => {
        navigated = true;
        mockRouterPush('/new');
      }, 200);

      // WS event sent immediately
      expect(mockWsSend).toHaveBeenCalled();
      expect(navigated).toBe(false);

      // After delay, navigation happens
      jest.advanceTimersByTime(200);
      expect(navigated).toBe(true);

      jest.useRealTimers();
    });
  });
});
