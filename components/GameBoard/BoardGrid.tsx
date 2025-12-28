/**
 * BoardGrid Component
 *
 * Renders the entire game board grid.
 * Maps the board state to a grid of BoardCell components.
 */

import { FC } from 'react';
import BoardCell from './BoardCell';
import { GameBoard, GamePlayer } from '../../types/game';

interface BoardGridProps {
  board: GameBoard;
  players: GamePlayer[];
  isMyTurn: boolean;
  selectedCard: unknown;
  errorPosition: { x: number; y: number } | null;
  onCellClick: (x: number, y: number) => void;
}

const BoardGrid: FC<BoardGridProps> = ({
  board,
  players,
  isMyTurn,
  selectedCard,
  errorPosition,
  onCellClick,
}) => {
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

            return (
              <BoardCell
                key={`${rowIndex}-${columnIndex}`}
                cell={cell}
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                players={players}
                isMyTurn={isMyTurn}
                hasError={hasError}
                selectedCard={selectedCard}
                onCellClick={onCellClick}
              />
            );
          })}
        </div>
      ))}
    </>
  );
};

export default BoardGrid;
