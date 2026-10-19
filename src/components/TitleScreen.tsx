import React from 'react';
import { GameMode, GameSettings } from '../types/tetris';
import { THEMES, SENIOR_BRAIN_TIPS } from '../utils/tetrisLogic';
import { Play, Sparkles, Volume2, VolumeX, Eye, HelpCircle, Heart, Zap, Award } from 'lucide-react';
import { soundManager, speakPraise } from '../utils/audio';

interface TitleScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onStartGame: (mode: GameMode) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  settings,
  onUpdateSettings,
  onStartGame,
}) => {
  const theme = THEMES[settings.theme];
  const [tipIndex, setTipIndex] = React.useState(0);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % SENIOR_BRAIN_TIPS.length);
    if (settings.soundEffects) soundManager.playMove();
  };

  const handleModeSelect = (mode: GameMode) => {
    if (settings.soundEffects) soundManager.playRotate();
    if (settings.voiceCheer) {
      if (mode === 'gentle') speakPraise('custom', '편안한 두뇌 쉼터를 시작합니다. 천천히 즐겨보세요.');
      else if (mode === 'silver') speakPraise('custom', '실버 활력 테트리스를 시작합니다. 화이팅!');
      else speakPraise('custom', '인지 미션 퍼즐을 시작합니다. 목표를 완성해보세요.');
    }
    onStartGame(mode);
  };

  const testVoice = () => {
    speakPraise('custom', '반갑습니다 어르신! 오늘 함께 신나게 두뇌 운동해볼까요?');
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-between p-4 md:p-8 select-none transition-colors duration-300 ${theme.bg}`}>
      {/* Background Decorative Ambient Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-amber-300 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-orange-300 blur-3xl" />
      </div>

      {/* Top Accessibility & Quick Controls Toolbar */}
      <header className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-amber-500/20 text-amber-900 border border-amber-400/40">
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            어르신 인지 케어 맞춤 게임
          </span>
        </div>

        {/* Quick settings: Font size, Sound, Theme */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-stone-200">
          <button
            onClick={() => {
              const nextTheme = settings.theme === 'warm' ? 'contrast' : settings.theme === 'contrast' ? 'forest' : 'warm';
              onUpdateSettings({ theme: nextTheme });
              if (settings.soundEffects) soundManager.playMove();
            }}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            title="화면 색상 테마 변경"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>{theme.name}</span>
          </button>

          <button
            onClick={() => {
              const active = soundManager.toggleBgm();
              onUpdateSettings({ bgm: active });
            }}
            className={`p-2 rounded-xl transition-colors ${
              settings.bgm ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400'
            }`}
            title="배경 음악 켜기/끄기"
          >
            <span className="text-xs font-bold">{settings.bgm ? '🎵 음악 켬' : '🎵 음악 끔'}</span>
          </button>

          <button
            onClick={() => {
              const next = !settings.voiceCheer;
              onUpdateSettings({ voiceCheer: next });
              if (next) testVoice();
            }}
            className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${
              settings.voiceCheer ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400'
            }`}
            title="음성 칭찬 켜기/끄기"
          >
            {settings.voiceCheer ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            <span className="text-xs font-bold">음성 칭찬</span>
          </button>
        </div>
      </header>

      {/* Main Title Lockup */}
      <main className="w-full max-w-4xl flex flex-col items-center text-center my-auto py-6 z-10">
        {/* Bespoke Title SVG Emblem */}
        <div className="mb-4 relative">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-3xl shadow-lg border-4 border-white mb-3">
            <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 100 100" fill="none">
              {/* Stylized Tetris pieces forming a smiling heart-brain */}
              <rect x="15" y="45" width="20" height="20" rx="4" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" />
              <rect x="35" y="45" width="20" height="20" rx="4" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" />
              <rect x="55" y="45" width="20" height="20" rx="4" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
              <rect x="75" y="45" width="20" height="20" rx="4" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
              
              <rect x="35" y="25" width="20" height="20" rx="4" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
              <rect x="55" y="25" width="20" height="20" rx="4" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />

              <rect x="35" y="65" width="20" height="20" rx="4" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
              <rect x="55" y="65" width="20" height="20" rx="4" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />

              {/* Heart sparkle in center */}
              <path d="M50 48 C50 42 42 42 42 48 C42 54 50 58 50 58 C50 58 58 54 58 48 C58 42 50 42 50 48 Z" fill="#ffffff" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm flex items-center justify-center gap-2">
            청춘 두뇌 테트리스
          </h1>
          <p className="mt-2 text-base md:text-xl font-medium text-stone-600">
            기억력과 집중력을 키우는 <span className="text-amber-700 font-bold">어르신 맞춤 인지 강화 게임</span>
          </p>
        </div>

        {/* 3 Game Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
          {/* Mode 1: Gentle Mode */}
          <button
            onClick={() => handleModeSelect('gentle')}
            className="group relative flex flex-col items-center text-left p-5 md:p-6 rounded-3xl bg-white/90 hover:bg-white shadow-md hover:shadow-xl border-3 border-amber-300 hover:border-amber-500 transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 text-stone-900"
          >
            <div className="absolute -top-3.5 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              어르신 강력 추천
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
              🌸
            </div>
            <h3 className="text-xl md:text-2xl font-black text-amber-950 mb-1 text-center">
              편안한 두뇌 쉼터
            </h3>
            <p className="text-sm font-bold text-amber-800 mb-2 text-center">
              초보자 & 안심 모드
            </p>
            <ul className="text-xs md:text-sm text-stone-600 space-y-1 w-full mt-2 border-t border-stone-200 pt-2 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> 시간 압박 없는 여유로운 속도
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> 8×12 넉넉하고 큰 격자판
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> 실수해도 안심! 무제한 되돌리기
              </li>
            </ul>
            <div className="mt-4 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-center shadow-sm flex items-center justify-center gap-1.5 text-base">
              <Play className="w-4 h-4 fill-stone-950" />
              <span>쉼터 시작하기</span>
            </div>
          </button>

          {/* Mode 2: Standard Silver Tetris */}
          <button
            onClick={() => handleModeSelect('silver')}
            className="group relative flex flex-col items-center text-left p-5 md:p-6 rounded-3xl bg-white/90 hover:bg-white shadow-md hover:shadow-xl border-3 border-stone-300 hover:border-blue-500 transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 text-stone-900"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
              🌿
            </div>
            <h3 className="text-xl md:text-2xl font-black text-blue-950 mb-1 text-center">
              실버 활력 테트리스
            </h3>
            <p className="text-sm font-bold text-blue-800 mb-2 text-center">
              정통 인지 트레이닝
            </p>
            <ul className="text-xs md:text-sm text-stone-600 space-y-1 w-full mt-2 border-t border-stone-200 pt-2 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">✓</span> 10×16 표준 시니어 보드
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">✓</span> 착수 가이드(그림자) 제공
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">✓</span> 두뇌 활력 점수 & 콤보 칭찬
              </li>
            </ul>
            <div className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-center shadow-sm flex items-center justify-center gap-1.5 text-base">
              <Zap className="w-4 h-4 fill-white" />
              <span>활력 모드 시작하기</span>
            </div>
          </button>

          {/* Mode 3: Memory Mission Puzzle */}
          <button
            onClick={() => handleModeSelect('puzzle')}
            className="group relative flex flex-col items-center text-left p-5 md:p-6 rounded-3xl bg-white/90 hover:bg-white shadow-md hover:shadow-xl border-3 border-stone-300 hover:border-purple-500 transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 text-stone-900"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
              💡
            </div>
            <h3 className="text-xl md:text-2xl font-black text-purple-950 mb-1 text-center">
              인지 미션 퍼즐
            </h3>
            <p className="text-sm font-bold text-purple-800 mb-2 text-center">
              공간 지각 & 문제 해결
            </p>
            <ul className="text-xs md:text-sm text-stone-600 space-y-1 w-full mt-2 border-t border-stone-200 pt-2 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="text-purple-600 font-bold">✓</span> 미리 놓인 빈틈 채우기
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-purple-600 font-bold">✓</span> 명확한 2줄 클리어 목표
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-purple-600 font-bold">✓</span> AI 스마트 힌트 무료 지원
              </li>
            </ul>
            <div className="mt-4 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-center shadow-sm flex items-center justify-center gap-1.5 text-base">
              <Sparkles className="w-4 h-4 fill-white" />
              <span>퍼즐 미션 도전</span>
            </div>
          </button>
        </div>

        {/* Flat Control Hints */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm font-bold text-stone-600 bg-white/70 px-4 py-2 rounded-2xl border border-stone-200">
          <span>🎮 조작법:</span>
          <span>화면 큰 버튼 터치</span>
          <span>·</span>
          <span>키보드 방향키 이동</span>
          <span>·</span>
          <span>↑ 돌리기</span>
          <span>·</span>
          <span>스페이스바 바로 놓기</span>
          <span>·</span>
          <span>Z키 무르기</span>
        </div>
      </main>

      {/* Senior Daily Brain Tip Card */}
      <footer className="w-full max-w-4xl z-10">
        <div className="bg-amber-100/90 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md">
                  {SENIOR_BRAIN_TIPS[tipIndex].badge}
                </span>
                <span className="font-extrabold text-sm md:text-base text-stone-900">
                  {SENIOR_BRAIN_TIPS[tipIndex].title}
                </span>
              </div>
              <p className="text-xs md:text-sm text-stone-700 mt-0.5">
                {SENIOR_BRAIN_TIPS[tipIndex].desc}
              </p>
            </div>
          </div>
          <button
            onClick={nextTip}
            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 shadow-sm transition-colors"
          >
            다음 건강 팁 ➔
          </button>
        </div>
      </footer>
    </div>
  );
};
