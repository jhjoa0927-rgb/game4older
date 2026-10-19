/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameMode, GameSettings, GameStats } from '../types/tetris';
import { THEMES } from '../utils/tetrisLogic';
import { Pause, Home, Volume2, VolumeX, Sparkles, Brain, Award, Settings } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameHeaderProps {
  mode: GameMode;
  stats: GameStats;
  settings: GameSettings;
  onPause: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  mode,
  stats,
  settings,
  onPause,
  onHome,
  onOpenSettings,
  onUpdateSettings,
}) => {
  const theme = THEMES[settings.theme];
  const isContrast = settings.theme === 'contrast';

  const modeLabel =
    mode === 'gentle' ? '🌸 두뇌 쉼터' : mode === 'silver' ? '🌿 실버 활력' : '💡 미션 퍼즐';

  return (
    <header className="w-full max-w-4xl flex items-center justify-between gap-2 px-2 py-1.5 select-none z-10">
      {/* Left: Home & Pause */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onHome}
          className={`p-2.5 rounded-2xl font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            isContrast
              ? 'bg-neutral-800 hover:bg-neutral-700 text-yellow-300 border border-yellow-400'
              : 'bg-white hover:bg-stone-100 text-stone-850 border border-stone-200'
          }`}
          title="처음 화면으로"
        >
          <Home className="w-5 h-5 text-amber-600" />
          <span className="text-xs md:text-sm font-extrabold hidden sm:inline">처음으로</span>
        </button>

        <button
          onClick={onPause}
          className={`p-2.5 rounded-2xl font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            isContrast
              ? 'bg-neutral-800 hover:bg-neutral-700 text-yellow-300 border border-yellow-400'
              : 'bg-white hover:bg-stone-100 text-stone-850 border border-stone-200'
          }`}
          title="잠시 멈춤"
        >
          <Pause className="w-5 h-5 text-blue-600" />
          <span className="text-xs md:text-sm font-extrabold hidden sm:inline">쉬어가기</span>
        </button>

        <span className="hidden md:inline-flex px-3 py-1 rounded-xl text-xs font-black bg-amber-500/15 text-amber-900 border border-amber-300">
          {modeLabel}
        </span>
      </div>

      {/* Center: Vitality & Lines Status Gauge */}
      <div className="flex items-center gap-2 md:gap-4 bg-white/90 backdrop-blur-md px-3 md:px-5 py-1.5 rounded-2xl shadow border border-stone-200">
        {/* Cleared Lines Count */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] md:text-xs font-bold text-stone-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            완성 줄
          </span>
          <span className="text-lg md:text-2xl font-black text-amber-900 tabular-nums">
            {stats.linesCleared}줄
          </span>
        </div>

        <div className="w-[1px] h-7 bg-stone-200" />

        {/* Brain Vitality Index (두뇌 활력도) */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] md:text-xs font-bold text-emerald-800 flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-emerald-700" />
            두뇌 활력
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg md:text-2xl font-black text-emerald-800 tabular-nums">
              {stats.vitalityScore}
            </span>
            <span className="text-xs font-bold text-emerald-700">점</span>
          </div>
        </div>

        {/* Combos if active */}
        {stats.combos > 1 && (
          <>
            <div className="w-[1px] h-7 bg-stone-200" />
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-[10px] font-bold text-rose-700">연속 완성</span>
              <span className="text-base md:text-xl font-black text-rose-700">
                {stats.combos}연속!
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right: Sound & Settings buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            const next = !settings.soundEffects;
            onUpdateSettings({ soundEffects: next });
            if (next) soundManager.playRotate();
          }}
          className={`p-2.5 rounded-2xl transition-colors shadow-sm ${
            settings.soundEffects ? 'bg-amber-100 text-amber-900' : 'bg-stone-200 text-stone-400'
          }`}
          title="효과음"
        >
          {settings.soundEffects ? <Volume2 className="w-5 h-5 text-amber-800" /> : <VolumeX className="w-5 h-5 text-stone-700" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-sm transition-colors"
          title="설정 및 글자 크기"
        >
          <Settings className="w-5 h-5 text-stone-700" />
        </button>
      </div>
    </header>
  );
};
