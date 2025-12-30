/**
 * Centralized localStorage access
 *
 * All localStorage access should go through this module for:
 * - Type safety
 * - SSR safety (checks for window)
 * - Consistent API
 * - Easy debugging and testing
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  ACCESS_TOKEN_EXPIRE: 'accessTokenExpire',
  SIGNATURE: 'signature',
  ADDING_METAMASK: 'adding-metamask',
  ROOM_ID: 'roomid',

  // Game state flags
  INTENTIONAL_LEAVE: 'intentional-leave',
  PLAY_AGAIN: 'play-again',
  CHOSEN_NFTS: 'chosen-nfts',

  // Debug
  DEBUG_ANIM: 'DEBUG_ANIM',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// ============================================================================
// SSR SAFETY
// ============================================================================

const isClient = typeof window !== 'undefined';

// ============================================================================
// LOW-LEVEL HELPERS
// ============================================================================

function get(key: StorageKey): string | null {
  if (!isClient) return null;
  return localStorage.getItem(key);
}

function set(key: StorageKey, value: string): void {
  if (!isClient) return;
  localStorage.setItem(key, value);
}

function remove(key: StorageKey): void {
  if (!isClient) return;
  localStorage.removeItem(key);
}

// ============================================================================
// AUTH STORAGE
// ============================================================================

export const auth = {
  getAccessToken: () => get(STORAGE_KEYS.ACCESS_TOKEN),
  setAccessToken: (token: string) => set(STORAGE_KEYS.ACCESS_TOKEN, token),
  removeAccessToken: () => remove(STORAGE_KEYS.ACCESS_TOKEN),

  getRefreshToken: () => get(STORAGE_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => set(STORAGE_KEYS.REFRESH_TOKEN, token),
  removeRefreshToken: () => remove(STORAGE_KEYS.REFRESH_TOKEN),

  getAccessTokenExpire: () => get(STORAGE_KEYS.ACCESS_TOKEN_EXPIRE),
  setAccessTokenExpire: (expire: string) => set(STORAGE_KEYS.ACCESS_TOKEN_EXPIRE, expire),
  removeAccessTokenExpire: () => remove(STORAGE_KEYS.ACCESS_TOKEN_EXPIRE),

  getSignature: () => get(STORAGE_KEYS.SIGNATURE),
  setSignature: (sig: string) => set(STORAGE_KEYS.SIGNATURE, sig),
  removeSignature: () => remove(STORAGE_KEYS.SIGNATURE),

  isLoggedIn: () => get(STORAGE_KEYS.ACCESS_TOKEN) !== null,

  clearAll: () => {
    remove(STORAGE_KEYS.ACCESS_TOKEN);
    remove(STORAGE_KEYS.REFRESH_TOKEN);
    remove(STORAGE_KEYS.ACCESS_TOKEN_EXPIRE);
    remove(STORAGE_KEYS.SIGNATURE);
  },
};

// ============================================================================
// GAME FLAGS STORAGE
// ============================================================================

export const gameFlags = {
  // Intentional leave flag - prevents redirect when user intentionally leaves
  getIntentionalLeave: () => get(STORAGE_KEYS.INTENTIONAL_LEAVE) === 'true',
  setIntentionalLeave: () => set(STORAGE_KEYS.INTENTIONAL_LEAVE, 'true'),
  clearIntentionalLeave: () => remove(STORAGE_KEYS.INTENTIONAL_LEAVE),

  // Play again flag - indicates user wants to play another game
  getPlayAgain: () => get(STORAGE_KEYS.PLAY_AGAIN) === 'true',
  setPlayAgain: () => set(STORAGE_KEYS.PLAY_AGAIN, 'true'),
  clearPlayAgain: () => remove(STORAGE_KEYS.PLAY_AGAIN),

  // Chosen NFTs - comma-separated list of NFT IDs
  getChosenNfts: () => get(STORAGE_KEYS.CHOSEN_NFTS),
  setChosenNfts: (nfts: string) => set(STORAGE_KEYS.CHOSEN_NFTS, nfts),
  clearChosenNfts: () => set(STORAGE_KEYS.CHOSEN_NFTS, ''),

  // Clear all game flags (on intentional exit)
  clearAllGameFlags: () => {
    set(STORAGE_KEYS.INTENTIONAL_LEAVE, 'true');
    set(STORAGE_KEYS.CHOSEN_NFTS, '');
  },
};

// ============================================================================
// METAMASK STORAGE
// ============================================================================

export const metamask = {
  isAddingMetamask: () => get(STORAGE_KEYS.ADDING_METAMASK) === 'true',
  setAddingMetamask: () => set(STORAGE_KEYS.ADDING_METAMASK, 'true'),
  clearAddingMetamask: () => remove(STORAGE_KEYS.ADDING_METAMASK),
};

// ============================================================================
// ROOM STORAGE
// ============================================================================

export const room = {
  getRoomId: () => get(STORAGE_KEYS.ROOM_ID),
  setRoomId: (id: string) => set(STORAGE_KEYS.ROOM_ID, id),
  clearRoomId: () => remove(STORAGE_KEYS.ROOM_ID),
};

// ============================================================================
// DEBUG STORAGE
// ============================================================================

export const debug = {
  isAnimDebugEnabled: () => get(STORAGE_KEYS.DEBUG_ANIM) === '1',
  enableAnimDebug: () => set(STORAGE_KEYS.DEBUG_ANIM, '1'),
  disableAnimDebug: () => remove(STORAGE_KEYS.DEBUG_ANIM),
};

// ============================================================================
// DEFAULT EXPORT - GROUPED BY DOMAIN
// ============================================================================

export const storage = {
  auth,
  gameFlags,
  metamask,
  room,
  debug,
  // Raw access for edge cases
  get,
  set,
  remove,
  KEYS: STORAGE_KEYS,
};

export default storage;
