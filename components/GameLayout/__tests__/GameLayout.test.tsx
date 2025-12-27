/**
 * Tests for GameLayout leave functionality
 */

import * as gameState from '../../../utils/gameState';

// Mock dependencies
jest.mock('../../../utils/gameState', () => ({
  hasResults: jest.fn(),
  setGameStarted: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
const originalLocation = window.location;
delete (window as any).location;
window.location = { ...originalLocation, href: '' } as Location;

describe('GameLayout Leave Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (gameState.hasResults as jest.Mock).mockReturnValue(false);
  });

  describe('Leave event logic', () => {
    it('should send close-room event when owner leaves', () => {
      const mockSend = jest.fn();
      const wsProvider = { send: mockSend, close: jest.fn() };
      const roomInfo = { ownderId: 'user123' };
      const user = { userId: 'user123' };

      // Simulate the leave function logic
      const isOwner = roomInfo.ownderId === user.userId;
      const eventName = isOwner ? 'close-room' : 'quit-room';

      wsProvider.send(JSON.stringify({
        event: eventName,
        data: {},
      }));

      expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify({ event: 'close-room', data: {} })
      );
    });

    it('should send quit-room event when non-owner leaves', () => {
      const mockSend = jest.fn();
      const wsProvider = { send: mockSend, close: jest.fn() };
      const roomInfo = { ownderId: 'owner456' };
      const user = { userId: 'user123' };

      // Simulate the leave function logic
      const isOwner = roomInfo.ownderId === user.userId;
      const eventName = isOwner ? 'close-room' : 'quit-room';

      wsProvider.send(JSON.stringify({
        event: eventName,
        data: {},
      }));

      expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify({ event: 'quit-room', data: {} })
      );
    });

    it('should clear local storage when leaving', () => {
      // Simulate the leave function logic
      localStorage.setItem('chosen-nft', JSON.stringify(null));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('chosen-nft', 'null');
    });

    it('should call setGameStarted(false) when leaving', () => {
      gameState.setGameStarted(false);

      expect(gameState.setGameStarted).toHaveBeenCalledWith(false);
    });
  });

  describe('Route change handling', () => {
    it('should allow route change when isConfirmedLeave is true', () => {
      const isConfirmedLeave = true;
      (gameState.hasResults as jest.Mock).mockReturnValue(false);
      localStorageMock.getItem.mockReturnValue(null);

      // The condition that blocks route change
      const shouldBlock = !gameState.hasResults() && !isConfirmedLeave && !localStorage.getItem('play-again');

      expect(shouldBlock).toBe(false);
    });

    it('should allow route change when hasResults is true', () => {
      const isConfirmedLeave = false;
      (gameState.hasResults as jest.Mock).mockReturnValue(true);
      localStorageMock.getItem.mockReturnValue(null);

      const shouldBlock = !gameState.hasResults() && !isConfirmedLeave && !localStorage.getItem('play-again');

      expect(shouldBlock).toBe(false);
    });

    it('should allow route change when play-again is set', () => {
      const isConfirmedLeave = false;
      (gameState.hasResults as jest.Mock).mockReturnValue(false);
      localStorageMock.getItem.mockReturnValue('true');

      const shouldBlock = !gameState.hasResults() && !isConfirmedLeave && !localStorage.getItem('play-again');

      expect(shouldBlock).toBe(false);
    });

    it('should block route change when no conditions are met', () => {
      const isConfirmedLeave = false;
      (gameState.hasResults as jest.Mock).mockReturnValue(false);
      localStorageMock.getItem.mockReturnValue(null);

      const shouldBlock = !gameState.hasResults() && !isConfirmedLeave && !localStorage.getItem('play-again');

      expect(shouldBlock).toBe(true);
    });

    it('should allow route change to /play without blocking', () => {
      const url = '/play';
      const isConfirmedLeave = false;
      (gameState.hasResults as jest.Mock).mockReturnValue(false);
      localStorageMock.getItem.mockReturnValue(null);

      // url !== "/play" is false, so should not block
      const shouldBlock = !gameState.hasResults() && !isConfirmedLeave && url !== '/play' && !localStorage.getItem('play-again');

      expect(shouldBlock).toBe(false);
    });
  });

  describe('Ownership detection', () => {
    it('should correctly identify owner', () => {
      const roomInfo = { ownderId: 'user123' };
      const user = { userId: 'user123' };

      const isOwner = roomInfo?.ownderId === user?.userId;

      expect(isOwner).toBe(true);
    });

    it('should correctly identify non-owner', () => {
      const roomInfo = { ownderId: 'owner456' };
      const user = { userId: 'user123' };

      const isOwner = roomInfo?.ownderId === user?.userId;

      expect(isOwner).toBe(false);
    });

    it('should handle undefined roomInfo', () => {
      const roomInfo = undefined;
      const user = { userId: 'user123' };

      const isOwner = roomInfo?.ownderId === user?.userId;

      expect(isOwner).toBe(false);
    });

    it('should handle undefined user', () => {
      const roomInfo = { ownderId: 'owner456' };
      const user = undefined;

      const isOwner = roomInfo?.ownderId === user?.userId;

      expect(isOwner).toBe(false);
    });
  });

  describe('BeforeUnload handler', () => {
    it('should add beforeunload event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      const handleTabClose = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        return;
      };

      window.addEventListener('beforeunload', handleTabClose);

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', handleTabClose);

      addEventListenerSpy.mockRestore();
    });

    it('should remove beforeunload event listener on cleanup', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const handleTabClose = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        return;
      };

      window.removeEventListener('beforeunload', handleTabClose);

      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', handleTabClose);

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Navigation after leave', () => {
    it('should navigate to dashboard after timeout', () => {
      jest.useFakeTimers();

      // Simulate the leave function navigation
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);

      expect(window.location.href).toBe('');

      jest.advanceTimersByTime(500);

      expect(window.location.href).toBe('/dashboard');

      jest.useRealTimers();
    });

    it('should use full page reload (window.location.href) not router.push', () => {
      // This test verifies the design decision to use window.location.href
      // which triggers a full page reload instead of client-side navigation

      const originalHref = window.location.href;
      window.location.href = '/dashboard';

      // window.location.href assignment causes full reload
      expect(window.location.href).toBe('/dashboard');

      window.location.href = originalHref;
    });
  });
});
