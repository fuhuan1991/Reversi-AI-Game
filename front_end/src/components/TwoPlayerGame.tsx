import { useState, useEffect } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message, notification } from 'antd';
import GameBoard from './GameBoard';
import { Board } from '../types';
import { INITIAL_BOARD } from '../constants';
import { getValidPositions, getCounts } from '../helper';

function TwoPlayerGame() {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<'B' | 'W'>('B');
  const [textOnTop, setTextOnTop] = useState<string>('Black\'s turn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validPositions, setValidPositions] = useState<Set<string>>(new Set());
  const [blackCount, setBlackCount] = useState<number>(2);
  const [whiteCount, setWhiteCount] = useState<number>(2);

  useEffect(() => {
    const positions = getValidPositions(currentPlayer, board);
    setValidPositions(positions);
  }, [board, currentPlayer]);

  const handleMove = async (row: number, col: number) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/game/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          board: { squares: board }, 
          player: currentPlayer, 
          row, 
          col 
        })
      });

      const data = await response.json();

      if (data.newBoard) {
        setBoard(data.newBoard.squares);
        const counts = getCounts(data.newBoard.squares);
        setBlackCount(counts[0]);
        setWhiteCount(counts[1]);
        const nextPlayer = currentPlayer === 'B' ? 'W' : 'B';
        
        // Check if all squares are occupied
        const allOccupied = data.newBoard.squares.every((row: string[]) => 
          row.every((cell: string) => cell !== '.')
        );

        // Check if current player has no valid moves
        const nextPlayerValidPositions = getValidPositions(nextPlayer, data.newBoard.squares);
        const opponentValidPositions = getValidPositions(currentPlayer, data.newBoard.squares);
        
        if (allOccupied || (nextPlayerValidPositions.size == 0 && opponentValidPositions.size == 0)) {
          // Game over when all posistions are occupied or no valid move for both players
          // Count pieces to determine winner
          if (counts[0] > counts[1]) {
            setTextOnTop('Black is the winner!');
          } else if (counts[1] > counts[0]) {
            setTextOnTop('White is the winner!');
          } else {
            setTextOnTop('It\'s a tie!');
          }
        } else if (nextPlayerValidPositions.size == 0 && opponentValidPositions.size != 0) {
          // The next player has no valid moves but its component still has. The next player need to skip this round
          const msg = `${nextPlayer === 'B' ? 'Black' : 'White'} has no valid moves, skip this round. it's ${nextPlayer === 'B' ? 'White' : 'Black'}'s turn`;
          
          setCurrentPlayer(currentPlayer);
          setTextOnTop(msg);

          notification.info({
            title: 'Double move!',
            description: msg,
            placement: 'topRight',
            duration: 6,
            icon: <ExclamationCircleOutlined style={{ color: '#E2231a' }} />,
          });
          
        } else {
          setCurrentPlayer(nextPlayer);
          setTextOnTop(`${nextPlayer === 'B' ? 'Black' : 'White'}'s turn`);
        }
      } else {
        message.error(data.error || 'Invalid move');
      }
    } catch (error) {
      message.error('Error making move');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('B');
    setTextOnTop('Black\'s turn');
    setIsProcessing(false);
  };

  return (
    <div className="app">
      <h1>Reversi - Two Players</h1>
      <div className="game-info">
        <p>{textOnTop}</p>
        <p>
          <span className='small-coin-B'></span>
          Black {blackCount} : {whiteCount} White
          <span className='small-coin-W'></span>
        </p>
      </div>
      <GameBoard 
        board={board} 
        moveHandler={handleMove}
        disabled={isProcessing}
        validPositions={validPositions}
      />
      <div style={{ marginTop: '20px' }}>
        <button onClick={resetGame} disabled={isProcessing} className="reset-button">
          New Game
        </button>
      </div>
    </div>
  );
}

export default TwoPlayerGame;
