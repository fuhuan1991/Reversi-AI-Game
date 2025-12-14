import { Board, SquareState } from './types';

/**
 * Visualizes a Reversi board using a single console.log
 * @param board - The board to visualize
 * @param title - Optional title to display above the board
 */
export function visualizeBoard(board: Board, title?: string): void {
    let output = '';

    if (title) {
        output += `\n${title}\n`;
    }

    output += '\n  1 2 3 4 5 6 7 8\n';

    for (let row = 0; row < 8; row++) {
        let rowString = `${row + 1} `;

        for (let col = 0; col < 8; col++) {
            const square = board.squares[row][col];
            let symbol: string;

            switch (square) {
                case SquareState.B:
                    symbol = 'B';
                    break;
                case SquareState.W:
                    symbol = 'W';
                    break;
                case SquareState.E:
                default:
                    symbol = '.';
                    break;
            }

            rowString += symbol + ' ';
        }

        output += rowString + '\n';
    }

    console.log(output);
}