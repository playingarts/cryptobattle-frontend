/**
 * Animation Queue Hook
 *
 * Manages animation playback for card moves.
 * - Single animation at a time
 * - Uses moveKey for idempotency
 * - Handles both local and remote moves uniformly
 * - Auto-clears animation after duration
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { PendingAnimation } from '../types/game';
import { GameAction } from '../store/gameActions';
import { logAnimation } from '../utils/debug';

// Animation duration matches CSS (800ms) + buffer for smoothness
const ANIMATION_DURATION_MS = 1000;

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use refs to track state inside useEffect without re-running on every state change
  const isAnimatingRef = useRef(isAnimating);
  const currentAnimationRef = useRef(currentAnimation);

  // Keep refs in sync
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
    currentAnimationRef.current = currentAnimation;
  }, [isAnimating, currentAnimation]);

  // Initialize audio on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/play-card.mp3');
    }
    return () => {
      audioRef.current = null;
    };
  }, []);

  // Play sound effect
  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, []);

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

    // Start the new animation
    setCurrentAnimation(pendingAnimation);
    setIsAnimating(true);
    dispatch({ type: 'ANIMATION_STARTED', payload: { moveKey: pendingAnimation.moveKey } });
    playSound();

    // Scroll the animation into view
    setTimeout(() => {
      const latestCard = document.querySelector('.game-latest-card-wrapper');
      if (latestCard) {
        const rect = latestCard.getBoundingClientRect();
        const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!inView) {
          latestCard.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
    }, 0);

    // End animation after duration - but keep currentAnimation so overlay stays visible
    animationTimeoutRef.current = setTimeout(() => {
      logAnimation('ANIM_COMPLETE', {
        moveKey: pendingAnimation.moveKey,
      });
      dispatch({ type: 'ANIMATION_COMPLETED', payload: { moveKey: pendingAnimation.moveKey } });
      // Don't clear currentAnimation - let the overlay stay visible
      // It will be replaced when the next animation starts
      setIsAnimating(false);
    }, ANIMATION_DURATION_MS);

    // Cleanup on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [pendingAnimation, dispatch, playSound]);

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
