export type GameMode = 'gentle' | 'silver' | 'puzzle';

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | 'DOT' | 'DOMINO' | 'CORNER';

export interface BlockSymbol {
  symbol: string;
  name: string;
  description: string;
}

export interface Piece {
  type: TetrominoType;
  shape: number[][];
  color: string;
  borderColor: string;
  symbol: string;
  name: string;
  x: number;
  y: number;
}

export interface BoardCell {
  color: string;
  borderColor: string;
  symbol: string;
  type: TetrominoType;
  clearing?: boolean;
}

export type Board = (BoardCell | null)[][];

export interface GameSettings {
  mode: GameMode;
  theme: 'warm' | 'contrast' | 'forest';
  fontSize: 'normal' | 'large' | 'huge';
  soundEffects: boolean;
  voiceCheer: boolean;
  bgm: boolean;
  showSymbols: boolean;
  showGhost: boolean;
  autoDrop: boolean;
  dropSpeed: number; // 1 (very slow) to 4 (normal)
}

export interface GameStats {
  score: number;
  linesCleared: number;
  level: number;
  combos: number;
  maxCombo: number;
  vitalityScore: number; // 두뇌 활력 점수
  startTime: number;
  movesCount: number;
  hintsUsed: number;
  undosUsed: number;
}

export interface UndoState {
  board: Board;
  currentPiece: Piece | null;
  nextPieces: Piece[];
  holdPiece: Piece | null;
  canHold: boolean;
  score: number;
  linesCleared: number;
  vitalityScore: number;
}

export interface BestMove {
  x: number;
  rotation: number;
  score: number;
  description: string;
}
