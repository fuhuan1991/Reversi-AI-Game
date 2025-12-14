import { Router } from 'express';
import { isSquare, isBoardValid, isMoveValid, getValidMoves } from '../validation';
import { SquareState, Board, MoveRequest, AiMoveRequest, MoveResponse, AiMoveResponse } from '../types';
import { AIService } from '../services/aiService';
import { visualizeBoard } from '../helper';

const router = Router();
const aiService = new AIService();

/**
 * Executes a move by placing the piece and flipping opponent pieces
 * @param row - Row position of the move
 * @param col - Column position of the move
 * @param player - Player making the move
 * @param board - Current board state
 * @returns New board state after executing the move
 */
function executeMove(row: number, col: number, player: SquareState.B | SquareState.W, board: Board): Board {
  // Create a deep copy of the board
  const newBoard: Board = {
    squares: board.squares.map(row => [...row])
  };

  // Place the new piece
  newBoard.squares[row][col] = player;

  const opponent = player === SquareState.B ? SquareState.W : SquareState.B;

  // Check all 8 directions for pieces to flip
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],  // Up-left, Up, Up-right
    [0, -1], [0, 1],   // Left, Right
    [1, -1], [1, 0], [1, 1]    // Down-left, Down, Down-right
  ];

  for (const [deltaRow, deltaCol] of directions) {
    const piecesToFlip: [number, number][] = [];
    let currentRow = row + deltaRow;
    let currentCol = col + deltaCol;

    // Collect opponent pieces in this direction
    while (
      currentRow >= 0 && currentRow < 8 &&
      currentCol >= 0 && currentCol < 8 &&
      newBoard.squares[currentRow][currentCol] === opponent
    ) {
      piecesToFlip.push([currentRow, currentCol]);
      currentRow += deltaRow;
      currentCol += deltaCol;
    }

    // If we found opponent pieces and ended with our own piece, flip them
    if (
      piecesToFlip.length > 0 &&
      currentRow >= 0 && currentRow < 8 &&
      currentCol >= 0 && currentCol < 8 &&
      newBoard.squares[currentRow][currentCol] === player
    ) {
      // Flip all opponent pieces in this direction
      for (const [flipRow, flipCol] of piecesToFlip) {
        newBoard.squares[flipRow][flipCol] = player;
      }
    }
  }

  return newBoard;
}

// Process human player move
router.post('/move', (req, res) => {
  let newBoard: Board;
  console.log('--------Operation: human move');

  try {
    // Parse the stringified JSON from request body
    let moveRequest: MoveRequest;

    if (typeof req.body === 'string') {
      // If body is a string, parse it as JSON
      moveRequest = JSON.parse(req.body);
    } else {
      // If body is already parsed (by express.json() middleware)
      moveRequest = req.body;
    }

    // Validate required fields
    if (
      typeof moveRequest.row !== 'number' ||
      typeof moveRequest.col !== 'number' ||
      !isSquare(moveRequest.player) ||
      !isBoardValid(moveRequest.board)) {
      return res.status(400).json({
        error: 'Invalid request format. Required fields: row, col, player, board'
      });
    }

    // Validate if the move is legal
    if (!isMoveValid(moveRequest.row, moveRequest.col, moveRequest.player, moveRequest.board)) {
      return res.status(400).json({
        error: 'Invalid move. The move is not legal according to Reversi rules.'
      });
    }

    visualizeBoard(moveRequest.board, '----old board----')
    console.log("it's " + moveRequest.player + "'s turn")

    // Execute the move and create new board status
    newBoard = executeMove(moveRequest.row, moveRequest.col, moveRequest.player, moveRequest.board);

    visualizeBoard(newBoard, '----new board----')

  } catch (error) {
    // Handle JSON parsing errors or other exceptions
    return res.status(400).json({
      error: 'Invalid JSON format or request structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  res.json({
    message: 'Move processed successfully',
    newBoard: newBoard
  } as MoveResponse);
});

// Get AI move
router.post('/ai-move', async (req, res) => {
  console.log('--------Operation: AI move');
  try {
    let aiMoveRequest: AiMoveRequest;

    if (typeof req.body === 'string') {
      // If body is a string, parse it as JSON
      aiMoveRequest = JSON.parse(req.body);
    } else {
      // If body is already parsed (by express.json() middleware)
      aiMoveRequest = req.body;
    }

    // Validate required fields
    if (!isSquare(aiMoveRequest.aiPlayer) || !isBoardValid(aiMoveRequest.board)) {
      return res.status(400).json({
        error: 'Invalid request format. Required fields: aiPlayer, board'
      });
    }

    // Check if AI has valid moves
    const validMoves = getValidMoves(aiMoveRequest.board, aiMoveRequest.aiPlayer);
    if (validMoves.length === 0) {
      return res.status(400).json({
        error: 'No valid moves available for AI player',
      });
    }

    // Get AI move from Bedrock
    const aiMove = await aiService.getAIMove(aiMoveRequest.board, aiMoveRequest.aiPlayer, validMoves);
    const isAiMoveValid = isMoveValid(aiMove.row, aiMove.col, aiMoveRequest.aiPlayer, aiMoveRequest.board)

    // Validate AI's suggested move
    if (!isAiMoveValid) {
      // Fallback to first valid move if AI suggests invalid move
      console.warn('AI suggested invalid move, using fallback');
      const fallbackMove = validMoves[0];
      aiMove.row = fallbackMove.row;
      aiMove.col = fallbackMove.col;
    }

    // Execute the AI move
    const newBoard = executeMove(aiMove.row, aiMove.col, aiMoveRequest.aiPlayer, aiMoveRequest.board);

    visualizeBoard(newBoard, '----new board----')

    res.json({
      message: 'AI move processed successfully',
      aiMove: {
        row: aiMove.row,
        col: aiMove.col,
        reason: isAiMoveValid ? aiMove.reason : null,
        player: aiMoveRequest.aiPlayer
      },
      newBoard: newBoard,
    } as AiMoveResponse);

  } catch (error) {
    console.error('AI move error:', error);
    res.status(500).json({
      error: 'Failed to process AI move',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as gameRouter };