/**
 * BoardGrid Component
 *
 * Renders the entire game board grid.
 * Maps the board state to a grid of BoardCell components.
 * Calculates zone outlines that merge adjacent columns with the same top-card player.
 */

import { FC, useMemo } from 'react';
import BoardCell from './BoardCell';
import { GameBoard, NormalizedCard, GamePlayer, BoardCell as BoardCellType, ZoneOutlineInfo } from '../../types/game';

interface BoardGridProps {
  board: GameBoard;
  players: GamePlayer[];
  isMyTurn: boolean;
  lastPlayedCard: NormalizedCard | null;
  lastPlayedPosition: { x: number; y: number } | null;
  selectedCard: unknown;
  errorPosition: { x: number; y: number } | null;
  onCellClick: (x: number, y: number) => void;
}

/**
 * Get the top card's userId from a cell
 */
function getTopCardUserId(cell: BoardCellType): string | null {
  if (cell.cards.length === 0) return null;
  return cell.cards[cell.cards.length - 1].userId || null;
}

/**
 * Get player color by userId
 */
function getPlayerColor(players: GamePlayer[], userId: string | null): string {
  if (!userId || userId === 'system') return '#2D3038';
  const player = players.find((p) => p.userId === userId);
  return player?.color || 'gray';
}

/**
 * Calculate zone outline info for each cell in a row
 * Merges adjacent cells that have the same top-card player
 */
function calculateRowOutlines(
  row: BoardCellType[],
  rowIndex: number,
  board: GameBoard,
  players: GamePlayer[]
): (ZoneOutlineInfo | null)[] {
  return row.map((cell, colIndex) => {
    const topUserId = getTopCardUserId(cell);

    // No cards = no outline
    if (!topUserId) return null;

    // System/default cards = no outline
    if (topUserId === 'system') return null;

    const color = getPlayerColor(players, topUserId);

    // Check adjacent cells (same row) for same player
    const leftCell = colIndex > 0 ? row[colIndex - 1] : null;
    const rightCell = colIndex < row.length - 1 ? row[colIndex + 1] : null;

    const leftUserId = leftCell ? getTopCardUserId(leftCell) : null;
    const rightUserId = rightCell ? getTopCardUserId(rightCell) : null;

    // Check cells above and below (different rows)
    const aboveRow = rowIndex > 0 ? board[rowIndex - 1] : null;
    const belowRow = rowIndex < board.length - 1 ? board[rowIndex + 1] : null;

    const aboveCell = aboveRow ? aboveRow[colIndex] : null;
    const belowCell = belowRow ? belowRow[colIndex] : null;

    const aboveUserId = aboveCell ? getTopCardUserId(aboveCell) : null;
    const belowUserId = belowCell ? getTopCardUserId(belowCell) : null;

    // Check diagonal cells for inner corner detection
    const topLeftCell = aboveRow && colIndex > 0 ? aboveRow[colIndex - 1] : null;
    const topRightCell = aboveRow && colIndex < row.length - 1 ? aboveRow[colIndex + 1] : null;
    const bottomLeftCell = belowRow && colIndex > 0 ? belowRow[colIndex - 1] : null;
    const bottomRightCell = belowRow && colIndex < row.length - 1 ? belowRow[colIndex + 1] : null;

    const topLeftDiagUserId = topLeftCell ? getTopCardUserId(topLeftCell) : null;
    const topRightDiagUserId = topRightCell ? getTopCardUserId(topRightCell) : null;
    const bottomLeftDiagUserId = bottomLeftCell ? getTopCardUserId(bottomLeftCell) : null;
    const bottomRightDiagUserId = bottomRightCell ? getTopCardUserId(bottomRightCell) : null;

    // Determine which borders to show (don't show border if adjacent cell has same player)
    const showLeft = leftUserId !== topUserId;
    const showRight = rightUserId !== topUserId;
    const showTop = aboveUserId !== topUserId;
    const showBottom = belowUserId !== topUserId;

    // Determine outer corner radii (only round if it's an actual corner of the group)
    const topLeftRadius = showTop && showLeft;
    const topRightRadius = showTop && showRight;
    const bottomLeftRadius = showBottom && showLeft;
    const bottomRightRadius = showBottom && showRight;

    // Determine inner corner radii (L-shaped merges)
    // Inner corner exists when: both adjacent sides are merged (no border),
    // but the diagonal cell is NOT part of the same group
    const innerTopLeftRadius = !showTop && !showLeft && topLeftDiagUserId !== topUserId;
    const innerTopRightRadius = !showTop && !showRight && topRightDiagUserId !== topUserId;
    const innerBottomLeftRadius = !showBottom && !showLeft && bottomLeftDiagUserId !== topUserId;
    const innerBottomRightRadius = !showBottom && !showRight && bottomRightDiagUserId !== topUserId;

    return {
      color,
      showTop,
      showBottom,
      showLeft,
      showRight,
      topLeftRadius,
      topRightRadius,
      bottomLeftRadius,
      bottomRightRadius,
      innerTopLeftRadius,
      innerTopRightRadius,
      innerBottomLeftRadius,
      innerBottomRightRadius,
    };
  });
}

const BoardGrid: FC<BoardGridProps> = ({
  board,
  players,
  isMyTurn,
  lastPlayedCard,
  lastPlayedPosition,
  selectedCard,
  errorPosition,
  onCellClick,
}) => {
  // Calculate zone outlines for all cells
  const zoneOutlines = useMemo(() => {
    return board.map((row, rowIndex) =>
      calculateRowOutlines(row, rowIndex, board, players)
    );
  }, [board, players]);

  if (board.length === 0) {
    return null;
  }

  return (
    <>
      {board.map((row, rowIndex) => (
        <div
          key={rowIndex}
          css={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {row.map((cell, columnIndex) => {
            const hasError = errorPosition?.x === cell.x && errorPosition?.y === cell.y;
            const zoneOutline = zoneOutlines[rowIndex]?.[columnIndex] || null;

            return (
              <BoardCell
                key={`${rowIndex}-${columnIndex}`}
                cell={cell}
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                players={players}
                isMyTurn={isMyTurn}
                hasError={hasError}
                lastPlayedCard={lastPlayedCard}
                lastPlayedPosition={lastPlayedPosition}
                selectedCard={selectedCard}
                onCellClick={onCellClick}
                zoneOutline={zoneOutline}
              />
            );
          })}
        </div>
      ))}
    </>
  );
};

export default BoardGrid;
