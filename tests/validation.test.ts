import { isBoardValid, isMoveValid } from '../src/validation';
import { SquareState, Board } from '../src/types';

describe('isBoardValid', () => {
  // Helper function to create a valid 8x8 board
  const createValidBoard = (): Board => ({
    squares: Array(8).fill(null).map(() => Array(8).fill(SquareState.E))
  });

  test('should return true for a valid empty board', () => {
    const board = createValidBoard();
    expect(isBoardValid(board)).toBe(true);
  });

  test('should return true for a valid board with pieces', () => {
    const board = createValidBoard();
    board.squares[3][3] = SquareState.W;
    board.squares[3][4] = SquareState.B;
    board.squares[4][3] = SquareState.B;
    board.squares[4][4] = SquareState.W;
    expect(isBoardValid(board)).toBe(true);
  });

  test('should return false for null board', () => {
    expect(isBoardValid(null as any)).toBe(false);
  });

  test('should return false for undefined board', () => {
    expect(isBoardValid(undefined as any)).toBe(false);
  });

  test('should return false for board without squares property', () => {
    const board = {} as Board;
    expect(isBoardValid(board)).toBe(false);
  });

  test('should return false for board with wrong number of rows', () => {
    const board = {
      squares: Array(7).fill(null).map(() => Array(8).fill(SquareState.E))
    };
    expect(isBoardValid(board)).toBe(false);
  });

  test('should return false for board with wrong number of columns', () => {
    const board = {
      squares: Array(8).fill(null).map(() => Array(7).fill(SquareState.E))
    };
    expect(isBoardValid(board)).toBe(false);
  });

  test('should return false for board with non-array row', () => {
    const board = createValidBoard();
    board.squares[0] = null as any;
    expect(isBoardValid(board)).toBe(false);
  });

  test('should return false for board with invalid square state', () => {
    const board = createValidBoard();
    board.squares[0][0] = 'X' as any;
    expect(isBoardValid(board)).toBe(false);
  });

  test('should return false for board with missing square values', () => {
    const board = createValidBoard();
    board.squares[0][0] = undefined as any;
    expect(isBoardValid(board)).toBe(false);
  });

  test('should handle board with all different valid square states', () => {
    const board = createValidBoard();
    board.squares[0][0] = SquareState.E;
    board.squares[0][1] = SquareState.B;
    board.squares[0][2] = SquareState.W;
    expect(isBoardValid(board)).toBe(true);
  });
});

