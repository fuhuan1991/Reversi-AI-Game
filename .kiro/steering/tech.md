# Technology Stack

This document outlines the technical foundation and conventions for the Reversi Service.

## Build System & Tools
- **Runtime**: Node.js (v20+)
- **Package Manager**: npm
- **Language**: TypeScript 5.2+
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Server**: ts-node

## Tech Stack
- **Language**: TypeScript
- **Framework**: Express.js 4.x
- **Database**: None (stateless service - game state sent in requests)
- **Testing**: Jest 29.x with ts-jest
- **AWS Integration**: AWS SDK v3 (@aws-sdk/client-bedrock-runtime)
- **Environment**: dotenv for configuration

## Dependencies

### Production
- `express` - Web framework for API endpoints
- `@aws-sdk/client-bedrock-runtime` - AWS Bedrock AI integration
- `dotenv` - Environment variable management

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution for development
- `jest` + `ts-jest` - Testing framework
- `@types/*` - TypeScript type definitions

## Common Commands

```bash
# Install dependencies
npm install

# Run development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests (single run)
npm test

# Run tests in watch mode
npm run test:watch
```

## Environment Variables
Required in `.env` file:
- `AWS_REGION` - AWS region for Bedrock (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `PORT` - Server port (optional, defaults to 3000)

## Code Standards

### TypeScript
- Use strict type checking (enabled in tsconfig.json)
- Define interfaces for all data structures
- Use enums for fixed sets of values (e.g., SquareState)
- Avoid `any` type - use proper types or `unknown`
- Use 2-space indentation

### Express Patterns
- Use Router instances for route organization
- Validate request bodies before processing
- Return consistent JSON error responses
- Use proper HTTP status codes (400 for validation, 500 for server errors)

### Testing
- Write tests for all validation logic
- Test edge cases and error conditions
- Use descriptive test names
- Aim for high coverage on core game logic

### Error Handling
- Catch and handle JSON parsing errors
- Validate all inputs before processing
- Provide clear error messages in API responses
- Log errors for debugging (console.error)

### Naming Conventions
- camelCase for variables and functions: `executeMove`, `validMoves`
- PascalCase for classes and types: `AIService`, `Board`, `MoveRequest`
- UPPER_SNAKE_CASE for constants: `DEFAULT_PORT`
- Descriptive names over abbreviations