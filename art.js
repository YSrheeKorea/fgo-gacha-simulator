// ============================================================
// FGO 가챠 시뮬레이터 - 공식 일러스트(Atlas Academy) + SVG 프레임 & 폴백 렌더러
// ============================================================

const ArtRenderer = (() => {
  const CUSTOM_IMG_KEY = 'fgo_gacha_custom_imgs_v1';
  const ART_MODE_KEY = 'fgo_gacha_art_mode_v1';

  let artMode = 'official'; // 'official' | 'svg'
  let customImages = {};

  function loadPrefs() {
    try {
      const m = localStorage.getItem(ART_MODE_KEY);
      if (m === 'svg' || m === 'official') artMode = m;
      const raw = localStorage.getItem(CUSTOM_IMG_KEY);
      if (raw) customImages = JSON.parse(raw) || {};
    } catch (_) {}
  }
  loadPrefs();

  function getArtMode() { return artMode; }
  function setArtMode(mode) {
    artMode = mode === 'svg' ? 'svg' : 'official';
    try { localStorage.setItem(ART_MODE_KEY, artMode); } catch (_) {}
  }
  function toggleArtMode() {
    setArtMode(artMode === 'official' ? 'svg' : 'official');
    return artMode;
  }

  function setCustomImage(id, dataUrl) {
    if (!dataUrl) {
      delete customImages[id];
    } else {
      customImages[id] = dataUrl;
    }
    try { localStorage.setItem(CUSTOM_IMG_KEY, JSON.stringify(customImages)); } catch (_) {
      return false;
    }
    return true;
  }
  function hasCustomImage(id) { return !!customImages[id]; }
  function clearAllCustomImages() {
    customImages = {};
    try { localStorage.removeItem(CUSTOM_IMG_KEY); } catch (_) {}
  }

  function getCardArtUrl(item, isServant = true, ascension = 1) {
    if (customImages[item.id]) return customImages[item.id];
    if (artMode !== 'official') return null;
    if (isServant) {
      if (typeof ATLAS_IMAGES !== 'undefined') {
        const entry = ATLAS_IMAGES.servants && ATLAS_IMAGES.servants[item.id];
        if (entry && entry.ascension) {
          return entry.ascension[ascension] || entry.ascension[1] || null;
        }
      }
      if (item.customAsc && item.customAsc.length) {
        return item.customAsc[Math.min(ascension, item.customAsc.length) - 1] || item.customAsc[0];
      }
      if (item.atlasId) {
        const reg = item.region || 'KR';
        const suffixMap = { 1: 'a@1', 2: 'a@2', 3: 'b@1', 4: 'b@2' };
        const suf = suffixMap[ascension] || 'a@1';
        return `https://static.atlasacademy.io/${reg}/CharaGraph/${item.atlasId}/${item.atlasId}${suf}.png`;
      }
      return null;
    } else {
      if (typeof ATLAS_IMAGES !== 'undefined') {
        const entry = ATLAS_IMAGES.ces && ATLAS_IMAGES.ces[item.id];
        if (entry && entry.card) return entry.card;
      }
      if (item.atlasId) {
        return `https://static.atlasacademy.io/${item.region || 'KR'}/CharaGraph/${item.atlasId}/${item.atlasId}a.png`;
      }
      return null;
    }
  }

  function getFaceUrl(servantId) {
    if (customImages[servantId]) return customImages[servantId];
    if (artMode !== 'official') return null;
    if (typeof ATLAS_IMAGES !== 'undefined') {
      const entry = ATLAS_IMAGES.servants && ATLAS_IMAGES.servants[servantId];
      if (entry && entry.face) return entry.face;
    }
    const sv = (typeof SERVANT_MAP !== 'undefined') && SERVANT_MAP[servantId];
    if (sv) {
      if (sv.customFace) return sv.customFace;
      if (sv.atlasId) {
        return `https://static.atlasacademy.io/${sv.region || 'KR'}/Faces/f_${sv.atlasId}0.png`;
      }
    }
    return null;
  }

  function _resolveAtlasId(servantId) {
    if (typeof ATLAS_IMAGES !== 'undefined') {
      const entry = ATLAS_IMAGES.servants && ATLAS_IMAGES.servants[servantId];
      if (entry && entry.atlasId) return entry.atlasId;
    }
    const sv = (typeof SERVANT_MAP !== 'undefined') && SERVANT_MAP[servantId];
    return sv && sv.atlasId ? sv.atlasId : null;
  }

  function getCommandSpriteUrl(servantId, asc = 1) {
    if (artMode !== 'official') return null;
    const aid = _resolveAtlasId(servantId);
    if (!aid) return null;
    const stage = Math.max(1, Math.min(3, Number(asc) || 1));
    return `https://static.atlasacademy.io/JP/Servants/Commands/${aid}/card_servant_${stage}.png`;
  }

  function getStatusSpriteUrl(servantId, asc = 1) {
    if (artMode !== 'official') return null;
    const aid = _resolveAtlasId(servantId);
    if (!aid) return null;
    const stage = Math.max(1, Math.min(3, Number(asc) || 1));
    return `https://static.atlasacademy.io/JP/Servants/Status/${aid}/status_servant_${stage}.png`;
  }

  function getNarrowFigureUrl(servantId, asc = 1) {
    if (artMode !== 'official') return null;
    const aid = _resolveAtlasId(servantId);
    if (!aid) return null;
    const idx = Math.max(0, Math.min(2, (Number(asc) || 1) - 1));
    return `https://static.atlasacademy.io/JP/NarrowFigure/${aid}/${aid}@${idx}.png`;
  }

  function getCharaFigureUrl(servantId, asc = 1) {
    if (artMode !== 'official') return null;
    const aid = _resolveAtlasId(servantId);
    if (!aid) return null;
    const stageIdx = Math.max(0, Math.min(2, (Number(asc) || 1) - 1));
    return `https://static.atlasacademy.io/JP/CharaFigure/${aid}${stageIdx}/${aid}${stageIdx}_merged.png`;
  }

  function preloadUrls(urls) {
    if (typeof Image === 'undefined') return;
    urls.filter(Boolean).forEach(url => {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.src = url;
    });
  }

  // 클래스별 고유 심볼 SVG (viewBox 0 0 64 64)
  function getClassIconSVG(cls, color = '#f5d76e', size = 28) {
    const shapes = {
      Saber: `<path d="M32 6 L37 38 L47 40 L45 45 L35 45 L35 56 L29 56 L29 45 L19 45 L17 40 L27 38 Z" fill="${color}"/>`,
      Archer: `<path d="M22 10 C42 16 42 48 22 54" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/><line x1="22" y1="12" x2="22" y2="52" stroke="${color}" stroke-width="2"/><line x1="12" y1="32" x2="52" y2="32" stroke="${color}" stroke-width="3.5"/><polygon points="56,32 45,25 45,39" fill="${color}"/>`,
      Lancer: `<line x1="14" y1="52" x2="46" y2="18" stroke="${color}" stroke-width="4" stroke-linecap="round"/><polygon points="54,10 38,16 48,26" fill="${color}"/><circle cx="24" cy="42" r="4" fill="${color}"/>`,
      Rider: `<circle cx="32" cy="34" r="16" stroke="${color}" stroke-width="4" fill="none"/><path d="M12 20 Q22 10 32 18 Q42 10 52 20" stroke="${color}" stroke-width="3.5" fill="none"/><line x1="32" y1="18" x2="32" y2="50" stroke="${color}" stroke-width="2.5"/><line x1="16" y1="34" x2="48" y2="34" stroke="${color}" stroke-width="2.5"/>`,
      Caster: `<path d="M32 8 L38 22 L52 22 L41 31 L45 45 L32 36 L19 45 L23 31 L12 22 L26 22 Z" fill="none" stroke="${color}" stroke-width="3"/><circle cx="32" cy="28" r="6" fill="${color}"/><line x1="32" y1="36" x2="32" y2="58" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`,
      Assassin: `<path d="M18 14 Q32 6 46 14 L44 38 Q32 54 20 38 Z" fill="none" stroke="${color}" stroke-width="3.5"/><circle cx="26" cy="26" r="3" fill="${color}"/><circle cx="38" cy="26" r="3" fill="${color}"/><path d="M25 38 L32 43 L39 38" stroke="${color}" stroke-width="3" fill="none"/>`,
      Berserker: `<path d="M16 14 L24 26 L32 10 L40 26 L48 14 L50 42 L32 54 L14 42 Z" fill="none" stroke="${color}" stroke-width="3.5"/><polygon points="24,33 30,36 24,39" fill="${color}"/><polygon points="40,33 34,36 40,39" fill="${color}"/>`,
      Ruler: `<line x1="32" y1="8" x2="32" y2="54" stroke="${color}" stroke-width="4"/><line x1="12" y1="20" x2="52" y2="20" stroke="${color}" stroke-width="3.5"/><path d="M12 20 L6 36 L18 36 Z M52 20 L46 36 L58 36 Z" fill="${color}"/><rect x="20" y="50" width="24" height="5" rx="2" fill="${color}"/>`,
      Avenger: `<path d="M32 8 C46 20 50 38 32 56 C14 38 18 20 32 8 Z" fill="none" stroke="${color}" stroke-width="3.5"/><path d="M32 18 C39 26 40 36 32 46 C24 36 25 26 32 18 Z" fill="${color}"/>`,
      AlterEgo: `<path d="M32 10 A22 22 0 1 0 32 54 A22 22 0 1 0 32 10 Z" fill="none" stroke="${color}" stroke-width="3.5"/><path d="M32 10 A11 11 0 0 1 32 32 A11 11 0 0 0 32 54 A22 22 0 0 1 32 10 Z" fill="${color}"/>`,
      Foreigner: `<circle cx="32" cy="32" r="9" fill="${color}"/><ellipse cx="32" cy="32" rx="24" ry="9" fill="none" stroke="${color}" stroke-width="3" transform="rotate(30 32 32)"/><ellipse cx="32" cy="32" rx="24" ry="9" fill="none" stroke="${color}" stroke-width="3" transform="rotate(-30 32 32)"/>`,
      Pretender: `<path d="M14 22 Q23 12 32 22 Q41 12 50 22 L46 44 Q32 54 18 44 Z" fill="none" stroke="${color}" stroke-width="3.5"/><path d="M22 30 Q26 26 30 30 M34 30 Q38 34 42 30" stroke="${color}" stroke-width="3" fill="none"/><circle cx="32" cy="40" r="3" fill="${color}"/>`,
      MoonCancer: `<path d="M40 12 A20 20 0 1 0 40 52 A14 14 0 1 1 40 12 Z" fill="${color}"/><circle cx="44" cy="24" r="3.5" fill="${color}"/><circle cx="49" cy="34" r="2.5" fill="${color}"/>`,
      Shielder: `<path d="M14 14 L32 8 L50 14 L48 36 C46 46 32 56 32 56 C32 56 18 46 16 36 Z" fill="none" stroke="${color}" stroke-width="4"/><path d="M32 16 L32 48 M20 28 L44 28" stroke="${color}" stroke-width="3.5"/>`,
      Beast: `<path d="M16 14 L26 24 L32 8 L38 24 L48 14 L52 38 L32 56 L12 38 Z" fill="none" stroke="${color}" stroke-width="3.8"/><circle cx="24" cy="34" r="3.5" fill="${color}"/><circle cx="40" cy="34" r="3.5" fill="${color}"/><path d="M26 44 L32 49 L38 44" stroke="${color}" stroke-width="3" fill="none"/>`,
      UnBeast: `<circle cx="32" cy="32" r="20" fill="none" stroke="${color}" stroke-width="3.5"/><polygon points="32,10 38,26 54,32 38,38 32,54 26,38 10,32 26,26" fill="${color}" opacity="0.88"/>`
    };
    const inner = shapes[cls] || shapes.Saber;
    return `<svg class="class-icon-svg" width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  // 서번트 카드 뒷면 (소환 연출용: 흑테/동테/은테/금테 클래스 카드 백)
  function renderCardBackSVG(cls, tier = 'gold') {
    const palettes = {
      gold:   ['#f7d96c', '#b8861e', '#422c07', '#2a1d08', '#5c4110'],
      silver: ['#cfd9e6', '#7b8a9e', '#252e3a', '#18202c', '#334257'],
      bronze: ['#e0a16b', '#8f5228', '#331a09', '#241208', '#4d2a12'],
      black:  ['#ff5c77', '#6b1426', '#16050a', '#090308', '#290814']
    };
    const [frameOuter, frameMid, frameDark, bg1, bg2] = palettes[tier] || palettes.silver;
    const clsName = (CLASS_INFO[cls] && CLASS_INFO[cls].en) || 'SERVANT';
    const iconSvg = getClassIconSVG(cls, frameOuter, 92)
      .replace('<svg class="class-icon-svg" width="92" height="92" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">', '')
      .replace('</svg>', '');

    return `
      <svg viewBox="0 0 240 410" xmlns="http://www.w3.org/2000/svg" class="fgo-card-svg">
        <defs>
          <linearGradient id="cb_bg_${tier}_${cls}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${bg1}"/>
            <stop offset="50%" stop-color="${bg2}"/>
            <stop offset="100%" stop-color="${bg1}"/>
          </linearGradient>
          <linearGradient id="cb_fr_${tier}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${frameOuter}"/>
            <stop offset="50%" stop-color="${frameMid}"/>
            <stop offset="100%" stop-color="${frameOuter}"/>
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="234" height="404" rx="14" fill="url(#cb_bg_${tier}_${cls})" stroke="url(#cb_fr_${tier})" stroke-width="6"/>
        <rect x="13" y="13" width="214" height="384" rx="9" fill="none" stroke="${frameOuter}" stroke-width="1.5" opacity="0.7"/>
        <path d="M16 42 L16 16 L42 16 M224 42 L224 16 L198 16 M16 368 L16 394 L42 394 M224 368 L224 394 L198 394" stroke="${frameOuter}" stroke-width="4" fill="none"/>
        <circle cx="120" cy="195" r="82" fill="none" stroke="${frameOuter}" stroke-width="2" opacity="0.45"/>
        <circle cx="120" cy="195" r="68" fill="none" stroke="${frameOuter}" stroke-width="1.2" stroke-dasharray="5 5" opacity="0.6"/>
        <polygon points="120,108 195,195 120,282 45,195" fill="none" stroke="${frameOuter}" stroke-width="1.2" opacity="0.35"/>
        <g transform="translate(72, 147) scale(1.5)">${iconSvg}</g>
        <rect x="34" y="32" width="172" height="26" rx="4" fill="${frameDark}" stroke="${frameOuter}" stroke-width="1.2"/>
        <text x="120" y="50" text-anchor="middle" fill="${frameOuter}" font-size="13" font-weight="700" letter-spacing="3" font-family="serif">SERVANT</text>
        <rect x="34" y="346" width="172" height="30" rx="4" fill="${frameDark}" stroke="${frameOuter}" stroke-width="1.2"/>
        <text x="120" y="366" text-anchor="middle" fill="${frameOuter}" font-size="15" font-weight="800" letter-spacing="2.5" font-family="serif">${clsName}</text>
      </svg>
    `;
  }

  // 개념예장 카드 뒷면 (소환 연출용)
  function renderCEBackSVG(tier = 'silver') {
    const isGold = tier === 'gold';
    const stroke = isGold ? '#f7d96c' : '#b8c7d9';
    const bg1 = isGold ? '#261a0c' : '#161f2e';
    const bg2 = isGold ? '#523b16' : '#2c3d59';
    return `
      <svg viewBox="0 0 240 410" xmlns="http://www.w3.org/2000/svg" class="fgo-card-svg">
        <rect x="3" y="3" width="234" height="404" rx="14" fill="${bg1}" stroke="${stroke}" stroke-width="6"/>
        <rect x="14" y="14" width="212" height="382" rx="8" fill="${bg2}" stroke="${stroke}" stroke-width="1.5" opacity="0.85"/>
        <circle cx="120" cy="205" r="72" fill="none" stroke="${stroke}" stroke-width="2.5" opacity="0.7"/>
        <polygon points="120,130 165,205 120,280 75,205" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.8"/>
        <circle cx="120" cy="205" r="24" fill="${stroke}" opacity="0.25"/>
        <text x="120" y="54" text-anchor="middle" fill="${stroke}" font-size="12" font-weight="700" letter-spacing="2.5" font-family="serif">CRAFT ESSENCE</text>
        <text x="120" y="368" text-anchor="middle" fill="${stroke}" font-size="13" font-weight="700" letter-spacing="3" font-family="serif">개념예장</text>
      </svg>
    `;
  }

  // 오프라인 폴백 / SVG 모드용 서번트 포트레이트
  function renderServantPortraitInner(sv, ascension = 1) {
    const a = sv.art;
    const uid = `${sv.id}_${ascension}`;
    let ascFx = '';
    if (ascension >= 2) ascFx += `<circle cx="120" cy="128" r="68" fill="none" stroke="${a.accent}" stroke-width="2" opacity="0.55"/>`;
    if (ascension >= 4) ascFx += `<ellipse cx="120" cy="130" rx="95" ry="110" fill="${a.accent}" opacity="0.24"/>`;

    return `
      <defs>
        <linearGradient id="bg_${uid}" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stop-color="${a.bg1}"/>
          <stop offset="65%" stop-color="${a.bg2}"/>
          <stop offset="100%" stop-color="#0b0d17"/>
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="224" height="394" fill="url(#bg_${uid})"/>
      ${ascFx}
      <path d="M70 112 C62 155 62 210 75 245 L165 245 C178 210 178 155 170 112 C164 78 145 64 120 64 C95 64 76 78 70 112 Z" fill="${a.hair}" opacity="0.92"/>
      <path d="M40 315 C45 245 72 218 102 212 L138 212 C168 218 195 245 200 315 Z" fill="${a.outfit}"/>
      <path d="M88 214 L120 264 L152 214 L138 210 L120 238 L102 210 Z" fill="${a.accent}"/>
      <rect x="109" y="188" width="22" height="30" rx="8" fill="#f7dec8"/>
      <path d="M86 124 C86 96 154 96 154 124 C154 162 140 192 120 196 C100 192 86 162 86 124 Z" fill="#ffe6d2"/>
      <ellipse cx="104" cy="144" rx="7.5" ry="6.2" fill="#ffffff"/>
      <ellipse cx="136" cy="144" rx="7.5" ry="6.2" fill="#ffffff"/>
      <circle cx="105" cy="144.5" r="4.8" fill="${a.eye}"/>
      <circle cx="135" cy="144.5" r="4.8" fill="${a.eye}"/>
      <circle cx="105" cy="144.5" r="2.2" fill="#111"/>
      <circle cx="135" cy="144.5" r="2.2" fill="#111"/>
      <circle cx="107" cy="142.5" r="1.6" fill="#fff"/>
      <circle cx="137" cy="142.5" r="1.6" fill="#fff"/>
      <path d="M113 171 Q120 176 127 171" stroke="#c97b6d" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M80 128 C82 82 102 68 120 68 C138 68 158 82 160 128 C154 114 146 108 139 124 C134 106 124 102 120 126 C115 102 105 106 101 124 C94 108 86 114 80 128 Z" fill="${a.hair}"/>
    `;
  }

  function renderCEPortraitInner(ce) {
    const a = ce.art;
    const uid = ce.id;
    return `
      <defs>
        <linearGradient id="cebg_${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${a.bg1}"/>
          <stop offset="100%" stop-color="${a.bg2}"/>
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="224" height="394" fill="url(#cebg_${uid})"/>
      <circle cx="120" cy="168" r="64" fill="${a.primary}" opacity="0.22" stroke="${a.primary}" stroke-width="2.5"/>
      <polygon points="120,104 162,168 120,232 78,168" fill="${a.secondary}" opacity="0.45" stroke="${a.primary}" stroke-width="2.5"/>
    `;
  }

  // 카드 프레임 오버레이 SVG (공식 일러스트 위에 씌우거나 단독 SVG에 합성)
  function renderFrameOverlaySVG(item, isServant, options, includePortraitFallback) {
    const { ascension = 1, npLevel = 0, isNew = false, compact = false, rarityOverride = null, mlb = false } = options;
    const effRarity = (rarityOverride !== null && rarityOverride !== undefined) ? rarityOverride : item.rarity;
    let frameLight = '#d5e0ec', frameMid = '#7f90a6', frameDark = '#1f2836', starsColor = '#d5e0ec';
    if (effRarity >= 4) {
      frameLight = '#ffe380'; frameMid = '#c49124'; frameDark = '#3b2808';
      starsColor = effRarity === 5 ? '#ffe666' : '#ffd24d';
    } else if (effRarity === 0) {
      frameLight = '#ff5c77'; frameMid = '#5c1122'; frameDark = '#140408';
      starsColor = '#ff708d';
    } else if (effRarity <= 2) {
      frameLight = '#e5a874'; frameMid = '#8c4f24'; frameDark = '#2e1808';
      starsColor = '#f2b880';
    }
    const stars = effRarity === 0 ? '☆ 0 ☆' : '★'.repeat(effRarity);
    const uid = `${item.id}_${ascension}_${effRarity}_${includePortraitFallback ? 'fb' : 'ov'}`;

    const clsBadge = isServant ? (() => {
      const iconInner = getClassIconSVG(item.cls, frameLight, 28)
        .replace('<svg class="class-icon-svg" width="28" height="28" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">', '')
        .replace('</svg>', '');
      return `
        <circle cx="34" cy="34" r="21" fill="${frameDark}" stroke="${frameLight}" stroke-width="2.5"/>
        <g transform="translate(17, 17) scale(0.53)">${iconInner}</g>
      `;
    })() : `
      <rect x="14" y="16" width="54" height="22" rx="4" fill="${frameDark}" stroke="${frameLight}" stroke-width="1.5"/>
      <text x="41" y="31" text-anchor="middle" fill="${frameLight}" font-size="11" font-weight="700">예장</text>
    `;

    const npBadge = (isServant && npLevel > 0) ? `
      <rect x="176" y="16" width="48" height="22" rx="4" fill="rgba(10,16,34,0.9)" stroke="${frameLight}" stroke-width="1.5"/>
      <text x="200" y="31" text-anchor="middle" fill="#ffe666" font-size="11" font-weight="800">보${npLevel}</text>
    ` : '';

    const newBadge = isNew ? `
      <rect x="168" y="42" width="56" height="20" rx="10" fill="#ff3b5c" stroke="#fff" stroke-width="1.5"/>
      <text x="196" y="56" text-anchor="middle" fill="#fff" font-size="11" font-weight="900">NEW!</text>
    ` : '';

    // 원작 FGO 풀돌(4회 한계돌파 최대해방) 우측 하단 황금 십자가 마크!
    const mlbBadge = (!isServant && mlb) ? `
      <g transform="translate(196, 360)">
        <circle cx="14" cy="14" r="14" fill="rgba(16,12,4,0.92)" stroke="#ffe666" stroke-width="2"/>
        <path d="M14 4 L17 11 L24 14 L17 17 L14 24 L11 17 L4 14 L11 11 Z" fill="#ffe666"/>
      </g>
    ` : '';

    const displayName = item.name.length > 11 && compact ? (item.nickname || item.name.slice(0, 10)) : item.name;
    const subtitle = isServant ? (CLASS_INFO[item.cls]?.name || item.cls) : '개념예장';

    const portraitBlock = includePortraitFallback
      ? (isServant ? renderServantPortraitInner(item, ascension) : renderCEPortraitInner(item))
      : '';

    return `
      <svg viewBox="0 0 240 410" xmlns="http://www.w3.org/2000/svg" class="fgo-card-svg ${includePortraitFallback ? 'fgo-card-fallback' : 'fgo-card-frame-ov'}">
        <defs>
          <linearGradient id="fr_${uid}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${frameLight}"/>
            <stop offset="50%" stop-color="${frameMid}"/>
            <stop offset="100%" stop-color="${frameLight}"/>
          </linearGradient>
          <linearGradient id="plate_${uid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(6,10,22,0)"/>
            <stop offset="32%" stop-color="rgba(6,10,22,0.82)"/>
            <stop offset="100%" stop-color="rgba(6,10,22,0.96)"/>
          </linearGradient>
        </defs>

        ${portraitBlock}

        <!-- 하단 네임플레이트 그라데이션 -->
        <rect x="8" y="286" width="224" height="116" rx="8" fill="url(#plate_${uid})"/>

        <!-- 외곽 금속 프레임 -->
        <rect x="4" y="4" width="232" height="402" rx="13" fill="none" stroke="url(#fr_${uid})" stroke-width="7"/>
        <rect x="11" y="11" width="218" height="388" rx="8" fill="none" stroke="${frameLight}" stroke-width="1.2" opacity="0.72"/>
        <path d="M12 36 L12 12 L36 12 M228 36 L228 12 L204 12 M12 374 L12 398 L36 398 M228 374 L228 398 L204 398" stroke="${frameLight}" stroke-width="3" fill="none"/>

        ${clsBadge}
        ${npBadge}
        ${newBadge}
        ${mlbBadge}

        <text x="120" y="328" text-anchor="middle" fill="${starsColor}" font-size="18" font-weight="900" letter-spacing="2" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.95))">${stars}</text>
        <line x1="28" y1="338" x2="212" y2="338" stroke="${frameLight}" stroke-width="1" opacity="0.55"/>
        <text x="120" y="362" text-anchor="middle" fill="#ffffff" font-size="${displayName.length > 9 ? 14 : 16}" font-weight="800" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.95))">${displayName}</text>
        <text x="120" y="384" text-anchor="middle" fill="${frameLight}" font-size="12" font-weight="700" letter-spacing="1.5">${subtitle}</text>
      </svg>
    `;
  }

  // 완성형 FGO 카드 마크업 (공식 일러스트 + 프레임 오버레이 + 자동 SVG 폴백)
  function renderCardSVG(item, isServant = true, options = {}) {
    const { ascension = 1, eager = false } = options;
    const artUrl = getCardArtUrl(item, isServant, ascension);

    if (!artUrl) {
      return renderFrameOverlaySVG(item, isServant, options, true);
    }

    const fallbackSvg = renderFrameOverlaySVG(item, isServant, options, true);
    const overlaySvg = renderFrameOverlaySVG(item, isServant, options, false);

    return `
      <div class="fgo-card-shell">
        ${fallbackSvg}
        <img
          class="fgo-official-img"
          src="${artUrl}"
          alt="${item.name}"
          loading="${eager ? 'eager' : 'lazy'}"
          decoding="async"
          referrerpolicy="no-referrer"
          onerror="this.remove()"
        />
        ${overlaySvg}
      </div>
    `;
  }

  return {
    getArtMode,
    setArtMode,
    toggleArtMode,
    setCustomImage,
    hasCustomImage,
    clearAllCustomImages,
    getCardArtUrl,
    getFaceUrl,
    getCommandSpriteUrl,
    getStatusSpriteUrl,
    getNarrowFigureUrl,
    getCharaFigureUrl,
    preloadUrls,
    getClassIconSVG,
    renderCardBackSVG,
    renderCEBackSVG,
    renderCardSVG
  };
})();
