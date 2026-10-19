/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameMode,
  GameSettings,
  GameStats,
  Piece,
  Board,
  UndoState,
  BestMove,
} from './types/tetris';
import {
  THEMES,
  getBoardDimensions,
  createEmptyBoard,
  createRandomPiece,
  rotateMatrix,
  checkCollision,
  calculateGhostY,
  placePieceOnBoard,
  getFullLines,
  clearLinesFromBoard,
  findBestMove,
  createPuzzleBoard,
} from './utils/tetrisLogic';
import { soundManager, speakPraise } from './utils/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { SidePanels } from './components/SidePanels';
import { PauseModal } from './components/PauseModal';
import { BrainReportModal } from './components/BrainReportModal';
import { SettingsModal } from './components/SettingsModal';
import confetti from 'canvas-confetti';

const INITIAL_SETTINGS: GameSettings = {
  mode: 'gentle',
  theme: 'warm',
  fontSize: 'large',
  soundEffects: true,
  voiceCheer: true,
  bgm: false,
  showSymbols: true,
  showGhost: true,
  autoDrop: true,
  dropSpeed: 1, // 1: Very slow (Turtle), 2: Normal, 3: Light rhythm
};

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('silver_tetris_settings');
      if (saved) return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return INITIAL_SETTINGS;
  });

  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'summary'>('title');
  const [board, setBoard] = useState<Board>(() => createEmptyBoard(8, 12));
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPieces, setNextPieces] = useState<Piece[]>([]);
  const [holdPiece, setHoldPiece] = useState<Piece | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [clearingLines, setClearingLines] = useState<number[]>([]);
  const [hintMove, setHintMove] = useState<BestMove | null>(null);
  const [praiseMessage, setPraiseMessage] = useState<string | null>(null);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [puzzleTarget, setPuzzleTarget] = useState<number>(2);
  const [puzzleCleared, setPuzzleCleared] = useState<number>(0);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    linesCleared: 0,
    level: 1,
    combos: 0,
    maxCombo: 0,
    vitalityScore: 100,
    startTime: Date.now(),
    movesCount: 0,
    hintsUsed: 0,
    undosUsed: 0,
  });

  const undoStackRef = useRef<UndoState[]>([]);
  const dropTimerRef = useRef<number | null>(null);
  const lockTimerRef = useRef<number | null>(null);
  const praiseTimeoutRef = useRef<number | null>(null);

  // Save settings on change
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('silver_tetris_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const showPraise = (msg: string) => {
    setPraiseMessage(msg);
    if (praiseTimeoutRef.current) clearTimeout(praiseTimeoutRef.current);
    praiseTimeoutRef.current = window.setTimeout(() => {
      setPraiseMessage(null);
    }, 2200);
  };

  // Start new game
  const startGame = useCallback((mode: GameMode) => {
    const { cols, rows } = getBoardDimensions(mode);
    let initialBoard = createEmptyBoard(cols, rows);
    let target = 2;

    if (mode === 'puzzle') {
      const puzzle = createPuzzleBoard();
      initialBoard = puzzle.board;
      target = puzzle.targetLines;
      setPuzzleTarget(target);
      setPuzzleCleared(0);
    }

    const firstPiece = createRandomPiece(mode, cols);
    const queue = [
      createRandomPiece(mode, cols),
      createRandomPiece(mode, cols),
      createRandomPiece(mode, cols),
    ];

    setBoard(initialBoard);
    setCurrentPiece(firstPiece);
    setNextPieces(queue);
    setHoldPiece(null);
    setCanHold(true);
    setClearingLines([]);
    setHintMove(null);
    setPraiseMessage(null);
    setIsVictory(false);
    undoStackRef.current = [];

    setStats({
      score: 0,
      linesCleared: 0,
      level: 1,
      combos: 0,
      maxCombo: 0,
      vitalityScore: 100,
      startTime: Date.now(),
      movesCount: 0,
      hintsUsed: 0,
      undosUsed: 0,
    });

    setSettings((prev) => ({ ...prev, mode }));
    setGameState('playing');
  }, []);

  // Save snapshot for Undo
  const saveUndoSnapshot = useCallback(() => {
    if (!currentPiece) return;
    const snapshot: UndoState = {
      board: board.map((r) => [...r]),
      currentPiece: { ...currentPiece, shape: currentPiece.shape.map((r) => [...r]) },
      nextPieces: nextPieces.map((p) => ({ ...p, shape: p.shape.map((r) => [...r]) })),
      holdPiece: holdPiece ? { ...holdPiece, shape: holdPiece.shape.map((r) => [...r]) } : null,
      canHold,
      score: stats.score,
      linesCleared: stats.linesCleared,
      vitalityScore: stats.vitalityScore,
    };
    undoStackRef.current.push(snapshot);
    if (undoStackRef.current.length > 8) {
      undoStackRef.current.shift();
    }
  }, [board, currentPiece, nextPieces, holdPiece, canHold, stats]);

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop();
    if (!prev) return;

    setBoard(prev.board);
    setCurrentPiece(prev.currentPiece);
    setNextPieces(prev.nextPieces);
    setHoldPiece(prev.holdPiece);
    setCanHold(prev.canHold);
    setStats((s) => ({
      ...s,
      score: prev.score,
      linesCleared: prev.linesCleared,
      vitalityScore: Math.max(50, prev.vitalityScore - 2),
      undosUsed: s.undosUsed + 1,
    }));
    setHintMove(null);
    showPraise('한 수 물렀습니다! 침착하게 해보세요');
  }, []);

  // Lock piece onto board & process lines
  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    saveUndoSnapshot();
    const newBoard = placePieceOnBoard(board, currentPiece);
    const fullLines = getFullLines(newBoard);

    if (fullLines.length > 0) {
      // Line clear sequence
      setClearingLines(fullLines);
      if (settings.soundEffects) soundManager.playLineClear(fullLines.length);

      const linesCount = fullLines.length;
      let addedVitality = linesCount * 20;
      let praiseText = '참 잘하셨어요!';

      if (linesCount >= 4) {
        praiseText = '대단해요! 4줄 테트리스 완성!';
        addedVitality = 100;
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } else if (linesCount >= 2) {
        praiseText = `${linesCount}줄을 한 번에 맞추셨네요!`;
        addedVitality = 50;
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      }

      showPraise(praiseText);
      if (settings.voiceCheer) {
        if (linesCount >= 2) speakPraise('multi');
        else speakPraise('clear');
      }

      setTimeout(() => {
        const clearedBoard = clearLinesFromBoard(newBoard, fullLines);
        setBoard(clearedBoard);
        setClearingLines([]);

        // Update stats
        setStats((prev) => {
          const newLines = prev.linesCleared + linesCount;
          const newCombo = prev.combos + 1;
          return {
            ...prev,
            linesCleared: newLines,
            score: prev.score + linesCount * 100 * prev.level,
            combos: newCombo,
            maxCombo: Math.max(prev.maxCombo, newCombo),
            vitalityScore: prev.vitalityScore + addedVitality,
          };
        });

        // Check Puzzle victory
        if (settings.mode === 'puzzle') {
          setPuzzleCleared((prev) => {
            const nextVal = prev + linesCount;
            if (nextVal >= puzzleTarget) {
              setIsVictory(true);
              setGameState('summary');
            }
            return nextVal;
          });
        }

        // Spawn next piece
        spawnNextPiece(clearedBoard);
      }, 350);
    } else {
      // Normal placement
      if (settings.soundEffects) soundManager.playDrop();
      setBoard(newBoard);
      setStats((prev) => ({
        ...prev,
        combos: 0,
        vitalityScore: prev.vitalityScore + 2,
        movesCount: prev.movesCount + 1,
      }));
      spawnNextPiece(newBoard);
    }
  }, [
    currentPiece,
    board,
    settings.soundEffects,
    settings.voiceCheer,
    settings.mode,
    puzzleTarget,
    saveUndoSnapshot,
  ]);

  // Spawn next piece
  const spawnNextPiece = useCallback(
    (checkBoard: Board) => {
      const cols = checkBoard[0].length;
      const nextPiece = nextPieces[0] || createRandomPiece(settings.mode, cols);
      const remaining = nextPieces.slice(1);
      remaining.push(createRandomPiece(settings.mode, cols));

      // Reset piece to top center
      const spawnX = Math.floor((cols - nextPiece.shape[0].length) / 2);
      const readyPiece: Piece = {
        ...nextPiece,
        x: spawnX,
        y: 0,
      };

      // Check if top collision = game over / round complete
      if (checkCollision(checkBoard, readyPiece, 0, 0)) {
        setIsVictory(false);
        setGameState('summary');
        return;
      }

      setCurrentPiece(readyPiece);
      setNextPieces(remaining);
      setCanHold(true);
      setHintMove(null);
    },
    [nextPieces, settings.mode]
  );

  // Movement actions
  const moveLeft = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    if (!checkCollision(board, currentPiece, -1, 0)) {
      setCurrentPiece((p) => p && { ...p, x: p.x - 1 });
      if (settings.soundEffects) soundManager.playMove();
    }
  }, [currentPiece, board, gameState, settings.soundEffects]);

  const moveRight = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    if (!checkCollision(board, currentPiece, 1, 0)) {
      setCurrentPiece((p) => p && { ...p, x: p.x + 1 });
      if (settings.soundEffects) soundManager.playMove();
    }
  }, [currentPiece, board, gameState, settings.soundEffects]);

  // Smooth rotation with wall kicks
  const rotate = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    const rotated = rotateMatrix(currentPiece.shape);

    // Wall kick offsets to try: 0, -1, +1, -2, +2
    const kicks = [0, -1, 1, -2, 2];
    for (const offset of kicks) {
      if (!checkCollision(board, currentPiece, offset, 0, rotated)) {
        setCurrentPiece((p) =>
          p
            ? {
                ...p,
                shape: rotated,
                x: p.x + offset,
              }
            : null
        );
        if (settings.soundEffects) soundManager.playRotate();
        return;
      }
    }
  }, [currentPiece, board, gameState, settings.soundEffects]);

  // Soft drop
  const softDrop = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    if (!checkCollision(board, currentPiece, 0, 1)) {
      setCurrentPiece((p) => p && { ...p, y: p.y + 1 });
    } else {
      lockPiece();
    }
  }, [currentPiece, board, gameState, lockPiece]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    const targetY = calculateGhostY(board, currentPiece);
    setCurrentPiece((p) => p && { ...p, y: targetY });
    // Immediate lock
    setTimeout(() => {
      lockPiece();
    }, 40);
  }, [currentPiece, board, gameState, lockPiece]);

  // Hold piece
  const handleHold = useCallback(() => {
    if (!currentPiece || !canHold || gameState !== 'playing') return;
    const cols = board[0].length;
    const toHold = { ...currentPiece, x: 0, y: 0 };

    if (holdPiece) {
      const swappedPiece: Piece = {
        ...holdPiece,
        x: Math.floor((cols - holdPiece.shape[0].length) / 2),
        y: 0,
      };
      setHoldPiece(toHold);
      setCurrentPiece(swappedPiece);
    } else {
      setHoldPiece(toHold);
      const nextOne = nextPieces[0];
      const remaining = nextPieces.slice(1);
      remaining.push(createRandomPiece(settings.mode, cols));
      setCurrentPiece({
        ...nextOne,
        x: Math.floor((cols - nextOne.shape[0].length) / 2),
        y: 0,
      });
      setNextPieces(remaining);
    }
    setCanHold(false);
    if (settings.soundEffects) soundManager.playHold();
  }, [currentPiece, canHold, gameState, board, holdPiece, nextPieces, settings.mode, settings.soundEffects]);

  // AI Hint
  const handleHint = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    const best = findBestMove(board, currentPiece);
    if (best) {
      setHintMove(best);
      // Auto-orient piece to best rotation and column for easy placement!
      let targetShape = currentPiece.shape;
      for (let i = 0; i < best.rotation; i++) {
        targetShape = rotateMatrix(targetShape);
      }
      setCurrentPiece((p) =>
        p
          ? {
              ...p,
              shape: targetShape,
              x: Math.max(0, Math.min(board[0].length - targetShape[0].length, best.x)),
            }
          : null
      );
      if (settings.soundEffects) soundManager.playHint();
      showPraise(best.description);
      setStats((s) => ({ ...s, hintsUsed: s.hintsUsed + 1 }));
    }
  }, [currentPiece, gameState, board, settings.soundEffects]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') {
        if (e.key === ' ' || e.key === 'Enter') {
          if (gameState === 'title') startGame('gentle');
          else if (gameState === 'paused') setGameState('playing');
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotate();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          softDrop();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'z':
        case 'Z':
        case 'Backspace':
          e.preventDefault();
          handleUndo();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          handleHint();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          handleHold();
          break;
        case 'Escape':
        case 'p':
        case 'P':
          e.preventDefault();
          setGameState('paused');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    moveLeft,
    moveRight,
    rotate,
    softDrop,
    hardDrop,
    handleUndo,
    handleHint,
    handleHold,
    startGame,
  ]);

  // Gentle Tick Drop Loop
  useEffect(() => {
    if (gameState !== 'playing' || !settings.autoDrop) {
      if (dropTimerRef.current) clearInterval(dropTimerRef.current);
      return;
    }

    // Senior gentle speeds:
    // Speed 1 (Turtle): 1800ms in gentle, 1200ms in silver
    // Speed 2 (Normal): 1300ms in gentle, 900ms in silver
    // Speed 3 (Lively): 900ms in gentle, 650ms in silver
    const baseDelay = settings.mode === 'gentle' ? 1800 : 1200;
    const speedFactor = settings.dropSpeed === 1 ? 1 : settings.dropSpeed === 2 ? 0.75 : 0.55;
    const tickInterval = Math.max(500, Math.floor(baseDelay * speedFactor));

    dropTimerRef.current = window.setInterval(() => {
      if (currentPiece && !checkCollision(board, currentPiece, 0, 1)) {
        setCurrentPiece((p) => p && { ...p, y: p.y + 1 });
      } else {
        lockPiece();
      }
    }, tickInterval);

    return () => {
      if (dropTimerRef.current) clearInterval(dropTimerRef.current);
    };
  }, [
    gameState,
    settings.autoDrop,
    settings.mode,
    settings.dropSpeed,
    currentPiece,
    board,
    lockPiece,
  ]);

  const currentTheme = THEMES[settings.theme];
  const ghostY = currentPiece ? calculateGhostY(board, currentPiece) : 0;

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-between overflow-x-hidden ${currentTheme.bg}`}>
      {/* 1. Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          settings={settings}
          onUpdateSettings={updateSettings}
          onStartGame={startGame}
        />
      )}

      {/* 2. Main Playing Screen */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="w-full min-h-screen flex flex-col items-center justify-between p-2 sm:p-4 max-w-5xl mx-auto">
          {/* Top Status Header */}
          <GameHeader
            mode={settings.mode}
            stats={stats}
            settings={settings}
            onPause={() => setGameState('paused')}
            onHome={() => setGameState('title')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUpdateSettings={updateSettings}
          />

          {/* Central Play Area: Board & Side Panels */}
          <main className="w-full flex-1 flex flex-col md:flex-row items-center justify-center gap-4 my-auto py-2">
            {/* Left side preview (Desktop) or top (Mobile) */}
            <div className="order-2 md:order-1 flex md:flex-col items-center justify-center">
              <SidePanels
                mode={settings.mode}
                nextPieces={nextPieces}
                holdPiece={holdPiece}
                settings={settings}
                puzzleTarget={puzzleTarget}
                puzzleCleared={puzzleCleared}
              />
            </div>

            {/* Central Board */}
            <div className="order-1 md:order-2 flex flex-col items-center">
              <GameBoard
                board={board}
                currentPiece={currentPiece}
                ghostY={ghostY}
                hintMove={hintMove}
                settings={settings}
                clearingLines={clearingLines}
                praiseMessage={praiseMessage}
                onRotate={rotate}
                onMoveLeft={moveLeft}
                onMoveRight={moveRight}
                onSoftDrop={softDrop}
              />
            </div>
          </main>

          {/* Bottom Tactile Game Controls */}
          <footer className="w-full flex flex-col items-center pb-2">
            <GameControls
              settings={settings}
              canUndo={undoStackRef.current.length > 0}
              canHold={canHold}
              onMoveLeft={moveLeft}
              onMoveRight={moveRight}
              onRotate={rotate}
              onSoftDrop={softDrop}
              onHardDrop={hardDrop}
              onUndo={handleUndo}
              onHint={handleHint}
              onHold={handleHold}
            />
          </footer>
        </div>
      )}

      {/* 3. Pause Modal with Breathing Exercise */}
      {gameState === 'paused' && (
        <PauseModal
          settings={settings}
          onResume={() => setGameState('playing')}
          onRestart={() => startGame(settings.mode)}
          onHome={() => setGameState('title')}
        />
      )}

      {/* 4. Brain Health Report Modal (Victory / Round Completed) */}
      {gameState === 'summary' && (
        <BrainReportModal
          stats={stats}
          settings={settings}
          mode={settings.mode}
          isVictory={isVictory}
          onRestart={() => startGame(settings.mode)}
          onHome={() => setGameState('title')}
        />
      )}

      {/* 5. Senior Accessibility Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
