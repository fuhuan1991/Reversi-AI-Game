export type SquareState = 'B' | 'W' | '.';
export type Board = SquareState[][];

export interface MoveRequest {
  board: Board;
  player: 'B' | 'W';
  row: number;
  col: number;
}

export interface MoveResponse {
  board: Board;
  valid: boolean;
  message?: string;
}

export interface AIMoveRequest {
  board: Board;
  player: 'B' | 'W';
}

export interface AIMoveResponse {
  board: Board;
  move: { row: number; col: number };
  message?: string;
}
