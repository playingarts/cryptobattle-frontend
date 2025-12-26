import { ComponentType } from "react";

// Card Types
export type CardSuit = "spades" | "hearts" | "clubs" | "diamonds";
export type CardValue = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

// Game State
export type GameState = "results" | "ended" | "started";
export type PlayerRoomState = "ready" | "waiting";
export type RoomState = "opened" | "inGame";
export type RoomType = "private" | "public";
export type AuthProvider = "twitter" | "metamask" | "unified";

// Player & User Types
export interface MetamaskInfo {
  address: string;
  signature?: string;
}

export interface User {
  userId: string;
  username: string;
  name: string;
  profilePictureUrl?: string;
  playerLevel: number;
  inRoomId?: string;
  inGameId?: string;
  refreshToken?: string;
  accessTokenExpire?: number;
  authProvider: AuthProvider;
  metamask?: MetamaskInfo;
  isTwitterConnected: boolean;
  isMetamaskConnected: boolean;
}

export interface RoomUser {
  isSocketIdle: boolean;
  state: PlayerRoomState;
  userId: string;
  color: string;
  username?: string;
}

export interface GamePlayer {
  isSocketIdle: boolean;
  username?: string;
  userId: string;
  color: string;
  profileImageUrl: string;
}

// Card Types
export interface PlayerCard {
  id: string;
  uid?: string; // Client-side generated unique ID for rendering
  name: string;
  xp: number;
  power: number;
  scoring: number;
  suit: CardSuit;
  value: CardValue;
  onSale: boolean;
  imageUrl: string;
  videoUrl: string;
  powerLevel: number;
  scoringLevel: number;
  userId?: string;
  score?: number;
  Icon?: ComponentType; // Added by getCard function
}

export interface TableCard {
  x: number;
  y: number;
  card: PlayerCard;
}

export interface PlaceableCard {
  x: number;
  y: number;
  index: number;
}

// Game Table Types - additionalProperties is used by backend serializer
export interface GameTableCardsInfo {
  additionalProperties?: { [key: string]: TableCard[] };
}

export interface AllowedUserCardsPlacement {
  additionalProperties?: PlaceableCard[];
}

export interface PlayersCurrentPoints {
  [userId: string]: number;
}

export interface LastPlayedCardInfo {
  x: number;
  y: number;
  userId: string;
}

// Game User With Cards
export interface GameUserWithCardsInfo {
  userId: string;
  cards: PlayerCard[];
}

// Game State Types
export interface GameUpdatedData {
  gameId: string;
  tableSizeX: number;
  tableSizeY: number;
  state: GameState;
  turnForPlayer: string;
  gameUsersWithCards?: GameUserWithCardsInfo[];
  allGamePlayers: GamePlayer[];
  gameTableCards?: GameTableCardsInfo;
  allowedUserCardsPlacement?: AllowedUserCardsPlacement;
  playersCurrentPoints?: PlayersCurrentPoints;
  lastPlayedCard?: LastPlayedCardInfo;
}

// Room Types
export interface RoomInfo {
  roomId: string;
  type: RoomType;
  state: RoomState;
  maxPlayers: number;
  ownderId: string; // Note: typo in backend, kept for compatibility
  roomUsers: RoomUser[];
  timeoutsOn: boolean;
}

// Game Results
export interface PlayerPoints {
  userId: string;
  points: number;
}

export interface NftCardDelta {
  powerDelta: number;
  scoringDelta: number;
  xpDelta: number;
}

export interface NftPlayerCardDeltas {
  [nftCardId: string]: NftCardDelta;
}

export interface NftPlayersCardsDeltas {
  userId: string;
  nftCardsDeltas: NftPlayerCardDeltas;
}

export interface GameResults {
  areAllPlayersActive: boolean;
  winnerPlayersUserIds: string[];
  playersPoints: PlayerPoints[];
  nftPlayersCardsDeltas?: NftPlayersCardsDeltas[];
}

// WebSocket Event Types
export interface WSError {
  errorCode: number;
  message: string;
}

export interface TimerData {
  secondsLeft: number;
  totalSeconds: number;
}

export interface UserSocketIdleData {
  isIdle: boolean;
  userId: string;
}

export interface CloseRoomData {
  reason: "TIMEOUT" | "NEXT_GAME_VOTE_FAILED" | "OWNER_CLOSED";
  ownerId?: string;
}

export interface QuitRoomData {
  reason: "KICKED_BY_ROOM_OWNER" | "LEFT";
  userId: string;
}

// WebSocket Event Payloads
export type WSEventType =
  | "user-info"
  | "create-room"
  | "room-info"
  | "room-updated"
  | "join-room"
  | "quit-room"
  | "close-room"
  | "player-ready"
  | "start-game"
  | "game-info"
  | "game-updated"
  | "game-results"
  | "choose-nft-cards"
  | "next-game"
  | "play-card"
  | "timer"
  | "user-socket-idle"
  | "ping"
  | "pong";

export interface WSEvent<T = unknown> {
  event: WSEventType;
  data: T & { error?: WSError };
}
