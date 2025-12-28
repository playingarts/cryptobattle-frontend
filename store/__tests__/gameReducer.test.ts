/**
 * Tests for gameReducer.ts
 *
 * Tests the game state reducer including:
 * - Initial state
 * - GAME_STATE_RECEIVED action
 * - LOCAL_MOVE_INITIATED action
 * - ANIMATION_STARTED/COMPLETED actions
 * - Move key deduplication (processedMoveKeys)
 */

import { gameReducer, initialGameState, GameReducerState } from '../gameReducer';
import {
  gameStateReceived,
  localMoveInitiated,
  animationStarted,
  animationCompleted,
  resetGame,
  GameStatePayload,
} from '../gameActions';
import { NormalizedCard, GameMove } from '../../types/game';

// Helper to create a mock server game state
function createMockServerState(overrides: Partial<GameStatePayload> = {}): GameStatePayload {
  return {
    gameId: 'test-game-1',
    state: 'started',
    turnForPlayer: 'player-1',
    tableSizeX: 7,
    tableSizeY: 5,
    allGamePlayers: [],
    gameTableCards: {
      additionalProperties: {
        '3-2': [{ id: 'card-1', suit: 'hearts', value: '5', userId: 'player-1' }],
      },
    },
    allowedUserCardsPlacement: { additionalProperties: {} },
    ...overrides,
  };
}

// Helper to create a normalized card
function createMockCard(overrides: Partial<NormalizedCard> = {}): NormalizedCard {
  return {
    id: 'card-1',
    suit: 'hearts',
    value: '10',
    userId: 'player-1',
    isNft: false,
    ...overrides,
  };
}

// Helper to create a game move
function createMockMove(overrides: Partial<GameMove> = {}): GameMove {
  const card = createMockCard(overrides.card);
  const position = overrides.position || { x: 1, y: 1 };
  return {
    moveKey: overrides.moveKey || `${card.suit}-${card.value}-${position.x}-${position.y}-${card.userId}`,
    card,
    position,
    playerId: overrides.playerId || 'player-1',
    timestamp: overrides.timestamp || Date.now(),
    isLocal: overrides.isLocal ?? true,
    confirmed: overrides.confirmed ?? false,
  };
}

