# Product Overview

This project is a **Reversi Service** - an HTTP API service that enables human players to play the classic Reversi (Othello) board game against an AI opponent powered by OpenAI.

## Purpose
- Provide a stateless HTTP API for playing Reversi games
- Enable human players to make moves and receive AI-generated responses
- Leverage OpenAI's LLM to generate intelligent game moves
- Validate all moves according to official Reversi rules


## Game Rules (Reversi/Othello)
- 8x8 board with Black (B) and White (W) pieces
- Players alternate turns placing pieces
- Valid moves must flip at least one opponent piece
- Pieces are flipped when sandwiched between the new piece and another piece of the same color
- Game ends when no valid moves remain for either player

## API Endpoints
- `POST /api/game/move` - Process human player moves
- `POST /api/game/ai-move` - Get AI-generated moves
- `GET /health` - Service health check
- `GET /index` - Render HTML page

## Goals
- Maintain clean, readable, and maintainable TypeScript code
- Ensure all moves are validated according to Reversi rules
- Provide reliable AI move generation with fallback logic
- Keep the service stateless (game state sent in each request)
- Comprehensive test coverage for game logic

## Context
When working on this project, always consider:
- Game rule accuracy and move validation
- AI response reliability and error handling
- API response clarity and error messages
- Performance of board state calculations
- Security of AWS credentials and API inputs