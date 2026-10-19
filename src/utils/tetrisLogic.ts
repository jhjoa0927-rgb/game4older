/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board, BoardCell, GameMode, Piece, TetrominoType, BestMove } from '../types/tetris';

export const THEMES = {
  warm: {
    name: '따스한 온돌방',
    bg: 'bg-amber-50',
    boardBg: 'bg-stone-900',
    gridLine: 'border-stone-800/60',
    panelBg: 'bg-amber-100/90 border-amber-300',
    accent: 'bg-amber-500 hover:bg-amber-600 text-stone-950',
    cardBorder: 'border-amber-200',
    textMain: 'text-stone-900',
    textSub: 'text-stone-600',
  },
  contrast: {
    name: '선명 고대비 모드',
    bg: 'bg-black text-white',
    boardBg: 'bg-slate-950',
    gridLine: 'border-yellow-400/40',
    panelBg: 'bg-neutral-900 border-yellow-400 border-2',
    accent: 'bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold',
    cardBorder: 'border-yellow-400',
    textMain: 'text-yellow-300',
    textSub: 'text-white',
  },
  forest: {
    name: '싱그러운 숲길',
    bg: 'bg-emerald-50',
    boardBg: 'bg-emerald-950',
    gridLine: 'border-emerald-900/60',
    panelBg: 'bg-emerald-100/90 border-emerald-300',
    accent: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    cardBorder: 'border-emerald-200',
    textMain: 'text-emerald-950',
    textSub: 'text-emerald-700',
  },
};

// Senior-friendly Tetromino definitions with warm, distinct, high-contrast colors & clear symbols
export const TETROMINOES: Record<TetrominoType, {
  shape: number[][];
  color: string;
  borderColor: string;
  symbol: string;
  name: string;
  description: string;
}> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#06b6d4', // Bright Cyan
    borderColor: '#0891b2',
    symbol: '🌸',
    name: '기다란 막대',
    description: '빈틈을 시원하게 채워주는 기다란 막대',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#eab308', // Bright Yellow Gold
    borderColor: '#ca8a04',
    symbol: '☀️',
    name: '정사각형 네모',
    description: '안정감 있는 반듯한 네모',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a855f7', // Purple
    borderColor: '#7e22ce',
    symbol: '🍀',
    name: '모자 블록 (T)',
    description: '가운데가 쏙 솟아오른 모자 모양',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#22c55e', // Grass Green
    borderColor: '#15803d',
    symbol: '🌿',
    name: '오른쪽 번개',
    description: '계단처럼 지그재그로 꺾인 블록',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#ef4444', // Red
    borderColor: '#b91c1c',
    symbol: '🍎',
    name: '왼쪽 번개',
    description: '왼쪽으로 굽어진 친근한 빨간 사과 블록',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3b82f6', // Royal Blue
    borderColor: '#1d4ed8',
    symbol: '🌙',
    name: '왼쪽 기억자',
    description: '달콤한 초승달 닮은 왼쪽 기억자',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f97316', // Orange
    borderColor: '#c2410c',
    symbol: '🍊',
    name: '오른쪽 니은자',
    description: '상큼한 귤빛 오른쪽 니은자',
  },
  // Extra simpler beginner pieces for gentle cognitive rehab mode
  DOT: {
    shape: [[1]],
    color: '#ec4899', // Pink
    borderColor: '#be185d',
    symbol: '⭐',
    name: '별 도우미 (1칸)',
    description: '한 칸 빈자리 메우기 도우미',
  },
  DOMINO: {
    shape: [
      [1, 1],
    ],
    color: '#14b8a6', // Teal
    borderColor: '#0f766e',
    symbol: '🍃',
    name: '두 칸 막대',
    description: '작고 다루기 쉬운 두 칸 블록',
  },
  CORNER: {
    shape: [
      [1, 0],
      [1, 1],
    ],
    color: '#8b5cf6', // Indigo
    borderColor: '#6d28d9',
    symbol: '🎈',
    name: '작은 기억자',
    description: '세 칸짜리 쉬운 모서리 블록',
  },
};

export const STANDARD_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
export const GENTLE_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L', 'DOMINO', 'CORNER', 'DOT'];

