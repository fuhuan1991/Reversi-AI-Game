import { Board, SquareState } from '../types';
import { getEnvironmentVariable } from '../helper';
import OpenAI from "openai";

export class AIService {
  private openAIClient: OpenAI | undefined = undefined;

  async getClient() {
    if (!this.openAIClient) {
      const apiKey = await getEnvironmentVariable('OPENAI_API_KEY');
      this.openAIClient = new OpenAI({ apiKey });
    }
    return this.openAIClient;
  }

  async getAIMove(board: Board, aiPlayer: SquareState.B | SquareState.W, validMoves:{ row: number, col: number }[]): Promise<{row: number, col: number, reason: string}> {
    const prompt = this.buildGamePrompt(board, aiPlayer, validMoves);
    console.log('----AI prompt');
    console.log(prompt);

    const client = await this.getClient();
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    console.log('---- getAIMove response:');
    // console.log(response);
    console.log(response.choices[0].message.content);
    
    return this.parseAIResponseOpenAI(response.choices[0].message.content);
  }

  private getValidMoveString(validMoves:{ row: number, col: number }[]): string {
    let result = '';
    for (const pos of validMoves) {
      result += 'row ' + (pos.row + 1) + ' col ' + (pos.col + 1) + '\n';
    }
    return result;
  }

  private buildGamePrompt(board: Board, aiPlayer: SquareState.B | SquareState.W, validMoves:{ row: number, col: number }[]): string {
    const boardString = this.boardToString(board);
    const validMovesString = this.getValidMoveString(validMoves); 
    const aiColor = aiPlayer === SquareState.B ? 'Black' : 'White';

    return `### ROLE:SYSTEM
You are a <Reversi> player, you are playing with the ${aiColor} pieces. There are 2 types of pieces, Black and White. All the pieces on the game board are defined in <BOARD> section. The board is 1-based indices.
### STRATEGY ###
- A <CORNER> move is a move that both row and col equals to 1 or 8.
- A <CORNER> move is the most valuable move, you must choose it if you found it.
- A <EDGE> move is a move that either row or col equals 1 or 8.
- A <EDGE> move is move valuable than a move not at <EDGE>.
- Try to capture the position that is hard to be captured by your opponent.
- Try to choose a move that can flip the most opponent's pieces.

### YOUR TASK ###
- You must choose your next move from <MOVE LIST> based on the <STRATEGY>.
- <ROW_NUMBER> represents the row number of your move, <COLUMN_NUMBER> represents the column number of your move, <REASON> represents a short explanation why you make this move. 
- Return ONE final response with the JSON format in <OUTPUT FORMAT>

### OUTPUT FORMAT ###
{
  "row": <ROW_NUMBER>,
  "col": <COLUMN_NUMBER>,
  "reason": <REASON>
}

### ROLE:USER
### BOARD ###
${boardString}

### MOVE LIST ###
${validMovesString}
`;
  }

  private boardToString(board: Board): string {
    let result = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board.squares[row][col] === SquareState.B || board.squares[row][col] === SquareState.W) {
          const piece = board.squares[row][col] === SquareState.B ? 'Black ' : 'White '
          result += piece + 'row ' + (row + 1) + ' col ' + (col + 1) + '\n';
        }
      }
    }
    return result;
  }

  private parseAIResponseOpenAI(jsonString: any): {row: number, col: number, reason: string} {
    // textOutputObject is expected to be { row: "x", col: "x" , reason: "xxxxxxxxxxx" }
    const textOutputObject = this.extractFirstJSON(jsonString);

    if (!textOutputObject) {
      throw new Error('Invalid AI response format');
    }

    const reason: string = textOutputObject.reason;
    const row = parseInt(textOutputObject.row, 10) - 1;
    const col = parseInt(textOutputObject.col, 10) - 1;
    
    if (row < 0 || row > 7 || col < 0 || col > 7) {
      throw new Error('AI suggested invalid coordinates');
    }
    
    return { row, col, reason };
  }

  private extractFirstJSON(input: string): any | undefined {
    try {
      // Find the first occurrence of '{' or '['
      const jsonStart = input.search(/[{\[]/);
      if (jsonStart === -1) {
        return undefined;
      }

      // Try to parse JSON starting from each potential position
      for (let i = jsonStart; i < input.length; i++) {
        if (input[i] !== '{' && input[i] !== '[') {
          continue;
        }

        // Try to find matching closing bracket
        let depth = 0;
        let inString = false;
        let escapeNext = false;

        for (let j = i; j < input.length; j++) {
          const char = input[j];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"') {
            inString = !inString;
            continue;
          }

          if (!inString) {
            if (char === '{' || char === '[') {
              depth++;
            } else if (char === '}' || char === ']') {
              depth--;
              if (depth === 0) {
                // Found complete JSON object/array
                const jsonString = input.substring(i, j + 1);
                try {
                  return JSON.parse(jsonString);
                } catch {
                  // Invalid JSON, continue searching
                  break;
                }
              }
            }
          }
        }
      }

      return undefined;
    } catch {
      return undefined;
    }
  }
}

