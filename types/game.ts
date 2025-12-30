/**
 * Game-related TypeScript types
 *
 * These types document the data structures used in the game.
 * They are defined separately to avoid breaking existing code.
 * Import and use incrementally as needed.
 */

// Player types
export interface Player {
  odlPlayer?: boolean;
  odlOld?: boolean;
  odlNew?: boolean;
  odlIdx?: number;
  odlMovedPlayer?: boolean;
  odlMovedIdx?: number;
  odlQueue?: boolean;
  odlOrdered?: number;
  userId: string;
  username: string;
  state?: 'ready' | 'waiting' | 'playing';
  avatarUrl?: string;
  color?: string;
}

export interface PlayerWithPoints extends Player {
  points: number;
}

// Room types
export interface RoomInfo {
  roomId: string;
  roomUsers?: Player[];
  ownerId?: string;
  ownderId?: string;  // Note: typo in backend, kept for compatibility
  maxPlayers?: number;
  gameMode?: string;
}

// Game state types
export interface GameState {
  state: 'waiting' | 'started' | 'ended';
  turnForPlayer?: string;
  allGamePlayers: Player[];
  currentRound?: number;
  totalRounds?: number;
}

// Card types
export interface Card {
  cardId?: string;
  uid?: string;
  suit?: string;
  value?: string;
  name?: string;
  imageUrl?: string;
  attributes?: Record<string, number>;
  isNft?: boolean;
  power?: number;
  scoring?: number;
}

// Game results types
export interface GameResults {
  winnerPlayersUserIds: string[];
  playersPoints: PlayerWithPoints[];
  areAllPlayersActive: boolean;
}

// User info from backend
export interface UserInfo {
  userId: string;
  username: string;
  inGameId?: string;
  inRoomId?: string;
  walletAddress?: string;
}

// WebSocket event types
export type WSEventType =
  | 'ping'
  | 'pong'
  | 'user-info'
  | 'create-room'
  | 'join-room'
  | 'room-info'
  | 'room-updated'
  | 'close-room'
  | 'quit-room'
  | 'game-info'
  | 'game-updated'
  | 'game-results'
  | 'timer'
  | 'user-socket-idle'
  | 'next-game'
  | 'choose-nft-cards';

export interface WSEvent<T = unknown> {
  event: WSEventType;
  data: T;
}

export interface WSErrorData {
  error: {
    errorCode: number;
    message: string;
  };
}

// Timer event data
export interface TimerEventData {
  secondsLeft: number;
  totalSeconds: number;
}

// Close room reasons
export type CloseRoomReason =
  | 'TIMEOUT'
  | 'NEXT_GAME_VOTE_FAILED'
  | 'HOST_CLOSED';

export interface CloseRoomEventData {
  reason: CloseRoomReason;
  ownerId?: string;
}

// Quit room reasons
export type QuitRoomReason = 'KICKED_BY_ROOM_OWNER' | 'LEFT';

export interface QuitRoomEventData {
  reason: QuitRoomReason;
}

// ============================================================
// NEW MOVE SYSTEM TYPES (Phase 3 Implementation)
// ============================================================

/**
 * Server card info as received from backend
 * (before normalization)
 */
export interface ServerCardInfo {
  id: string;
  name?: string;
  xp?: number;
  power?: number;
  scoring?: number;
  suit: string;
  value: string;
  onSale?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  powerLevel?: number;
  scoringLevel?: number;
  userId: string;
  score?: number;
}

/**
 * Server table cards format
 */
export interface ServerTableCards {
  additionalProperties?: Record<string, ServerCardInfo[]>;
}

/**
 * Normalized card representation used everywhere in frontend
 * All suits are lowercase for consistent comparison
 */
export interface NormalizedCard {
  id: string;
  suit: string;            // Always lowercase: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  value: string;           // '2'-'10' | 'jack' | 'queen' | 'king' | 'ace' | 'joker'
  userId: string;          // Who owns/played this card
  powerLevel?: number;
  scoringLevel?: number;
  imageUrl?: string;
  videoUrl?: string;
  isNft: boolean;
}

/**
 * A move represents a card being played to the board
 */
export interface GameMove {
  moveKey: string;         // Unique key: `${suit}-${value}-${x}-${y}-${userId}`
  card: NormalizedCard;
  position: { x: number; y: number };
  playerId: string;
  timestamp: number;       // Client-side timestamp for ordering
  isLocal: boolean;        // true if this was an optimistic local move
  confirmed: boolean;      // true if server has confirmed
}

/**
 * Board cell containing stacked cards
 */
export interface BoardCell {
  x: number;
  y: number;
  cards: NormalizedCard[];
  isEmpty: boolean;
  isDropTarget: boolean;   // Can drop card here
}

/**
 * 2D board derived from server state
 */
export type GameBoard = BoardCell[][];

/**
 * Animation state for a pending animation
 */
export interface PendingAnimation {
  moveKey: string;
  card: NormalizedCard;
  position: { x: number; y: number };
  scoringLevel: number;
  playerId: string;
  stackIndex: number; // Index in stack (0 = first card, 1 = second, etc.) for rotation
}

/**
 * Game player as received from allGamePlayers
 */
export interface GamePlayer {
  oddsForWin?: number;
  oddsForLose?: number;
  oddsForTie?: number;
  oddsForHalfGame?: number;
  oddsForHalfGameSurpass?: number;
  oddsForHalfGameNotReach?: number;
  oddsForGameSurpass?: number;
  oddsForGameNotReach?: number;
  oddsForExact?: number;
  userId: string;
  username?: string;
  color?: string;
}
