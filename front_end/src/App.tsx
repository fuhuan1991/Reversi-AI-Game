import { useState } from 'react';
import TwoPlayerGame from './components/TwoPlayerGame';
import AIGame from './components/AIGame';
import './App.css';


function App() {
  const [gameMode, setGameMode] = useState<'two-player' | 'ai'>('ai');

  return (
    <div className="app-container">
      <div className="mode-selector">
        <button 
          onClick={() => setGameMode('two-player')}
          disabled={gameMode === 'two-player'}
          className="mode-button"
        >
          2 Player Game
        </button>
        <button 
          onClick={() => setGameMode('ai')}
          disabled={gameMode === 'ai'}
          className="mode-button"
        >
          AI Game
        </button>
      </div>
      
      <div className="game-content">
        {gameMode === 'two-player' ? (
          <TwoPlayerGame />
        ) : (
          <AIGame />
        )}
      </div>
    </div>
  );
}

export default App;
