/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings } from '../types/tetris';
import { ArrowLeft, ArrowRight, RotateCw, ArrowDown, ChevronsDown, Lightbulb, Undo2, Package } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameControlsProps {
  settings: GameSettings;
  canUndo: boolean;
  canHold: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onUndo: () => void;
  onHint: () => void;
  onHold: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  settings,
  canUndo,
  canHold,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onUndo,
  onHint,
  onHold,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  const handleAction = (fn: () => void, soundFn?: () => void) => {
    triggerHaptic();
    if (soundFn && settings.soundEffects) soundFn();
    fn();
  };

  const isContrast = settings.theme === 'contrast';

  return (
    <div className="w-full max-w-md flex flex-col gap-2.5 mt-2 select-none">
      {/* Top Helper Tools Row: Hint, Undo, Hold */}
      <div className="grid grid-cols-3 gap-2">
        {/* AI Hint */}
        <button
          onClick={() => handleAction(onHint, soundManager.playHint)}
          className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl font-black text-sm md:text-base shadow transition-all active:scale-95 ${
            isContrast
              ? 'bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-white'
              : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300'
          }`}
          title="추천 착수 위치 확인 (단축키 H)"
        >
          <Lightbulb className="w-5 h-5 text-amber-600 fill-amber-500" />
          <span>추천 힌트</span>
        </button>

        {/* Undo */}
        <button
          onClick={() => handleAction(onUndo, soundManager.playUndo)}
          disabled={!canUndo}
          className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl font-black text-sm md:text-base shadow transition-all active:scale-95 ${
            !canUndo
              ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500'
              : isContrast
              ? 'bg-white hover:bg-stone-200 text-black border-2 border-yellow-400'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-2 border-stone-300'
          }`}
          title="이전 상태로 되돌리기 (단축키 Z)"
        >
          <Undo2 className="w-5 h-5 text-blue-600" />
          <span>한 수 무르기</span>
        </button>

        {/* Hold */}
        <button
          onClick={() => handleAction(onHold, soundManager.playHold)}
          disabled={!canHold}
          className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl font-black text-sm md:text-base shadow transition-all active:scale-95 ${
            !canHold
              ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500'
              : isContrast
              ? 'bg-neutral-800 hover:bg-neutral-700 text-yellow-300 border-2 border-yellow-400'
              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-2 border-emerald-300'
          }`}
          title="지금 블록을 나중에 쓰기 위해 보관 (단축키 C)"
        >
          <Package className="w-5 h-5 text-emerald-600" />
          <span>블록 보관</span>
        </button>
      </div>

      {/* Direction & Rotation Cluster */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleAction(onMoveLeft, soundManager.playMove)}
          className={`flex flex-col items-center justify-center py-4 rounded-2xl font-black text-lg md:text-xl shadow-md transition-all active:scale-95 border-b-4 ${
            isContrast
              ? 'bg-neutral-900 hover:bg-neutral-800 text-yellow-300 border-yellow-400 active:border-b-0'
              : 'bg-white hover:bg-stone-50 text-stone-900 border-stone-300 active:border-b-0'
          }`}
        >
          <ArrowLeft className="w-7 h-7 text-amber-600 stroke-[3]" />
          <span className="text-sm font-bold mt-1">왼쪽</span>
        </button>

        <button
          onClick={() => handleAction(onRotate, soundManager.playRotate)}
          className={`flex flex-col items-center justify-center py-4 rounded-2xl font-black text-lg md:text-xl shadow-md transition-all active:scale-95 border-b-4 ${
            isContrast
              ? 'bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-500 active:border-b-0'
              : 'bg-amber-400 hover:bg-amber-500 text-stone-950 border-amber-600 active:border-b-0'
          }`}
        >
          <RotateCw className="w-7 h-7 stroke-[3]" />
          <span className="text-sm font-black mt-1">돌리기</span>
        </button>

        <button
          onClick={() => handleAction(onMoveRight, soundManager.playMove)}
          className={`flex flex-col items-center justify-center py-4 rounded-2xl font-black text-lg md:text-xl shadow-md transition-all active:scale-95 border-b-4 ${
            isContrast
              ? 'bg-neutral-900 hover:bg-neutral-800 text-yellow-300 border-yellow-400 active:border-b-0'
              : 'bg-white hover:bg-stone-50 text-stone-900 border-stone-300 active:border-b-0'
          }`}
        >
          <ArrowRight className="w-7 h-7 text-amber-600 stroke-[3]" />
          <span className="text-sm font-bold mt-1">오른쪽</span>
        </button>
      </div>

      {/* Drop Cluster: Soft Drop & Hard Drop */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleAction(onSoftDrop, soundManager.playMove)}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-base md:text-lg shadow transition-all active:scale-95 ${
            isContrast
              ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-stone-500'
              : 'bg-stone-200 hover:bg-stone-300 text-stone-900 border border-stone-300'
          }`}
        >
          <ArrowDown className="w-6 h-6 text-stone-700 stroke-[2.5]" />
          <span>천천히 내리기</span>
        </button>

        <button
          onClick={() => handleAction(onHardDrop, soundManager.playDrop)}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-base md:text-lg shadow-md transition-all active:scale-95 ${
            isContrast
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
          }`}
        >
          <ChevronsDown className="w-6 h-6 stroke-[3]" />
          <span>바로 놓기</span>
        </button>
      </div>
    </div>
  );
};
