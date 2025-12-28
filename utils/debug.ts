/**
 * Debug utilities for game animation and state tracking
 *
 * Enable debug mode by setting NEXT_PUBLIC_DEBUG_ANIM=1
 * This will log all animation events to the console with timestamps
 */

const DEBUG_ANIM = typeof window !== 'undefined' &&
  (process.env.NEXT_PUBLIC_DEBUG_ANIM === '1' ||
   (typeof localStorage !== 'undefined' && localStorage.getItem('DEBUG_ANIM') === '1'));

type AnimationEvent =
  | 'STATE_RECEIVED'
  | 'LOCAL_MOVE'
  | 'ANIM_START'
  | 'ANIM_COMPLETE'
  | 'MOVE_KEY_GENERATED'
  | 'DUPLICATE_DETECTED'
  | 'BOARD_UPDATED';

interface AnimationLogData {
  moveKey?: string | null;
  isNewMove?: boolean | "" | null;
  processedKeys?: number;
  card?: string | null;
  position?: { x: number; y: number };
  playerId?: string;
  [key: string]: unknown;
}

/**
 * Log animation-related events when debug mode is enabled
 */
export function logAnimation(event: AnimationEvent, data: AnimationLogData): void {
  if (!DEBUG_ANIM) return;

  const timestamp = new Date().toISOString().split('T')[1];
  const color = getEventColor(event);

  console.log(
    `%c[ANIM ${timestamp}] ${event}`,
    `color: ${color}; font-weight: bold`,
    data
  );
}

/**
 * Get a color for each event type for better visual debugging
 */
function getEventColor(event: AnimationEvent): string {
  switch (event) {
    case 'STATE_RECEIVED':
      return '#00bcd4';
    case 'LOCAL_MOVE':
      return '#4caf50';
    case 'ANIM_START':
      return '#ff9800';
    case 'ANIM_COMPLETE':
      return '#8bc34a';
    case 'MOVE_KEY_GENERATED':
      return '#9c27b0';
    case 'DUPLICATE_DETECTED':
      return '#f44336';
    case 'BOARD_UPDATED':
      return '#2196f3';
    default:
      return '#ffffff';
  }
}

/**
 * Log game state changes when debug mode is enabled
 */
export function logGameState(label: string, state: unknown): void {
  if (!DEBUG_ANIM) return;

  console.log(
    `%c[GAME STATE] ${label}`,
    'color: #e91e63; font-weight: bold',
    state
  );
}

/**
 * Enable debug mode at runtime
 */
export function enableDebugMode(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('DEBUG_ANIM', '1');
    console.log('%c[DEBUG] Animation debug mode enabled. Refresh to apply.', 'color: #4caf50');
  }
}

/**
 * Disable debug mode at runtime
 */
export function disableDebugMode(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('DEBUG_ANIM');
    console.log('%c[DEBUG] Animation debug mode disabled. Refresh to apply.', 'color: #f44336');
  }
}

// Export convenience function for checking debug state
export function isDebugMode(): boolean {
  return DEBUG_ANIM;
}
