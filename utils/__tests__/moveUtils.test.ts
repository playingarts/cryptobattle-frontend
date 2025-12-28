/**
 * Tests for moveUtils.ts
 *
 * Tests move key generation and card normalization functions
 * that are core to the animation deduplication system.
 */

import { generateMoveKey, normalizeCard, ServerCardInfo } from '../moveUtils';

describe('moveUtils', () => {
  describe('generateMoveKey', () => {
    it('should generate consistent move key format', () => {
      const card = { suit: 'Hearts', value: '10', userId: 'user-123' };
      const position = { x: 2, y: 3 };

      const moveKey = generateMoveKey(card, position);

      expect(moveKey).toBe('hearts-10-2-3-user-123');
    });

    it('should normalize suit to lowercase', () => {
      const card = { suit: 'SPADES', value: 'ace', userId: 'user-456' };
      const position = { x: 0, y: 0 };

      const moveKey = generateMoveKey(card, position);

      expect(moveKey).toBe('spades-ace-0-0-user-456');
    });

    it('should normalize value to lowercase', () => {
      const card = { suit: 'diamonds', value: 'KING', userId: 'player1' };
      const position = { x: 5, y: 2 };

      const moveKey = generateMoveKey(card, position);

      expect(moveKey).toBe('diamonds-king-5-2-player1');
    });

    it('should handle numeric values as strings', () => {
      const card = { suit: 'clubs', value: '7', userId: 'user-789' };
      const position = { x: 1, y: 1 };

      const moveKey = generateMoveKey(card, position);

      expect(moveKey).toBe('clubs-7-1-1-user-789');
    });

    it('should handle joker card', () => {
      const card = { suit: 'joker', value: 'joker', userId: 'user-000' };
      const position = { x: 3, y: 3 };

      const moveKey = generateMoveKey(card, position);

      expect(moveKey).toBe('joker-joker-3-3-user-000');
    });

    it('should generate different keys for same card at different positions', () => {
      const card = { suit: 'hearts', value: '5', userId: 'user-123' };

      const key1 = generateMoveKey(card, { x: 0, y: 0 });
      const key2 = generateMoveKey(card, { x: 1, y: 0 });
      const key3 = generateMoveKey(card, { x: 0, y: 1 });

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    it('should generate different keys for same card played by different users', () => {
      const position = { x: 2, y: 2 };

      const key1 = generateMoveKey({ suit: 'hearts', value: '5', userId: 'user-1' }, position);
      const key2 = generateMoveKey({ suit: 'hearts', value: '5', userId: 'user-2' }, position);

      expect(key1).not.toBe(key2);
    });
  });

  describe('normalizeCard', () => {
    it('should normalize server card to consistent format', () => {
      const serverCard: ServerCardInfo = {
        suit: 'HEARTS',
        value: 'Queen',
        userId: 'user-123',
        powerLevel: 12,
        scoringLevel: 3,
        imageUrl: 'https://example.com/queen-hearts.jpg',
      };

      const normalized = normalizeCard(serverCard);

      expect(normalized.suit).toBe('hearts');
      expect(normalized.value).toBe('queen');
      expect(normalized.userId).toBe('user-123');
      expect(normalized.powerLevel).toBe(12);
      expect(normalized.scoringLevel).toBe(3);
      expect(normalized.imageUrl).toBe('https://example.com/queen-hearts.jpg');
    });

    it('should generate id from suit, value, userId when no id provided', () => {
      const serverCard: ServerCardInfo = {
        suit: 'spades',
        value: '8',
        userId: 'player-456',
      };

      const normalized = normalizeCard(serverCard);

      expect(normalized.id).toBe('spades-8-player-456');
    });

    it('should use provided id when available', () => {
      const serverCard: ServerCardInfo = {
        id: 'nft-custom-id-123',
        suit: 'diamonds',
        value: 'ace',
        userId: 'player-789',
      };

      const normalized = normalizeCard(serverCard);

      expect(normalized.id).toBe('nft-custom-id-123');
    });

    it('should set isNft to true when id is provided and not empty', () => {
      const serverCard: ServerCardInfo = {
        id: 'nft-123',
        suit: 'clubs',
        value: '10',
        userId: 'user-1',
      };

      const normalized = normalizeCard(serverCard);

      expect(normalized.isNft).toBe(true);
    });

    it('should set isNft to false when no id is provided', () => {
      const serverCard: ServerCardInfo = {
        suit: 'hearts',
        value: '3',
        userId: 'user-2',
      };

      const normalized = normalizeCard(serverCard);

      expect(normalized.isNft).toBe(false);
    });

    it('should set isNft to false when id is empty string', () => {
      const serverCard: ServerCardInfo = {
        id: '',
        suit: 'spades',
        value: '7',
        userId: 'user-3',
      };

      const normalized = normalizeCard(serverCard);

      expect(normalized.isNft).toBe(false);
    });

    it('should handle numeric value input', () => {
      const serverCard: ServerCardInfo = {
        suit: 'diamonds',
        value: 9,
        userId: 'user-4',
      };

      const normalized = normalizeCard(serverCard);

      expect(normalized.value).toBe('9');
    });

    it('should preserve optional videoUrl', () => {
      const serverCard: ServerCardInfo = {
        suit: 'hearts',
        value: 'king',
        userId: 'user-5',
        videoUrl: 'https://example.com/king-hearts.mp4',
      };

      const normalized = normalizeCard(serverCard);

      expect(normalized.videoUrl).toBe('https://example.com/king-hearts.mp4');
    });

    it('should handle undefined optional fields', () => {
      const serverCard: ServerCardInfo = {
        suit: 'clubs',
        value: '2',
        userId: 'user-6',
      };

      const normalized = normalizeCard(serverCard);

      expect(normalized.powerLevel).toBeUndefined();
      expect(normalized.scoringLevel).toBeUndefined();
      expect(normalized.imageUrl).toBeUndefined();
      expect(normalized.videoUrl).toBeUndefined();
    });
  });
});
