# Reversi Service

A TypeScript Express service for playing Reversi with AI via AWS Bedrock.

## Setup

```bash
npm install
npm run dev
```

## API Endpoints

- `POST /api/game/move` - Process human player move
- `POST /api/game/ai-move` - Get AI move via AWS Bedrock
- `GET /health` - Health check

## Development

```bash
npm run dev      # Start development server
npm test         # Run tests
npm run build    # Build for production
npm start        # Start production server
```