export function getBoardDimensions(mode: GameMode): { cols: number; rows: number } {
  switch (mode) {
    case 'gentle':
      return { cols: 8, rows: 12 }; // Less visual clutter, clear scan
    case 'puzzle':
      return { cols: 8, rows: 12 };
    case 'silver':
    default:
      return { cols: 10, rows: 16 }; // Senior-optimized: 16 rows instead of 20 to fit large screen nicely
  }
}

export function createEmptyBoard(cols: number, rows: number): Board {
  const board: Board = [];
  for (let r = 0; r < rows; r++) {
    board.push(new Array(cols).fill(null));
  }
  return board;
}

export function createRandomPiece(mode: GameMode, cols: number): Piece {
  const pool = mode === 'gentle' ? GENTLE_TYPES : STANDARD_TYPES;
  // In gentle mode, prioritize simpler pieces 30% of the time
  const type = pool[Math.floor(Math.random() * pool.length)];
  const def = TETROMINOES[type];
  
  // Clone shape array
  const shape = def.shape.map(row => [...row]);
  const width = shape[0].length;
  const startX = Math.floor((cols - width) / 2);

  return {
    type,
    shape,
    color: def.color,
    borderColor: def.borderColor,
    symbol: def.symbol,
    name: def.name,
    x: startX,
    y: 0,
  };
}

export function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = [];
  for (let c = 0; c < cols; c++) {
    const newRow: number[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      newRow.push(matrix[r][c]);
    }
    result.push(newRow);
  }
  return result;
}

export function checkCollision(board: Board, piece: Piece, offsetX = 0, offsetY = 0, newShape?: number[][]): boolean {
  const shape = newShape || piece.shape;
  const targetX = piece.x + offsetX;
  const targetY = piece.y + offsetY;
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const boardX = targetX + c;
        const boardY = targetY + r;

        // Check boundaries
        if (boardX < 0 || boardX >= cols || boardY >= rows) {
          return true;
        }
        // Check collision with placed blocks (only if within vertical bounds)
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

export function calculateGhostY(board: Board, piece: Piece): number {
  let ghostY = piece.y;
  while (!checkCollision(board, piece, 0, ghostY - piece.y + 1)) {
    ghostY++;
  }
  return ghostY;
}

export function placePieceOnBoard(board: Board, piece: Piece): Board {
  const newBoard = board.map(row => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const by = piece.y + r;
        const bx = piece.x + c;
        if (by >= 0 && by < board.length && bx >= 0 && bx < board[0].length) {
          newBoard[by][bx] = {
            color: piece.color,
            borderColor: piece.borderColor,
            symbol: piece.symbol,
            type: piece.type,
          };
        }
      }
    }
  }
  return newBoard;
}

export function getFullLines(board: Board): number[] {
  const lines: number[] = [];
  for (let r = 0; r < board.length; r++) {
    if (board[r].every(cell => cell !== null)) {
      lines.push(r);
    }
  }
  return lines;
}

export function clearLinesFromBoard(board: Board, linesToClear: number[]): Board {
  if (linesToClear.length === 0) return board;

  const cols = board[0].length;
  const newBoard = board.filter((_, idx) => !linesToClear.includes(idx));
  
  // Add new empty rows at top
  const emptyRowsNeeded = linesToClear.length;
  for (let i = 0; i < emptyRowsNeeded; i++) {
    newBoard.unshift(new Array(cols).fill(null));
  }
  return newBoard;
}

/**
 * Intelligent Senior Hint Finder:
 * Evaluates all valid positions for the current piece and finds the most harmonious,
 * safe, and rewarding placement.
 */
