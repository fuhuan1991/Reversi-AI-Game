import { Board } from './types';

export function getValidPositions(currentPlayer: 'B' | 'W', board: Board): Set<string> {
  const validPositions = new Set<string>();
  const opponent = currentPlayer === 'B' ? 'W' : 'B';
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] !== '.') continue;

      for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        let hasOpponent = false;

        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          if (board[r][c] === '.') break;
          if (board[r][c] === opponent) {
            hasOpponent = true;
            r += dr;
            c += dc;
          } else if (board[r][c] === currentPlayer) {
            if (hasOpponent) {
              validPositions.add(`${row},${col}`);
            }
            break;
          }
        }
      }
    }
  }

  return validPositions;
}

export function getCounts(board: Board): [number, number] {
  let _blackCount = 0;
  let _whiteCount = 0;
  board.forEach((row: string[]) => {
    row.forEach((cell: string) => {
      if (cell === 'B') _blackCount++;
      if (cell === 'W') _whiteCount++;
    });
  });
  return [_blackCount, _whiteCount];
}
