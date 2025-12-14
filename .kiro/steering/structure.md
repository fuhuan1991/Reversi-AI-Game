# Project Structure

This document defines the organization and folder structure for the Reversi Service.

## Root Directory
```
.
├── .kiro/                  # Kiro configuration and steering rules
├── .vscode/                # VS Code workspace settings
├── src/                    # Backend TypeScript source code
│   ├── index.ts           # Express app entry point
│   ├── types.ts           # TypeScript type definitions
│   ├── validation.ts      # Game rule validation logic
│   ├── helper.ts          # Utility functions (board visualization, etc.)
│   ├── routes/            # Express route handlers
│   └── services/          # External service integrations
├── front_end/              # Frontend React application
│   ├── index.html         # HTML entry point
│   ├── asset/             # Static assets
│   │   ├── B.png          # Black piece image
│   │   ├── W.png          # White piece image
│   │   ├── slate_1.jpeg   # Board background option 1
│   │   ├── slate_2.jpeg   # Board background option 2
│   │   └── wood.jpeg      # Board background option 3
│   └── src/               # Frontend TypeScript/React source
│       ├── App.tsx        # Main React application component
│       ├── main.tsx       # React entry point
│       ├── index.css      # Global styles
│       ├── constants.ts   # Frontend constants
│       ├── helper.ts      # Frontend utility functions
│       ├── types.ts       # Frontend type definitions
│       └── components/    # React components
├── tests/                  # Jest test files
│   ├── validation.test.ts # Tests for game validation logic
│   └── move.test.ts       # Tests for move execution
├── dist/                   # Compiled JavaScript output (generated)
├── coverage/               # Test coverage reports (generated)
├── node_modules/           # npm dependencies (generated)
├── .env                    # Environment variables (AWS credentials)
├── package.json            # npm dependencies and scripts
├── package-lock.json       # npm dependency lock file
├── tsconfig.json           # TypeScript compiler configuration
├── vite.config.ts          # Vite build configuration
├── jest.config.js          # Jest testing configuration
├── README.md               # Project documentation
└── .gitignore              # Git ignore patterns
```

## Source Code Organization

### Backend (src/)
- **index.ts**: Express server setup, middleware, and route registration
- **types.ts**: TypeScript interfaces and enums (Board, SquareState, MoveRequest, etc.)
- **validation.ts**: Game rule validation (isMoveValid, getValidMoves, isBoardValid)
- **helper.ts**: Utility functions for board visualization and debugging

#### Routes
- **routes/**: Express route handlers for API endpoints
  - Move execution logic
  - AI move handling
  - Request validation and error handling

#### Services
- **services/**: External service integrations
  - AWS Bedrock AI integration
  - AI move generation
  - Prompt construction and response parsing

### Frontend (front_end/)
- **index.html**: HTML entry point for the React application
- **src/App.tsx**: Main React application component with game UI
- **src/main.tsx**: React application entry point and DOM rendering
- **src/index.css**: Global CSS styles for the application
- **src/constants.ts**: Frontend constants and configuration
- **src/helper.ts**: Frontend utility functions for game logic
- **src/types.ts**: Frontend TypeScript type definitions
- **src/components/**: React components for game interface

### Assets (front_end/asset/)
- **B.png**: Black piece image for game board
- **W.png**: White piece image for game board
- **slate_1.jpeg, slate_2.jpeg**: Slate board background options
- **wood.jpeg**: Wood board background option

## Build Configuration
- **vite.config.ts**: Vite configuration for frontend build and development
- **tsconfig.json**: TypeScript compiler configuration for both frontend and backend
- **jest.config.js**: Jest testing framework configuration
- **package.json**: npm dependencies, scripts, and project metadata

## File Naming Conventions
- Use camelCase for TypeScript files: `aiService.ts`, `gameRouter.ts`
- Use PascalCase for classes and interfaces: `AIService`, `Board`, `MoveRequest`
- Use PascalCase for React components: `App.tsx`, `GameBoard.tsx`
- Use camelCase for functions and variables: `executeMove`, `isMoveValid`
- Test files mirror source files with `.test.ts` suffix
- Asset files use descriptive names: `B.png`, `W.png`, `wood.jpeg`

## Code Organization Guidelines

### Backend
- Keep route handlers focused on HTTP concerns (parsing, validation, responses)
- Move complex game logic into separate functions or modules
- Keep validation logic pure and testable
- Use TypeScript types for all function parameters and return values
- Export router instances, not the entire Express app

### Frontend
- Use React functional components with TypeScript
- Keep components focused on single responsibilities
- Share common types between frontend and backend where applicable
- Use CSS for styling with descriptive class names
- Organize assets by type (images, backgrounds, etc.)

## Documentation
- README.md: Setup instructions, API documentation, usage examples
- Inline JSDoc comments for complex functions
- Type definitions serve as documentation for data structures
- Steering files in .kiro/ provide project context and guidelines