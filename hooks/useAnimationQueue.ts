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

    // Start the new animation
    setCurrentAnimation(pendingAnimation);
    setIsAnimating(true);
    dispatch({ type: 'ANIMATION_STARTED', payload: { moveKey: pendingAnimation.moveKey } });

    // Scroll to center the played card
    setTimeout(() => {
      const latestCard = document.querySelector('.game-latest-card-wrapper');
      if (latestCard) {
        latestCard.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 50);

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
