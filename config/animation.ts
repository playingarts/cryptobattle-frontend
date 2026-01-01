/**
 * Animation Configuration
 *
 * Centralized animation timing and settings for the game.
 * All durations are in milliseconds.
 */

export const ANIMATION_CONFIG = {
  // Card fly-in animation duration (must match CSS @keyframes cardFlyIn)
  CARD_FLY_IN_DURATION: 400,

  // Buffer after animation for visual smoothness
  ANIMATION_BUFFER: 100,

  // Scroll animation duration when centering card
  SCROLL_DURATION: 600,

  // Easing function for scroll animation
  SCROLL_EASING: 'ease-out-cubic' as const,

  // Score popup animation duration
  SCORE_POPUP_DURATION: 1500,

  // Drag feedback animation duration
  DRAG_FEEDBACK_DURATION: 150,

  // Drop zone highlight duration
  DROP_ZONE_HIGHLIGHT_DURATION: 200,

  // Card stack rotation per card (degrees)
  CARD_STACK_ROTATION: 4,

  // Maximum stack offset (pixels)
  MAX_STACK_OFFSET: 8,
} as const;

/**
 * Calculate total animation duration including scroll
 */
export function getTotalAnimationDuration(): number {
  return (
    ANIMATION_CONFIG.SCROLL_DURATION +
    ANIMATION_CONFIG.CARD_FLY_IN_DURATION +
    ANIMATION_CONFIG.ANIMATION_BUFFER
  );
}

/**
 * Easing functions for smooth animations
 */
export const EASING = {
  // Cubic ease-out (used for scroll animations)
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),

  // Cubic ease-in-out (used for card transitions)
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Elastic ease-out (for bouncy card landing)
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Back ease-out (slight overshoot)
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
} as const;

/**
 * Create a smooth scroll animation using requestAnimationFrame
 */
export function smoothScrollTo(
  element: Element,
  targetLeft: number,
  targetTop: number,
  duration: number = ANIMATION_CONFIG.SCROLL_DURATION,
  onComplete?: () => void
): () => void {
  const startLeft = element.scrollLeft;
  const startTop = element.scrollTop;
  const startTime = performance.now();
  let animationId: number;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = EASING.easeOutCubic(progress);

    element.scrollLeft = startLeft + (targetLeft - startLeft) * eased;
    element.scrollTop = startTop + (targetTop - startTop) * eased;

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };

  animationId = requestAnimationFrame(animate);

  // Return cancel function
  return () => cancelAnimationFrame(animationId);
}

/**
 * Calculate scroll target to center an element in its container
 * Returns null if scrolling would be minimal (element near edge)
 */
export function calculateScrollTarget(
  element: Element,
  container: Element
): { left: number; top: number } | null {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Calculate ideal center position
  const idealLeft =
    container.scrollLeft +
    elementRect.left -
    containerRect.left -
    containerRect.width / 2 +
    elementRect.width / 2;
  const idealTop =
    container.scrollTop +
    elementRect.top -
    containerRect.top -
    containerRect.height / 2 +
    elementRect.height / 2;

  // Calculate max scroll values
  const maxScrollLeft = container.scrollWidth - containerRect.width;
  const maxScrollTop = container.scrollHeight - containerRect.height;

  // Clamp to valid scroll range
  const clampedLeft = Math.max(0, Math.min(idealLeft, maxScrollLeft));
  const clampedTop = Math.max(0, Math.min(idealTop, maxScrollTop));

  // Check if scroll distance is minimal (less than 50px in both directions)
  // This prevents glitchy small scrolls at board edges
  const scrollDistanceX = Math.abs(clampedLeft - container.scrollLeft);
  const scrollDistanceY = Math.abs(clampedTop - container.scrollTop);
  const minScrollThreshold = 50;

  if (scrollDistanceX < minScrollThreshold && scrollDistanceY < minScrollThreshold) {
    return null; // Skip scrolling for minimal distances
  }

  return {
    left: clampedLeft,
    top: clampedTop,
  };
}
