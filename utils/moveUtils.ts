/**
 * Move utility functions for game state management
 *
 * These utilities handle:
 * - Move key generation for idempotency
 * - Card normalization (lowercase suits)
 * - Position finding on the board
 */

import { NormalizedCard, ServerCardInfo, ServerTableCards } from '../types/game';
import cards from '../components/Cards/cards.json';

/**
 * Generate a unique, deterministic key for a move
 * Used for idempotency and animation deduplication
 *
 * Key format: suit-value-x-y-userId
 * This ensures:
 * - Same card at different positions = different keys
 * - Same card by same player at same position = same key (idempotent)
 */
export function generateMoveKey(
  card: { suit: string; value: string; userId: string },
  position: { x: number; y: number }
): string {
  const suit = card.suit.toLowerCase();
  const value = String(card.value).toLowerCase();
  const { x, y } = position;
  const userId = card.userId;

  return `${suit}-${value}-${x}-${y}-${userId}`;
}

/**
 * Normalize a server card to our standard format
 * Ensures consistent lowercase suits and proper field mapping
 */
export function normalizeCard(serverCard: ServerCardInfo): NormalizedCard {
  return {
    id: serverCard.id || `${serverCard.suit}-${serverCard.value}-${serverCard.userId}`,
    suit: serverCard.suit.toLowerCase(),
    value: String(serverCard.value).toLowerCase(),
    userId: serverCard.userId,
    powerLevel: serverCard.powerLevel,
    scoringLevel: serverCard.scoringLevel,
    imageUrl: serverCard.imageUrl,
    videoUrl: serverCard.videoUrl,
    isNft: !!serverCard.id && serverCard.id !== '',
  };
}

/**
 * Find the position of a card on the board
 * Returns { x, y } or null if not found
 *
 * Searches through gameTableCards for a matching card
 * (matches by suit, value, and userId)
 */
export function findCardPosition(
  tableCards: Record<string, NormalizedCard[]>,
  card: NormalizedCard
): { x: number; y: number } | null {
  for (const [key, cards] of Object.entries(tableCards)) {
    // Check the top card in each stack
    const topCard = cards[cards.length - 1];
    if (
      topCard &&
      topCard.suit.toLowerCase() === card.suit.toLowerCase() &&
      topCard.value.toLowerCase() === card.value.toLowerCase() &&
      topCard.userId === card.userId
    ) {
      const [xStr, yStr] = key.split('-');
      return { x: parseInt(xStr, 10), y: parseInt(yStr, 10) };
    }
  }
  return null;
}

/**
 * Normalize table cards from server format to our internal format
 * Converts additionalProperties object to a Record<string, NormalizedCard[]>
 */
export function normalizeTableCards(
  serverTableCards?: ServerTableCards
): Record<string, NormalizedCard[]> {
  if (!serverTableCards?.additionalProperties) {
    return {};
  }

  const result: Record<string, NormalizedCard[]> = {};

  for (const [key, cards] of Object.entries(serverTableCards.additionalProperties)) {
    if (Array.isArray(cards)) {
      result[key] = cards.map((card: ServerCardInfo) => normalizeCard(card));
    }
  }

  return result;
}

/**
 * Check if two cards represent the same played move
 * Used to match optimistic moves with server confirmations
 */
export function isMatchingMove(
  move: { card: NormalizedCard; position: { x: number; y: number } },
  serverCard: NormalizedCard | null,
  serverPosition: { x: number; y: number } | null
): boolean {
  if (!serverCard || !serverPosition) return false;

  return (
    move.card.suit.toLowerCase() === serverCard.suit.toLowerCase() &&
    move.card.value.toLowerCase() === serverCard.value.toLowerCase() &&
    move.card.userId === serverCard.userId &&
    move.position.x === serverPosition.x &&
    move.position.y === serverPosition.y
  );
}

/**
 * Get the card image URL
 * Looks up the card in cards.json if no imageUrl provided
 */
export function getCardImageUrl(card: { suit: string; value: string; imageUrl?: string }): string {
  if (card.imageUrl) {
    return card.imageUrl;
  }

  // Look up in cards.json
  // Note: Using any[] because cards.json has joker entries with suit?: undefined
  const foundCard = (cards as { suit?: string; value: string | number; img: string }[]).find((c) =>
    c.suit?.toLowerCase() === card.suit?.toLowerCase() &&
    String(c.value).toLowerCase() === String(card.value).toLowerCase()
  );

  if (foundCard && foundCard.img) {
    return foundCard.img;
  }

  // Fallback - should never reach here if cards.json is complete
  return '';
}

/**
 * Get the card video URL
 * Looks up the card in cards.json if no videoUrl provided
 */
export function getCardVideoUrl(card: { suit: string; value: string; videoUrl?: string }): string | undefined {
  if (card.videoUrl) {
    return card.videoUrl;
  }

  // Look up in cards.json
  // Note: Using explicit type because cards.json has joker entries with suit?: undefined
  const foundCard = (cards as { suit?: string; value: string | number; video?: string }[]).find((c) =>
    c.suit?.toLowerCase() === card.suit?.toLowerCase() &&
    String(c.value).toLowerCase() === String(card.value).toLowerCase()
  );

  return foundCard?.video;
}
