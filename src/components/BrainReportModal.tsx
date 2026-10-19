/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { GameStats, GameSettings, GameMode } from '../types/tetris';
import { THEMES } from '../utils/tetrisLogic';
import { Trophy, Award, Heart, RotateCcw, Home, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager, speakPraise } from '../utils/audio';

interface BrainReportModalProps {
  stats: GameStats;
  settings: GameSettings;
  mode: GameMode;
  isVictory: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export const BrainReportModal: React.FC<BrainReportModalProps> = ({
  stats,
  settings,
  mode,
  isVictory,
  onRestart,
  onHome,
}) => {
  const theme = THEMES[settings.theme];
  const isContrast = settings.theme === 'contrast';

  const durationSec = Math.max(1, Math.floor((Date.now() - stats.startTime) / 1000));
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    if (settings.soundEffects) {
      soundManager.playVictory();
    }

    if (settings.voiceCheer) {
      const msg = isVictory
        ? '축하합니다 어르신! 멋지게 목표를 달성하셨습니다!'
        : '정말 수고 많으셨습니다! 두뇌 활력이 크게 향상되었어요.';
      speakPraise('custom', msg);
    }
  }, [isVictory, settings.soundEffects, settings.voiceCheer]);

  // Determine encouragement badge
  let badgeName = '청춘 두뇌 활력상';
  if (stats.linesCleared >= 10) badgeName = '백발백중 집중력 왕';
  else if (stats.vitalityScore > 200) badgeName = '명품 두뇌 해결사';
  else if (isVictory) badgeName = '인지 미션 마스터';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-lg p-6 rounded-3xl shadow-2xl border-4 text-center ${
          isContrast
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-white border-amber-300 text-stone-900'
        }`}
      >
        {/* Celebration Trophy Icon */}
        <div className="inline-flex p-3.5 rounded-3xl bg-amber-400 text-stone-950 shadow-lg border-2 border-white mb-2">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black mb-1">
          {isVictory ? '축하합니다! 미션 완성!' : '오늘의 두뇌 운동 완료!'}
        </h2>
        <p className="text-sm font-bold text-amber-700 mb-4">
          머리가 한층 더 맑아지고 기억력이 활성화되었습니다.
        </p>

        {/* Honor Badge Ribbon */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-sm mb-4 shadow-xs">
          <Award className="w-5 h-5 text-amber-600" />
          <span>{badgeName}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-3">
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center">
            <span className="text-xs font-bold text-stone-500 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5" /> 운동 시간
            </span>
            <span className="text-lg md:text-xl font-black text-stone-800">
              {minutes > 0 ? `${minutes}분 ` : ''}{seconds}초
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> 완성한 줄
            </span>
            <span className="text-lg md:text-xl font-black text-amber-900">
              {stats.linesCleared}줄
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 두뇌 활력 점수
            </span>
            <span className="text-lg md:text-xl font-black text-emerald-900">
              {stats.vitalityScore}점
            </span>
          </div>
        </div>

        {/* Dementia Prevention Encouragement Note */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 text-left my-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>어르신을 위한 건강 응원 메시지</span>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed font-medium">
            블록의 방향을 돌리고 빈자리를 맞추는 활동은 뇌의 두정엽과 전두엽을 동시에 자극합니다.
            매일 10분씩 꾸준히 하시면 집중력과 일상 기억력 유지에 큰 도움이 됩니다!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={onRestart}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-base shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>한 판 더 하기</span>
          </button>

          <button
            onClick={onHome}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-base border border-stone-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-5 h-5 text-stone-600" />
            <span>메인 메뉴로</span>
          </button>
        </div>
      </div>
    </div>
  );
};
