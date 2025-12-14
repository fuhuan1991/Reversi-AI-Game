import { Board } from '../types';
import './GameBoard.css';

interface GameBoardProps {
  board: Board;
  moveHandler: (row: number, col: number) => void;
  disabled?: boolean;
  validPositions?: Set<string>;
}

function GameBoard({ board, moveHandler, disabled, validPositions }: GameBoardProps) {
  const isValidPosition = (row: number, col: number): boolean => {
    return validPositions?.has(`${row},${col}`) ?? false;
  };

  const handleSquareClick = (row: number, col: number, elementInCell: string) => {
    if (disabled || elementInCell !== '.') return;
    moveHandler(row, col);
  };

  return (
    <div className="game-board-container">

      {/* Column indices header */}
      <div className="column-indices">
        <div className="corner-space"></div>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="column-index">{i + 1}</div>
        ))}
      </div>
      
      <div className="board-with-rows">
        {/* Row indices */}
        <div className="row-indices">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="row-index">{i + 1}</div>
          ))}
        </div>
        
        {/* Board without row indices */}
        <div className="board-container">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
              {row.map((elementInCell, colIndex) => {
                const isValid = isValidPosition(rowIndex, colIndex);
                const isDisabled = disabled || elementInCell !== '.';
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`square ${elementInCell ? `piece-${elementInCell}` : ''} ${isValid ? 'valid-move' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex, elementInCell)}
                  >
                    {elementInCell && <div className="piece" />}
                    {isValid && <div className="valid-indicator" />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
