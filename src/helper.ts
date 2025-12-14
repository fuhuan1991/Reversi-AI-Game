import { Board, SquareState } from './types';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

/**
 * Visualizes a Reversi board using a single console.log
 * @param board - The board to visualize
 * @param title - Optional title to display above the board
 */
export function visualizeBoard(board: Board, title?: string): void {
    let output = '';

    if (title) {
        output += `\n${title}\n`;
    }

    output += '\n  1 2 3 4 5 6 7 8\n';

    for (let row = 0; row < 8; row++) {
        let rowString = `${row + 1} `;

        for (let col = 0; col < 8; col++) {
            const square = board.squares[row][col];
            let symbol: string;

            switch (square) {
                case SquareState.B:
                    symbol = 'B';
                    break;
                case SquareState.W:
                    symbol = 'W';
                    break;
                case SquareState.E:
                default:
                    symbol = '.';
                    break;
            }

            rowString += symbol + ' ';
        }

        output += rowString + '\n';
    }

    console.log(output);
}

/**
 * Gets an environment variable from process.env in development or AWS Systems Manager in production
 * @param key - The environment variable key to retrieve
 * @returns The environment variable value
 * @throws Error if the variable is not found or cannot be retrieved
 */
export async function getEnvironmentVariable(key: string): Promise<string> {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'development') {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Environment variable ${key} not found in process.env`);
        }
        return value;
    } else if (nodeEnv === 'production') {
        try {
            const ssmClient = new SSMClient({
                region: process.env.AWS_REGION || 'us-east-1'
            });
            
            const command = new GetParameterCommand({
                Name: key,
                WithDecryption: true // This allows retrieval of SecureString parameters
            });
            
            const response = await ssmClient.send(command);
            
            if (!response.Parameter?.Value) {
                throw new Error(`Parameter ${key} not found in AWS Systems Manager`);
            }
            
            return response.Parameter.Value;
        } catch (error) {
            throw new Error(`Failed to retrieve parameter ${key} from AWS Systems Manager: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    } else {
        throw new Error(`Unsupported NODE_ENV: ${nodeEnv}. Expected 'development' or 'production'`);
    }
}

