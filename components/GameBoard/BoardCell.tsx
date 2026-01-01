/**
 * BoardCell Component
 *
 * Renders a single cell on the game board.
 * Can be: empty, a drop target placeholder, or contain a stack of cards.
 */

import { FC } from 'react';
import CardStack from './CardStack';
import CardEmpty from '../CardEmpty';
import { BoardCell as BoardCellType, NormalizedCard, GamePlayer, ZoneOutlineInfo } from '../../types/game';

// Cell dimensions
const CELL_WIDTH = 210;
const CELL_HEIGHT = 294;
const CELL_MARGIN = 15;

// Error X icon as base64 SVG
const ERROR_ICON_SVG = "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzIxMTZfMjU1MCkiPgo8cGF0aCBkPSJNMjUgMEMyMC4wNTU1IDAgMTUuMjIyIDEuNDY2MjIgMTEuMTEwOCA0LjIxMzI2QzYuOTk5NTMgNi45NjAyOSAzLjc5NTIxIDEwLjg2NDggMS45MDMwMiAxNS40MzI5QzAuMDEwODMyMiAyMC4wMDExIC0wLjQ4NDI1MSAyNS4wMjc3IDAuNDgwMzc5IDI5Ljg3NzNDMS40NDUwMSAzNC43MjY4IDMuODI2MDMgMzkuMTgxNCA3LjMyMjM0IDQyLjY3NzdDMTAuODE4NyA0Ni4xNzQgMTUuMjczMiA0OC41NTUgMjAuMTIyOCA0OS41MTk2QzI0Ljk3MjMgNTAuNDg0MyAyOS45OTg5IDQ5Ljk4OTIgMzQuNTY3MSA0OC4wOTdDMzkuMTM1MyA0Ni4yMDQ4IDQzLjAzOTcgNDMuMDAwNSA0NS43ODY3IDM4Ljg4OTNDNDguNTMzOCAzNC43NzggNTAgMjkuOTQ0NSA1MCAyNUM0OS45OTI4IDE4LjM3MTggNDcuMzU2NiAxMi4wMTcxIDQyLjY2OTggNy4zMzAyNUMzNy45ODI5IDIuNjQzMzkgMzEuNjI4MiAwLjAwNzE2ODkyIDI1IDBWMFpNMjUgNDUuODMzM0MyMC44Nzk2IDQ1LjgzMzMgMTYuODUxNyA0NC42MTE1IDEzLjQyNTYgNDIuMzIyM0M5Ljk5OTYxIDQwLjAzMzEgNy4zMjkzNSAzNi43Nzk0IDUuNzUyNTIgMzIuOTcyNkM0LjE3NTcgMjkuMTY1OCAzLjc2MzEzIDI0Ljk3NjkgNC41NjY5OCAyMC45MzU2QzUuMzcwODQgMTYuODk0MyA3LjM1NTAzIDEzLjE4MjIgMTAuMjY4NiAxMC4yNjg2QzEzLjE4MjIgNy4zNTUwMSAxNi44OTQ0IDUuMzcwODMgMjAuOTM1NiA0LjU2Njk3QzI0Ljk3NjkgMy43NjMxMSAyOS4xNjU4IDQuMTc1NjggMzIuOTcyNiA1Ljc1MjUxQzM2Ljc3OTQgNy4zMjkzNCA0MC4wMzMxIDkuOTk5NiA0Mi4zMjIzIDEzLjQyNTZDNDQuNjExNSAxNi44NTE2IDQ1LjgzMzMgMjAuODc5NiA0NS44MzMzIDI1QzQ1LjgyNzMgMzAuNTIzNSA0My42MzA0IDM1LjgxOSAzOS43MjQ3IDM5LjcyNDdDMzUuODE5IDQzLjYzMDQgMzAuNTIzNSA0NS44MjczIDI1IDQ1LjgzMzNaIiBmaWxsPSIjRkU1NjIxIi8+CjxwYXRoIGQ9Ik0zNC44MDYxIDE1LjE5MzhDMzQuNDE1NSAxNC44MDMyIDMzLjg4NTYgMTQuNTgzOCAzMy4zMzMyIDE0LjU4MzhDMzIuNzgwOCAxNC41ODM4IDMyLjI1MSAxNC44MDMyIDMxLjg2MDMgMTUuMTkzOEwyNC45OTk5IDIyLjA1NDJMMTguMTM5NSAxNS4xOTM4QzE3Ljk0NzMgMTQuOTk0OCAxNy43MTc0IDE0LjgzNjEgMTcuNDYzMiAxNC43MjY5QzE3LjIwOTEgMTQuNjE3NyAxNi45MzU3IDE0LjU2MDIgMTYuNjU5MSAxNC41NTc4QzE2LjM4MjQgMTQuNTU1NCAxNi4xMDgxIDE0LjYwODEgMTUuODUyMSAxNC43MTI5QzE1LjU5NiAxNC44MTc2IDE1LjM2MzQgMTQuOTcyMyAxNS4xNjc4IDE1LjE2NzlDMTQuOTcyMiAxNS4zNjM1IDE0LjgxNzUgMTUuNTk2MiAxNC43MTI4IDE1Ljg1MjJDMTQuNjA4IDE2LjEwODIgMTQuNTU1MyAxNi4zODI2IDE0LjU1NzcgMTYuNjU5MkMxNC41NjAxIDE2LjkzNTggMTQuNjE3NiAxNy4yMDkyIDE0LjcyNjggMTcuNDYzM0MxNC44MzU5IDE3LjcxNzUgMTQuOTk0NyAxNy45NDc0IDE1LjE5MzYgMTguMTM5NkwyMi4wNTQxIDI1TDE1LjE5MzYgMzEuODYwNEMxNC45OTQ3IDMyLjA1MjYgMTQuODM1OSAzMi4yODI1IDE0LjcyNjggMzIuNTM2N0MxNC42MTc2IDMyLjc5MDggMTQuNTYwMSAzMy4wNjQyIDE0LjU1NzcgMzMuMzQwOEMxNC41NTUzIDMzLjYxNzUgMTQuNjA4IDMzLjg5MTggMTQuNzEyOCAzNC4xNDc4QzE0LjgxNzUgMzQuNDAzOSAxNC45NzIyIDM0LjYzNjUgMTUuMTY3OCAzNC44MzIxQzE1LjM2MzQgMzUuMDI3NyAxNS41OTYgMzUuMTgyNCAxNS44NTIxIDM1LjI4NzFDMTYuMTA4MSAzNS4zOTE5IDE2LjM4MjQgMzUuNDQ0NiAxNi42NTkxIDM1LjQ0MjJDMTYuOTM1NyAzNS40Mzk4IDE3LjIwOTEgMzUuMzgyMyAxNy40NjMyIDM1LjI3MzFDMTcuNzE3NCAzNS4xNjM5IDE3Ljk0NzMgMzUuMDA1MiAxOC4xMzk1IDM0LjgwNjNMMjQuOTk5OSAyNy45NDU4TDMxLjg2MDMgMzQuODA2M0MzMi4yNTMyIDM1LjE4NTggMzIuNzc5NSAzNS4zOTU3IDMzLjMyNTcgMzUuMzkxQzMzLjg3MiAzNS4zODYyIDM0LjM5NDUgMzUuMTY3MSAzNC43ODA4IDM0Ljc4MDlDMzUuMTY3IDM0LjM5NDYgMzUuMzg2MSAzMy44NzIxIDM1LjM5MDkgMzMuMzI1OEMzNS4zOTU2IDMyLjc3OTYgMzUuMTg1NiAzMi4yNTMzIDM0LjgwNjEgMzEuODYwNEwyNy45NDU3IDI1TDM0LjgwNjEgMTguMTM5NkMzNS4xOTY3IDE3Ljc0ODkgMzUuNDE2MSAxNy4yMTkxIDM1LjQxNjEgMTYuNjY2N0MzNS40MTYxIDE2LjExNDIgMzUuMTk2NyAxNS41ODQ0IDM0LjgwNjEgMTUuMTkzOFoiIGZpbGw9IiNGRTU2MjEiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8yMTE2XzI1NTAiPgo8cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==)";

