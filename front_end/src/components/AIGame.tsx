import { useState, useEffect } from 'react';
import { message, notification } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import TypeWriterEffect from "react-typewriter-effect";
import GameBoard from './GameBoard';
import { Board } from '../types';
import { INITIAL_BOARD } from '../constants';
import { getValidPositions, getCounts } from '../helper';

function AIGame() {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<'B' | 'W'>('B');
  const [textOnTop, setTextOnTop] = useState<string>('Black\'s turn');
  const [textForAI, setTextForAI] = useState<string>('Make your move...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validPositions, setValidPositions] = useState<Set<string>>(new Set());
  const [blackCount, setBlackCount] = useState<number>(2);
  const [whiteCount, setWhiteCount] = useState<number>(2);
  const [waitForAi, setWaitForAi] = useState<boolean>(false);

  useEffect(() => {
    const positions = getValidPositions(currentPlayer, board);
    setValidPositions(positions);
  }, [board, currentPlayer]);

  useEffect(() => {
    if (waitForAi) {
      (async () => {
        await handleAiMove();
        setWaitForAi(false);
      })()
    } 
  }, [waitForAi]);

  const handleHumanMove = async (row: number, col: number) => {
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
          setIsProcessing(false);
        } else if (nextPlayerValidPositions.size == 0 && opponentValidPositions.size != 0) {
          // The next play(AI) has no valid moves but its component(human) still has. The next player(AI) need to skip this round
          const msg = `${nextPlayer === 'B' ? 'Black' : 'White'} has no valid moves, skip this round. it's ${nextPlayer === 'B' ? 'White' : 'Black'}'s turn`;
          
          setCurrentPlayer(currentPlayer);
          setTextOnTop(msg);
          setIsProcessing(false);

          notification.info({
            title: 'Double move!',
            description: msg,
            placement: 'bottomRight',
            duration: 6,
            icon: <ExclamationCircleOutlined style={{ color: '#E2231a' }} />,
          });

        }  else {
          // Normal case, next turn is for AI player
          setCurrentPlayer(nextPlayer);
          setTextOnTop(`${nextPlayer === 'B' ? 'Black' : 'White'}'s turn`);
          setWaitForAi(true);
        }
      } else {
        message.error(data.error || 'Invalid move');
        setIsProcessing(false);
      }
    } catch (error) {
      message.error('Error making move');
      setIsProcessing(false);
    }
  }

  const handleAiMove = async() => {
    try {
      const response = await fetch('/api/game/ai-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          board: { squares: board }, 
          aiPlayer: currentPlayer
        })
      }); 

      const data = await response.json();

      // Basic notification about AI move
      let aiText = 'AI made a move at ' + (data.aiMove.row + 1) + ' - ' + (data.aiMove.col + 1);
      
      // Display the reason behind the move
      if (data.aiMove.reason) {
        aiText = aiText + '\n' + data.aiMove.reason;
      }

      setTextForAI(aiText);
      

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
          // The next player(human) has no valid moves but its component(AI) still has. The next player(human) need to skip this round
          const msg = `${nextPlayer === 'B' ? 'Black' : 'White'} has no valid moves, skip this round. it's ${nextPlayer === 'B' ? 'White' : 'Black'}'s turn`;
          setCurrentPlayer(currentPlayer);
          setTextOnTop(msg);

          notification.info({
            title: 'Double move!',
            description: msg,
            placement: 'bottomRight',
            duration: 6,
            icon: <ExclamationCircleOutlined style={{ color: '#E2231a' }} />,
          });

          setTimeout(() => {
            console.log('setTimeout executed')
            setWaitForAi(true);
          }, 500);

        } else {
          // Normal case, next turn is for human player
          setCurrentPlayer(nextPlayer);
          setTextOnTop(`${nextPlayer === 'B' ? 'Black' : 'White'}'s turn`);
          setIsProcessing(false);
        }
      } else {
        message.error(data.error || 'Invalid move');
      }
    } catch (error) {
      message.error('Error making move');
    }
  }

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('B');
    setTextOnTop('Black\'s turn');
    setIsProcessing(false);
  };

  return (
    <div className="app">
      <h1>Reversi - AI Game</h1>
      <div className="game-info">
        <p>{textOnTop}</p>
        <p>
          <div className='small-coin-B'></div>
          Black - Human &nbsp;&nbsp;&nbsp; {blackCount} : {whiteCount} &nbsp;&nbsp;&nbsp; AI - White
          <div className='small-coin-W'></div>
        </p>
      </div>
      <div className='type-writter'>
        <TypeWriterEffect
          text={textForAI}
          key={textForAI}
          typeSpeed={5}
        />
      </div>
      <GameBoard 
        board={board} 
        moveHandler={handleHumanMove}
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

export default AIGame;
