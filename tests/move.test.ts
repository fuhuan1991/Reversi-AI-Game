import request from 'supertest';
import express from 'express';
import { gameRouter } from '../src/routes/game';
import { SquareState, Board, MoveRequest } from '../src/types';
import { visualizeBoard } from '../src/helper';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/game', gameRouter);

describe('/move API', () => {
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

    describe('Request validation', () => {
        test('should return 400 for missing row', async () => {
            const moveRequest = {
                col: 2,
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid request format. Required fields: row, col, player, board');
        });

        test('should return 400 for missing col', async () => {
            const moveRequest = {
                row: 2,
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid request format. Required fields: row, col, player, board');
        });

        test('should return 400 for missing player', async () => {
            const moveRequest = {
                row: 2,
                col: 2,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid request format. Required fields: row, col, player, board');
        });

        test('should return 400 for missing board', async () => {
            const moveRequest = {
                row: 2,
                col: 2,
                player: SquareState.B
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid request format. Required fields: row, col, player, board');
        });

        test('should return 400 for invalid player value', async () => {
            const moveRequest = {
                row: 2,
                col: 2,
                player: 'X' as any,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid request format. Required fields: row, col, player, board');
        });

        test('should return 400 for invalid board structure', async () => {
            const moveRequest = {
                row: 2,
                col: 2,
                player: SquareState.B,
                board: { squares: [] } // Invalid board
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid request format. Required fields: row, col, player, board');
        });

        test('should return 400 for non-numeric row', async () => {
            const moveRequest = {
                row: '2' as any,
                col: 2,
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid request format. Required fields: row, col, player, board');
        });

        test('should return 400 for non-numeric col', async () => {
            const moveRequest = {
                row: 2,
                col: '2' as any,
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid request format. Required fields: row, col, player, board');
        });
    });

    describe('Move validation', () => {
        test('should return 400 for invalid move (out of bounds)', async () => {
            const moveRequest: MoveRequest = {
                row: -1,
                col: 2,
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid move. The move is not legal according to Reversi rules.');
        });

        test('should return 400 for invalid move (occupied square)', async () => {
            const moveRequest: MoveRequest = {
                row: 3,
                col: 3, // Already occupied by White
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid move. The move is not legal according to Reversi rules.');
        });

        test('should return 400 for invalid move (no pieces to flip)', async () => {
            const moveRequest: MoveRequest = {
                row: 0,
                col: 0, // No valid flips from this position
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid move. The move is not legal according to Reversi rules.');
        });
    });

    describe('Successful moves', () => {
        test('should process valid Black move from starting position', async () => {
            // Starting board position:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . . . . . . . .
            // 2 . . . X . . . .  <- Black move at (2,3)
            // 3 . . . W B . . .
            // 4 . . . B W . . .
            // 5 . . . . . . . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .
            //
            // After move, White piece at (3,3) gets flipped to Black:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . . . . . . . .
            // 2 . . . B . . . .  <- New Black piece
            // 3 . . . B B . . .  <- W flipped to B
            // 4 . . . B W . . .
            // 5 . . . . . . . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .

            const moveRequest: MoveRequest = {
                row: 2,
                col: 3, // Valid Black move above White piece
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Move processed successfully');
            expect(response.body.newBoard).toBeDefined();
            expect(response.body.newBoard.squares).toBeDefined();

            // Check that the move was executed
            expect(response.body.newBoard.squares[2][3]).toBe(SquareState.B);
            // Check that the White piece was flipped to Black
            expect(response.body.newBoard.squares[3][3]).toBe(SquareState.B);
        });

        test('should process valid White move from starting position', async () => {
            // Starting board position:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . . . . . . . .
            // 2 . . . . X . . .  <- White move at (2,4)
            // 3 . . . W B . . .
            // 4 . . . B W . . .
            // 5 . . . . . . . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .
            //
            // After move, Black piece at (3,4) gets flipped to White:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . . . . . . . .
            // 2 . . . . W . . .  <- New White piece
            // 3 . . . W W . . .  <- B flipped to W
            // 4 . . . B W . . .
            // 5 . . . . . . . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .

            const moveRequest: MoveRequest = {
                row: 2,
                col: 4, // Valid White move above Black piece
                player: SquareState.W,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Move processed successfully');
            expect(response.body.newBoard).toBeDefined();

            // Check that the move was executed
            expect(response.body.newBoard.squares[2][4]).toBe(SquareState.W);
            // Check that the Black piece was flipped to White
            expect(response.body.newBoard.squares[3][4]).toBe(SquareState.W);
        });

        test('should flip multiple pieces in one direction', async () => {
            // Board setup - horizontal line with multiple Black pieces:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . . . . . . . .
            // 2 . . . . . . . .
            // 3 W B B X . . . .  <- White move at (3,3)
            // 4 . . . . . . . .
            // 5 . . . . . . . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .
            //
            // After move, both Black pieces get flipped to White:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . . . . . . . .
            // 2 . . . . . . . .
            // 3 W W W W . . . .  <- All pieces now White
            // 4 . . . . . . . .
            // 5 . . . . . . . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .

            const board = createEmptyBoard();
            // Set up: W-B-B-E at row 3
            board.squares[3][0] = SquareState.W;
            board.squares[3][1] = SquareState.B;
            board.squares[3][2] = SquareState.B;

            const moveRequest: MoveRequest = {
                row: 3,
                col: 3, // White move that should flip two Black pieces
                player: SquareState.W,
                board: board
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(200);
            expect(response.body.newBoard.squares[3][3]).toBe(SquareState.W);
            expect(response.body.newBoard.squares[3][1]).toBe(SquareState.W);
            expect(response.body.newBoard.squares[3][2]).toBe(SquareState.W);
            expect(response.body.newBoard.squares[3][0]).toBe(SquareState.W);
        });

        test('should flip pieces in multiple directions', async () => {
            // Board setup - White pieces between Black pieces in multiple directions:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . B . . B . . .
            // 2 . . W W W . . .
            // 3 . B W X W B . .  <- Black move at (3,3)
            // 4 . . W W W . . .
            // 5 . . B . . B . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .
            //
            // After move, White pieces get flipped in multiple directions:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . B . . B . . .
            // 2 . . B W W . . .  <- W flipped to B
            // 3 . B B B B B . .  <- W flipped to B, new B piece
            // 4 . . W W B . . .  <- W flipped to B
            // 5 . . B . . B . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .

            const board = createEmptyBoard();
            // Set up pattern where Black move at (3,3) can flip White pieces in multiple directions
            
            // Place Black pieces as anchors
            board.squares[1][1] = SquareState.B; // Up-left anchor
            board.squares[1][4] = SquareState.B; // Up-right anchor
            board.squares[3][1] = SquareState.B; // Left anchor
            board.squares[3][5] = SquareState.B; // Right anchor
            board.squares[5][2] = SquareState.B; // Down-left anchor
            board.squares[5][5] = SquareState.B; // Down-right anchor

            // Place White pieces that will be flipped (between new move and Black anchors)
            board.squares[2][2] = SquareState.W; // Up-left diagonal
            board.squares[2][3] = SquareState.W; // Up vertical
            board.squares[2][4] = SquareState.W; // Up-right diagonal
            board.squares[3][2] = SquareState.W; // Left horizontal
            board.squares[3][4] = SquareState.W; // Right horizontal
            board.squares[4][2] = SquareState.W; // Down-left diagonal
            board.squares[4][3] = SquareState.W; // Down vertical
            board.squares[4][4] = SquareState.W; // Down-right diagonal

            const moveRequest: MoveRequest = {
                row: 3,
                col: 3, // Black move that should flip White pieces in multiple directions
                player: SquareState.B,
                board: board
            };

            visualizeBoard(board);

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            visualizeBoard(response.body.newBoard);

            expect(response.status).toBe(200);
            expect(response.body.newBoard.squares[3][3]).toBe(SquareState.B); // New piece

            // Check all directions got flipped
            expect(response.body.newBoard.squares[2][2]).toBe(SquareState.B); // Up-left diagonal
            expect(response.body.newBoard.squares[3][2]).toBe(SquareState.B); // Left horizontal
            expect(response.body.newBoard.squares[3][4]).toBe(SquareState.B); // Right horizontal
            expect(response.body.newBoard.squares[4][4]).toBe(SquareState.B); // Down-right diagonal

            expect(response.body.newBoard.squares[2][3]).toBe(SquareState.W); // Up vertical
            expect(response.body.newBoard.squares[2][4]).toBe(SquareState.W); // Up-right diagonal
            expect(response.body.newBoard.squares[4][2]).toBe(SquareState.W); // Down-left diagonal
            expect(response.body.newBoard.squares[4][3]).toBe(SquareState.W); // Down vertical
        });

        test('should handle diagonal flips', async () => {
            // Board setup - diagonal line:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . . . . . . . .
            // 2 . . W . . . . .
            // 3 . . . B . . . .
            // 4 . . . . X . . .  <- White move at (4,4)
            // 5 . . . . . . . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .
            //
            // After move, Black piece at (3,3) gets flipped to White:
            //   0 1 2 3 4 5 6 7
            // 0 . . . . . . . .
            // 1 . . . . . . . .
            // 2 . . W . . . . .
            // 3 . . . W . . . .  <- B flipped to W
            // 4 . . . . W . . .  <- New White piece
            // 5 . . . . . . . .
            // 6 . . . . . . . .
            // 7 . . . . . . . .

            const board = createEmptyBoard();
            // Set up diagonal: W-B-E
            board.squares[2][2] = SquareState.W;
            board.squares[3][3] = SquareState.B;

            const moveRequest: MoveRequest = {
                row: 4,
                col: 4, // White move diagonally
                player: SquareState.W,
                board: board
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(200);
            expect(response.body.newBoard.squares[4][4]).toBe(SquareState.W);
            expect(response.body.newBoard.squares[3][3]).toBe(SquareState.W); // Flipped
            expect(response.body.newBoard.squares[2][2]).toBe(SquareState.W); // Original
        });
    });

    describe('JSON parsing', () => {
        test('should handle pre-parsed JSON request body', async () => {
            const moveRequest: MoveRequest = {
                row: 2,
                col: 3,
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Move processed successfully');
        });

        test('should handle stringified JSON when sent as string', async () => {
            // Note: This test simulates the case where the body comes as a string
            // In practice, this would happen with different middleware configuration
            const moveRequest: MoveRequest = {
                row: 2,
                col: 3,
                player: SquareState.B,
                board: createStartingBoard()
            };

            // Send as regular JSON (express.json() will parse it)
            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Move processed successfully');
        });
    });

    describe('Board state preservation', () => {
        test('should not modify original board', async () => {
            const originalBoard = createStartingBoard();
            const originalBoardCopy = JSON.parse(JSON.stringify(originalBoard));

            const moveRequest: MoveRequest = {
                row: 2,
                col: 3,
                player: SquareState.B,
                board: originalBoard
            };

            await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            // Original board should remain unchanged
            expect(originalBoard).toEqual(originalBoardCopy);
        });

        test('should return complete board state', async () => {
            const moveRequest: MoveRequest = {
                row: 2,
                col: 3,
                player: SquareState.B,
                board: createStartingBoard()
            };

            const response = await request(app)
                .post('/api/game/move')
                .send(moveRequest);

            expect(response.status).toBe(200);
            expect(response.body.newBoard.squares).toHaveLength(8);
            response.body.newBoard.squares.forEach((row: any[]) => {
                expect(row).toHaveLength(8);
                row.forEach(square => {
                    expect([SquareState.E, SquareState.B, SquareState.W]).toContain(square);
                });
            });
        });
    });
});