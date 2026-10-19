/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Soothing Web Audio synthesizer and Web Speech TTS for senior players

let audioCtx: AudioContext | null = null;
let bgmInterval: number | null = null;
let isBgmPlaying = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a gentle marimba/kalimba-like soft tone
 */
function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal: number = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio glitches
  }
}

export const soundManager = {
  // Move sound: very soft wooden tick
  playMove() {
    playTone(320, 0.08, 'triangle', 0.1);
  },

  // Rotate sound: warm gentle ascending chime
  playRotate() {
    const ctx = getAudioContext();
    if (!ctx) return;
    playTone(440, 0.09, 'sine', 0.12);
    setTimeout(() => playTone(660, 0.12, 'sine', 0.12), 35);
  },

  // Drop / land sound: reassuring soft wood thud
  playDrop() {
    playTone(180, 0.15, 'triangle', 0.18);
  },

  // Hold block sound
  playHold() {
    playTone(523.25, 0.1, 'sine', 0.12); // C5
    setTimeout(() => playTone(659.25, 0.12, 'sine', 0.12), 60); // E5
  },

  // Undo sound: gentle rewind sweep
  playUndo() {
    playTone(659.25, 0.09, 'sine', 0.12);
    setTimeout(() => playTone(523.25, 0.09, 'sine', 0.12), 40);
    setTimeout(() => playTone(440, 0.12, 'sine', 0.12), 80);
  },

  // Hint sound: bright sparkle chime
  playHint() {
    playTone(587.33, 0.1, 'sine', 0.15); // D5
    setTimeout(() => playTone(880, 0.15, 'sine', 0.15), 70); // A5
  },

  // Line clear: pentatonic celebration chord
  playLineClear(count: number = 1) {
    const notes = [
      [523.25, 659.25, 783.99], // C, E, G
      [523.25, 659.25, 783.99, 1046.5], // 2 lines: C major arpeggio
      [523.25, 659.25, 783.99, 1046.5, 1318.5], // 3 lines
      [523.25, 659.25, 783.99, 880, 1046.5, 1318.5, 1567.98], // 4 lines Tetris!
    ];

    const chord = notes[Math.min(count - 1, notes.length - 1)];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 0.35, 'sine', 0.15);
      }, idx * 70);
    });
  },

  // Game over or round completed fanfare
  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 0.45, 'triangle', 0.18);
      }, idx * 110);
    });
  },

  // Gentle generative ambient BGM for calm focus
  startBgm() {
    if (isBgmPlaying) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    isBgmPlaying = true;

    // Soothing Korean traditional / folk inspired pentatonic scale (C4, D4, E4, G4, A4, C5, E5)
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25];
    let step = 0;

    const tick = () => {
      if (!isBgmPlaying) return;
      // Gentle arpeggio pattern
      const noteIdx = [0, 2, 4, 3, 5, 4, 2, 1][step % 8];
      const freq = scale[noteIdx];
      // Play warm, distant sine note with long decay
      playTone(freq, 1.2, 'sine', 0.04);

      if (step % 4 === 0) {
        // Soft bass note
        playTone(scale[0] / 2, 1.8, 'triangle', 0.03);
      }
      step++;
    };

    tick();
    bgmInterval = window.setInterval(tick, 900);
  },

  stopBgm() {
    isBgmPlaying = false;
    if (bgmInterval !== null) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  },

  toggleBgm(): boolean {
    if (isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  },

  isBgmActive(): boolean {
    return isBgmPlaying;
  },
};

/**
 * Web Speech TTS for warm encouragement
 */
const PRAISE_MESSAGES = [
  '참 잘하셨어요!',
  '멋집니다! 머리가 맑아지고 있어요.',
  '대단해요! 아주 침착하게 맞추셨어요.',
  '시원하게 한 줄 완성되었습니다!',
  '집중력이 대단하십니다.',
  '좋은 수였습니다! 아주 훌륭해요.',
  '손가락과 두뇌가 활짝 깨어납니다.',
  '천천히 여유를 가지고 해보세요.',
];

const MULTI_LINE_PRAISES = [
  '와! 멋지게 여러 줄을 완성하셨어요!',
  '대단하십니다! 최고의 집중력이세요!',
  '두뇌 활력이 쑥쑥 올라갑니다!',
];

let lastSpokenTime = 0;

export function speakPraise(type: 'clear' | 'multi' | 'encouragement' | 'custom', customText?: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const now = Date.now();
  // Don't overlap speech within 2.5 seconds unless custom
  if (type !== 'custom' && now - lastSpokenTime < 2800) return;
  lastSpokenTime = now;

  let text = '';
  if (customText) {
    text = customText;
  } else if (type === 'multi') {
    text = MULTI_LINE_PRAISES[Math.floor(Math.random() * MULTI_LINE_PRAISES.length)];
  } else if (type === 'clear') {
    text = PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
  } else {
    text = '천천히 한 칸씩 놓아보세요.';
  }

  try {
    window.speechSynthesis.cancel(); // Cancel any existing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.88; // Gentle, slower speed for senior comprehension
    utterance.pitch = 1.05; // Warm, friendly tone
    utterance.volume = 0.9;

    // Pick a natural Korean voice if available
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(v => v.lang.startsWith('ko'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Fallback if browser blocks speech
  }
}