describe('isMoveValid', () => {
  // Helper function to create a standard Reversi starting position
  const createStartingBoard = (): Board => {
    const board: Board = {
      squares: Array(8).fill(null).map(() => Array(8).fill(SquareState.E))
    };
    // Standard starting position
    board.squares[3][3] = SquareState.W;
    board.squares[3][4] = SquareState.B;
    board.squares[4][3] = SquareState.B;
    board.squares[4][4] = SquareState.W;
    return board;
  };

  // Helper function to create an empty board
  const createEmptyBoard = (): Board => ({
    squares: Array(8).fill(null).map(() => Array(8).fill(SquareState.E))
  });

  describe('boundary checks', () => {
    test('should return false for negative row', () => {
      const board = createStartingBoard();
      expect(isMoveValid(-1, 4, SquareState.B, board)).toBe(false);
    });

    test('should return false for negative column', () => {
      const board = createStartingBoard();
      expect(isMoveValid(4, -1, SquareState.B, board)).toBe(false);
    });

    test('should return false for row >= 8', () => {
      const board = createStartingBoard();
      expect(isMoveValid(8, 4, SquareState.B, board)).toBe(false);
    });

    test('should return false for column >= 8', () => {
      const board = createStartingBoard();
      expect(isMoveValid(4, 8, SquareState.B, board)).toBe(false);
    });
  });

  describe('occupied square checks', () => {
    test('should return false when trying to place on occupied square (Black)', () => {
      const board = createStartingBoard();
      expect(isMoveValid(3, 4, SquareState.B, board)).toBe(false);
    });

    test('should return false when trying to place on occupied square (White)', () => {
      const board = createStartingBoard();
      expect(isMoveValid(3, 3, SquareState.W, board)).toBe(false);
    });
  });

  describe('valid moves from starting position', () => {
    test('should return true for valid Black moves from starting position', () => {
      const board = createStartingBoard();
      // Valid moves for Black in starting position
      expect(isMoveValid(2, 3, SquareState.B, board)).toBe(true); // Above W at (3,3)
      expect(isMoveValid(3, 2, SquareState.B, board)).toBe(true); // Left of W at (3,3)
      expect(isMoveValid(4, 5, SquareState.B, board)).toBe(true); // Right of W at (4,4)
      expect(isMoveValid(5, 4, SquareState.B, board)).toBe(true); // Below W at (4,4)
    });

    test('should return true for valid White moves from starting position', () => {
      const board = createStartingBoard();
      // Valid moves for White in starting position
      expect(isMoveValid(2, 4, SquareState.W, board)).toBe(true); // Above B at (3,4)
      expect(isMoveValid(3, 5, SquareState.W, board)).toBe(true); // Right of B at (3,4)
      expect(isMoveValid(4, 2, SquareState.W, board)).toBe(true); // Left of B at (4,3)
      expect(isMoveValid(5, 3, SquareState.W, board)).toBe(true); // Below B at (4,3)
    });
  });

  describe('invalid moves from starting position', () => {
    test('should return false for moves that do not flip any pieces', () => {
      const board = createStartingBoard();
      // These moves don't flip any pieces
      expect(isMoveValid(0, 0, SquareState.B, board)).toBe(false);
      expect(isMoveValid(7, 7, SquareState.B, board)).toBe(false);
      expect(isMoveValid(1, 1, SquareState.W, board)).toBe(false);
      expect(isMoveValid(6, 6, SquareState.W, board)).toBe(false);
    });
  });

  describe('diagonal moves', () => {
    test('should validate diagonal flips correctly', () => {
      const board = createEmptyBoard();
      // Set up a diagonal scenario: W-B-E
      board.squares[2][2] = SquareState.W;
      board.squares[3][3] = SquareState.B;
      // White can capture diagonally
      expect(isMoveValid(4, 4, SquareState.W, board)).toBe(true);
    });

    test('should handle multiple diagonal directions', () => {
      const board = createEmptyBoard();
      // Set up cross pattern with Black in center
      board.squares[3][3] = SquareState.B;
      board.squares[2][2] = SquareState.W; // Up-left
      board.squares[2][4] = SquareState.W; // Up-right
      board.squares[4][2] = SquareState.W; // Down-left
      board.squares[4][4] = SquareState.W; // Down-right

      // Black can capture in multiple diagonal directions
      expect(isMoveValid(1, 1, SquareState.B, board)).toBe(true); // Captures W at (2,2)
      expect(isMoveValid(1, 5, SquareState.B, board)).toBe(true); // Captures W at (2,4)
      expect(isMoveValid(5, 1, SquareState.B, board)).toBe(true); // Captures W at (4,2)
      expect(isMoveValid(5, 5, SquareState.B, board)).toBe(true); // Captures W at (4,4)
    });
  });

  describe('horizontal and vertical moves', () => {
    test('should validate horizontal flips', () => {
      const board = createEmptyBoard();
      // Set up horizontal line: W-B-E
      board.squares[3][1] = SquareState.W;
      board.squares[3][2] = SquareState.B;
      // White can capture horizontally
      expect(isMoveValid(3, 3, SquareState.W, board)).toBe(true);
    });

    test('should validate vertical flips', () => {
      const board = createEmptyBoard();
      // Set up vertical line: W-B-E
      board.squares[1][3] = SquareState.W;
      board.squares[2][3] = SquareState.B;
      // White can capture vertically
      expect(isMoveValid(3, 3, SquareState.W, board)).toBe(true);
    });
  });

  describe('multiple piece flips', () => {
    test('should validate moves that flip multiple pieces in one direction', () => {
      const board = createEmptyBoard();
      // Set up: W-B-B-E
      board.squares[3][0] = SquareState.W;
      board.squares[3][1] = SquareState.B;
      board.squares[3][2] = SquareState.B;
      // White can capture multiple Black pieces
      expect(isMoveValid(3, 3, SquareState.W, board)).toBe(true);
    });

    test('should require at least one opponent piece to flip', () => {
      const board = createEmptyBoard();
      // Set up: W-W-E (no opponent pieces between)
      board.squares[3][0] = SquareState.W;
      board.squares[3][1] = SquareState.W;
      // Cannot place here as no opponent pieces to flip
      expect(isMoveValid(3, 2, SquareState.W, board)).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle moves at board edges', () => {
      const board = createEmptyBoard();
      // Set up edge scenario
      board.squares[0][0] = SquareState.W;
      board.squares[0][1] = SquareState.B;
      // White can capture at edge
      expect(isMoveValid(0, 2, SquareState.W, board)).toBe(true);
    });

    test('should handle corner moves', () => {
      const board = createEmptyBoard();
      // Set up corner scenario
      board.squares[6][6] = SquareState.W;
      board.squares[7][7] = SquareState.B;
      // Cannot place beyond board
      expect(isMoveValid(8, 8, SquareState.W, board)).toBe(false);
    });

    test('should return false when no valid flips in any direction', () => {
      const board = createEmptyBoard();
      // Isolated piece with no valid captures
      board.squares[4][4] = SquareState.B;
      expect(isMoveValid(2, 2, SquareState.W, board)).toBe(false);
    });
  });

  describe('complex board scenarios', () => {
    test('should handle mixed piece arrangements', () => {
      const board = createEmptyBoard();
      // Create a more complex scenario
      board.squares[3][3] = SquareState.W;
      board.squares[3][4] = SquareState.B;
      board.squares[3][5] = SquareState.B;
      board.squares[4][3] = SquareState.B;
      board.squares[4][4] = SquareState.W;
      board.squares[5][3] = SquareState.W;

      // Test various moves
      expect(isMoveValid(3, 6, SquareState.W, board)).toBe(true); // Flips horizontal
      expect(isMoveValid(6, 3, SquareState.B, board)).toBe(true); // Flips vertical
      expect(isMoveValid(2, 2, SquareState.B, board)).toBe(false); // No valid flips
    });
  });
});