// Zone outline styling constants
const ZONE_BORDER_WIDTH = 3;
const ZONE_BORDER_RADIUS = 25;
const ZONE_OUTLINE_GAP = 6; // Gap between outline and cell edge (12px total between adjacent outlines)

interface BoardCellProps {
  cell: BoardCellType;
  rowIndex: number;
  columnIndex: number;
  players: GamePlayer[];
  isMyTurn: boolean;
  hasError: boolean;
  lastPlayedCard: NormalizedCard | null;
  lastPlayedPosition: { x: number; y: number } | null;
  selectedCard: unknown;
  onCellClick: (x: number, y: number) => void;
  zoneOutline: ZoneOutlineInfo | null;
}

const BoardCell: FC<BoardCellProps> = ({
  cell,
  rowIndex,
  columnIndex,
  players,
  isMyTurn,
  hasError,
  lastPlayedCard,
  lastPlayedPosition,
  selectedCard,
  onCellClick,
  zoneOutline,
}) => {
  const { x, y, cards, isEmpty, isDropTarget } = cell;
  const hasCards = cards.length > 0;

  // Handler for cell click
  const handleClick = () => {
    onCellClick(x, y);
  };

  // Cell wrapper styles (consistent for all cell types)
  const cellWrapperStyles = {
    margin: `${CELL_MARGIN}px`,
    borderRadius: 10,
    position: 'relative' as const,
    width: `${CELL_WIDTH}px`,
    height: `${CELL_HEIGHT}px`,
  };

  // Render zone outline as a single overlay div with proper rounded corners
  const renderZoneOutline = () => {
    if (!zoneOutline) {
      return null;
    }

    const { color, showTop, showBottom, showLeft, showRight } = zoneOutline;
    const { topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius } = zoneOutline;
    const { innerTopLeftRadius, innerTopRightRadius, innerBottomLeftRadius, innerBottomRightRadius } = zoneOutline;

    // Calculate offset for each side:
    // - If border is shown (edge of group), add gap for spacing between different groups
    // - If border is hidden (merged with adjacent cell), extend past margin to overlap with neighbor
    const topOffset = showTop ? CELL_MARGIN - ZONE_OUTLINE_GAP : CELL_MARGIN + ZONE_OUTLINE_GAP;
    const bottomOffset = showBottom ? CELL_MARGIN - ZONE_OUTLINE_GAP : CELL_MARGIN + ZONE_OUTLINE_GAP;
    const leftOffset = showLeft ? CELL_MARGIN - ZONE_OUTLINE_GAP : CELL_MARGIN + ZONE_OUTLINE_GAP;
    const rightOffset = showRight ? CELL_MARGIN - ZONE_OUTLINE_GAP : CELL_MARGIN + ZONE_OUTLINE_GAP;

    // Inner corner style - small rounded corner piece
    const innerCornerSize = 3;
    const innerCornerStyle = {
      position: 'absolute' as const,
      width: innerCornerSize,
      height: innerCornerSize,
      border: `${ZONE_BORDER_WIDTH}px solid ${color}`,
      background: 'transparent',
      zIndex: 1,
      pointerEvents: 'none' as const,
      animation: 'zoneOutlineAppear 400ms ease-out',
    };

    return (
      <>
        <div
          css={{
            position: 'absolute',
            // Extend into the gap between cells, with conditional spacing
            top: `-${topOffset}px`,
            bottom: `-${bottomOffset}px`,
            left: `-${leftOffset}px`,
            right: `-${rightOffset}px`,
            // Individual borders - only show where needed
            borderTop: showTop ? `${ZONE_BORDER_WIDTH}px solid ${color}` : 'none',
            borderBottom: showBottom ? `${ZONE_BORDER_WIDTH}px solid ${color}` : 'none',
            borderLeft: showLeft ? `${ZONE_BORDER_WIDTH}px solid ${color}` : 'none',
            borderRight: showRight ? `${ZONE_BORDER_WIDTH}px solid ${color}` : 'none',
            // Rounded corners only at actual group corners
            borderTopLeftRadius: topLeftRadius ? ZONE_BORDER_RADIUS : 0,
            borderTopRightRadius: topRightRadius ? ZONE_BORDER_RADIUS : 0,
            borderBottomLeftRadius: bottomLeftRadius ? ZONE_BORDER_RADIUS : 0,
            borderBottomRightRadius: bottomRightRadius ? ZONE_BORDER_RADIUS : 0,
            // Fade-in animation when outline appears
            animation: 'zoneOutlineAppear 400ms ease-out',
            '@keyframes zoneOutlineAppear': {
              '0%': {
                opacity: 0,
                transform: 'scale(1.02)',
              },
              '100%': {
                opacity: 1,
                transform: 'scale(1)',
              },
            },
            zIndex: 1, // Below cards and other elements
            pointerEvents: 'none',
          }}
        />
        {/* Inner corner pieces for L-shaped merges */}
        {innerTopLeftRadius && (
          <div
            style={{
              ...innerCornerStyle,
              top: `-${topOffset - 12}px`,
              left: `-${leftOffset - 12}px`,
              borderTop: 'none',
              borderLeft: 'none',
              borderBottomRightRadius: innerCornerSize,
            }}
          />
        )}
        {innerTopRightRadius && (
          <div
            style={{
              ...innerCornerStyle,
              top: `-${topOffset - 12}px`,
              right: `-${rightOffset - 12}px`,
              borderTop: 'none',
              borderRight: 'none',
              borderBottomLeftRadius: innerCornerSize,
            }}
          />
        )}
        {innerBottomLeftRadius && (
          <div
            style={{
              ...innerCornerStyle,
              bottom: `-${bottomOffset - 12}px`,
              left: `-${leftOffset - 12}px`,
              borderBottom: 'none',
              borderLeft: 'none',
              borderTopRightRadius: innerCornerSize,
            }}
          />
        )}
        {innerBottomRightRadius && (
          <div
            style={{
              ...innerCornerStyle,
              bottom: `-${bottomOffset - 12}px`,
              right: `-${rightOffset - 12}px`,
              borderBottom: 'none',
              borderRight: 'none',
              borderTopLeftRadius: innerCornerSize,
            }}
          />
        )}
      </>
    );
  };

  // Determine what to render:
  // - hasCards: render card stack
  // - isDropTarget (no cards): render droppable CardEmpty with border
  // - isEmpty (adjacent to cards, no cards, not drop target): render faded placeholder
  // - none of above: render invisible placeholder to maintain grid structure
  const showDropTarget = !hasCards && isDropTarget;
  const showFadedPlaceholder = !hasCards && isEmpty && !isDropTarget;
  const showInvisiblePlaceholder = !hasCards && !isEmpty && !isDropTarget;

  return (
    <div css={cellWrapperStyles}>
      {/* Zone outline - single overlay with proper rounded corners */}
      {renderZoneOutline()}

      {/* Invisible placeholder for cells outside the active area */}
      {showInvisiblePlaceholder && (
        <div style={{ width: '100%', height: '100%' }} />
      )}

      {/* Faded placeholder for adjacent cells that aren't drop targets */}
      {showFadedPlaceholder && (
        <CardEmpty
          key={`placeholder-${columnIndex}-${rowIndex}`}
          isPlaceholder={true}
          id={`${rowIndex}-${columnIndex}`}
          css={{
            pointerEvents: isMyTurn ? 'unset' : 'none',
          }}
        />
      )}

      {/* Drop target cell (can place cards here) */}
      {showDropTarget && (
        <CardEmpty
          selectedCard={selectedCard}
          key={`drop-${columnIndex}-${rowIndex}`}
          containerStyles={{
            '&::before': {
              transition: 'all 300ms',
              position: 'absolute',
              content: `' '`,
              zIndex: 99999,
              borderRadius: 15,
              backgroundImage: hasError ? ERROR_ICON_SVG : 'none',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
          }}
          css={{
            borderRadius: 10,
            position: 'relative',
          }}
          style={{
            pointerEvents: isMyTurn ? 'unset' : 'none',
          }}
          onClick={handleClick}
          id={`${rowIndex}-${columnIndex}`}
        />
      )}

      {/* Card stack */}
      {hasCards && (
        <CardStack
          cards={cards}
          players={players}
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          isMyTurn={isMyTurn}
          hasError={hasError}
          lastPlayedCard={lastPlayedCard}
          lastPlayedPosition={lastPlayedPosition}
          selectedCard={selectedCard}
          onCellClick={handleClick}
        />
      )}
    </div>
  );
};

export default BoardCell;
