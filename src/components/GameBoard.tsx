/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Board, Piece, GameSettings, BestMove } from '../types/tetris';
import { THEMES, calculateGhostY } from '../utils/tetrisLogic';

interface GameBoardProps {
  board: Board;
  currentPiece: Piece | null;
  ghostY: number;
  hintMove: BestMove | null;
  settings: GameSettings;
  clearingLines: number[];
  praiseMessage: string | null;
  onRotate: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPiece,
  ghostY,
  hintMove,
  settings,
  clearingLines,
  praiseMessage,
  onRotate,
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
}) => {
  const theme = THEMES[settings.theme];
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const rows = board.length;
  const cols = board[0].length;

  // Touch gesture support on the board
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    // Tap to rotate
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 280) {
      onRotate();
      touchStartRef.current = null;
      return;
    }

    // Swipe horizontal
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 25) {
      if (dx > 0) onMoveRight();
      else onMoveLeft();
    } else if (dy > 30) {
      // Swipe down
      onSoftDrop();
    }
    touchStartRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative flex items-center justify-center p-2 rounded-3xl shadow-2xl border-4 ${
        settings.theme === 'contrast'
          ? 'border-yellow-400 bg-neutral-950'
          : settings.theme === 'forest'
          ? 'border-emerald-600 bg-emerald-950'
          : 'border-amber-400 bg-stone-900'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Praise Floating Banner Overlay */}
      {praiseMessage && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-bounce">
          <div className="px-6 py-3 rounded-2xl bg-amber-400 text-stone-950 font-black text-xl md:text-2xl shadow-2xl border-4 border-white flex items-center gap-2 whitespace-nowrap">
            <span>✨</span>
            <span>{praiseMessage}</span>
            <span>✨</span>
          </div>
        </div>
      )}

      {/* Grid Table */}
      <div
        className="grid gap-1 relative overflow-hidden rounded-2xl"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          width: 'clamp(260px, 42vw, 360px)',
          height: 'clamp(380px, 60vh, 560px)',
        }}
      >
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const isClearing = clearingLines.includes(rIdx);

            // Check if part of active falling piece
            let pieceCell = null;
            if (
              currentPiece &&
              rIdx >= currentPiece.y &&
              rIdx < currentPiece.y + currentPiece.shape.length &&
              cIdx >= currentPiece.x &&
              cIdx < currentPiece.x + currentPiece.shape[0].length
            ) {
              const py = rIdx - currentPiece.y;
              const px = cIdx - currentPiece.x;
              if (currentPiece.shape[py] && currentPiece.shape[py][px]) {
                pieceCell = currentPiece;
              }
            }

            // Check if part of ghost piece
            let isGhost = false;
            if (
              settings.showGhost &&
              !pieceCell &&
              currentPiece &&
              rIdx >= ghostY &&
              rIdx < ghostY + currentPiece.shape.length &&
              cIdx >= currentPiece.x &&
              cIdx < currentPiece.x + currentPiece.shape[0].length
            ) {
              const gy = rIdx - ghostY;
              const gx = cIdx - currentPiece.x;
              if (currentPiece.shape[gy] && currentPiece.shape[gy][gx]) {
                isGhost = true;
              }
            }

            // Check if part of AI Hint recommendation
            let isHint = false;
            // (Hint move outline rendering)

            // Cell rendering logic
            if (isClearing) {
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-full h-full rounded-md bg-yellow-300 border-2 border-white shadow-inner animate-pulse flex items-center justify-center font-bold text-stone-900"
                >
                  ⭐
                </div>
              );
            }

            if (pieceCell) {
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-full h-full rounded-lg shadow-md border-2 flex items-center justify-center select-none transform transition-transform"
                  style={{
                    backgroundColor: pieceCell.color,
                    borderColor: '#ffffff',
                    boxShadow: 'inset 2px 2px 0px rgba(255,255,255,0.6), inset -2px -2px 0px rgba(0,0,0,0.3)',
                  }}
                >
                  {settings.showSymbols && (
                    <span className="text-base sm:text-lg select-none filter drop-shadow">
                      {pieceCell.symbol}
                    </span>
                  )}
                </div>
              );
            }

            if (isGhost) {
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-full h-full rounded-lg border-2 border-dashed flex items-center justify-center bg-white/10"
                  style={{
                    borderColor: currentPiece?.color || '#ffffff',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentPiece?.color || '#ffffff' }}
                  />
                </div>
              );
            }

            if (cell) {
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-full h-full rounded-lg shadow-md border-2 flex items-center justify-center select-none"
                  style={{
                    backgroundColor: cell.color,
                    borderColor: cell.borderColor,
                    boxShadow: 'inset 2px 2px 0px rgba(255,255,255,0.4), inset -2px -2px 0px rgba(0,0,0,0.3)',
                  }}
                >
                  {settings.showSymbols && (
                    <span className="text-base sm:text-lg select-none filter drop-shadow">
                      {cell.symbol}
                    </span>
                  )}
                </div>
              );
            }

            // Empty cell background
            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`w-full h-full rounded-md border transition-colors ${
                  settings.theme === 'contrast'
                    ? 'border-yellow-400/25 bg-black/40'
                    : 'border-white/5 bg-stone-800/40'
                }`}
              />
            );
          })
        )}
      </div>

      {/* AI Hint Notification Badge */}
      {hintMove && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-amber-400 text-stone-950 text-xs font-black rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 animate-pulse">
          <span>💡</span>
          <span>{hintMove.description}</span>
        </div>
      )}
    </div>
  );
};
