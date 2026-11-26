// ============================================================
// FGO 가챠 시뮬레이터 - 오디오 엔진 (Web Audio API + 볼륨 제어 + FGO 고증 효과음)
// ============================================================

const SoundEngine = (() => {
  let ctx = null;
  let muted = false;
  let masterVolume = 0.8; // 0.0 ~ 1.0

  function init() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  function loadPrefs() {
    try {
      muted = localStorage.getItem('fgo_gacha_muted') === '1';
      const v = parseFloat(localStorage.getItem('fgo_gacha_vol'));
      if (!Number.isNaN(v) && v >= 0 && v <= 1) masterVolume = v;
    } catch (_) {}
  }
  loadPrefs();

  function isMuted() { return muted; }
  function getVolume() { return masterVolume; }

  function setMuted(val) {
    muted = !!val;
    try { localStorage.setItem('fgo_gacha_muted', muted ? '1' : '0'); } catch (_) {}
  }

  function setVolume(val) {
    masterVolume = Math.max(0, Math.min(1, Number(val)));
    try { localStorage.setItem('fgo_gacha_vol', String(masterVolume)); } catch (_) {}
  }

  function playTone(freq, duration, type = 'sine', volume = 0.12, delay = 0, endFreq = null) {
    if (muted || masterVolume <= 0.001) return;
    init();
    if (!ctx) return;

    const scaledVol = Math.max(0.0001, volume * masterVolume);
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(scaledVol, now + Math.min(0.03, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  function playNoise(duration, volume = 0.08, delay = 0, highpass = 1200) {
    if (muted || masterVolume <= 0.001) return;
    init();
    if (!ctx) return;

    const scaledVol = Math.max(0.0001, volume * masterVolume);
    const now = ctx.currentTime + delay;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(highpass, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(scaledVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + duration + 0.03);
  }

  return {
    init,
    isMuted,
    setMuted,
    getVolume,
    setVolume,
    toggleMute() {
      setMuted(!muted);
      return muted;
    },

    click() {
      playTone(920, 0.055, 'triangle', 0.075, 0, 1280);
    },

    summonStart() {
      // 칼데아 소환실 바닥 마법진 점화 + 저음 공명
      playTone(110, 1.2, 'sine', 0.12, 0, 220);
      playTone(220, 1.0, 'triangle', 0.07, 0.06, 440);
      playTone(329.63, 0.9, 'sine', 0.055, 0.14, 659.25);
      playNoise(0.55, 0.035, 0.04, 2400);
    },

    ringSpin(tier) {
      // 3광구 3중 회전 사운드 (일반 / 금색 회전 / 무지개 회전)
      if (tier === 'rainbow') {
        const notes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98, 2093.0];
        notes.forEach((f, i) => {
          playTone(f, 0.7, 'sine', 0.1, i * 0.075);
          playTone(f * 1.25, 0.5, 'triangle', 0.045, i * 0.075 + 0.03);
        });
        playNoise(0.5, 0.05, 0.08, 3200);
      } else if (tier === 'gold') {
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((f, i) => {
          playTone(f, 0.55, 'triangle', 0.095, i * 0.085);
        });
        playNoise(0.35, 0.035, 0.06, 2600);
      } else {
        playTone(329.63, 0.45, 'sine', 0.07, 0, 493.88);
        playTone(493.88, 0.4, 'sine', 0.05, 0.14, 659.25);
      }
    },

    pillarBurst() {
      // 빛기둥 수렴 & 섬광 폭발음
      playNoise(0.28, 0.1, 0, 1600);
      playTone(260, 0.32, 'sine', 0.09, 0, 920);
    },

    sparkPromotion() {
      // 은테 -> 금테 치직!! 전격 승격 연출 (2단 스파크 + 황금 폭발)
      playNoise(0.12, 0.19, 0, 2600);
      playTone(130, 0.11, 'sawtooth', 0.12, 0.01, 65);
      playNoise(0.15, 0.21, 0.17, 3000);
      playTone(165, 0.13, 'sawtooth', 0.13, 0.18, 82);
      playNoise(0.18, 0.22, 0.34, 3400);
      // 황금 광휘 팡파르
      const notes = [587.33, 739.99, 880, 1174.66, 1479.98];
      notes.forEach((f, i) => playTone(f, 0.7, 'triangle', 0.11, 0.44 + i * 0.055));
    },

    cardFlip() {
      playNoise(0.16, 0.075, 0, 1900);
      playTone(310, 0.2, 'sine', 0.065, 0, 780);
    },

    reveal(rarity, isServant) {
      if (rarity === 5 && isServant) {
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        chord.forEach((f, i) => {
          playTone(f, 1.3, 'triangle', 0.105, i * 0.055);
          playTone(f * 2, 0.85, 'sine', 0.038, i * 0.055 + 0.07);
        });
      } else if (rarity === 4 && isServant) {
        const chord = [440, 554.37, 659.25, 880];
        chord.forEach((f, i) => playTone(f, 0.8, 'triangle', 0.09, i * 0.055));
      } else if (rarity === 5) {
        const chord = [493.88, 622.25, 739.99, 987.77];
        chord.forEach((f, i) => playTone(f, 0.7, 'sine', 0.08, i * 0.05));
      } else if (rarity === 4) {
        playTone(440, 0.4, 'sine', 0.07, 0);
        playTone(587.33, 0.45, 'sine', 0.07, 0.08);
      } else {
        playTone(349.23, 0.25, 'sine', 0.05, 0);
      }
    },

    levelUp() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => playTone(f, 0.35, 'triangle', 0.09, i * 0.07));
    },

    shopBuy() {
      playTone(783.99, 0.12, 'sine', 0.08, 0);
      playTone(1046.5, 0.22, 'sine', 0.09, 0.09);
    },

    myRoomTap() {
      playTone(659.25, 0.14, 'sine', 0.055, 0);
      playTone(880, 0.18, 'sine', 0.045, 0.05);
    },

    error() {
      playTone(220, 0.18, 'sawtooth', 0.07, 0, 160);
    }
  };
})();
