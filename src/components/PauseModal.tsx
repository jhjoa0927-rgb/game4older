/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Home, Wind, Smile } from 'lucide-react';
import { GameSettings } from '../types/tetris';
import { THEMES } from '../utils/tetrisLogic';

interface PauseModalProps {
  settings: GameSettings;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  settings,
  onResume,
  onRestart,
  onHome,
}) => {
  const theme = THEMES[settings.theme];
  const isContrast = settings.theme === 'contrast';

  // 6-second breathing rhythm (3s inhale, 3s exhale)
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border-4 text-center ${
          isContrast
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-white border-amber-300 text-stone-900'
        }`}
      >
        <div className="inline-flex p-3 rounded-2xl bg-blue-100 text-blue-700 mb-3">
          <Smile className="w-8 h-8" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black mb-1">잠시 쉬어가기</h2>
        <p className="text-sm font-semibold text-stone-600 mb-4">
          여유를 가지고 깊게 숨을 쉬어보세요.
        </p>

        {/* Relaxing Breathing Exercise Circle */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`absolute rounded-full transition-all duration-3000 ease-in-out ${
                phase === 'inhale'
                  ? 'w-28 h-28 bg-emerald-400/30 scale-110'
                  : 'w-16 h-16 bg-blue-400/20 scale-90'
              }`}
            />
            <div
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white font-black text-sm shadow-md transition-colors duration-1000 ${
                phase === 'inhale' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              <Wind className="w-5 h-5 mb-0.5" />
              <span>{phase === 'inhale' ? '들이쉬고' : '내쉬고'}</span>
            </div>
          </div>
          <span className="text-xs font-bold text-stone-500 mt-2">
            3초간 천천히 숨을 마시고 편안히 내쉽니다
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-5">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-lg shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            <span>이어서 계속하기</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRestart}
              className="py-3 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm border border-stone-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-stone-600" />
              <span>처음부터 다시</span>
            </button>

            <button
              onClick={onHome}
              className="py-3 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm border border-stone-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Home className="w-4 h-4 text-stone-600" />
              <span>메인 메뉴로</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
