/**
 * Animation Overlay Component
 *
 * Renders the card placement animation ABOVE the board.
 * Shows the ACTUAL CARD FACE during animation (Option B from design).
 *
 * Features:
 * - Displays card image/video during fly-in animation
 * - Shows score popup (+N) after card lands
 * - Uses player color for outline
 * - Auto-positions based on cell location
 */

import { FC, useMemo } from 'react';
import Card from '../CardNew';
import { PendingAnimation, GamePlayer } from '../../types/game';
import { getCardImageUrl, getCardVideoUrl } from '../../utils/moveUtils';

// Cell dimensions (must match GameBoard cell sizing)
const CELL_WIDTH = 210;
const CELL_HEIGHT = 300;
const CELL_MARGIN = 20;

interface AnimationOverlayProps {
  animation: PendingAnimation | null;
  players: GamePlayer[];
  boardOffsetX?: number;
  boardOffsetY?: number;
}

/**
 * Get player color by userId
 */
function getPlayerColor(players: GamePlayer[], userId: string): string {
  const player = players.find((p) => p.userId === userId);
  return player?.color || '#808080';
}

/**
 * Calculate the position for the animation based on cell coordinates
 */
function calculateAnimationPosition(
  position: { x: number; y: number },
  boardOffsetX: number,
  boardOffsetY: number
): { top: number; left: number } {
  // Calculate position based on cell grid
  // Account for margin around cells
  const cellTotalWidth = CELL_WIDTH + CELL_MARGIN * 2;
  const cellTotalHeight = CELL_HEIGHT + CELL_MARGIN * 2;

  return {
    top: boardOffsetY + position.y * cellTotalHeight + CELL_MARGIN,
    left: boardOffsetX + position.x * cellTotalWidth + CELL_MARGIN,
  };
}

export const AnimationOverlay: FC<AnimationOverlayProps> = ({
  animation,
  players,
  boardOffsetX = 0,
  boardOffsetY = 0,
}) => {
  // Calculate position for the animation (always called - hooks must be called unconditionally)
  const animPosition = useMemo(
    () => {
      if (!animation) {
        return { top: 0, left: 0 };
      }
      return calculateAnimationPosition(animation.position, boardOffsetX, boardOffsetY);
    },
    [animation, boardOffsetX, boardOffsetY]
  );

  // Build card object for the Card component (always called)
  const { cardData, playerColor } = useMemo(
    () => {
      if (!animation) {
        return { cardData: { img: '', video: undefined, background: '', info: '' }, playerColor: '' };
      }
      const color = getPlayerColor(players, animation.playerId);
      return {
        cardData: {
          img: getCardImageUrl(animation.card),
          video: getCardVideoUrl(animation.card),
          background: color,
          info: `${animation.card.value} of ${animation.card.suit}`,
        },
        playerColor: color,
      };
    },
    [animation, players]
  );

  // Don't render anything if no animation
  if (!animation) {
    return null;
  }

  const { card, scoringLevel, moveKey } = animation;

  return (
    <div
      key={moveKey}
      className="animation-overlay-container"
      css={{
        position: 'absolute',
        top: animPosition.top,
        left: animPosition.left,
        zIndex: 9999,
        pointerEvents: 'none',
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
      }}
    >
      {/* Card wrapper with fly-in animation */}
      <div
        className="game-latest-card-wrapper"
        css={{
          position: 'relative',
          width: '100%',
          height: '100%',
          animationName: 'cardFlyIn',
          animationDuration: '800ms',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
        }}
      >
        {/* The actual card component */}
        <Card
          card={cardData}
          animated={!!card.videoUrl && card.isNft}
          isStatic={true}
          noShadow={false}
          css={{
            outline: `6px solid ${playerColor}`,
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        />

        {/* Score popup overlay */}
        <div
          className="game-latest-card__score"
          css={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: 100,
            fontFamily: 'Aldrich, sans-serif',
            fontWeight: 'bold',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          +{scoringLevel}
        </div>
      </div>
    </div>
  );
};

export default AnimationOverlay;
