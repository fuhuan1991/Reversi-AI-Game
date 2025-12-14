import { SquareState, Board } from './types';

/**
 * Validates that a board has the correct structure and valid square states
 * @param board - The board to validate
 * @returns true if valid, false otherwise
 */
export function isBoardValid(board: Board): boolean {
    // Check if board exists and has squares property
    if (!board || !board.squares) {
        console.log("!board || !board.squares")
        return false;
    }

    // Check if board is 8x8
    if (board.squares.length !== 8) {
        return false;
    }

    // Check each row
    for (let row = 0; row < 8; row++) {
        if (!Array.isArray(board.squares[row]) || board.squares[row].length !== 8) {
            return false;
        }

        // Check each square in the row
        for (let col = 0; col < 8; col++) {
            const square = board.squares[row][col];
            if (!isSquare(square)) {
                console.log(square + 'on row: ' + row + ' col: ' + col);
                return false;
            }
        }
    }

    return true;
}

export function isMoveValid(row: number, col: number, currentPlayer: SquareState.W | SquareState.B, board: Board): boolean {
    // Check if position is within bounds
    if (row < 0 || row >= 8 || col < 0 || col >= 8) {
        return false;
    }

    // Check if square is empty
    if (board.squares[row][col] !== SquareState.E) {
        return false;
    }

    const opponent = currentPlayer === SquareState.B ? SquareState.W : SquareState.B;

    // Check all 8 directions for valid flips
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],  // Up-left, Up, Up-right
        [0, -1], [0, 1],   // Left, Right
        [1, -1], [1, 0], [1, 1]    // Down-left, Down, Down-right
    ];

    for (const [deltaRow, deltaCol] of directions) {
        let currentRow = row + deltaRow;
        let currentCol = col + deltaCol;
        let hasOpponentDisc = false;

        // Move in this direction while we find opponent discs
        while (
            currentRow >= 0 && currentRow < 8 &&
            currentCol >= 0 && currentCol < 8 &&
            board.squares[currentRow][currentCol] === opponent
        ) {
            hasOpponentDisc = true;
            currentRow += deltaRow;
            currentCol += deltaCol;
        }

        // If we found opponent discs and ended with our own disc, this direction is valid
        if (
            hasOpponentDisc &&
            currentRow >= 0 && currentRow < 8 &&
            currentCol >= 0 && currentCol < 8 &&
            board.squares[currentRow][currentCol] === currentPlayer
        ) {
            return true;
        }
    }

    return false;
}

export function isSquare(value: any): value is SquareState {
    return Object.values(SquareState).includes(value as SquareState);
}

/**
 * Gets all valid moves for a player on the current board
 * @param board - Current board state
 * @param player - Player to get valid moves for
 * @returns Array of valid move coordinates
 */
export function getValidMoves(board: Board, player: SquareState.B | SquareState.W): { row: number, col: number }[] {
    const validMoves: { row: number, col: number }[] = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isMoveValid(row, col, player, board)) {
                validMoves.push({ row, col });
            }
        }
    }

    return validMoves;
}

/**
 * Checks if a player has any valid moves available
 * @param board - Current board state
 * @param player - Player to check for valid moves
 * @returns true if player has valid moves, false otherwise
 */
export function hasValidMoves(board: Board, player: SquareState.B | SquareState.W): boolean {
    return getValidMoves(board, player).length > 0;
}