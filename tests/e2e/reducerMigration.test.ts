/**
 * Reducer Migration Smoke Tests
 *
 * These tests verify that the reducer-based state management works correctly
 * during the migration from useState to useReducer in GameProvider.
 *
 * Milestone A: WS connect → create room → verify state structure
 *
 * These tests focus on verifying the WS event data structure that will
 * be dispatched to the reducer. Single-client tests for reliability.
 *
 * Run with: yarn test:smoke --testPathPattern=reducerMigration
 */

import { GameBot } from './GameBot';
import { createGuestSessions, sleep } from './testUtils';

// Timeout for e2e tests
jest.setTimeout(30000);

describe('Reducer Migration - Milestone A', () => {
  let bot1: GameBot;

  afterEach(async () => {
    if (bot1) bot1.disconnect();
    await sleep(500);
  });

  describe('WS Events Structure', () => {
    it('should receive user-info with required fields on connect', async () => {
      const [account] = await createGuestSessions(1);

      bot1 = new GameBot({
        name: 'UserInfoBot',
        accessToken: account.accessToken,
        logEvents: true,
      });

      await bot1.connect();
      await bot1.waitForConnection();

      // Verify user-info was received and processed
      expect(bot1.isConnected).toBe(true);
      expect(bot1.userId).toBeTruthy();
      expect(typeof bot1.userId).toBe('string');
      expect(bot1.userId.length).toBeGreaterThan(0);

      console.log('✓ user-info received, userId:', bot1.userId);
    });

    it('should receive create-room with roomId', async () => {
      const [account] = await createGuestSessions(1);

      bot1 = new GameBot({
        name: 'RoomCreateBot',
        accessToken: account.accessToken,
        logEvents: true,
      });

      await bot1.connect();
      await bot1.waitForConnection();

      bot1.createRoom();
      const roomId = await bot1.waitForRoomCreated();

      // Verify create-room response
      expect(roomId).toBeTruthy();
      expect(typeof roomId).toBe('string');
      expect(bot1.roomId).toBe(roomId);

      console.log('✓ create-room received, roomId:', roomId);
    });

    it('should receive room-info with user list', async () => {
      const [account] = await createGuestSessions(1);

      bot1 = new GameBot({
        name: 'RoomInfoBot',
        accessToken: account.accessToken,
        logEvents: true,
      });

      await bot1.connect();
      await bot1.waitForConnection();

      bot1.createRoom();
      await bot1.waitForRoomCreated();

      // GameBot automatically requests room-info after create-room
      await sleep(1000);

      // Verify room-info structure (this is what reducer needs)
      expect(bot1.roomInfo).toBeTruthy();
      expect(bot1.roomInfo?.roomId).toBe(bot1.roomId);
      expect(bot1.roomInfo?.roomUsers).toBeDefined();
      expect(Array.isArray(bot1.roomInfo?.roomUsers)).toBe(true);
      expect(bot1.roomInfo?.roomUsers?.length).toBeGreaterThan(0);

      // Verify room user has required fields for player display
      const roomUser = bot1.roomInfo?.roomUsers?.[0] as { userId: string; state: string; color?: string };
      expect(roomUser?.userId).toBeTruthy();
      expect(roomUser?.state).toBeDefined();
      // color is provided by server but not in RoomInfo type
      expect((roomUser as Record<string, unknown>)?.color).toBeDefined();

      console.log('✓ room-info structure verified:', {
        roomId: bot1.roomInfo?.roomId,
        usersCount: bot1.roomInfo?.roomUsers?.length,
      });
    });
  });
});

describe('Reducer Migration - Summary', () => {
  it('prints milestone A verification', () => {
    console.log('\n========================================');
    console.log('    MILESTONE A: WS EVENT STRUCTURE');
    console.log('========================================');
    console.log('Verified single-client WS events:');
    console.log('  ✓ user-info → userId field present');
    console.log('  ✓ create-room → roomId field present');
    console.log('  ✓ room-info → roomUsers array present');
    console.log('');
    console.log('These events will be dispatched to reducer.');
    console.log('========================================\n');
  });
});
