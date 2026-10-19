/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings } from '../types/tetris';
import { THEMES } from '../utils/tetrisLogic';
import { X, Volume2, Sparkles, Eye, ShieldCheck, Play } from 'lucide-react';
import { soundManager, speakPraise } from '../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const isContrast = settings.theme === 'contrast';

  const testVoice = () => {
    speakPraise('custom', '어르신, 오늘도 활기차고 건강한 하루 되세요!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-lg p-6 rounded-3xl shadow-2xl border-4 ${
          isContrast
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-white border-amber-300 text-stone-900'
        } max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-xl md:text-2xl font-black">어르신 편의 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-left">
          {/* 1. Drop Speed */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <label className="block text-sm font-black text-stone-900 mb-2">
              🐢 블록 떨어지는 속도
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1, label: '🐢 아주 느림', desc: '생각하며 천천히' },
                { val: 2, label: '🚶 보통 편안', desc: '부담 없는 리듬' },
                { val: 3, label: '🏃 가벼움', desc: '조금 더 빠른 반응' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    onUpdateSettings({ dropSpeed: item.val });
                    if (settings.soundEffects) soundManager.playMove();
                  }}
                  className={`p-2 rounded-xl text-center font-bold text-xs md:text-sm border transition-all ${
                    settings.dropSpeed === item.val
                      ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <div className="font-black">{item.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Themes */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <label className="block text-sm font-black text-stone-900 mb-2">
              🎨 화면 색상 테마
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'warm', name: '따스한 온돌방', desc: '포근한 황토색' },
                { key: 'contrast', name: '선명 고대비', desc: '눈이 침침할 때' },
                { key: 'forest', name: '싱그러운 숲길', desc: '눈이 편한 초록' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onUpdateSettings({ theme: item.key as any });
                    if (settings.soundEffects) soundManager.playMove();
                  }}
                  className={`p-2 rounded-xl text-center font-bold text-xs md:text-sm border transition-all ${
                    settings.theme === item.key
                      ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <div className="font-black">{item.name}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Block Symbols & Ghost Guides */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-stone-900">
                  🌸 블록 안 기호 문양 표시
                </div>
                <div className="text-xs text-stone-500">
                  꽃·별·네잎클로버 등 모양으로 블록을 쉽게 구별해요
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ showSymbols: !settings.showSymbols })}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  settings.showSymbols ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.showSymbols ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-2.5">
              <div>
                <div className="text-sm font-black text-stone-900">
                  🎯 착수 점선 그림자 안내
                </div>
                <div className="text-xs text-stone-500">
                  블록이 떨어질 바닥 위치를 점선으로 미리 보여줍니다
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ showGhost: !settings.showGhost })}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  settings.showGhost ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.showGhost ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 4. Audio Toggles: TTS & BGM */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                  <span>🗣️ 친절한 한국어 음성 칭찬</span>
                </div>
                <div className="text-xs text-stone-500">
                  줄을 맞출 때 따뜻한 목소리로 칭찬해 드립니다
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={testVoice}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-amber-900" />
                  미리듣기
                </button>
                <button
                  onClick={() => onUpdateSettings({ voiceCheer: !settings.voiceCheer })}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    settings.voiceCheer ? 'bg-amber-500' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.voiceCheer ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-2.5">
              <div>
                <div className="text-sm font-black text-stone-900">
                  🎵 마음이 편안해지는 배경음악
                </div>
                <div className="text-xs text-stone-500">
                  잔잔하고 포근한 실버 힐링 멜로디
                </div>
              </div>
              <button
                onClick={() => {
                  const active = soundManager.toggleBgm();
                  onUpdateSettings({ bgm: active });
                }}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  settings.bgm ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.bgm ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-base shadow-md transition-all active:scale-95"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};
