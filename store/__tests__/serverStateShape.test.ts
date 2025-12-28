/**
 * Integration test to verify reducer serverState shape matches component expectations
 *
 * This test ensures that all properties used by components exist in the reducer's serverState
 */

import { gameReducer, initialGameState, GameReducerState } from '../gameReducer';
import { gameStateReceived } from '../gameActions';

describe('serverState shape compatibility', () => {
  // Mock server data as it comes from WebSocket
  const mockServerGameState = {
    gameId: 'test-game-123',
    state: 'inGame' as const,
    turnForPlayer: 'user-123',
    tableSizeX: 7,
    tableSizeY: 5,
    allGamePlayers: [
      { odatatype: 'player', odataid: 'p1', odataetag: '', odataEditLink: '', odataContext: '', odataMetadataEtag: '', odataMetadata: '', userId: 'user-123', username: 'Player1', color: '#FF0000' },
      { odatatype: 'player', odataid: 'p2', odataetag: '', odataEditLink: '', odataContext: '', odataMetadataEtag: '', odataMetadata: '', userId: 'user-456', username: 'Player2', color: '#00FF00' },
    ],
    gameTableCards: {
      additionalProperties: {
        '3-2': [
          { suit: 'HEARTS', value: '5', userId: 'user-123' },
          { suit: 'SPADES', value: 'king', userId: 'user-456' },
        ],
      },
    },
    allowedUserCardsPlacement: {
      additionalProperties: {
        '3-3': [{ suit: 'hearts', value: '7' }],
        '4-2': [{ suit: 'clubs', value: 'ace' }],
      },
    },
    playersCurrentPoints: {
      additionalProperties: {
        'user-123': 15,
        'user-456': 10,
      },
    },
    lastPlayedCard: {
      suit: 'SPADES',
      value: 'king',
      userId: 'user-456',
    },
    gameUsersWithCards: [
      { odatatype: 'user', odataid: 'u1', odataetag: '', odataEditLink: '', odataContext: '', odataMetadataEtag: '', odataMetadata: '', userId: 'user-123', cards: [{ suit: 'hearts', value: '7' }] },
      { odatatype: 'user', odataid: 'u2', odataetag: '', odataEditLink: '', odataContext: '', odataMetadataEtag: '', odataMetadata: '', userId: 'user-456', cards: [{ suit: 'clubs', value: 'ace' }] },
    ],
  };

  let state: GameReducerState;

  beforeEach(() => {
    // Set current player first
    const stateWithPlayer = gameReducer(initialGameState, {
      type: 'SET_CURRENT_PLAYER',
      payload: { userId: 'user-123' },
    });

    // Then receive game state
    state = gameReducer(stateWithPlayer, gameStateReceived(mockServerGameState));
  });

  describe('GameHeader component requirements', () => {
    it('should have turnForPlayer property', () => {
      expect(state.serverState.turnForPlayer).toBe('user-123');
    });

    it('should have playersCurrentPoints as Record<userId, number>', () => {
      expect(state.serverState.playersCurrentPoints).toBeDefined();
      expect(typeof state.serverState.playersCurrentPoints).toBe('object');
      expect(state.serverState.playersCurrentPoints['user-123']).toBe(15);
      expect(state.serverState.playersCurrentPoints['user-456']).toBe(10);
    });

    it('should have allGamePlayers array', () => {
      expect(Array.isArray(state.serverState.allGamePlayers)).toBe(true);
      expect(state.serverState.allGamePlayers.length).toBe(2);
    });

    it('should have gameUsersWithCards for opponent cards display', () => {
      expect(Array.isArray(state.serverState.gameUsersWithCards)).toBe(true);
      expect(state.serverState.gameUsersWithCards.length).toBe(2);
    });
  });

  describe('GameBoard component requirements', () => {
    it('should have state property for game status', () => {
      expect(state.serverState.state).toBe('inGame');
    });

    it('should have lastPlayedCard for animation', () => {
      expect(state.serverState.lastPlayedCard).toBeDefined();
      expect(state.serverState.lastPlayedCard?.suit).toBe('spades');
      expect(state.serverState.lastPlayedCard?.value).toBe('king');
    });

    it('should have lastPlayedPosition for animation overlay', () => {
      // Position is derived from finding card in gameTableCards
      expect(state.serverState.lastPlayedPosition).toBeDefined();
    });

    it('should have allowedPlacements as Record<position, boolean>', () => {
      expect(state.serverState.allowedPlacements).toBeDefined();
      expect(state.serverState.allowedPlacements['3-3']).toBe(true);
      expect(state.serverState.allowedPlacements['4-2']).toBe(true);
    });

    it('should have allowedUserCardsPlacement for card validation', () => {
      expect(state.serverState.allowedUserCardsPlacement).toBeDefined();
    });
  });

  describe('GameInventory component requirements', () => {
    it('should have turnForPlayer for isMyTurn calculation', () => {
      expect(state.serverState.turnForPlayer).toBeDefined();
    });
  });

  describe('play/index.tsx requirements', () => {
    it('should have gameUsersWithCards with cards arrays', () => {
      const userWithCards = state.serverState.gameUsersWithCards.find(
        (u) => u.userId === 'user-123'
      );
      expect(userWithCards).toBeDefined();
      expect(Array.isArray(userWithCards?.cards)).toBe(true);
    });

    it('should have gameId for game identification', () => {
      expect(state.serverState.gameId).toBe('test-game-123');
    });
  });

  describe('board derived state', () => {
    it('should derive board from serverState', () => {
      expect(Array.isArray(state.board)).toBe(true);
      expect(state.board.length).toBe(5); // tableSizeY
      expect(state.board[0].length).toBe(7); // tableSizeX
    });

    it('should have cards in correct board position', () => {
      // Card at position 3-2
      const cell = state.board[2][3]; // y=2, x=3
      expect(cell.cards.length).toBe(2);
      expect(cell.cards[0].suit).toBe('hearts');
      expect(cell.cards[1].suit).toBe('spades');
    });

    it('should mark cells with allowedPlacements as drop targets', () => {
      // Position 3-3 should be a drop target
      const dropCell = state.board[3][3];
      expect(dropCell.isDropTarget).toBe(true);
    });
  });

  describe('isMyTurn derived state', () => {
    it('should correctly calculate isMyTurn', () => {
      expect(state.isMyTurn).toBe(true); // turnForPlayer matches currentPlayerId
    });

    it('should be false when not current players turn', () => {
      const otherPlayerState = gameReducer(initialGameState, {
        type: 'SET_CURRENT_PLAYER',
        payload: { userId: 'user-456' },
      });
      const stateWithOtherPlayer = gameReducer(
        otherPlayerState,
        gameStateReceived({ ...mockServerGameState, turnForPlayer: 'user-123' })
      );
      expect(stateWithOtherPlayer.isMyTurn).toBe(false);
    });
  });
});
