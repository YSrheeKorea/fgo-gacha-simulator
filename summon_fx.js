// ============================================================
// FGO 가챠 시뮬레이터 - 원작 고증 칼데아 소환실 연출 & FGO 대사창 엔진
// (3D 바닥 소환진 · 3광구 3중 회전 · 빛기둥 수렴 · 은테→금테 치직 승격 · 타자기 대사창)
// ============================================================

const SummonFX = (() => {
  let canvas, ctx;
  let rafId = null;
  let particles = [];
  let orbTrails = [[], [], []];

  // 애니메이션 상태
  let ringMode = 'normal'; // 'normal' | 'gold' | 'rainbow'
  let stageVisual = 'chamber'; // 'chamber' | 'pillar' | 'card' | 'revealed'
  let time = 0;
  let orbAngle = 0;
  let orbRadiusRatio = 1; // 1 -> 0.18 수렴
  let pillarIntensity = 0;
  let lightningFrames = 0;
  let flashAlpha = 0;

  // 시퀀스 상태
  let active = false;
  let queue = [];
  let index = 0;
  let phase = 'idle'; // 'orbs' | 'back' | 'spark' | 'revealed'
  let timerIds = [];
  let finishCallback = null;
  let opts = { fastMode: false, autoSkipCommon: false, highParticles: true, textSpeed: 'normal' };

  // 타자기 효과 상태
  let typeTimer = null;
  let fullQuoteText = '';
  let typedPos = 0;
  let typingDone = true;

  function clearTimers() {
    timerIds.forEach(id => clearTimeout(id));
    timerIds = [];
    stopTypewriter(false);
  }

  function later(fn, ms) {
    const mult = opts.fastMode ? 0.45 : 1.0;
    const id = setTimeout(fn, Math.max(70, Math.round(ms * mult)));
    timerIds.push(id);
    return id;
  }

  function initCanvas() {
    canvas = document.getElementById('summon-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getHueForMode(mode, idx = 0) {
    if (mode === 'rainbow') return ((time * 160) + idx * 120) % 360;
    if (mode === 'gold') return 43 + (idx * 5);
    return 206 + (idx * 8);
  }

  function spawnParticles(count, mode, spread = 200) {
    const cap = opts.highParticles ? 1 : 0.45;
    const actual = Math.max(1, Math.round(count * cap));
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < actual; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 0.4 + Math.random() * 2.2;
      particles.push({
        x: w / 2 + (Math.random() - 0.5) * spread,
        y: h * 0.56 + (Math.random() - 0.5) * spread * 0.7,
        vx: Math.cos(a) * spd * 0.7,
        vy: -0.9 - Math.random() * 2.6,
        r: 1.4 + Math.random() * 3.2,
        life: 1,
        decay: 0.008 + Math.random() * 0.014,
        hue: mode === 'rainbow' ? Math.random() * 360 : (mode === 'gold' ? 42 + Math.random() * 16 : 202 + Math.random() * 26)
      });
    }
  }

  // 원작 FGO 스타일 칼데아 소환실 3D 투시 바닥 소환진 + 3광구 회전 + 빛기둥 렌더링
  function drawFrame() {
    if (!active || !ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const floorY = h * 0.72;
    const centerY = h * 0.46;

    time += 0.016;

    // 1) 소환실 심연 배경 (원작 블루-블랙 체임버)
    const bgGrad = ctx.createRadialGradient(cx, centerY, 20, cx, centerY, Math.max(w, h) * 0.78);
    if (ringMode === 'rainbow') {
      bgGrad.addColorStop(0, 'rgba(34, 24, 72, 0.96)');
      bgGrad.addColorStop(0.55, 'rgba(10, 16, 40, 0.98)');
      bgGrad.addColorStop(1, '#02040c');
    } else if (ringMode === 'gold') {
      bgGrad.addColorStop(0, 'rgba(54, 38, 12, 0.96)');
      bgGrad.addColorStop(0.55, 'rgba(12, 18, 38, 0.98)');
      bgGrad.addColorStop(1, '#02040c');
    } else {
      bgGrad.addColorStop(0, 'rgba(14, 34, 76, 0.96)');
      bgGrad.addColorStop(0.55, 'rgba(7, 15, 36, 0.98)');
      bgGrad.addColorStop(1, '#02040b');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2) 소환실 바닥 3D 투시 칼데아 마법진 (기울어진 타원형 원반)
    const floorR = Math.min(w * 0.42, 340);
    ctx.save();
    ctx.translate(cx, floorY);
    ctx.scale(1, 0.34); // 원근 투시!

    const floorHue = getHueForMode(ringMode, 0);
    const ringStroke = ringMode === 'rainbow'
      ? `hsl(${floorHue}, 100%, 74%)`
      : (ringMode === 'gold' ? '#ffe078' : '#7ac8ff');

    // 바닥 마법진 글로우
    const fGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, floorR * 1.25);
    fGlow.addColorStop(0, ringMode === 'gold' ? 'rgba(255,216,96,0.45)' : (ringMode === 'rainbow' ? `hsla(${floorHue},100%,70%,0.42)` : 'rgba(95,185,255,0.42)'));
    fGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fGlow;
    ctx.beginPath();
    ctx.arc(0, 0, floorR * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // 회전하는 동심원 & 룬 링
    ctx.strokeStyle = ringStroke;
    ctx.shadowColor = ringStroke;
    ctx.shadowBlur = 16;

    // 외곽 링
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, floorR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, floorR * 0.86, 0, Math.PI * 2);
    ctx.stroke();

    // 회전 룬 눈금
    ctx.save();
    ctx.rotate(time * 0.45);
    ctx.setLineDash([12, 10]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, floorR * 0.93, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6망성 기하 도형
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.65;
    for (let t = 0; t < 2; t++) {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (Math.PI * 2 * i) / 3 + (t * Math.PI) / 3;
        const px = Math.cos(a) * floorR * 0.82;
        const py = Math.sin(a) * floorR * 0.82;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    // 내부 역회전 링
    ctx.save();
    ctx.rotate(-time * 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, floorR * 0.52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // 3) 중앙 빛기둥 (소환진에서 하늘로 솟구치는 FGO 아이코닉 광선)
    const targetPillar = stageVisual === 'orbs' ? 0.65 : (stageVisual === 'pillar' ? 1.0 : 0.32);
    pillarIntensity += (targetPillar - pillarIntensity) * 0.08;
    const pillarW = (ringMode === 'rainbow' ? 175 : (ringMode === 'gold' ? 150 : 120)) * (0.65 + pillarIntensity * 0.55);

    const pGrad = ctx.createLinearGradient(cx - pillarW, 0, cx + pillarW, 0);
    const pColor = ringMode === 'rainbow'
      ? `hsla(${(time * 180) % 360}, 100%, 75%, ${0.32 * pillarIntensity})`
      : (ringMode === 'gold'
        ? `rgba(255, 224, 110, ${0.34 * pillarIntensity})`
        : `rgba(120, 200, 255, ${0.28 * pillarIntensity})`);
    pGrad.addColorStop(0, 'rgba(255,255,255,0)');
    pGrad.addColorStop(0.32, pColor);
    pGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.42 * pillarIntensity})`);
    pGrad.addColorStop(0.68, pColor);
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = pGrad;
    ctx.fillRect(cx - pillarW, 0, pillarW * 2, floorY + 25);

    // 4) FGO 3광구 3중 회전 (실제 가챠 시 은/금/무지개 3개 링 & 광구!)
    if (stageVisual === 'orbs' || stageVisual === 'pillar') {
      const spinSpd = ringMode === 'rainbow' ? 0.145 : (ringMode === 'gold' ? 0.12 : 0.095);
      orbAngle += spinSpd;
      if (stageVisual === 'pillar') {
        orbRadiusRatio = Math.max(0.1, orbRadiusRatio * 0.92);
      } else {
        orbRadiusRatio = Math.max(0.45, orbRadiusRatio - 0.008);
      }

      const rx = Math.min(w * 0.34, 255) * orbRadiusRatio;
      const ry = rx * 0.32;

      for (let i = 0; i < 3; i++) {
        const a = orbAngle + (Math.PI * 2 * i) / 3;
        const yOffset = (i - 1) * 44 * orbRadiusRatio;
        const ox = cx + Math.cos(a) * rx;
        const oy = centerY + yOffset + Math.sin(a) * ry;

        const trail = orbTrails[i];
        trail.push({ x: ox, y: oy });
        if (trail.length > 26) trail.shift();

        // 광구 궤적 리본 (금색 회전 / 무지개 회전의 핵심 시각 연출!)
        const orbHue = getHueForMode(ringMode, i);
        const col = ringMode === 'rainbow'
          ? `hsl(${orbHue}, 100%, 72%)`
          : (ringMode === 'gold' ? '#ffd95e' : '#9ee0ff');

        ctx.save();
        ctx.strokeStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 18;
        ctx.lineCap = 'round';
        for (let k = 1; k < trail.length; k++) {
          const alpha = k / trail.length;
          ctx.globalAlpha = alpha * 0.85;
          ctx.lineWidth = alpha * (ringMode === 'normal' ? 4.5 : 7.5);
          ctx.beginPath();
          ctx.moveTo(trail[k - 1].x, trail[k - 1].y);
          ctx.lineTo(trail[k].x, trail[k].y);
          ctx.stroke();
        }
        // 광구 코어
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, ringMode === 'normal' ? 6 : 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 5) 공개 시 뒤에서 뻗어나가는 신성한 방사광(God Rays)
    if (stageVisual === 'revealed' && (ringMode === 'gold' || ringMode === 'rainbow')) {
      ctx.save();
      ctx.translate(cx, centerY);
      ctx.rotate(time * 0.22);
      const rays = 14;
      for (let i = 0; i < rays; i++) {
        const ra = (Math.PI * 2 * i) / rays;
        ctx.fillStyle = ringMode === 'rainbow'
          ? `hsla(${(i * 28 + time * 80) % 360}, 100%, 75%, 0.085)`
          : 'rgba(255, 224, 115, 0.08)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, Math.max(w, h) * 0.65, ra, ra + 0.14);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 6) 은테 → 금테 승격 전격 (치직!! 번개)
    if (lightningFrames > 0) {
      lightningFrames--;
      ctx.save();
      ctx.strokeStyle = '#fff9c4';
      ctx.shadowColor = '#ffc800';
      ctx.shadowBlur = 22;
      ctx.lineWidth = 3.2;
      for (let b = 0; b < 6; b++) {
        ctx.beginPath();
        let lx = cx + (Math.random() - 0.5) * 190;
        let ly = centerY - 200 + Math.random() * 60;
        ctx.moveTo(lx, ly);
        for (let s = 0; s < 6; s++) {
          lx += (Math.random() - 0.5) * 84;
          ly += 54 + Math.random() * 24;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 7) 상승 마력 파티클
    if (Math.random() < (opts.highParticles ? 0.6 : 0.25)) {
      spawnParticles(ringMode === 'rainbow' ? 4 : 2, ringMode, 260);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `hsla(${p.hue}, 100%, 78%, ${p.life})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8) 화이트 섬광 플래시
    if (flashAlpha > 0.01) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, flashAlpha)})`;
      ctx.fillRect(0, 0, w, h);
      flashAlpha *= 0.85;
    }

    rafId = requestAnimationFrame(drawFrame);
  }

  // ================= FGO 원작 스타일 타자기 대사창 제어 =================
  function startTypewriter(speaker, text, badgeText = '') {
    stopTypewriter(false);
    const box = document.getElementById('summon-quote-box');
    const spEl = document.getElementById('summon-dlg-speaker');
    const badgeEl = document.getElementById('summon-dlg-badge');
    const txtEl = document.getElementById('summon-dlg-text');
    const curEl = document.getElementById('summon-dlg-cursor');

    spEl.textContent = speaker;
    badgeEl.textContent = badgeText;
    fullQuoteText = text || '';
    typedPos = 0;
    box.classList.add('visible');

    const speedMap = { slow: 46, normal: 24, fast: 10, instant: 0 };
    const interval = speedMap[opts.textSpeed] ?? 24;

    if (interval === 0) {
      txtEl.textContent = fullQuoteText;
      typingDone = true;
      curEl.classList.add('visible');
      return;
    }

    txtEl.textContent = '';
    typingDone = false;
    curEl.classList.remove('visible');

    typeTimer = setInterval(() => {
      typedPos += (opts.textSpeed === 'fast' ? 2 : 1);
      if (typedPos >= fullQuoteText.length) {
        txtEl.textContent = fullQuoteText;
        stopTypewriter(true);
      } else {
        txtEl.textContent = fullQuoteText.slice(0, typedPos);
      }
    }, interval);
  }

  function stopTypewriter(showComplete = true) {
    if (typeTimer) {
      clearInterval(typeTimer);
      typeTimer = null;
    }
    typingDone = true;
    const txtEl = document.getElementById('summon-dlg-text');
    const curEl = document.getElementById('summon-dlg-cursor');
    if (showComplete && txtEl) txtEl.textContent = fullQuoteText;
    if (curEl) curEl.classList.add('visible');
  }

  // ================= 카드별 원작 소환 시퀀스 =================
  function startCardSequence(roll) {
    // 3성/중복 자동 스킵 옵션 처리 (★4 이상이나 NEW는 반드시 연출!)
    if (opts.autoSkipCommon && queue.length > 1 && roll.item.rarity <= 3 && !roll.isNew) {
      index++;
      if (index >= queue.length) {
        finish();
      } else {
        startCardSequence(queue[index]);
      }
      return;
    }

    const card3d = document.getElementById('summon-card-3d');
    const backEl = document.getElementById('summon-card-back');
    const frontEl = document.getElementById('summon-card-front');
    const tagEl = document.getElementById('summon-event-tag');
    const quoteEl = document.getElementById('summon-quote-box');
    const headerInfo = document.getElementById('summon-servant-banner');
    const progEl = document.getElementById('summon-progress');

    progEl.textContent = `${index + 1} / ${queue.length}`;
    card3d.classList.remove('flipped', 'entering', 'spark-shake', 'glow-gold', 'glow-rainbow', 'spinning-reveal');
    tagEl.textContent = '';
    tagEl.className = 'summon-event-tag';
    quoteEl.classList.remove('visible');
    if (headerInfo) headerInfo.classList.remove('visible');

    orbTrails = [[], [], []];
    orbRadiusRatio = 1.05;

    const isServant = roll.type === 'servant';
    frontEl.innerHTML = ArtRenderer.renderCardSVG(roll.item, isServant, {
      ascension: 1,
      npLevel: isServant ? roll.npLevelAfter : 0,
      isNew: roll.isNew,
      eager: true
    });

    // 승격 연출이면 일단 은테 카드 뒷면으로 시작!
    const startSilver = (roll.animTier === 'spark_gold' || roll.animTier === 'spark_rainbow' || roll.item.rarity <= 3);
    const backTier = startSilver ? 'silver' : 'gold';
    backEl.innerHTML = isServant
      ? ArtRenderer.renderCardBackSVG(roll.item.cls, backTier)
      : ArtRenderer.renderCEBackSVG(backTier);

    // 1단계: 3광구 3중 회전 (은/금/무지개)
    stageVisual = 'orbs';
    phase = 'orbs';

    if (roll.animTier === 'rainbow') {
      ringMode = 'rainbow';
      tagEl.textContent = roll.isPity ? '★ 330연 천장 확정! 무지개 3중 회전 ★' : '✦ 무지개 3중 회전!! ★5 확정!! ✦';
      tagEl.classList.add('tag-rainbow', 'visible');
      SoundEngine.ringSpin('rainbow');
    } else if (roll.animTier === 'gold') {
      ringMode = 'gold';
      tagEl.textContent = '✦ 금색 3중 회전!! ★4 이상 서번트 확정! ✦';
      tagEl.classList.add('tag-gold', 'visible');
      SoundEngine.ringSpin('gold');
    } else {
      ringMode = 'normal';
      SoundEngine.ringSpin('normal');
    }

    spawnParticles(roll.animTier === 'rainbow' ? 45 : 20, ringMode);

    // 2단계: 빛기둥 수렴 → 백색 섬광 → 카드 뒷면 강림
    later(() => {
      if (!active) return;
      stageVisual = 'pillar';
      SoundEngine.pillarBurst();

      later(() => {
        if (!active) return;
        flashAlpha = 0.82;
        stageVisual = 'card';
        phase = 'back';
        card3d.classList.add('entering');

        // 2.5단계: 은테 → 금테 치직!! 전격 승격 연출
        if (roll.animTier === 'spark_gold' || roll.animTier === 'spark_rainbow') {
          later(() => {
            if (!active || phase !== 'back') return;
            phase = 'spark';
            lightningFrames = 32;
            flashAlpha = 0.85;
            ringMode = roll.animTier === 'spark_rainbow' ? 'rainbow' : 'gold';
            card3d.classList.add('spark-shake');
            SoundEngine.sparkPromotion();

            tagEl.textContent = '⚡ 치직!! 은테 → 금테 승격!! ⚡';
            tagEl.className = 'summon-event-tag tag-spark visible';

            later(() => {
              if (!active) return;
              backEl.innerHTML = ArtRenderer.renderCardBackSVG(roll.item.cls, 'gold');
              spawnParticles(55, ringMode);
              later(() => revealCurrentCard(), 720);
            }, 390);
          }, 680);
        } else {
          later(() => revealCurrentCard(), roll.animTier === 'rainbow' ? 920 : 560);
        }
      }, 420);
    }, roll.animTier === 'rainbow' ? 1050 : (roll.animTier === 'gold' ? 880 : 620));
  }

  function revealCurrentCard() {
    if (!active || phase === 'revealed') return;
    clearTimers();
    phase = 'revealed';
    stageVisual = 'revealed';

    const roll = queue[index];
    const isServant = roll.type === 'servant';
    const card3d = document.getElementById('summon-card-3d');
    const tagEl = document.getElementById('summon-event-tag');
    const headerInfo = document.getElementById('summon-servant-banner');

    if (isServant && roll.item.rarity >= 4) {
      document.getElementById('summon-card-back').innerHTML = ArtRenderer.renderCardBackSVG(roll.item.cls, 'gold');
    }

    card3d.classList.add('entering', 'flipped');
    flashAlpha = roll.item.rarity === 5 ? 0.95 : (roll.item.rarity === 4 ? 0.52 : 0.25);
    if (roll.item.rarity === 5 && isServant) {
      card3d.classList.add('glow-rainbow');
      ringMode = 'rainbow';
      spawnParticles(75, 'rainbow', 340);
    } else if (roll.item.rarity >= 4) {
      card3d.classList.add('glow-gold');
      ringMode = 'gold';
      spawnParticles(36, 'gold', 280);
    }

    SoundEngine.cardFlip();
    SoundEngine.reveal(roll.item.rarity, isServant);

    // 상단 서번트 진명/클래스 타이틀 배너 (원작 FGO 스타일)
    if (headerInfo) {
      const clsName = isServant ? (CLASS_INFO[roll.item.cls]?.en || roll.item.cls) : 'CRAFT ESSENCE';
      const stars = '★'.repeat(roll.item.rarity);
      headerInfo.innerHTML = `
        <div class="ssb-left">
          ${isServant ? ArtRenderer.getClassIconSVG(roll.item.cls, '#ffe680', 34) : '<span style="font-size:24px">✦</span>'}
          <div>
            <div class="ssb-cls">${clsName} <span class="ssb-stars">${stars}</span></div>
            <div class="ssb-name">${roll.item.name}</div>
          </div>
        </div>
        ${roll.isNew ? '<span class="ssb-new">NEW</span>' : ''}
      `;
      headerInfo.classList.add('visible');
    }

    // 이벤트 태그
    if (isServant && roll.item.rarity === 5) {
      if (roll.isPity) {
        tagEl.textContent = `★ 330연 천장 확정 소환! ★`;
        tagEl.className = 'summon-event-tag tag-rainbow visible';
      } else if (roll.isPickup) {
        tagEl.textContent = `✦ PICKUP ★5 소환 성공! ✦`;
        tagEl.className = 'summon-event-tag tag-rainbow visible';
      } else if (roll.isSpook) {
        tagEl.textContent = `💥 픽뚫 ★5 서번트 등장!`;
        tagEl.className = 'summon-event-tag tag-gold visible';
      } else {
        tagEl.textContent = `✦ ★5 서번트 소환! ✦`;
        tagEl.className = 'summon-event-tag tag-rainbow visible';
      }
    } else if (isServant && roll.item.rarity === 4) {
      tagEl.textContent = roll.isPickup ? `★ PICKUP ★4 서번트 ★` : `★4 서번트 소환`;
      tagEl.className = 'summon-event-tag tag-gold visible';
    } else if (!isServant && roll.item.rarity === 5) {
      tagEl.textContent = `✦ ★5 개념예장 획득 ✦`;
      tagEl.className = 'summon-event-tag tag-gold visible';
    } else if (!isServant && roll.item.id === 'ce_mapo_tofu') {
      tagEl.textContent = `🌶️ 신부의 축복… [아주 매운 마파두부]`;
      tagEl.className = 'summon-event-tag tag-meme visible';
    } else {
      tagEl.className = 'summon-event-tag';
    }

    // 원작 FGO 스타일 하단 대사창 (타자기 출력!)
    const speaker = isServant ? roll.item.name : `${roll.item.name} (개념예장)`;
    const metaBadge = isServant
      ? `${CLASS_INFO[roll.item.cls]?.name || roll.item.cls} · 보구 Lv.${roll.npLevelAfter}${roll.usoGained ? ' (+무기명 영기!)' : ''}`
      : `${'★'.repeat(roll.item.rarity)} · ${roll.item.effect}`;
    const quoteText = isServant ? roll.item.summonQuote : roll.item.flavor;

    startTypewriter(speaker, quoteText, metaBadge);
  }

  function handleStageClick() {
    if (!active) return;
    if (phase !== 'revealed') {
      revealCurrentCard();
    } else if (!typingDone) {
      // 타자기 출력 중 클릭 시 즉시 전체 텍스트 완성 (원작 FGO와 동일!)
      stopTypewriter(true);
    } else {
      SoundEngine.click();
      index++;
      if (index >= queue.length) {
        finish();
      } else {
        startCardSequence(queue[index]);
      }
    }
  }

  function skipAll() {
    if (!active) return;
    SoundEngine.click();
    finish();
  }

  function finish() {
    clearTimers();
    active = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    const stage = document.getElementById('summon-stage');
    if (stage) stage.classList.add('hidden');
    if (typeof finishCallback === 'function') {
      const cb = finishCallback;
      finishCallback = null;
      cb(queue);
    }
  }

  function playSequence(results, onComplete, options = {}) {
    initCanvas();
    ArtRenderer.preloadUrls(results.map(r => ArtRenderer.getCardArtUrl(r.item, r.type === 'servant', 1)));
    opts = {
      fastMode: !!options.fastMode,
      autoSkipCommon: !!options.autoSkipCommon,
      highParticles: options.highParticles !== false,
      textSpeed: options.textSpeed || 'normal'
    };
    queue = results;
    index = 0;
    finishCallback = onComplete;
    particles = [];
    orbTrails = [[], [], []];
    flashAlpha = 0.5;
    lightningFrames = 0;
    pillarIntensity = 0.2;
    active = true;

    const stage = document.getElementById('summon-stage');
    stage.classList.remove('hidden');

    SoundEngine.summonStart();
    drawFrame();
    startCardSequence(queue[0]);
  }

  return {
    playSequence,
    handleStageClick,
    skipAll,
    isActive: () => active
  };
})();
