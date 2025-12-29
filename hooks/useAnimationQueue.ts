/**
 * Animation Queue Hook
 *
 * Manages animation playback for card moves.
 * - Single animation at a time
 * - Uses moveKey for idempotency
 * - Handles both local and remote moves uniformly
 * - Auto-clears animation after duration
 */

import { useState, useEffect, useRef } from 'react';
import { PendingAnimation } from '../types/game';
import { GameAction } from '../store/gameActions';
import { logAnimation } from '../utils/debug';

// Animation duration matches CSS (400ms) + buffer for smoothness
const ANIMATION_DURATION_MS = 500;

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
    // If no pending animation, skip
    if (!pendingAnimation) {
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

    const SCROLL_DURATION = 600;

    const startCardAnimation = () => {
      setCurrentAnimation(pendingAnimation);
    };

    if (boardCell && scrollContainer) {
      const cardRect = boardCell.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();

      // Calculate target scroll position to center the card
      const targetLeft = scrollContainer.scrollLeft + cardRect.left - containerRect.left - (containerRect.width / 2) + (cardRect.width / 2);
      const targetTop = scrollContainer.scrollTop + cardRect.top - containerRect.top - (containerRect.height / 2) + (cardRect.height / 2);

      // Smooth scroll with custom duration
      const startLeft = scrollContainer.scrollLeft;
      const startTop = scrollContainer.scrollTop;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / SCROLL_DURATION, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        scrollContainer.scrollLeft = startLeft + (targetLeft - startLeft) * eased;
        scrollContainer.scrollTop = startTop + (targetTop - startTop) * eased;

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          // Scroll complete, start card animation
          startCardAnimation();
        }
      };

      requestAnimationFrame(animateScroll);
    } else {
      // No scroll needed, start animation immediately
      startCardAnimation();
    }

    // End animation after scroll + card animation duration
    animationTimeoutRef.current = setTimeout(() => {
      logAnimation('ANIM_COMPLETE', {
        moveKey: pendingAnimation.moveKey,
      });
      dispatch({ type: 'ANIMATION_COMPLETED', payload: { moveKey: pendingAnimation.moveKey } });
      // Don't clear currentAnimation - let the overlay stay visible
      // It will be replaced when the next animation starts
      setIsAnimating(false);
    }, SCROLL_DURATION + ANIMATION_DURATION_MS);

    // Cleanup on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [pendingAnimation, dispatch]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Always return currentAnimation - overlay stays visible after animation completes
    currentAnimation,
    isAnimating,
  };
}
