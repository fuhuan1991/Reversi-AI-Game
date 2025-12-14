export enum SquareState {
  E = '.',  // Empty
  B = 'B',  // Black
  W = 'W'   // White
}

export interface Board {
  squares: SquareState[][];  // 8x8 grid representing the Reversi board
}

export interface MoveRequest {
  row: number;        // Row position (0-7)
  col: number;        // Column position (0-7)
  player: SquareState.B | SquareState.W;  // Player making the move (Black or White)
  board: Board;       // Current board state
}

export interface AiMoveRequest {
  aiPlayer: SquareState.B | SquareState.W;  // Which player the AI is playing as
  board: Board;       // Current board state
}

export interface MoveResponse {
  message: string;    // Success message
  newBoard: Board;    // Updated board state after the move
}

export interface AiMoveResponse {
  message: string;    // Success message
  aiMove: {
    row: number;        // Row position (0-7)
    col: number;        // Column position (0-7)
    player: SquareState.B | SquareState.W;  // Player making the move (Black or White)
    reason: string;     // Explanation of this move
  }
  newBoard: Board;    // Updated board state after the move
}

