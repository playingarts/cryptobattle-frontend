/**
 * Animation Queue Hook
 *
 * Manages animation playback for card moves.
 * - Single animation at a time
 * - Uses moveKey for idempotency
 * - Handles both local and remote moves uniformly
 * - Auto-clears animation after duration
 * - Uses centralized animation config
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { PendingAnimation } from '../types/game';
import { GameAction } from '../store/gameActions';
import { logAnimation } from '../utils/debug';
import {
  ANIMATION_CONFIG,
  smoothScrollTo,
  calculateScrollTarget,
} from '../config/animation';

interface UseAnimationQueueOptions {
  pendingAnimation: PendingAnimation | null;
  dispatch: (action: GameAction) => void;
}

interface UseAnimationQueueResult {
  currentAnimation: PendingAnimation | null;
  isAnimating: boolean;
}

/**
 * Hook to manage animation playback
 */
export function useAnimationQueue({
  pendingAnimation,
  dispatch,
}: UseAnimationQueueOptions): UseAnimationQueueResult {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<PendingAnimation | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollCancelRef = useRef<(() => void) | null>(null);

  // Use refs to track state inside useEffect without re-running on every state change
  const isAnimatingRef = useRef(isAnimating);
  const currentAnimationRef = useRef(currentAnimation);

  // Keep refs in sync
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
    currentAnimationRef.current = currentAnimation;
  }, [isAnimating, currentAnimation]);

  // Start a new animation when pendingAnimation changes
  useEffect(() => {
    // If no pending animation, clear current animation (game ended or animation cleared)
    if (!pendingAnimation) {
      if (currentAnimationRef.current) {
        setCurrentAnimation(null);
        setIsAnimating(false);
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
          animationTimeoutRef.current = null;
        }
      }
      return;
    }

    // If already animating the same move, skip
    if (isAnimatingRef.current && currentAnimationRef.current?.moveKey === pendingAnimation.moveKey) {
      return;
    }

    // Clear any existing animation timer
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // If we're animating a different move, complete it first
    if (isAnimatingRef.current && currentAnimationRef.current && currentAnimationRef.current.moveKey !== pendingAnimation.moveKey) {
      dispatch({ type: 'ANIMATION_COMPLETED', payload: { moveKey: currentAnimationRef.current.moveKey } });
    }

    logAnimation('ANIM_START', {
      moveKey: pendingAnimation.moveKey,
      card: `${pendingAnimation.card.suit}-${pendingAnimation.card.value}`,
      position: pendingAnimation.position,
    });

    // Mark as animating
    setIsAnimating(true);
    dispatch({ type: 'ANIMATION_STARTED', payload: { moveKey: pendingAnimation.moveKey } });

    // Scroll to the card position first, then start card animation
    const scrollContainer = document.querySelector('.scroll-container');
    const boardCell = document.querySelector(`[id="${pendingAnimation.position.y}-${pendingAnimation.position.x}"]`);

    const startCardAnimation = () => {
      setCurrentAnimation(pendingAnimation);
    };

    // Store cancel function for scroll animation cleanup
    let cancelScroll: (() => void) | null = null;

    if (boardCell && scrollContainer) {
      const { left: targetLeft, top: targetTop } = calculateScrollTarget(boardCell, scrollContainer);

      // Use optimized smooth scroll with cleanup
      cancelScroll = smoothScrollTo(
        scrollContainer,
        targetLeft,
        targetTop,
        ANIMATION_CONFIG.SCROLL_DURATION,
        startCardAnimation
      );
    } else {
      // No scroll needed, start animation immediately
      startCardAnimation();
    }

    // Calculate total animation duration
    const totalDuration =
      ANIMATION_CONFIG.SCROLL_DURATION +
      ANIMATION_CONFIG.CARD_FLY_IN_DURATION +
      ANIMATION_CONFIG.ANIMATION_BUFFER;

    // End animation after scroll + card animation duration
    animationTimeoutRef.current = setTimeout(() => {
      logAnimation('ANIM_COMPLETE', {
        moveKey: pendingAnimation.moveKey,
      });
      dispatch({ type: 'ANIMATION_COMPLETED', payload: { moveKey: pendingAnimation.moveKey } });
      // Clear currentAnimation so the board card becomes visible again
      setCurrentAnimation(null);
      setIsAnimating(false);
    }, totalDuration);

    // Store cancel function for cleanup
    scrollCancelRef.current = cancelScroll;

    // Cleanup on unmount or when animation changes
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (scrollCancelRef.current) {
        scrollCancelRef.current();
      }
    };
  }, [pendingAnimation, dispatch]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (scrollCancelRef.current) {
        scrollCancelRef.current();
      }
    };
  }, []);

  return {
    // Always return currentAnimation - overlay stays visible after animation completes
    currentAnimation,
    isAnimating,
  };
}