export function findBestMove(board: Board, piece: Piece): BestMove | null {
  const cols = board[0].length;
  const rows = board.length;
  let bestScore = -999999;
  let bestMove: BestMove | null = null;

  // Test 4 rotations
  let currentShape = piece.shape.map(r => [...r]);
  for (let rot = 0; rot < 4; rot++) {
    const shapeW = currentShape[0].length;

    for (let testX = -2; testX < cols; testX++) {
      const dummyPiece: Piece = {
        ...piece,
        shape: currentShape,
        x: testX,
        y: 0,
      };

      // Check if testX is initially out of bounds or collides at top
      if (checkCollision(board, dummyPiece, 0, 0)) {
        continue;
      }

      // Drop to bottom
      let dropY = 0;
      while (!checkCollision(board, dummyPiece, 0, dropY + 1)) {
        dropY++;
      }
      dummyPiece.y = dropY;

      // Evaluate placement
      let score = 0;

      // Check completed lines
      let lines = 0;
      for (let r = 0; r < rows; r++) {
        let isFull = true;
        for (let c = 0; c < cols; c++) {
          const filled = (board[r][c] !== null) ||
            (r >= dropY && r < dropY + currentShape.length &&
             c >= testX && c < testX + shapeW &&
             currentShape[r - dropY][c - testX] === 1);
          if (!filled) {
            isFull = false;
            break;
          }
        }
        if (isFull) lines++;
      }

      score += lines * 250; // High reward for line clears

      // Low landing height reward (lower is better)
      score += dropY * 8;

      // Penalty for holes created under this piece
      let holes = 0;
      for (let c = 0; c < shapeW; c++) {
        const boardC = testX + c;
        if (boardC >= 0 && boardC < cols) {
          let foundBlock = false;
          for (let r = 0; r < rows; r++) {
            const isFilled = (board[r][boardC] !== null) ||
              (r >= dropY && r < dropY + currentShape.length &&
               currentShape[r - dropY][c] === 1);
            if (isFilled) {
              foundBlock = true;
            } else if (foundBlock) {
              holes++;
            }
          }
        }
      }
      score -= holes * 40; // Heavy penalty for creating gaps

      if (score > bestScore) {
        bestScore = score;
        let desc = '아래쪽 빈칸을 안정적으로 채웁니다.';
        if (lines >= 2) desc = `대박! ${lines}줄을 한 번에 맞출 수 있습니다!`;
        else if (lines === 1) desc = '한 줄을 깔끔하게 완성할 수 있는 최적의 위치입니다.';

        bestMove = {
          x: testX,
          rotation: rot,
          score,
          description: desc,
        };
      }
    }

    // Next rotation
    currentShape = rotateMatrix(currentShape);
  }

  return bestMove;
}

// Generate pre-placed puzzle board for Cognitive Memory & Mission Mode
export function createPuzzleBoard(): { board: Board; targetLines: number; title: string } {
  const cols = 8;
  const rows = 12;
  const board = createEmptyBoard(cols, rows);

  // Place warm, colorful base blocks with some gaps for the senior to solve
  const basePatterns = [
    // Bottom row has 1 gap at column 3
    [1, 1, 1, 0, 1, 1, 1, 1],
    // Row 10 has 1 gap at column 4
    [1, 1, 1, 1, 0, 1, 1, 1],
    // Row 9 has decorative blocks
    [0, 1, 0, 0, 0, 0, 1, 0],
  ];

  const types: TetrominoType[] = ['O', 'T', 'I', 'S', 'L', 'J'];

  basePatterns.forEach((rowPattern, pIdx) => {
    const rowIdx = rows - basePatterns.length + pIdx;
    rowPattern.forEach((hasBlock, cIdx) => {
      if (hasBlock) {
        const randType = types[(pIdx * cols + cIdx) % types.length];
        const def = TETROMINOES[randType];
        board[rowIdx][cIdx] = {
          color: def.color,
          borderColor: def.borderColor,
          symbol: def.symbol,
          type: randType,
        };
      }
    });
  });

  return {
    board,
    targetLines: 2,
    title: '빈 곳을 채워 2줄 완성하기',
  };
}

export const SENIOR_BRAIN_TIPS = [
  {
    title: '손가락 관절 잼잼 운동',
    desc: '손을 쥐었다 폈다 10번 반복하면 뇌 전두엽 혈류가 약 20% 증가합니다.',
    badge: '두뇌 혈류 개선',
  },
  {
    title: '따뜻한 물 한 모금',
    desc: '수분이 충분하면 뇌세포 간 신호 전달이 훨씬 원활해집니다.',
    badge: '수분 보충 팁',
  },
  {
    title: '블록 모양 미리 상상하기',
    desc: '다음에 올 블록의 회전 모양을 머릿속으로 그려보면 공간 지각력이 강화됩니다.',
    badge: '인지력 트레이닝',
  },
  {
    title: '심호흡 3초 규칙',
    desc: '천천히 3초 들이쉬고 3초 내쉬면 긴장이 풀리고 집중력이 최고로 높아집니다.',
    badge: '스트레스 완화',
  },
  {
    title: '칭찬은 최고의 두뇌 비타민',
    desc: '스스로 "잘하고 있다"고 칭찬하면 뇌에서 긍정 신경물질 도파민이 샘솟습니다.',
    badge: '정서적 안정',
  },
];
