/**
 * Test animation flow for both local and opponent moves
 */

import { gameReducer, initialGameState, GameReducerState } from '../gameReducer';
import { gameStateReceived, localMoveInitiated, setCurrentPlayer } from '../gameActions';
import { generateMoveKey } from '../../utils/moveUtils';

describe('Animation Flow', () => {
  const mockServerGameState = {
    gameId: 'test-game-123',
    state: 'inGame' as const,
    turnForPlayer: 'player-1',
    tableSizeX: 7,
    tableSizeY: 5,
    allGamePlayers: [
      { odatatype: 'player', odataid: 'p1', odataetag: '', odataEditLink: '', odataContext: '', odataMetadataEtag: '', odataMetadata: '', userId: 'player-1', username: 'Player1', color: '#FF0000' },
      { odatatype: 'player', odataid: 'p2', odataetag: '', odataEditLink: '', odataContext: '', odataMetadataEtag: '', odataMetadata: '', userId: 'bot-1', username: 'Bot', color: '#00FF00' },
    ],
    gameTableCards: {
      additionalProperties: {
        '3-2': [{ suit: 'HEARTS', value: '5', userId: 'player-1' }],
      },
    },
    allowedUserCardsPlacement: {
      additionalProperties: {
        '3-3': [{ suit: 'hearts', value: '7' }],
        '4-2': [{ suit: 'clubs', value: 'ace' }],
      },
    },
    playersCurrentPoints: {
      'player-1': 1,
      'bot-1': 0,
    },
    lastPlayedCard: {
      suit: 'HEARTS',
      value: '5',
      userId: 'player-1',
    },
    gameUsersWithCards: [
      { userId: 'player-1', cards: [{ suit: 'hearts', value: '7' }] },
      { userId: 'bot-1', cards: [{ suit: 'clubs', value: 'ace' }] },
    ],
  };

  let state: GameReducerState;

  beforeEach(() => {
    // Set current player first
    const stateWithPlayer = gameReducer(initialGameState, setCurrentPlayer('player-1'));
    // Then receive initial game state
    state = gameReducer(stateWithPlayer, gameStateReceived(mockServerGameState));
  });

  describe('Local player move animation', () => {
    it('should set pendingAnimation when local move is initiated', () => {
      const card = {
        id: 'hearts-7-player-1',
        suit: 'hearts',
        value: '7',
        userId: 'player-1',
      };
      const position = { x: 3, y: 3 };
      const moveKey = generateMoveKey(card, position);

      const newState = gameReducer(state, localMoveInitiated({
        moveKey,
        card,
        position,
        playerId: 'player-1',
        timestamp: Date.now(),
        isLocal: true,
        confirmed: false,
      }));

      expect(newState.pendingAnimation).not.toBeNull();
      expect(newState.pendingAnimation?.moveKey).toBe(moveKey);
      expect(newState.pendingAnimation?.card.suit).toBe('hearts');
      expect(newState.pendingAnimation?.card.value).toBe('7');
      expect(newState.pendingAnimation?.position).toEqual(position);
    });

    it('should pre-register moveKey in processedMoveKeys', () => {
      const card = {
        id: 'hearts-7-player-1',
        suit: 'hearts',
        value: '7',
        userId: 'player-1',
      };
      const position = { x: 3, y: 3 };
      const moveKey = generateMoveKey(card, position);

      const newState = gameReducer(state, localMoveInitiated({
        moveKey,
        card,
        position,
        playerId: 'player-1',
        timestamp: Date.now(),
        isLocal: true,
        confirmed: false,
      }));

      expect(newState.processedMoveKeys.has(moveKey)).toBe(true);
    });
  });

  describe('Opponent (bot) move animation', () => {
    it('should set pendingAnimation when server sends bot move', () => {
      // Simulate bot playing a card
      const botMoveState = {
        ...mockServerGameState,
        turnForPlayer: 'player-1', // Now it's player's turn (bot just played)
        gameTableCards: {
          additionalProperties: {
            '3-2': [{ suit: 'HEARTS', value: '5', userId: 'player-1' }],
            '4-2': [{ suit: 'CLUBS', value: 'ace', userId: 'bot-1' }],
          },
        },
        lastPlayedCard: {
          suit: 'CLUBS',
          value: 'ace',
          userId: 'bot-1',
          scoringLevel: 2,
        },
        playersCurrentPoints: {
          'player-1': 1,
          'bot-1': 2,
        },
      };

      const newState = gameReducer(state, gameStateReceived(botMoveState));

      console.log('[TEST] pendingAnimation:', newState.pendingAnimation);
      console.log('[TEST] processedMoveKeys size:', newState.processedMoveKeys.size);
      console.log('[TEST] lastPlayedCard:', newState.serverState.lastPlayedCard);
      console.log('[TEST] lastPlayedPosition:', newState.serverState.lastPlayedPosition);

      // Bot's move should trigger a pending animation
      expect(newState.pendingAnimation).not.toBeNull();
      expect(newState.pendingAnimation?.card.suit).toBe('clubs');
      expect(newState.pendingAnimation?.card.value).toBe('ace');
      expect(newState.pendingAnimation?.card.userId).toBe('bot-1');
      expect(newState.pendingAnimation?.scoringLevel).toBe(2);
    });

    it('should find correct position for bot card', () => {
      const botMoveState = {
        ...mockServerGameState,
        turnForPlayer: 'player-1',
        gameTableCards: {
          additionalProperties: {
            '3-2': [{ suit: 'HEARTS', value: '5', userId: 'player-1' }],
            '4-2': [{ suit: 'CLUBS', value: 'ace', userId: 'bot-1' }],
          },
        },
        lastPlayedCard: {
          suit: 'CLUBS',
          value: 'ace',
          userId: 'bot-1',
        },
      };

      const newState = gameReducer(state, gameStateReceived(botMoveState));

      // Position should be found at 4-2 (x=4, y=2)
      expect(newState.serverState.lastPlayedPosition).toEqual({ x: 4, y: 2 });
      expect(newState.pendingAnimation?.position).toEqual({ x: 4, y: 2 });
    });

    it('should not re-animate already processed moves', () => {
      // First bot move
      const botMoveState1 = {
        ...mockServerGameState,
        turnForPlayer: 'player-1',
        gameTableCards: {
          additionalProperties: {
            '3-2': [{ suit: 'HEARTS', value: '5', userId: 'player-1' }],
            '4-2': [{ suit: 'CLUBS', value: 'ace', userId: 'bot-1' }],
          },
        },
        lastPlayedCard: {
          suit: 'CLUBS',
          value: 'ace',
          userId: 'bot-1',
        },
      };

      const state1 = gameReducer(state, gameStateReceived(botMoveState1));
      const moveKey1 = state1.pendingAnimation?.moveKey;

      expect(state1.pendingAnimation).not.toBeNull();
      expect(state1.processedMoveKeys.has(moveKey1!)).toBe(true);

      // Same state received again (e.g., duplicate websocket message)
      const state2 = gameReducer(state1, gameStateReceived(botMoveState1));

      // Should keep the same pending animation (not create a new one)
      expect(state2.pendingAnimation?.moveKey).toBe(moveKey1);
    });
  });

  describe('Animation sequence', () => {
    it('should handle player move followed by bot move', () => {
      // 1. Player makes a move
      const playerCard = {
        id: 'hearts-7-player-1',
        suit: 'hearts',
        value: '7',
        userId: 'player-1',
      };
      const playerPosition = { x: 3, y: 3 };
      const playerMoveKey = generateMoveKey(playerCard, playerPosition);

      const stateAfterPlayerMove = gameReducer(state, localMoveInitiated({
        moveKey: playerMoveKey,
        card: playerCard,
        position: playerPosition,
        playerId: 'player-1',
        timestamp: Date.now(),
        isLocal: true,
        confirmed: false,
      }));

      expect(stateAfterPlayerMove.pendingAnimation?.moveKey).toBe(playerMoveKey);

      // 2. Server confirms player move and bot responds
      const serverConfirmAndBotMove = {
        ...mockServerGameState,
        turnForPlayer: 'player-1', // Back to player's turn
        gameTableCards: {
          additionalProperties: {
            '3-2': [{ suit: 'HEARTS', value: '5', userId: 'player-1' }],
            '3-3': [{ suit: 'HEARTS', value: '7', userId: 'player-1' }],
            '4-2': [{ suit: 'CLUBS', value: 'ace', userId: 'bot-1' }],
          },
        },
        lastPlayedCard: {
          suit: 'CLUBS',
          value: 'ace',
          userId: 'bot-1',
          scoringLevel: 3,
        },
        playersCurrentPoints: {
          'player-1': 2,
          'bot-1': 3,
        },
      };

      const stateAfterBotMove = gameReducer(stateAfterPlayerMove, gameStateReceived(serverConfirmAndBotMove));

      console.log('[TEST] After bot move - pendingAnimation:', stateAfterBotMove.pendingAnimation);

      // Bot's move should now be the pending animation
      expect(stateAfterBotMove.pendingAnimation).not.toBeNull();
      expect(stateAfterBotMove.pendingAnimation?.card.suit).toBe('clubs');
      expect(stateAfterBotMove.pendingAnimation?.card.value).toBe('ace');
      expect(stateAfterBotMove.pendingAnimation?.card.userId).toBe('bot-1');
    });
  });
});
