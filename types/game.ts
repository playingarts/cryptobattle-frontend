/**
 * Game-related TypeScript types
 *
 * These types document the data structures used in the game.
 * They are defined separately to avoid breaking existing code.
 * Import and use incrementally as needed.
 */

// Player types
export interface Player {
  userId: string;
  username: string;
  state?: 'ready' | 'waiting' | 'playing';
  avatarUrl?: string;
}

export interface PlayerWithPoints extends Player {
  points: number;
}

// Room types
export interface RoomInfo {
  roomId: string;
  roomUsers: Player[];
  ownerId?: string;
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
  cardId: string;
  name?: string;
  imageUrl?: string;
  attributes?: Record<string, number>;
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
