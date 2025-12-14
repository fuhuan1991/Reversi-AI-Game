import 'dotenv/config';
import express from 'express';
import path from 'path';
import { gameRouter } from './routes/game';

const app = express();
const PORT = process.env.PORT || 3000;

// Determine root path based on environment
// In dev mode (ts-node): serve from front_end directory
// In prod mode (compiled): serve from dist/public directory
const isDev = process.env.NODE_ENV !== 'production' && __dirname.includes('src');
const rootPath = isDev ? '../front_end' : 'public';

// Middleware
app.use(express.json());

// Serve static files from appropriate directory
app.use(express.static(path.join(__dirname, rootPath)));

// Routes
app.use('/api/game', gameRouter);

// Serve front-end index page
app.get('/index', (_req, res) => {
  res.sendFile(path.join(__dirname, rootPath, 'index.html'));
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'reversi-service' });
});

app.listen(PORT, () => {
  console.log(`Reversi service running on port ${PORT}`);
});