describe('gameReducer', () => {
  describe('initial state', () => {
    it('should have correct initial values', () => {
      expect(initialGameState.serverState.gameId).toBeNull();
      expect(initialGameState.serverState.state).toBeNull();
      expect(initialGameState.board).toEqual([]);
      expect(initialGameState.pendingAnimation).toBeNull();
      expect(initialGameState.processedMoveKeys.size).toBe(0);
      expect(initialGameState.currentPlayerId).toBeNull();
      expect(initialGameState.optimisticMoves).toEqual([]);
    });
  });

  describe('RESET_GAME action', () => {
    it('should reset state to initial values but preserve currentPlayerId', () => {
      // Start with some state
      const stateWithData: GameReducerState = {
        ...initialGameState,
        serverState: {
          ...initialGameState.serverState,
          gameId: 'some-game',
          state: 'started',
        },
        currentPlayerId: 'player-123',
        processedMoveKeys: new Set(['move-1', 'move-2']),
        pendingAnimation: {
          moveKey: 'test-key',
          card: createMockCard(),
          position: { x: 0, y: 0 },
          scoringLevel: 1,
          playerId: 'player-1',
        },
      };

      const newState = gameReducer(stateWithData, resetGame());

      expect(newState.serverState.gameId).toBeNull();
      expect(newState.serverState.state).toBeNull();
      expect(newState.processedMoveKeys.size).toBe(0);
      expect(newState.pendingAnimation).toBeNull();
      // currentPlayerId should be preserved
      expect(newState.currentPlayerId).toBe('player-123');
    });
  });

  describe('GAME_STATE_RECEIVED action', () => {
    it('should update server state with normalized values', () => {
      const serverState = createMockServerState();
      const action = gameStateReceived(serverState);

      const newState = gameReducer(initialGameState, action);

      expect(newState.serverState.gameId).toBe('test-game-1');
      expect(newState.serverState.state).toBe('started');
      expect(newState.serverState.turnForPlayer).toBe('player-1');
    });

    it('should normalize game table cards', () => {
      const serverState = createMockServerState({
        gameTableCards: {
          additionalProperties: {
            '0-0': [{ id: 'c1', suit: 'SPADES', value: 'Ace', userId: 'player-1' }],
            '1-0': [{ id: 'c2', suit: 'Hearts', value: 'KING', userId: 'player-2' }],
          },
        },
      });
      const action = gameStateReceived(serverState);

      const newState = gameReducer(initialGameState, action);

      // Suits and values should be lowercased
      expect(newState.serverState.gameTableCards['0-0'][0].suit).toBe('spades');
      expect(newState.serverState.gameTableCards['0-0'][0].value).toBe('ace');
      expect(newState.serverState.gameTableCards['1-0'][0].suit).toBe('hearts');
      expect(newState.serverState.gameTableCards['1-0'][0].value).toBe('king');
    });

    it('should derive board with correct dimensions', () => {
      const serverState = createMockServerState({
        tableSizeX: 3,
        tableSizeY: 2,
        gameTableCards: {
          additionalProperties: {
            '1-0': [{ id: 'c1', suit: 'hearts', value: '5', userId: 'player-1' }],
          },
        },
      });
      const action = gameStateReceived(serverState);

      const newState = gameReducer(initialGameState, action);

      // Board should be 2 rows x 3 columns
      expect(newState.board.length).toBe(2);
      expect(newState.board[0].length).toBe(3);

      // Cell at 1-0 should have the card
      expect(newState.board[0][1].cards.length).toBe(1);
      expect(newState.board[0][1].cards[0].suit).toBe('hearts');
    });

    it('should trigger pending animation for new moves', () => {
      const serverState = createMockServerState({
        lastPlayedCard: {
          id: 'card-queen',
          suit: 'diamonds',
          value: 'queen',
          userId: 'player-2',
          scoringLevel: 5,
        },
        gameTableCards: {
          additionalProperties: {
            '2-2': [{ id: 'card-queen', suit: 'diamonds', value: 'queen', userId: 'player-2' }],
          },
        },
      });
      const action = gameStateReceived(serverState);

      const newState = gameReducer(initialGameState, action);

      expect(newState.pendingAnimation).not.toBeNull();
      expect(newState.pendingAnimation?.card.suit).toBe('diamonds');
      expect(newState.pendingAnimation?.card.value).toBe('queen');
      expect(newState.pendingAnimation?.scoringLevel).toBe(5);
    });

    it('should not trigger new animation for already processed moves', () => {
      // First, simulate processing a move
      const moveKey = 'diamonds-queen-2-2-player-2';
      const stateWithProcessedMove: GameReducerState = {
        ...initialGameState,
        processedMoveKeys: new Set([moveKey]),
      };

      const serverState = createMockServerState({
        lastPlayedCard: {
          id: 'card-queen',
          suit: 'diamonds',
          value: 'queen',
          userId: 'player-2',
          scoringLevel: 5,
        },
        gameTableCards: {
          additionalProperties: {
            '2-2': [{ id: 'card-queen', suit: 'diamonds', value: 'queen', userId: 'player-2' }],
          },
        },
      });
      const action = gameStateReceived(serverState);

      const newState = gameReducer(stateWithProcessedMove, action);

      // Should not set pending animation for already processed move
      expect(newState.pendingAnimation).toBeNull();
    });

    it('should preserve existing animation when move was already processed', () => {
      // Simulate having an optimistic animation pending that matches the move key
      const moveKey = 'hearts-10-2-2-player-1';
      const card = createMockCard({ suit: 'hearts', value: '10' });
      const stateWithPendingAnimation: GameReducerState = {
        ...initialGameState,
        pendingAnimation: {
          moveKey,
          card,
          position: { x: 2, y: 2 },
          scoringLevel: 0, // Optimistic had 0
          playerId: 'player-1',
        },
        processedMoveKeys: new Set([moveKey]),
      };

      const serverState = createMockServerState({
        lastPlayedCard: {
          id: 'card-10',
          suit: 'hearts',
          value: '10',
          userId: 'player-1',
          scoringLevel: 7, // Server has actual score
        },
        gameTableCards: {
          additionalProperties: {
            '2-2': [{ id: 'card-10', suit: 'hearts', value: '10', userId: 'player-1' }],
          },
        },
      });
      const action = gameStateReceived(serverState);

      const newState = gameReducer(stateWithPendingAnimation, action);

      // Since move was already processed (in processedMoveKeys), the existing animation
      // is preserved as-is. The reducer doesn't update scoringLevel for already-processed moves.
      expect(newState.pendingAnimation).not.toBeNull();
      expect(newState.pendingAnimation?.scoringLevel).toBe(0);
    });
  });

  describe('LOCAL_MOVE_INITIATED action', () => {
    it('should set pending animation for local move', () => {
      const move = createMockMove({
        card: { id: 'c1', suit: 'clubs', value: '7', userId: 'player-1', isNft: false },
        position: { x: 3, y: 2 },
      });

      const action = localMoveInitiated(move);
      const newState = gameReducer(initialGameState, action);

      expect(newState.pendingAnimation).not.toBeNull();
      expect(newState.pendingAnimation?.moveKey).toBe(move.moveKey);
      expect(newState.pendingAnimation?.card.suit).toBe('clubs');
      expect(newState.pendingAnimation?.card.value).toBe('7');
    });

    it('should add move key to processed set', () => {
      const move = createMockMove();
      const action = localMoveInitiated(move);

      const newState = gameReducer(initialGameState, action);

      expect(newState.processedMoveKeys.has(move.moveKey)).toBe(true);
    });

    it('should add move to optimistic moves array', () => {
      const move = createMockMove();
      const action = localMoveInitiated(move);

      const newState = gameReducer(initialGameState, action);

      expect(newState.optimisticMoves.length).toBe(1);
      expect(newState.optimisticMoves[0].moveKey).toBe(move.moveKey);
    });

    it('should optimistically update board with card', () => {
      // First set up a board with proper dimensions
      const stateWithBoard: GameReducerState = {
        ...initialGameState,
        board: [
          [
            { x: 0, y: 0, cards: [], isEmpty: false, isDropTarget: false },
            { x: 1, y: 0, cards: [], isEmpty: false, isDropTarget: false },
          ],
          [
            { x: 0, y: 1, cards: [], isEmpty: false, isDropTarget: false },
            { x: 1, y: 1, cards: [], isEmpty: true, isDropTarget: true },
          ],
        ],
      };

      const move = createMockMove({
        position: { x: 1, y: 1 },
      });
      const action = localMoveInitiated(move);

      const newState = gameReducer(stateWithBoard, action);

      // Card should appear on board at position 1,1
      expect(newState.board[1][1].cards.length).toBe(1);
      expect(newState.board[1][1].cards[0].suit).toBe('hearts');
    });
  });

  describe('ANIMATION_STARTED action', () => {
    it('should not change state significantly (logs only)', () => {
      const moveKey = 'spades-ace-0-0-player-1';
      const action = animationStarted(moveKey);

      const newState = gameReducer(initialGameState, action);

      // ANIMATION_STARTED just logs, doesn't change state
      expect(newState).toEqual(initialGameState);
    });
  });

  describe('ANIMATION_COMPLETED action', () => {
    it('should clear pending animation when moveKey matches', () => {
      const moveKey = 'test-key';
      const stateWithAnimation: GameReducerState = {
        ...initialGameState,
        pendingAnimation: {
          moveKey,
          card: createMockCard(),
          position: { x: 0, y: 0 },
          scoringLevel: 1,
          playerId: 'player-1',
        },
      };

      const action = animationCompleted(moveKey);
      const newState = gameReducer(stateWithAnimation, action);

      expect(newState.pendingAnimation).toBeNull();
    });

    it('should not clear pending animation when moveKey does not match', () => {
      const stateWithAnimation: GameReducerState = {
        ...initialGameState,
        pendingAnimation: {
          moveKey: 'different-key',
          card: createMockCard(),
          position: { x: 0, y: 0 },
          scoringLevel: 1,
          playerId: 'player-1',
        },
      };

      const action = animationCompleted('some-other-key');
      const newState = gameReducer(stateWithAnimation, action);

      // Pending animation should remain
      expect(newState.pendingAnimation).not.toBeNull();
      expect(newState.pendingAnimation?.moveKey).toBe('different-key');
    });
  });

  describe('move key deduplication', () => {
    it('should prevent duplicate animations across local and server moves', () => {
      // Simulate local move first
      const card = createMockCard({ suit: 'hearts', value: '5' });
      const position = { x: 2, y: 2 };
      const moveKey = 'hearts-5-2-2-player-1';

      const localMoveAction = localMoveInitiated({
        moveKey,
        card,
        position,
        playerId: 'player-1',
        timestamp: Date.now(),
        isLocal: true,
        confirmed: false,
      });

      let state = gameReducer(initialGameState, localMoveAction);

      // Should have pending animation
      expect(state.pendingAnimation).not.toBeNull();
      expect(state.processedMoveKeys.has(moveKey)).toBe(true);

      // Complete the animation
      state = gameReducer(state, animationCompleted(moveKey));
      expect(state.pendingAnimation).toBeNull();

      // Now simulate server confirming same move
      const serverState = createMockServerState({
        lastPlayedCard: {
          id: 'card-5',
          suit: 'hearts',
          value: '5',
          userId: 'player-1',
          scoringLevel: 3,
        },
        gameTableCards: {
          additionalProperties: {
            '2-2': [{ id: 'card-5', suit: 'hearts', value: '5', userId: 'player-1' }],
          },
        },
      });

      state = gameReducer(state, gameStateReceived(serverState));

      // Should not trigger new animation since move was already processed
      expect(state.pendingAnimation).toBeNull();
    });

    it('should track multiple processed move keys', () => {
      const moves = [
        { suit: 'hearts', value: '2', position: { x: 0, y: 0 } },
        { suit: 'spades', value: '3', position: { x: 1, y: 0 } },
        { suit: 'diamonds', value: '4', position: { x: 2, y: 0 } },
      ];

      let state = initialGameState;

      moves.forEach((move) => {
        const card = createMockCard({ suit: move.suit, value: move.value, userId: 'player-1' });
        const moveKey = `${move.suit}-${move.value}-${move.position.x}-${move.position.y}-player-1`;

        const action = localMoveInitiated({
          moveKey,
          card,
          position: move.position,
          playerId: 'player-1',
          timestamp: Date.now(),
          isLocal: true,
          confirmed: false,
        });

        state = gameReducer(state, action);
        state = gameReducer(state, animationCompleted(moveKey));
      });

      expect(state.processedMoveKeys.size).toBe(3);
      expect(state.processedMoveKeys.has('hearts-2-0-0-player-1')).toBe(true);
      expect(state.processedMoveKeys.has('spades-3-1-0-player-1')).toBe(true);
      expect(state.processedMoveKeys.has('diamonds-4-2-0-player-1')).toBe(true);
    });
  });

  describe('unknown action', () => {
    it('should return current state for unknown action types', () => {
      const currentState = {
        ...initialGameState,
        currentPlayerId: 'player-test',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newState = gameReducer(currentState, { type: 'UNKNOWN_ACTION' } as any);

      expect(newState).toBe(currentState);
    });
  });
});
