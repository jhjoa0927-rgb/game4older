/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Piece, GameSettings, GameMode } from '../types/tetris';
import { THEMES } from '../utils/tetrisLogic';
import { Package, Sparkles, Target } from 'lucide-react';

interface SidePanelsProps {
  mode: GameMode;
  nextPieces: Piece[];
  holdPiece: Piece | null;
  settings: GameSettings;
  puzzleTarget?: number;
  puzzleCleared?: number;
}

export const SidePanels: React.FC<SidePanelsProps> = ({
  mode,
  nextPieces,
  holdPiece,
  settings,
  puzzleTarget,
  puzzleCleared,
}) => {
  const theme = THEMES[settings.theme];
  const isContrast = settings.theme === 'contrast';
  const nextPiece = nextPieces[0];

  const renderMiniPiece = (piece: Piece | null, label: string) => {
    if (!piece) {
      return (
        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center text-xs font-bold text-stone-500">
          비어있음
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <div
          className="grid gap-0.5 p-1.5 rounded-xl bg-stone-900/10 border border-stone-300"
          style={{
            gridTemplateColumns: `repeat(${piece.shape[0].length}, 18px)`,
            gridTemplateRows: `repeat(${piece.shape.length}, 18px)`,
          }}
        >
          {piece.shape.map((row, r) =>
            row.map((val, c) => {
              if (!val) {
                return <div key={`${r}-${c}`} className="w-[18px] h-[18px]" />;
              }
              return (
                <div
                  key={`${r}-${c}`}
                  className="w-[18px] h-[18px] rounded flex items-center justify-center shadow-xs"
                  style={{
                    backgroundColor: piece.color,
                    border: '1px solid #ffffff',
                  }}
                >
                  {settings.showSymbols && (
                    <span className="text-[10px] select-none">{piece.symbol}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
        <span className="text-xs font-black text-stone-850 mt-1.5 text-center">
          {piece.name}
        </span>
      </div>
    );
  };

  return (
    <div className="flex md:flex-col gap-2.5 justify-center items-center w-full md:w-40 select-none">
      {/* Puzzle Objective Card (If Puzzle Mode) */}
      {mode === 'puzzle' && (
        <div
          className={`w-full p-2.5 rounded-2xl shadow-sm border ${
            isContrast
              ? 'bg-neutral-900 border-yellow-400 text-yellow-300'
              : 'bg-purple-50 border-purple-200 text-purple-950'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-black mb-1">
            <Target className="w-4 h-4 text-purple-600" />
            <span>퍼즐 클리어 목표</span>
          </div>
          <div className="text-xs text-stone-600">
            완성한 줄:{' '}
            <strong className="text-purple-700 text-sm">
              {puzzleCleared || 0} / {puzzleTarget || 2}줄
            </strong>
          </div>
        </div>
      )}

      {/* Next Piece Card */}
      <div
        className={`w-full p-3 rounded-2xl shadow-sm border flex flex-col items-center ${
          isContrast
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-white/90 border-stone-200 text-stone-800'
        }`}
      >
        <span className="text-xs font-extrabold text-stone-700 mb-2 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          다음에 올 블록
        </span>
        {renderMiniPiece(nextPiece, '다음 블록')}
      </div>

      {/* Hold Piece Card */}
      <div
        className={`w-full p-3 rounded-2xl shadow-sm border flex flex-col items-center ${
          isContrast
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-white/90 border-stone-200 text-stone-800'
        }`}
      >
        <span className="text-xs font-extrabold text-stone-700 mb-2 flex items-center gap-1">
          <Package className="w-3.5 h-3.5 text-emerald-700" />
          보관 중인 블록
        </span>
        {renderMiniPiece(holdPiece, '보관 블록')}
        <span className="text-[10px] text-stone-600 mt-1">C키 또는 보관 터치</span>
      </div>
    </div>
  );
};
