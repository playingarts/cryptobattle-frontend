const generateBoard = (columns, rows) => {
  const a = [...Array(rows)].map((_, i) => i);
  const b = [...Array(columns)].map(() => null);
  a.forEach((_, index) => {
    a[index] = [...b]
  });
  return a;
};

const board = generateBoard(9, 7);

const findCenter = (board) => {
  const index = Math.floor(board.length / 2);
  const indexColumns = Math.floor(board[0].length / 2);

  return [index, indexColumns];
};

const center = findCenter(board)
console.log(center)

// board[center[0]-1] = [...Array(board[0].length).fill(null)]
board[center[0]][center[1]] = "Card3h"
board[center[0] + 1][center[1]] = "empty"
board[center[0] - 1][center[1]] = "empty"
board[center[0]][center[1]+1] = "empty"
board[center[0]][center[1]-1] = "empty"


console.log(board);




console.log(board[center[0]][center[1]])