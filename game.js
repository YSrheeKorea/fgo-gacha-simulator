// ============================================================
// CHALDEA SUMMON SIMULATOR — 메인 게임 로직 & 상태 관리
// ============================================================

(() => {
  const SAVE_KEY = 'fgo_gacha_sim_save_v1';

  // 공식 한그오(KR) 대사·프로필·스킬·보구·개념예장 설명 데이터 병합
  function hydrateOfficialLore() {
    if (typeof KR_LORE === 'undefined') return;
    SERVANTS.forEach(sv => {
      const k = KR_LORE.servants && KR_LORE.servants[sv.id];
      if (!k) return;
      if (k.atkMax) sv.atk = k.atkMax;
      if (k.hpMax) sv.hp = k.hpMax;
      if (k.cv) sv.cv = k.cv;
      if (k.illustrator) sv.illustrator = k.illustrator;
      if (k.attribute) sv.attribute = k.attribute;
      if (k.npName) sv.npName = k.npName;
      if (k.npRuby) sv.npSub = k.npRuby;
      if (k.npDetail) sv.npDetail = k.npDetail;
      if (k.skills && k.skills.length) sv.skills = k.skills;
      if (k.cards && k.cards.length === 5) sv.cards = k.cards;
      if (k.summonQuote) sv.summonQuote = k.summonQuote;
      if (k.profileSummary) sv.profileSummary = k.profileSummary;
      if (k.profileBond) sv.profileBond = k.profileBond;
      if (k.myRoomLines && k.myRoomLines.length) {
        sv.officialLines = k.myRoomLines;
      }
    });
    CRAFT_ESSENCES.forEach(ce => {
      const k = KR_LORE.ces && KR_LORE.ces[ce.id];
      if (!k) return;
      if (k.illustrator) ce.illustrator = k.illustrator;
      if (k.atkMax !== undefined) ce.atkMax = k.atkMax;
      if (k.hpMax !== undefined) ce.hpMax = k.hpMax;
      if (k.effect) ce.effect = k.effect;
      if (k.effectMax) ce.effectMax = k.effectMax;
      if (k.flavor) ce.flavor = k.flavor;
    });
  }
  hydrateOfficialLore();

  // FGO 공식 가챠 확률 상수
  const RATES = {
    SV5: 0.01,
    SV5_PICKUP: 0.008,
    SV4: 0.03,
    SV3: 0.40,
    CE5: 0.04,
    CE4: 0.12,
    CE3: 0.40
  };

  // 기본 세이브 데이터 생성
  function createDefaultState() {
    return {
      sq: 900,           // 성정석
      tickets: 15,       // 호부
      mp: 300,           // 마나프리즘
      rp: 5,             // 레어프리즘
      fp: 20000,         // 프렌드 포인트 (프렌드 가챠 100연분)
      uso: 0,            // 무기명 영기
      grails: 3,         // 성배
      embers: 40,        // 종화 (예지의 맹화)
      qp: 15000000,      // QP
      commandSpells: 3,  // 영주 (최대 3획, 매일 0시 전회복)
      lastSpellResetDate: '', // YYYY-MM-DD (로컬 날짜 기준)
      activeBannerId: BANNERS[0].id,
      customPickup: { sv5: 'sv_no_444', sv4: 'sv_no_003' },
      bannerState: {},   // { [bannerId]: { pity: 0, singleBonus: 0, totalPulls: 0 } }
      servants: {},      // { [id]: { copies, extraCopies, npLevel, level, ascension, grailsUsed, bond, bondExp, viewAsc } }
      ces: {},           // { [id]: { copies, extraCopies } }
      activeMysticCodeId: 'mc_chaldea',
      mysticCodes: {},   // { [mcId]: { exp, level } }
      myRoomServantId: null,
      options: {
        fastFx: false,
        skipFx: false,
        autoSkipCommon: false,
        highParticles: true,
        textSpeed: 'normal'
      },
      stats: {
        totalPulls: 0,
        fpPulls: 0,
        sqSpent: 0,
        ticketsSpent: 0,
        simPaidKrw: 0,
        sv5: 0,
        sv5Pickup: 0,
        sv5Spook: 0,
        sv5Pity: 0,
        sv4: 0,
        sv3: 0,
        ce5: 0,
        ce4: 0,
        ce3: 0,
        curDryStreak: 0,
        maxDryStreak: 0,
        sparkCount: 0,
        rainbowCount: 0,
        mapoCount: 0,
        kscopeCount: 0,
        blackGrailCount: 0,
        recentPulls: [],  // 최근 20건 요약
        ssrHistory: []    // 획득한 5성 서번트 기록
      }
    };
  }

  function ensureStarterAndCustom(st) {
    // No.001 기본 서번트 마슈 키리에라이트 자동 지급 (원작 고증!)
    if (SERVANT_MAP.sv_no_001 && !st.servants.sv_no_001) {
      st.servants.sv_no_001 = {
        copies: 1, extraCopies: 0, npLevel: 1, level: 1,
        ascension: 1, grailsUsed: 0, bond: 1, bondExp: 0, viewAsc: 1
      };
      if (!st.myRoomServantId) st.myRoomServantId = 'sv_no_001';
    }
    if (typeof st.fp !== 'number') st.fp = 20000;
    if (!st.customPickup) st.customPickup = { sv5: 'sv_no_444', sv4: 'sv_no_003' };
    if (!SERVANT_MAP[st.customPickup.sv5]) st.customPickup.sv5 = 'sv_castoria';
    if (!SERVANT_MAP[st.customPickup.sv4]) st.customPickup.sv4 = 'sv_emiya';
    if (BANNER_MAP.bn_custom) {
      BANNER_MAP.bn_custom.pickup5 = [st.customPickup.sv5];
      BANNER_MAP.bn_custom.pickup4 = [st.customPickup.sv4];
    }
    // 원작 FGO 마술예장 28종 상태 초기화 (기본·스토리 7종 자동 해금)
    if (!st.mysticCodes || typeof st.mysticCodes !== 'object') st.mysticCodes = {};
    if (typeof DEFAULT_UNLOCKED_MYSTIC_CODES !== 'undefined') {
      DEFAULT_UNLOCKED_MYSTIC_CODES.forEach(id => {
        if (!st.mysticCodes[id]) st.mysticCodes[id] = { exp: 0, level: 1 };
      });
    }
    if (typeof MYSTIC_CODE_MAP !== 'undefined') {
      if (!st.activeMysticCodeId || !MYSTIC_CODE_MAP[st.activeMysticCodeId] || !st.mysticCodes[st.activeMysticCodeId]) {
        st.activeMysticCodeId = 'mc_chaldea';
        if (!st.mysticCodes.mc_chaldea) st.mysticCodes.mc_chaldea = { exp: 0, level: 1 };
      }
    }
    // 원작 FGO 터미널 마스터 상태 초기화 (기존 세이브 100% 호환)
    if (!st.terminal || typeof st.terminal !== 'object') {
      st.terminal = {
        masterLevel: 120,
        masterExp: 0,
        masterGender: 'female',
        part1Cleared: true,
        ap: 135,
        lastApTick: Date.now(),
        fragments: 21,
        apples: { gold: 10, silver: 15, bronze: 20, blue: 5, sapling: 10 },
        stormPods: 3,
        lastPodResetDate: '',
        starSand: 0,
        dailyGiftDate: '',
        grandRedMode: false,
        claimedMissions: {},
        freeQuestClears: {},
        claimedInterludes: {}
      };
    }
    if (!st.terminal.apples) st.terminal.apples = { gold: 10, silver: 15, bronze: 20, blue: 5, sapling: 10 };
    // v24: 퓨어프리즘·성배의 물방울·영맥석·티포트·특별재림·관위지정·64종 소재 초기화
    if (typeof st.purePrisms !== 'number') st.purePrisms = 100;
    if (typeof st.grailDrops !== 'number') st.grailDrops = 0;
    if (typeof st.leylineStones !== 'number') st.leylineStones = 5;
    if (typeof st.teapots !== 'number') st.teapots = 10;
    if (typeof st.specialAscUsed !== 'boolean') st.specialAscUsed = false;
    if (typeof st.dailyFreeFpDate !== 'string') st.dailyFreeFpDate = '';
    if (typeof st.dailyPaidPullDate !== 'string') st.dailyPaidPullDate = '';
    if (!st.grandGraph || typeof st.grandGraph !== 'object') st.grandGraph = {};
    if (!st.materials || typeof st.materials !== 'object') st.materials = {};
    Object.keys(st.servants || {}).forEach(id => {
      const o = st.servants[id];
      if (!o) return;
      if (typeof o.coins !== 'number') {
        const sv = SERVANT_MAP[id];
        o.coins = (typeof window.getFgoSummonCoins === 'function' ? window.getFgoSummonCoins(sv) : 30) * (o.copies || 1);
      }
      if (typeof o.fouHp !== 'number') o.fouHp = 0;
      if (typeof o.fouAtk !== 'number') o.fouAtk = 0;
      if (!Array.isArray(o.appendLevels) || o.appendLevels.length !== 5) o.appendLevels = [0, 0, 0, 0, 0];
      if (typeof o.bondCap !== 'number') o.bondCap = 10;
    });
    return st;
  }

  let state = ensureStarterAndCustom(loadState());
  let codexFilter = { type: 'servant', rarity: 'all', owned: 'all', cls: 'all', pool: 'all', trait: 'all', sort: 'id_asc', query: '' };
  let codexLimit = 60;
  let myroomQuery = '';
  let welfareQuery = '';
  let lastPullMode = 'multi';

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      const def = createDefaultState();
      return {
        ...def,
        ...parsed,
        customPickup: { ...def.customPickup, ...(parsed.customPickup || {}) },
        options: { ...def.options, ...(parsed.options || {}) },
        stats: { ...def.stats, ...(parsed.stats || {}) }
      };
    } catch (_) {
      return createDefaultState();
    }
  }

  function saveState() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function getBannerState(bannerId) {
    if (!state.bannerState[bannerId]) {
      state.bannerState[bannerId] = { pity: 0, singleBonus: 0, totalPulls: 0 };
    }
    return state.bannerState[bannerId];
  }

  // ================= 토스트 알림 =================
  function toast(msg) {
    const box = document.getElementById('toast-container');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'all 0.25s';
      setTimeout(() => el.remove(), 260);
    }, 2600);
  }
  window.showChaldeaToast = toast;

  // ================= 가챠 확률 엔진 (FGO 고증) =================
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function rollSingleCard(banner, forceRule = null) {
    const bState = getBannerState(banner.id);
    bState.totalPulls++;

    // 원작 FGO 고증 풀 분리:
    // - 픽업 배너 비픽업(픽뚫) 풀: 순수 상시(pool === 'permanent')만 등장 (배포·프렌드·한정·기본 캐릭터 제외!)
    // - 스토리 소환 풀: 상시 + 스토리 해금(pool === 'story') 전원 등장 (환상종 42기 획득 가능!)
    const inSqPool = (s) => s.pool === 'permanent' || (banner.isStory && s.pool === 'story');
    const poolSv5 = SERVANTS.filter(s => s.rarity === 5 && inSqPool(s));
    const poolSv4 = SERVANTS.filter(s => s.rarity === 4 && inSqPool(s));
    const poolSv3 = SERVANTS.filter(s => s.rarity === 3 && inSqPool(s));
    const allCe5  = CRAFT_ESSENCES.filter(c => c.rarity === 5 && !c.npcOnly && !c.fpOnly && !c.shopOnly);
    const allCe4  = CRAFT_ESSENCES.filter(c => c.rarity === 4 && !c.npcOnly && !c.fpOnly && !c.shopOnly);
    const allCe3  = CRAFT_ESSENCES.filter(c => c.rarity === 3 && !c.npcOnly && !c.fpOnly && !c.shopOnly);

    const hasPickup5 = !banner.isStory && banner.pickup5.length > 0;
    const hasPickup4 = !banner.isStory && banner.pickup4.length > 0;
    const hasPickup3 = !banner.isStory && Array.isArray(banner.pickup3) && banner.pickup3.length > 0;
    const hasPickupCE5 = !banner.isStory && banner.pickupCE5.length > 0;

    let type = 'ce';
    let item = null;
    let isPickup = false;
    let isSpook = false;
    let isPity = false;

    // 1) 330연 천장 체크 (스토리 배너 제외)
    if (hasPickup5 && bState.pity >= 329) {
      type = 'servant';
      item = SERVANT_MAP[pickRandom(banner.pickup5)];
      isPickup = true;
      isPity = true;
      bState.pity = 0;
    } else {
      // 2) 확률 판정 (강제 룰 지원: 4성+ 확정, 서번트 확정)
      let category = '';
      const r = Math.random();

      if (forceRule === '4plus') {
        // 4★+ 풀 재정규화 (총 0.20 = SV5 0.01 + SV4 0.03 + CE5 0.04 + CE4 0.12)
        const p = r * 0.20;
        if (p < 0.01) category = 'sv5';
        else if (p < 0.04) category = 'sv4';
        else if (p < 0.08) category = 'ce5';
        else category = 'ce4';
      } else if (forceRule === 'servant') {
        // 서번트 풀 재정규화 (총 0.44 = SV5 0.01 + SV4 0.03 + SV3 0.40)
        const p = r * 0.44;
        if (p < 0.01) category = 'sv5';
        else if (p < 0.04) category = 'sv4';
        else category = 'sv3';
      } else {
        if (r < 0.01) category = 'sv5';
        else if (r < 0.04) category = 'sv4';
        else if (r < 0.44) category = 'sv3';
        else if (r < 0.48) category = 'ce5';
        else if (r < 0.60) category = 'ce4';
        else category = 'ce3';
      }

      if (category === 'sv5') {
        type = 'servant';
        if (hasPickup5) {
          // 5★ 중 픽업 80% (0.8% / 1.0%), 픽뚫 20% (0.2% / 1.0%)
          if (Math.random() < 0.8) {
            item = SERVANT_MAP[pickRandom(banner.pickup5)];
            isPickup = true;
            bState.pity = 0;
          } else {
            item = pickRandom(poolSv5);
            isSpook = true;
            bState.pity++;
          }
        } else {
          item = pickRandom(poolSv5);
        }
      } else if (category === 'sv4') {
        type = 'servant';
        if (hasPickup5) bState.pity++;
        if (hasPickup4 && Math.random() < (banner.pickup4.length === 1 ? 0.5 : 0.8)) {
          item = SERVANT_MAP[pickRandom(banner.pickup4)];
          isPickup = true;
        } else {
          item = pickRandom(poolSv4);
        }
      } else if (category === 'sv3') {
        type = 'servant';
        if (hasPickup5) bState.pity++;
        if (hasPickup3 && Math.random() < 0.1) {
          item = SERVANT_MAP[pickRandom(banner.pickup3)];
          isPickup = true;
        } else {
          item = pickRandom(poolSv3);
        }
      } else if (category === 'ce5') {
        type = 'ce';
        if (hasPickup5) bState.pity++;
        if (hasPickupCE5 && Math.random() < 0.7) {
          item = CE_MAP[pickRandom(banner.pickupCE5)];
          isPickup = true;
        } else {
          item = pickRandom(allCe5);
        }
      } else if (category === 'ce4') {
        type = 'ce';
        if (hasPickup5) bState.pity++;
        item = pickRandom(allCe4);
      } else {
        type = 'ce';
        if (hasPickup5) bState.pity++;
        item = pickRandom(allCe3);
      }
    }

    // 3) 인벤토리 & 통계 반영
    let isNew = false;
    let npLevelAfter = 0;
    let usoGained = false;

    state.stats.totalPulls++;

    if (type === 'servant') {
      if (!state.servants[item.id]) {
        isNew = true;
        state.servants[item.id] = {
          copies: 1,
          extraCopies: 0,
          npLevel: 1,
          level: 1,
          ascension: 1,
          grailsUsed: 0,
          bond: 1,
          bondExp: 0,
          viewAsc: 1
        };
        if (!state.myRoomServantId) state.myRoomServantId = item.id;
      } else {
        const owned = state.servants[item.id];
        owned.copies++;
        if (owned.npLevel < 5) {
          owned.npLevel++;
        } else {
          owned.extraCopies++;
          if (item.rarity === 5) {
            state.uso++;
            usoGained = true;
          }
        }
      }
      // v24: 서번트 소환 시 공식 서번트 코인 지급
      const coinGain = typeof window.getFgoSummonCoins === 'function' ? window.getFgoSummonCoins(item) : 30;
      state.servants[item.id].coins = (state.servants[item.id].coins || 0) + coinGain;
      npLevelAfter = state.servants[item.id].npLevel;

      if (item.rarity === 5) {
        state.stats.sv5++;
        if (isPickup) state.stats.sv5Pickup++;
        if (isSpook) state.stats.sv5Spook++;
        if (isPity) state.stats.sv5Pity++;
        state.stats.curDryStreak = 0;
        state.stats.ssrHistory.unshift({
          id: item.id,
          name: item.name,
          cls: item.cls,
          pullNo: state.stats.totalPulls,
          isPickup,
          isSpook,
          isPity,
          bannerTitle: banner.title
        });
        if (state.stats.ssrHistory.length > 100) state.stats.ssrHistory.pop();
      } else {
        state.stats.curDryStreak++;
        if (state.stats.curDryStreak > state.stats.maxDryStreak) {
          state.stats.maxDryStreak = state.stats.curDryStreak;
        }
        if (item.rarity === 4) state.stats.sv4++;
        else state.stats.sv3++;
      }
    } else {
      if (!state.ces[item.id]) {
        isNew = true;
        state.ces[item.id] = { copies: 1, extraCopies: 0 };
      } else {
        state.ces[item.id].copies++;
        if (state.ces[item.id].copies > 5) state.ces[item.id].extraCopies++;
      }

      state.stats.curDryStreak++;
      if (state.stats.curDryStreak > state.stats.maxDryStreak) {
        state.stats.maxDryStreak = state.stats.curDryStreak;
      }
      if (item.rarity === 5) state.stats.ce5++;
      else if (item.rarity === 4) state.stats.ce4++;
      else state.stats.ce3++;

      if (item.id === 'ce_mapo_tofu') state.stats.mapoCount++;
      if (item.id === 'ce_kscope') state.stats.kscopeCount++;
      if (item.id === 'ce_black_grail') state.stats.blackGrailCount++;
    }

    // 4) 소환 연출 티어 결정
    let animTier = 'normal';
    if (type === 'servant' && item.rarity === 5) {
      const ar = Math.random();
      if (isPity || ar < 0.55) {
        animTier = 'rainbow';
        state.stats.rainbowCount++;
      } else if (ar < 0.78) {
        animTier = 'gold';
      } else {
        animTier = 'spark_rainbow';
        state.stats.sparkCount++;
      }
    } else if (type === 'servant' && item.rarity === 4) {
      if (Math.random() < 0.35) {
        animTier = 'spark_gold';
        state.stats.sparkCount++;
      } else {
        animTier = 'gold';
      }
    }

    // 최근 20건 로그 추가
    state.stats.recentPulls.unshift({
      type,
      id: item.id,
      name: item.name,
      rarity: item.rarity,
      isPickup,
      isSpook,
      isPity
    });
    if (state.stats.recentPulls.length > 20) state.stats.recentPulls.pop();

    return {
      type,
      item,
      isNew,
      isPickup,
      isSpook,
      isPity,
      npLevelAfter,
      usoGained,
      animTier
    };
  }

  // 11연차 (10+1) 실행: ★4 이상 1장 확정 + ★3 이상 서번트 1기 확정
  function rollElevenPack(banner) {
    const rolls = [];
    for (let i = 0; i < 11; i++) {
      let force = null;
      if (i === 9) {
        const has4Plus = rolls.some(x => x.item.rarity >= 4);
        const hasServant = rolls.some(x => x.type === 'servant');
        if (!has4Plus) force = '4plus';
        else if (!hasServant) force = 'servant';
      } else if (i === 10) {
        const has4Plus = rolls.some(x => x.item.rarity >= 4);
        const hasServant = rolls.some(x => x.type === 'servant');
        if (!has4Plus) force = '4plus';
        else if (!hasServant) force = 'servant';
      }
      rolls.push(rollSingleCard(banner, force));
    }
    return rolls;
  }

  // 프렌드 포인트 소환 1회 (★0 앙리마유 0.05% · ★4 세이버 릴리/하베트롯 0.5% · ★1~★3 프렌드 서번트 + ★1~★3 프렌드 예장)
  function rollFriendPointCard() {
    const fp4 = SERVANTS.filter(s => s.fp && s.rarity === 4);
    const fp3 = SERVANTS.filter(s => s.fp && s.rarity === 3);
    const fp2 = SERVANTS.filter(s => s.fp && s.rarity === 2);
    const fp1 = SERVANTS.filter(s => s.fp && s.rarity === 1);
    const allCe3 = CRAFT_ESSENCES.filter(c => c.rarity === 3 && !c.npcOnly);
    const allCe2 = CRAFT_ESSENCES.filter(c => c.rarity === 2 && !c.npcOnly);
    const allCe1 = CRAFT_ESSENCES.filter(c => c.rarity === 1 && !c.npcOnly);

    const r = Math.random();
    let type = 'servant';
    let item = null;
    let animTier = 'normal';

    if (r < 0.0005 && SERVANT_MAP.sv_no_107) {
      item = SERVANT_MAP.sv_no_107; // ★0 앙리마유!
      animTier = 'rainbow';
    } else if (r < 0.0055 && fp4.length) {
      item = pickRandom(fp4); // ★4 세이버 릴리 / 하베트롯
      animTier = 'gold';
    } else if (r < 0.1055 && fp3.length) {
      item = pickRandom(fp3);
    } else if (r < 0.3055 && fp2.length) {
      item = pickRandom(fp2);
    } else if (r < 0.6255 && fp1.length) {
      item = pickRandom(fp1);
    } else if (r < 0.7255 && allCe3.length) {
      type = 'ce'; item = pickRandom(allCe3);
    } else if (r < 0.8555 && allCe2.length) {
      type = 'ce'; item = pickRandom(allCe2);
    } else {
      type = 'ce'; item = pickRandom(allCe1.length ? allCe1 : allCe3);
    }

    state.stats.fpPulls = (state.stats.fpPulls || 0) + 1;
    let isNew = false;
    let npLevelAfter = 0;

    if (type === 'servant') {
      if (!state.servants[item.id]) {
        isNew = true;
        state.servants[item.id] = {
          copies: 1, extraCopies: 0, npLevel: 1, level: 1,
          ascension: 1, grailsUsed: 0, bond: 1, bondExp: 0, viewAsc: 1
        };
      } else {
        const owned = state.servants[item.id];
        owned.copies++;
        if (owned.npLevel < 5) owned.npLevel++;
        else owned.extraCopies++;
      }
      // v24: 서번트 소환 시 공식 서번트 코인 지급
      const coinGain = typeof window.getFgoSummonCoins === 'function' ? window.getFgoSummonCoins(item) : 30;
      state.servants[item.id].coins = (state.servants[item.id].coins || 0) + coinGain;
      npLevelAfter = state.servants[item.id].npLevel;
    } else {
      if (!state.ces[item.id]) {
        isNew = true;
        state.ces[item.id] = { copies: 1, extraCopies: 0 };
      } else {
        state.ces[item.id].copies++;
        if (state.ces[item.id].copies > 5) state.ces[item.id].extraCopies++;
      }
    }

    state.stats.recentPulls.unshift({
      type, id: item.id, name: item.name, rarity: item.rarity,
      isPickup: item.rarity === 0 || item.rarity === 4, isSpook: false, isPity: false
    });
    if (state.stats.recentPulls.length > 20) state.stats.recentPulls.pop();

    return {
      type, item, isNew, isPickup: item.rarity === 0, isSpook: false, isPity: false,
      npLevelAfter, usoGained: false, animTier
    };
  }

  // ================= 소환 액션 핸들러 =================
  function executeSummon(mode) {
    const banner = BANNER_MAP[state.activeBannerId] || BANNERS[0];
    const bState = getBannerState(banner.id);
    lastPullMode = mode;

    let results = [];
    let modalTitle = '✨ 소환 결과';

    if (mode === 'fp1' || mode === 'fp10' || mode === 'fp100') {
      const count = mode === 'fp1' ? 1 : (mode === 'fp10' ? 10 : 100);
      const cost = count * 200;
      if (state.fp < cost) {
        SoundEngine.error();
        toast(`프렌드 포인트가 ${cost.toLocaleString()} FP 필요합니다! 배틀 클리어 또는 다 빈치 공방에서 무료 보급받으세요.`);
        return;
      }
      state.fp -= cost;
      for (let i = 0; i < count; i++) results.push(rollFriendPointCard());
      modalTitle = `🤝 프렌드 포인트 ${count}회 소환 결과`;
      saveState();
      renderAll();
      const hasGoldFp = results.some(r => r.item.rarity >= 4 || (r.type === 'servant' && r.item.rarity === 0));
      if (mode === 'fp100' || (state.options.skipFx && !hasGoldFp)) {
        SoundEngine.reveal(hasGoldFp ? 5 : 3, hasGoldFp);
        showResultModal(results, modalTitle);
      } else {
        SummonFX.playSequence(results, (doneRolls) => {
          showResultModal(doneRolls, modalTitle);
        }, {
          fastMode: state.options.fastFx,
          autoSkipCommon: state.options.autoSkipCommon,
          skipCommonOnly: !!state.options.skipFx,
          highParticles: state.options.highParticles !== false,
          textSpeed: state.options.textSpeed || 'normal'
        });
      }
      return;
    }

    if (mode === 'ticket') {
      if (state.tickets < 1) {
        SoundEngine.error();
        toast('호부가 부족합니다! 다 빈치 공방에서 마나프리즘으로 교환해 보세요.');
        return;
      }
      state.tickets -= 1;
      state.stats.ticketsSpent += 1;
      bState.singleBonus++;
      results.push(rollSingleCard(banner));
      if (bState.singleBonus >= 10) {
        bState.singleBonus = 0;
        results.push(rollSingleCard(banner));
        toast('🎉 단차 10회 달성! 보너스 1회 소환이 추가되었습니다!');
      }
      modalTitle = '🎫 호부 소환 결과';
    } else if (mode === 'single') {
      if (state.sq < 3) {
        SoundEngine.error();
        toast('성정석이 부족합니다! 상단 💎 버튼을 눌러 무료 충전하세요.');
        return;
      }
      state.sq -= 3;
      state.stats.sqSpent += 3;
      bState.singleBonus++;
      results.push(rollSingleCard(banner));
      if (bState.singleBonus >= 10) {
        bState.singleBonus = 0;
        results.push(rollSingleCard(banner));
        toast('🎉 단차 10회 달성! 보너스 1회 소환이 추가되었습니다!');
      }
      modalTitle = '💎 1회 소환 결과';
    } else if (mode === 'multi') {
      if (state.sq < 30) {
        SoundEngine.error();
        toast('성정석이 30개 필요합니다! 상단 💎 버튼에서 무료로 충전할 수 있습니다.');
        return;
      }
      state.sq -= 30;
      state.stats.sqSpent += 30;
      results = rollElevenPack(banner);
      modalTitle = `✨ 11회 소환 결과 — ${banner.title}`;
    } else if (mode === 'sim110') {
      if (state.sq < 300) {
        SoundEngine.error();
        toast('110연 고속 시뮬은 성정석 300개가 필요합니다! 상단 💎에서 충전하세요.');
        return;
      }
      state.sq -= 300;
      state.stats.sqSpent += 300;
      for (let set = 0; set < 10; set++) {
        results.push(...rollElevenPack(banner));
      }
      modalTitle = `🔥 110연 고속 시뮬레이션 결과 — ${banner.title}`;
    }

    // 100연차마다 마스터 보너스 종화 지급
    if (results.length >= 11) {
      state.embers += results.length >= 110 ? 20 : 2;
    }

    saveState();
    renderAll();

    // 원작 FGO 고증: 스킵 옵션 시에도 은테(★3)·동테(★1~2)만 스킵되며 금테(★4~5) 이상은 그대로 연출! (110연 고속 시뮬은 즉시 결과)
    const hasGold = results.some(r => r.item.rarity >= 4 || (r.type === 'servant' && r.item.rarity === 0));
    if (mode === 'sim110' || (state.options.skipFx && !hasGold)) {
      const hasSsr = results.some(r => r.type === 'servant' && r.item.rarity === 5);
      SoundEngine.reveal(hasSsr ? 5 : 4, hasSsr);
      showResultModal(results, modalTitle);
    } else {
      SummonFX.playSequence(results, (doneRolls) => {
        showResultModal(doneRolls, modalTitle);
      }, {
        fastMode: state.options.fastFx,
        autoSkipCommon: state.options.autoSkipCommon,
        skipCommonOnly: !!state.options.skipFx,
        highParticles: state.options.highParticles !== false,
        textSpeed: state.options.textSpeed || 'normal'
      });
    }
  }

  function showResultModal(results, title) {
    const modal = document.getElementById('result-modal');
    const titleEl = document.getElementById('result-modal-title');
    const sumEl = document.getElementById('result-summary-bar');
    const gridEl = document.getElementById('result-cards-grid');
    const againBtn = document.getElementById('btn-result-again');

    titleEl.textContent = title;

    const sv5Count = results.filter(r => r.type === 'servant' && r.item.rarity === 5).length;
    const sv4Count = results.filter(r => r.type === 'servant' && r.item.rarity === 4).length;
    const sv0Count = results.filter(r => r.type === 'servant' && r.item.rarity === 0).length;
    const ce5Count = results.filter(r => r.type === 'ce' && r.item.rarity === 5).length;
    const mapoCount = results.filter(r => r.item.id === 'ce_mapo_tofu').length;

    let comment = '';
    if (sv0Count >= 1) comment = '🖤 기적의 ★0 앙리마유 강림!! (전설의 0.05%!!)';
    else if (sv5Count >= 2) comment = '🔥 미친 비틱!! 5성 다중 출현!!';
    else if (sv5Count === 1) comment = '🎉 축하합니다! ★5 서번트 강림!';
    else if (sv4Count >= 1) comment = '✨ 금테 서번트 확보!';
    else if (mapoCount >= 2) comment = '🌶️ 신부의 은총이 가득합니다… (대폭사)';
    else comment = '💀 최소 보장… 다음 소환엔 뜰 겁니다!';

    sumEl.innerHTML = `
      <span>총 ${results.length}장</span>
      <span style="color:#ffe666">★5 서번트: ${sv5Count}</span>
      <span style="color:#ffd24d">★4 서번트: ${sv4Count}</span>
      <span style="color:#d9a6ff">★5 예장: ${ce5Count}</span>
      <span style="margin-left:auto;color:#6ee7ff">${comment}</span>
    `;

    // 110연일 경우 상위 레어도 우선 정렬해서 핵심 카드가 맨 위에 보이게!
    const displayList = results.length > 20
      ? [...results].sort((a, b) => {
          const scoreA = a.item.rarity * 10 + (a.type === 'servant' ? 5 : 0);
          const scoreB = b.item.rarity * 10 + (b.type === 'servant' ? 5 : 0);
          return scoreB - scoreA;
        })
      : results;

    gridEl.innerHTML = '';
    displayList.forEach(roll => {
      const slot = document.createElement('div');
      slot.className = 'result-card-slot' + (roll.type === 'servant' && roll.item.rarity === 5 ? ' is-ssr' : '');
      slot.innerHTML = ArtRenderer.renderCardSVG(roll.item, roll.type === 'servant', {
        ascension: 1,
        npLevel: roll.type === 'servant' ? roll.npLevelAfter : 0,
        isNew: roll.isNew,
        compact: true
      });
      slot.addEventListener('click', () => openDetailModal(roll.type, roll.item.id));
      gridEl.appendChild(slot);
    });

    againBtn.textContent = lastPullMode === 'sim110'
      ? '🔥 한 번 더 110연 고속 시뮬 (💎300)'
      : (lastPullMode === 'fp100'
        ? '🔥 한 번 더 프렌드 100회 (🤝20,000)'
        : (lastPullMode === 'fp10' || lastPullMode === 'fp1'
          ? '🤝 한 번 더 프렌드 10회 (🤝2,000)'
          : '✨ 한 번 더 11회 소환 (💎30)'));

    modal.classList.remove('hidden');
  }

  // ================= 렌더링: 상단 재화 =================
  function renderResources() {
    document.getElementById('res-sq').textContent = state.sq.toLocaleString();
    document.getElementById('res-ticket').textContent = state.tickets.toLocaleString();
    document.getElementById('res-mp').textContent = state.mp.toLocaleString();
    document.getElementById('res-rp').textContent = state.rp.toLocaleString();
    const fpEl = document.getElementById('res-fp');
    if (fpEl) fpEl.textContent = (state.fp || 0).toLocaleString();
    document.getElementById('res-grail').textContent = state.grails.toLocaleString();
    document.getElementById('btn-mute').textContent = SoundEngine.isMuted() ? '🔇' : '🔊';
    const artBtn = document.getElementById('btn-art-mode');
    if (artBtn) {
      const isOff = ArtRenderer.getArtMode() === 'official';
      artBtn.textContent = isOff ? '🖼️' : '🎨';
      artBtn.title = isOff ? '현재: 공식 일러스트 (클릭 시 SVG 모드로 전환)' : '현재: SVG 모드 (클릭 시 공식 일러스트로 전환)';
    }
  }

  // ================= 렌더링: 소환 탭 =================
  function renderSummonTab() {
    const strip = document.getElementById('banner-strip');
    const activeBanner = BANNER_MAP[state.activeBannerId] || BANNERS[0];
    const bState = getBannerState(activeBanner.id);

    strip.innerHTML = '';
    BANNERS.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'banner-chip' + (b.id === activeBanner.id ? ' active' : '');
      btn.style.background = `linear-gradient(135deg, ${b.theme[0]}, ${b.theme[1]}88)`;
      const p5Name = b.pickup5.length ? b.pickup5.map(id => SERVANT_MAP[id]?.nickname || '').join(' · ') : '상시 균등';
      const faceUrl = ArtRenderer.getFaceUrl(b.pickup5[0] || 'sv_artoria');
      const thumbHtml = faceUrl
        ? `<img class="face-thumb" src="${faceUrl}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`
        : '';
      btn.innerHTML = `
        <div class="banner-chip-inner">
          ${thumbHtml}
          <div>
            <div class="banner-chip-tag">${b.tag}</div>
            <div class="banner-chip-name">${p5Name}</div>
            <div class="banner-chip-sub">${b.title.slice(0, 12)}${b.title.length > 12 ? '…' : ''}</div>
          </div>
        </div>
      `;
      btn.addEventListener('click', () => {
        SoundEngine.click();
        state.activeBannerId = b.id;
        saveState();
        renderSummonTab();
      });
      strip.appendChild(btn);
    });

    // 히어로 배경 & 텍스트
    const hero = document.getElementById('banner-hero');
    hero.style.background = `linear-gradient(135deg, ${activeBanner.theme[0]} 0%, ${activeBanner.theme[1]}cc 60%, #09132b 100%)`;

    document.getElementById('banner-tag').textContent = activeBanner.tag;
    document.getElementById('banner-title').textContent = activeBanner.title;
    document.getElementById('banner-subtitle').textContent = activeBanner.subtitle;
    document.getElementById('banner-quote').textContent = activeBanner.quote;

    const pityLeft = Math.max(0, 330 - bState.pity);
    const pityBadge = document.getElementById('banner-pity-badge');
    const pityWrap = document.getElementById('pity-bar-wrap');
    const bonusBadge = document.getElementById('banner-bonus-badge');
    if (activeBanner.isFP) {
      pityBadge.textContent = `보유 FP ${(state.fp || 0).toLocaleString()}`;
      pityWrap.style.display = 'none';
      bonusBadge.textContent = '★0 앙리마유 0.05%';
    } else if (activeBanner.isStory) {
      pityBadge.textContent = '천장 없음 (상시 · 스토리 42기)';
      pityWrap.style.display = 'none';
      bonusBadge.textContent = `단차 보너스 ${bState.singleBonus}/10`;
    } else {
      pityBadge.textContent = `천장까지 ${pityLeft}회`;
      pityWrap.style.display = 'block';
      document.getElementById('pity-bar-text').textContent = `${bState.pity} / 330 회 (${Math.floor((bState.pity / 330) * 100)}%)`;
      document.getElementById('pity-bar-fill').style.width = `${Math.min(100, (bState.pity / 330) * 100)}%`;
      bonusBadge.textContent = `단차 보너스 ${bState.singleBonus}/10`;
    }

    // 커스텀 픽업 선택 UI & FP/성정석 버튼 전환
    const customBox = document.getElementById('custom-pickup-box');
    if (customBox) {
      customBox.classList.toggle('hidden', !activeBanner.isCustom);
      if (activeBanner.isCustom) populateCustomPickupSelectors();
    }
    const sqPanel = document.getElementById('sq-summon-actions');
    const fpPanel = document.getElementById('fp-summon-actions');
    if (sqPanel && fpPanel) {
      sqPanel.classList.toggle('hidden', !!activeBanner.isFP);
      fpPanel.classList.toggle('hidden', !activeBanner.isFP);
    }

    // 픽업 칩
    const pickupsEl = document.getElementById('banner-pickups');
    pickupsEl.innerHTML = '';
    activeBanner.pickup5.forEach(id => {
      const sv = SERVANT_MAP[id];
      if (!sv) return;
      const chip = document.createElement('button');
      chip.className = 'pickup-chip';
      chip.innerHTML = `<span class="star5">★★★★★</span> ${sv.name} (${CLASS_INFO[sv.cls]?.name})`;
      chip.addEventListener('click', () => openDetailModal('servant', id));
      pickupsEl.appendChild(chip);
    });
    activeBanner.pickup4.forEach(id => {
      const sv = SERVANT_MAP[id];
      if (!sv) return;
      const chip = document.createElement('button');
      chip.className = 'pickup-chip';
      chip.innerHTML = `<span class="star4">★★★★</span> ${sv.name}`;
      chip.addEventListener('click', () => openDetailModal('servant', id));
      pickupsEl.appendChild(chip);
    });
    (activeBanner.pickup3 || []).forEach(id => {
      const sv = SERVANT_MAP[id];
      if (!sv) return;
      const chip = document.createElement('button');
      chip.className = 'pickup-chip';
      chip.innerHTML = `<span style="color:#cfd9e6">★★★ 한정</span> ${sv.name}`;
      chip.addEventListener('click', () => openDetailModal('servant', id));
      pickupsEl.appendChild(chip);
    });
    activeBanner.pickupCE5.forEach(id => {
      const ce = CE_MAP[id];
      if (!ce) return;
      const chip = document.createElement('button');
      chip.className = 'pickup-chip';
      chip.innerHTML = `<span style="color:#d9a6ff">★5 예장</span> ${ce.name}`;
      chip.addEventListener('click', () => openDetailModal('ce', id));
      pickupsEl.appendChild(chip);
    });

    // 우측 대표 카드
    const featWrap = document.getElementById('banner-featured-card');
    const featuredId = activeBanner.pickup5[0] || 'sv_artoria';
    const featSv = SERVANT_MAP[featuredId];
    const ownedFeat = state.servants[featuredId];
    featWrap.innerHTML = `<div class="banner-featured-card-box">${ArtRenderer.renderCardSVG(featSv, true, {
      ascension: ownedFeat ? ownedFeat.viewAsc : 4,
      npLevel: ownedFeat ? ownedFeat.npLevel : 0
    })}</div>`;
    featWrap.querySelector('.banner-featured-card-box').addEventListener('click', () => openDetailModal('servant', featuredId));

    // 옵션 체크박스 동기화
    document.getElementById('opt-fast-fx').checked = !!state.options.fastFx;
    document.getElementById('opt-skip-fx').checked = !!state.options.skipFx;

    // 최근 20건 기록
    const recentEl = document.getElementById('recent-pulls-list');
    if (state.stats.recentPulls.length === 0) {
      recentEl.innerHTML = '<div class="empty-hint">아직 소환 기록이 없습니다. 첫 소환을 시작해 보세요!</div>';
    } else {
      recentEl.innerHTML = state.stats.recentPulls.map(r => {
        let cls = '';
        if (r.type === 'servant' && r.rarity === 5) cls = 'r5-sv';
        else if (r.type === 'servant' && r.rarity === 4) cls = 'r4-sv';
        else if (r.type === 'ce' && r.rarity === 5) cls = 'r5-ce';
        else if (r.id === 'ce_mapo_tofu') cls = 'r3-meme';
        const tag = r.isPity ? '[천장]' : (r.isSpook ? '[픽뚫]' : '');
        const stars = r.rarity === 0 ? '☆0' : '★'.repeat(r.rarity);
        return `<span class="recent-pill ${cls}">${stars} ${r.name} ${tag}</span>`;
      }).join('');
    }
  }

  function populateCustomPickupSelectors() {
    const q5 = (document.getElementById('custom-pu5-search')?.value || '').trim().toLowerCase();
    const q4 = (document.getElementById('custom-pu4-search')?.value || '').trim().toLowerCase();
    const sel5 = document.getElementById('custom-pu5-sel');
    const sel4 = document.getElementById('custom-pu4-sel');
    if (!sel5 || !sel4) return;

    const matchSv = (s, q) => !q || s.name.toLowerCase().includes(q) || String(s.collectionNo || '').includes(q) || (CLASS_INFO[s.cls]?.name || '').includes(q);
    const list5 = SERVANTS.filter(s => s.rarity === 5 && matchSv(s, q5));
    const list4 = SERVANTS.filter(s => s.rarity === 4 && matchSv(s, q4));

    sel5.innerHTML = list5.map(s =>
      `<option value="${s.id}" ${s.id === state.customPickup.sv5 ? 'selected' : ''}>No.${String(s.collectionNo).padStart(3, '0')} · ${s.name} (${CLASS_INFO[s.cls]?.name || s.cls})</option>`
    ).join('');
    sel4.innerHTML = list4.map(s =>
      `<option value="${s.id}" ${s.id === state.customPickup.sv4 ? 'selected' : ''}>No.${String(s.collectionNo).padStart(3, '0')} · ${s.name} (${CLASS_INFO[s.cls]?.name || s.cls})</option>`
    ).join('');
  }

  // ================= 렌더링: 영기 일람 (도감 — 공식 ID No.001~487 순) =================
  function renderCodexTab() {
    const grid = document.getElementById('codex-grid');
    const pager = document.getElementById('codex-pager');
    const clsSelect = document.getElementById('codex-class-filter');
    const poolSelect = document.getElementById('codex-pool-filter');
    const traitSelect = document.getElementById('codex-trait-filter');
    const sortSelect = document.getElementById('codex-sort-filter');

    // 클래스 필터 드롭다운 1회 채우기
    if (clsSelect.options.length <= 1) {
      Object.entries(CLASS_INFO).forEach(([k, v]) => {
        if (k.startsWith('BeastI')) return;
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = v.name;
        clsSelect.appendChild(opt);
      });
    }

    const mode = codexFilter.type; // 'servant' | 'ce' | 'npc'
    const isServant = mode === 'servant';
    const isNpc = mode === 'npc';
    clsSelect.style.display = (isServant || isNpc) ? 'inline-block' : 'none';
    if (poolSelect) poolSelect.style.display = isServant ? 'inline-block' : 'none';
    if (traitSelect) traitSelect.style.display = isServant ? 'inline-block' : 'none';
    if (sortSelect) sortSelect.style.display = isServant ? 'inline-block' : 'none';

    if (isNpc) {
      document.getElementById('codex-progress-box').textContent = `미실장 프로필 ${NPC_PROFILES.length}기 (소환 불가 · 마테리얼 등록)`;
      const q = (codexFilter.query || '').trim().toLowerCase();
      const npcs = NPC_PROFILES.filter(n => {
        if (codexFilter.cls !== 'all' && n.cls !== codexFilter.cls) return false;
        if (q && !n.name.toLowerCase().includes(q) && !String(n.no).includes(q)) return false;
        return true;
      });
      grid.innerHTML = '';
      if (pager) pager.innerHTML = '';
      npcs.forEach(n => {
        const fakeSv = {
          id: `npc_${n.no}`, name: n.name, rarity: n.rarity, cls: n.cls,
          atlasId: n.atlasId, region: n.reg, customAsc: n.img ? [n.img] : [],
          art: { bg1: '#1a0a16', bg2: '#7a1c38', hair: '#fff', eye: '#ff5277', outfit: '#1b1024', accent: '#ff5c8a' }
        };
        const div = document.createElement('div');
        div.className = 'codex-item';
        div.innerHTML = ArtRenderer.renderCardSVG(fakeSv, true, { ascension: 1, compact: true }) +
          `<span class="codex-no-badge">No.${String(n.no).padStart(3, '0')}</span>` +
          `<span class="codex-pool-tag pool-npc">${n.note || '프로필 한정'}</span>`;
        grid.appendChild(div);
      });
      return;
    }

    const list = isServant ? SERVANTS : CRAFT_ESSENCES;
    const ownedMap = isServant ? state.servants : state.ces;
    const ownedTotal = list.filter(x => !!ownedMap[x.id]).length;
    const pct = Math.round((ownedTotal / list.length) * 100);
    document.getElementById('codex-progress-box').textContent =
      `${isServant ? '서번트' : '개념예장'} 수집률 ${ownedTotal}/${list.length} (${pct}%)`;

    const q = (codexFilter.query || '').trim().toLowerCase();
    let filtered = list.filter(item => {
      const owned = ownedMap[item.id];
      const effR = isServant ? getEffectiveRarity(item, owned) : item.rarity;
      if (codexFilter.rarity === 'variable') {
        if (!item.variableRarity) return false;
      } else if (codexFilter.rarity !== 'all' && String(effR) !== codexFilter.rarity) {
        return false;
      }
      const isOwned = !!owned;
      if (codexFilter.owned === 'owned' && !isOwned) return false;
      if (codexFilter.owned === 'unowned' && isOwned) return false;
      if (isServant && codexFilter.cls !== 'all' && item.cls !== codexFilter.cls) return false;
      if (isServant && codexFilter.pool !== 'all' && item.pool !== codexFilter.pool) return false;
      if (isServant && codexFilter.trait !== 'all') {
        const tf = codexFilter.trait;
        if (tf === 'npSp') {
          if (!item.npSpecial || !item.npSpecial.length) return false;
        } else if (tf.startsWith('gen:')) {
          const want = tf.slice(4);
          if (want === '없음') {
            if (item.gender === '여성' || item.gender === '남성') return false;
          } else if (item.gender !== want) return false;
        } else if (tf.startsWith('align:')) {
          const want = tf.slice(6);
          if (!(item.alignment || '').includes(want)) return false;
        } else if (tf.startsWith('tr:')) {
          const want = tf.slice(3);
          if (!(item.traits || []).includes(want)) return false;
        }
      }
      if (q) {
        const noStr = String(item.collectionNo || '').padStart(3, '0');
        const hit = item.name.toLowerCase().includes(q)
          || (item.nickname && item.nickname.toLowerCase().includes(q))
          || noStr.includes(q)
          || String(item.collectionNo || '').includes(q);
        if (!hit) return false;
      }
      return true;
    });

    if (isServant) {
      filtered = [...filtered];
      if (codexFilter.sort === 'id_desc') filtered.sort((a, b) => (b.collectionNo || 0) - (a.collectionNo || 0));
      else if (codexFilter.sort === 'rarity_desc') filtered.sort((a, b) => (b.rarity - a.rarity) || ((a.collectionNo || 0) - (b.collectionNo || 0)));
      else filtered.sort((a, b) => (a.collectionNo || 0) - (b.collectionNo || 0));
    }

    grid.innerHTML = '';
    if (pager) pager.innerHTML = '';
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="empty-hint">조건에 맞는 영기가 없습니다.</div>';
      return;
    }

    const visibleList = filtered.slice(0, codexLimit);
    const poolShort = { starter: '기본', permanent: '상시', limited: '한정', story: '스토리', fp: '프렌드', welfare: '배포' };

    visibleList.forEach(item => {
      const owned = ownedMap[item.id];
      const div = document.createElement('div');
      div.className = 'codex-item' + (owned ? '' : ' unowned');
      const noBadge = isServant && item.collectionNo
        ? `<span class="codex-no-badge">No.${String(item.collectionNo).padStart(3, '0')}</span>`
        : '';
      const poolBadge = isServant && item.pool
        ? `<span class="codex-pool-tag pool-${item.pool}">${poolShort[item.pool] || item.pool}</span>`
        : '';
      const effR = isServant ? getEffectiveRarity(item, owned) : item.rarity;
      const mlbCe = !isServant && isCeMlb(owned);
      div.innerHTML = ArtRenderer.renderCardSVG(item, isServant, {
        ascension: isServant && owned ? owned.viewAsc : 1,
        npLevel: isServant && owned ? owned.npLevel : 0,
        rarityOverride: effR,
        mlb: mlbCe,
        compact: true
      }) + noBadge + poolBadge + (owned ? `<span class="codex-item-count">${isServant ? `Lv.${owned.level}` : `${mlbCe ? '✛' : ''}Lv.${owned.level || 1}·x${owned.copies}`}</span>` : '');
      div.addEventListener('click', () => openDetailModal(codexFilter.type, item.id));
      grid.appendChild(div);
    });

    if (pager && filtered.length > visibleList.length) {
      pager.innerHTML = `
        <span class="codex-pager-info">표시 중 ${visibleList.length} / ${filtered.length}기</span>
        <button class="small-outline-btn" id="btn-codex-more">➕ 60기 더 보기</button>
        <button class="small-outline-btn" id="btn-codex-all">전체 ${filtered.length}기 표시</button>
      `;
      document.getElementById('btn-codex-more').addEventListener('click', () => {
        codexLimit += 60;
        renderCodexTab();
      });
      document.getElementById('btn-codex-all').addEventListener('click', () => {
        codexLimit = filtered.length;
        renderCodexTab();
      });
    } else if (pager && filtered.length > 0) {
      pager.innerHTML = `<span class="codex-pager-info">총 ${filtered.length}기 표시 완료</span>`;
    }
  }

  // ================= 렌더링: 마이룸 & 육성 =================
  function getBaseMaxLevel(rarity) {
    if (rarity === 5) return 90;
    if (rarity === 4) return 80;
    if (rarity === 3) return 70;
    if (rarity === 2 || rarity === 0) return 65;
    return 60; // ★1
  }

  function getMaxLevelCap(sv, owned) {
    const effR = getEffectiveRarity(sv, owned);
    const baseMax = getBaseMaxLevel(effR);
    const ascCap = Math.min(baseMax, Math.max(20, (baseMax - 30) + (owned.ascension - 1) * 10));
    if (owned.ascension < 4) return ascCap;
    // 성배전림으로 최대 Lv.120까지 확장!
    return Math.min(120, baseMax + owned.grailsUsed * 2);
  }

  // ================= 공식 FGO 강화 QP 비용표 (★0~★5 나무위키 기준) =================
  const ASCENSION_QP = {
    5: [300000, 1000000, 3000000],
    4: [150000, 500000, 1500000],
    3: [100000, 300000, 900000],
    2: [45000, 150000, 450000],
    1: [30000, 100000, 300000],
    0: [45000, 150000, 450000]
  };
  const SKILL_QP = {
    5: [200000, 400000, 1200000, 1600000, 4000000, 5000000, 10000000, 12000000, 20000000],
    4: [100000, 200000, 600000, 800000, 2000000, 2500000, 5000000, 6000000, 10000000],
    3: [50000, 100000, 300000, 400000, 1000000, 1250000, 2500000, 3000000, 5000000],
    2: [20000, 40000, 120000, 160000, 400000, 500000, 1000000, 1200000, 2000000],
    1: [10000, 20000, 60000, 80000, 200000, 250000, 500000, 600000, 1000000],
    0: [20000, 40000, 120000, 160000, 400000, 500000, 1000000, 1200000, 2000000]
  };
  function getLevelUpQp(rarity, level) {
    const mult = rarity === 5 ? 180 : (rarity === 4 ? 120 : (rarity === 3 ? 60 : (rarity === 1 ? 20 : 40)));
    const base = rarity === 5 ? 420 : (rarity === 4 ? 280 : (rarity === 3 ? 140 : (rarity === 1 ? 60 : 100)));
    return (base + mult * level) * 5;
  }
  function getAscensionQp(rarity, curAsc) {
    const table = ASCENSION_QP[rarity] || ASCENSION_QP[3];
    return table[Math.max(0, Math.min(2, curAsc - 1))] || 300000;
  }
  function getSkillUpQp(rarity, curLv) {
    const table = SKILL_QP[rarity] || SKILL_QP[3];
    return table[curLv - 1] || 0;
  }
  function formatQpShort(n) {
    if (n >= 10000000) return `${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 1)}천만`;
    if (n >= 10000) return `${Math.round(n / 10000)}만`;
    return n.toLocaleString();
  }

  function renderMyRoomTab() {
    const ownedIds = Object.keys(state.servants);
    document.getElementById('mr-owned-count').textContent = `${ownedIds.length}기 보유`;
    document.getElementById('mr-embers').textContent = state.embers.toLocaleString();
    document.getElementById('mr-grails').textContent = state.grails.toLocaleString();
    document.getElementById('mr-qp').textContent = state.qp.toLocaleString();

    const rosterEl = document.getElementById('myroom-roster-list');
    rosterEl.innerHTML = '';

    if (ownedIds.length === 0) {
      document.getElementById('myroom-portrait-wrap').innerHTML =
        `<div class="empty-hint" style="text-align:center;padding:50px 10px">소환으로 첫 서번트를<br>영입해 주세요!</div>`;
      document.getElementById('mr-name').textContent = '보유 서번트 없음';
      document.getElementById('mr-title').textContent = '소환 탭에서 서번트를 뽑아보세요';
      return;
    }

    if (!state.myRoomServantId || !state.servants[state.myRoomServantId]) {
      state.myRoomServantId = ownedIds[0];
    }

    // 레어도 높은 순 정렬 + 검색 필터
    ownedIds.sort((a, b) => (SERVANT_MAP[b].rarity - SERVANT_MAP[a].rarity) || (state.servants[b].level - state.servants[a].level) || ((SERVANT_MAP[a].collectionNo || 0) - (SERVANT_MAP[b].collectionNo || 0)));
    const mq = myroomQuery.trim().toLowerCase();
    const visibleOwned = mq
      ? ownedIds.filter(id => {
          const s = SERVANT_MAP[id];
          return s && (s.name.toLowerCase().includes(mq) || String(s.collectionNo || '').includes(mq));
        })
      : ownedIds;
    visibleOwned.forEach(id => {
      const sv = SERVANT_MAP[id];
      const own = state.servants[id];
      const chip = document.createElement('button');
      chip.className = 'roster-chip' + (id === state.myRoomServantId ? ' active' : '');
      const faceUrl = ArtRenderer.getFaceUrl(id);
      const faceHtml = faceUrl
        ? `<img class="roster-face" src="${faceUrl}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`
        : '';
      chip.innerHTML = `
        <div class="roster-chip-row">
          ${faceHtml}
          <div style="flex:1;min-width:0">
            <div class="roster-chip-top"><span>${sv.nickname || sv.name}</span><span style="color:#ffe666">${sv.rarity === 0 ? '☆0' : `★${sv.rarity}`}</span></div>
            <div class="roster-chip-sub">No.${String(sv.collectionNo || 0).padStart(3, '0')} · Lv.${own.level} · 보${own.npLevel}</div>
          </div>
        </div>
      `;
      chip.addEventListener('click', () => {
        SoundEngine.click();
        state.myRoomServantId = id;
        saveState();
        renderMyRoomTab();
        triggerMyRoomLine(false);
        fetchOfficialServantLore(sv);
      });
      rosterEl.appendChild(chip);
    });

    const sv = SERVANT_MAP[state.myRoomServantId];
    const own = state.servants[state.myRoomServantId];
    const effR = getEffectiveRarity(sv, own);
    const maxCap = getMaxLevelCap(sv, own);

    // 영기재림 보기 탭
    document.querySelectorAll('#myroom-asc-tabs .asc-btn').forEach(btn => {
      const asc = Number(btn.dataset.asc);
      btn.disabled = asc > own.ascension;
      btn.classList.toggle('active', asc === own.viewAsc);
    });

    // 대형 포트레이트 (v25: 카드 보기 ⇄ Atlas Academy 스탠딩 & 표정 시트 전환!)
    const mrViewMode = state.options.myRoomViewMode || 'card'; // 'card' | 'standing' | 'sheet'
    const portraitWrap = document.getElementById('myroom-portrait-wrap');
    const figUrl = ArtRenderer.getCharaFigureUrl ? ArtRenderer.getCharaFigureUrl(sv.id, own.viewAsc || 1) : null;
    const modeBtnsHtml = `
      <div style="display:flex;gap:5px;justify-content:center;margin-bottom:8px" onclick="event.stopPropagation()">
        <button class="small-outline-btn mr-v25-mode" data-mode="card" style="padding:3px 9px;font-size:11px;${mrViewMode === 'card' ? 'border-color:#ffd86b;color:#ffd86b;' : ''}">🃏 카드</button>
        <button class="small-outline-btn mr-v25-mode" data-mode="standing" style="padding:3px 9px;font-size:11px;${mrViewMode === 'standing' ? 'border-color:#ffd86b;color:#ffd86b;' : ''}">🧍 스탠딩</button>
        <button class="small-outline-btn mr-v25-mode" data-mode="sheet" style="padding:3px 9px;font-size:11px;${mrViewMode === 'sheet' ? 'border-color:#ffd86b;color:#ffd86b;' : ''}">😊 표정 시트</button>
      </div>
    `;
    if (mrViewMode === 'standing' && figUrl) {
      portraitWrap.innerHTML = modeBtnsHtml + `
        <div class="mr-standing-box" style="width:260px;height:380px;margin:0 auto;overflow:hidden;border-radius:14px;background:radial-gradient(circle at 50% 30%,rgba(60,95,165,0.45),rgba(10,16,32,0.9));border:1px solid rgba(255,215,100,0.35);display:flex;align-items:flex-start;justify-content:center">
          <img src="${figUrl}" alt="${sv.name}" referrerpolicy="no-referrer"
            style="width:260px;height:auto;object-fit:cover;object-position:top center;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.65));transition:transform 0.2s"
            onerror="this.parentElement.innerHTML='<div style=\\'padding:40px 12px;text-align:center;color:#9bb6df;font-size:12px\\'>스탠딩 에셋이 없는 서번트입니다.<br>카드 모드로 전환해 주세요.</div>'">
        </div>
      `;
    } else if (mrViewMode === 'sheet' && figUrl) {
      portraitWrap.innerHTML = modeBtnsHtml + `
        <div class="mr-standing-box" style="width:280px;max-height:380px;margin:0 auto;overflow:auto;border-radius:12px;background:rgba(10,16,32,0.92);border:1px solid rgba(255,215,100,0.35);padding:6px">
          <img src="${figUrl}" alt="${sv.name} 표정 시트" referrerpolicy="no-referrer" style="width:100%;height:auto;display:block"
            onerror="this.parentElement.innerHTML='<div style=\\'padding:40px 12px;text-align:center;color:#9bb6df;font-size:12px\\'>표정 시트가 없는 서번트입니다.</div>'">
        </div>
      `;
    } else {
      portraitWrap.innerHTML = modeBtnsHtml + ArtRenderer.renderCardSVG(sv, true, {
        ascension: own.viewAsc,
        npLevel: own.npLevel,
        rarityOverride: effR
      });
    }
    portraitWrap.querySelectorAll('.mr-v25-mode').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundEngine.click();
        state.options.myRoomViewMode = b.dataset.mode;
        saveState();
        renderMyRoomTab();
      });
    });

    // 스탯 계산
    const lvRatio = 0.35 + (own.level / getBaseMaxLevel(effR)) * 0.65;
    const curAtk = Math.round(sv.atk * lvRatio);
    const curHp = Math.round(sv.hp * lvRatio);

    const tierLabel = RARITY_TIERS[effR] || '';
    document.getElementById('mr-name').textContent = `${effR === 0 ? '☆0' : '★'.repeat(effR)} ${tierLabel}${sv.variableRarity ? '(가변)' : ''} ${sv.name}`;
    const creditParts = [
      CLASS_INFO[sv.cls]?.name || sv.cls,
      sv.cv ? `CV. ${sv.cv}` : sv.title,
      sv.illustrator ? `Illust. ${sv.illustrator}` : '',
      `보유 ${own.copies}기${own.extraCopies ? ` (잉여 ${own.extraCopies})` : ''}`
    ].filter(Boolean);
    document.getElementById('mr-title').textContent = creditParts.join(' · ');
    document.getElementById('mr-np-pill').textContent = `보구 Lv.${own.npLevel}`;
    document.getElementById('mr-level').textContent = `Lv.${own.level} / ${maxCap}`;
    document.getElementById('mr-bond').textContent = `인연 Lv.${own.bond} / 15`;
    document.getElementById('mr-atk').textContent = curAtk.toLocaleString();
    document.getElementById('mr-hp').textContent = curHp.toLocaleString();

    const npBadge = document.getElementById('mr-np-type');
    npBadge.textContent = sv.npType;
    npBadge.className = `np-type-badge ${sv.npType}`;
    const mrNpUp = (typeof isNpUpgraded === 'function' && isNpUpgraded(sv)) ? ' 🗡️ 보구 강화(+25%)' : '';
    document.getElementById('mr-np-name').textContent = `${sv.npName}${mrNpUp}`;
    document.getElementById('mr-np-sub').textContent = sv.npSub || '';
    document.getElementById('mr-np-detail').textContent = sv.npDetail || '';

    // 공식 5장 커맨드 카드 덱 표기
    const deckRow = document.getElementById('mr-deck-row');
    if (deckRow) {
      const cards = sv.cards || ['Quick', 'Arts', 'Arts', 'Buster', 'Buster'];
      deckRow.innerHTML = `<span style="font-size:11.5px;color:#9cb2d9;font-weight:700">커맨드 덱:</span>` +
        cards.map(c => `<span class="deck-dot ${c}">${c}</span>`).join('') +
        `<span style="font-size:11px;color:#dbe7ff;margin-left:auto">${sv.attribute || '인(人)'} · ${sv.gender || '없음'} · ${sv.alignment || '-/-'}</span>`;
    }
    const hiddenRow = document.getElementById('mr-hidden-row');
    if (hiddenRow) {
      const ps = (typeof getServantPassives === 'function') ? getServantPassives(sv) : { n: [] };
      const pChips = (ps.n || []).map(p => `<span class="trait-pill" style="background:rgba(56,189,248,0.18);color:#93d5ff;border-color:rgba(56,189,248,0.35)">🛡️ ${p}</span>`).join('');
      const trChips = (sv.traits || []).map(t => `<span class="trait-pill">${t}</span>`).join('');
      const spChips = (sv.npSpecial || []).map(s => `<span class="trait-pill trait-sp">💥 ${s} 특공</span>`).join('');
      hiddenRow.innerHTML = (pChips || trChips || spChips)
        ? `<div class="hidden-traits-wrap">${pChips}${spChips}${trChips}</div>`
        : '';
    }

    // 공식 스킬 강화 (Lv.1 → Lv.10, 공식 QP 비용표, Lv.6/-1T · Lv.10/-2T 쿨감)
    if (!Array.isArray(own.skillLevels) || own.skillLevels.length !== 3) own.skillLevels = [1, 1, 1];
    const skillsRow = document.getElementById('mr-skills-row');
    const svSkills = (sv.skills && sv.skills.length >= 3) ? sv.skills : ['스킬 1', '스킬 2', '스킬 3'];
    skillsRow.innerHTML = svSkills.map((sk, idx) => {
      const slv = own.skillLevels[idx] || 1;
      const cost = slv < 10 ? getSkillUpQp(sv.rarity, slv) : 0;
      const cdTip = slv >= 10 ? '쿨타임 -2T' : (slv >= 6 ? '쿨타임 -1T' : 'Lv.6에 쿨-1T');
      return `
        <div class="mr-skill-card">
          <div class="mr-skill-info">
            <strong>스킬${idx + 1} · ${sk}</strong>
            <span>Lv.${slv} / 10 (${cdTip})</span>
          </div>
          <button class="mr-skill-up-btn" data-skidx="${idx}" ${slv >= 10 ? 'disabled' : ''}>
            ${slv >= 10 ? 'MAX' : `강화 (${formatQpShort(cost)} QP)`}
          </button>
        </div>
      `;
    }).join('');
    skillsRow.querySelectorAll('.mr-skill-up-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.skidx);
        const slv = own.skillLevels[idx] || 1;
        if (slv >= 10) return;
        const cost = getSkillUpQp(sv.rarity, slv);
        if (state.qp < cost) {
          SoundEngine.error();
          toast(`QP가 부족합니다! 필요: ${cost.toLocaleString()} QP (배틀 보물고에서 파밍하세요!)`);
          return;
        }
        // v29: 공식 스킬 강화 재료 실제 체크 및 소비!
        const matData = window.SERVANT_MATERIALS && window.SERVANT_MATERIALS[sv.collectionNo];
        const reqItems = matData && matData.skill && matData.skill[slv] && matData.skill[slv].items ? matData.skill[slv].items : [];
        const missing = reqItems.filter(([name, amt]) => ((state.materials && state.materials[name]) || 0) < amt);
        if (missing.length) {
          SoundEngine.error();
          toast(`재료가 부족합니다! 필요: ${missing.map(([n, a]) => `${n} ${a}개(보유 ${(state.materials && state.materials[n]) || 0})`).join(', ')} — 다 빈치 공방에서 교환하세요!`);
          return;
        }
        reqItems.forEach(([name, amt]) => { state.materials[name] = ((state.materials && state.materials[name]) || 0) - amt; });
        state.qp -= cost;
        own.skillLevels[idx] = slv + 1;
        SoundEngine.levelUp();
        saveState();
        renderMyRoomTab();
        const extra = (slv + 1 === 6 || slv + 1 === 10) ? ' (배틀 쿨타임 -1턴 감소!)' : '';
        const matMsg = reqItems.length ? ` · 재료 소비 완료` : '';
        toast(`⚡ ${sv.name} [${svSkills[idx]}] Lv.${slv + 1} 달성!${extra}${matMsg}`);
      });
    });

    // 레벨업 / 영기재림 버튼에 공식 QP 비용 표시
    const lvQp = getLevelUpQp(sv.rarity, own.level);
    document.getElementById('btn-lv-up').textContent = `🔥 레벨업 (+10Lv / 종화 5 · ${formatQpShort(lvQp)} QP)`;
    const ascBtn = document.getElementById('btn-ascend');
    if (own.ascension >= 4) {
      ascBtn.textContent = '✨ 최종 영기재림 완료 (4차)';
    } else {
      const ascQp = getAscensionQp(sv.rarity, own.ascension);
      ascBtn.textContent = `✨ ${own.ascension + 1}차 영기재림 (${formatQpShort(ascQp)} QP)`;
    }

    document.getElementById('myroom-speaker').textContent = `${sv.name} (${own.ascension}차 재림)`;
    renderMyRoomV24Panel(sv, own);
  }

  function renderMyRoomV24Panel(sv, own) {
    const box = document.getElementById('mr-v24-panel');
    if (!box) return;
    const coins = own.coins || 0;
    const fouHp = own.fouHp || 0;
    const fouAtk = own.fouAtk || 0;
    const bondCap = own.bondCap || 10;
    const apps = own.appendLevels || [0, 0, 0, 0, 0];
    const isGrand = state.grandGraph && state.grandGraph[sv.cls] === sv.id;
    const canGrand = own.level >= 100 && (own.skillLevels || [1, 1, 1]).every(v => v >= 10);

    box.innerHTML = `
      <div style="margin-top:12px;padding:12px;border-radius:10px;background:rgba(15,24,46,0.7);border:1px solid rgba(255,215,100,0.22);display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
          <strong style="color:#ffd875">🪙 서번트 코인: ${coins.toLocaleString()}개</strong>
          <span style="font-size:12px;color:#b8d4ff">🐾 포우작: HP +${fouHp.toLocaleString()} / ATK +${fouAtk.toLocaleString()} · 💞 인연 상한 Lv.${bondCap}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <button class="small-outline-btn" id="btn-v24-fou">🐾 포우 강화 (+1000 → +2000 → +3000)</button>
          <button class="small-outline-btn" id="btn-v24-special-asc" ${state.specialAscUsed || own.ascension >= 4 ? 'disabled' : ''}>🌟 특별재림 (${state.specialAscUsed ? '사용완료' : '1회 무료 4차'})</button>
          <button class="small-outline-btn" id="btn-v24-bond-cap" ${bondCap >= 16 ? 'disabled' : ''}>🔥 인연 상한 개방 (${bondCap < 15 ? '몽화 Lv.' + (bondCap + 1) : bondCap === 15 ? '대몽화 Lv.16' : 'MAX'})</button>
          <button class="small-gold-btn" id="btn-v24-grand">${isGrand ? '👑 관위 서번트 지정됨 (Grand)' : '👑 관위지정 (Lv.100 & 10/10/10)'}</button>
        </div>
        <div style="font-size:12px;color:#cde0ff"><strong>⚡ 어펜드 스킬 (1~5 · 개방 코인 120개):</strong></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px">
          ${(window.FGO_APPEND_SKILLS || []).map((ap, i) => `
            <button class="small-outline-btn v24-append-btn" data-idx="${i}" style="text-align:left;padding:6px 8px;font-size:11px">
              ${apps[i] > 0 ? `✅ Lv.${apps[i]}` : '🔒 미개방'} ${ap.name}
            </button>
          `).join('')}
        </div>
        ${(() => {
          const matData = window.SERVANT_MATERIALS && window.SERVANT_MATERIALS[sv.collectionNo];
          if (!matData) return '';
          const fmt = (st) => st && st.items && st.items.length
            ? st.items.map(([n, a]) => `${n} ×${a}`).join(', ') + ` (${formatQpShort(st.qp)} QP)`
            : '재료 없음';
          const ascRows = [0, 1, 2, 3].map(i => `<div><strong>${i + 1}차 재림:</strong> ${fmt(matData.asc && matData.asc[i])}</div>`).join('');
          const skRows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<div><strong>Lv.${i}→${i + 1}:</strong> ${fmt(matData.skill && matData.skill[i])}</div>`).join('');
          return `
            <details style="margin-top:4px;font-size:11.5px;color:#cde0ff">
              <summary style="cursor:pointer;color:#ffd875;font-weight:700">🧪 공식 영기재림(1~4차) · 스킬(Lv.1~10) 필요 재료 보기</summary>
              <div style="margin-top:6px;padding:8px;border-radius:8px;background:rgba(8,14,28,0.75);display:flex;flex-direction:column;gap:3px;line-height:1.45">
                <div style="color:#93c5fd;font-weight:700">✨ 영기재림 재료</div>
                ${ascRows}
                <div style="color:#93c5fd;font-weight:700;margin-top:6px">⚡ 스킬 강화 재료 (스킬 1개당)</div>
                ${skRows}
              </div>
            </details>
          `;
        })()}
      </div>
    `;

    box.querySelector('#btn-v24-fou')?.addEventListener('click', () => {
      if (fouHp >= 3000) { toast('이미 ★5 포우작(+3,000) 최대치입니다!'); return; }
      const next = fouHp < 1000 ? 1000 : (fouHp < 2000 ? 2000 : 3000);
      own.fouHp = next;
      own.fouAtk = next;
      SoundEngine.levelUp();
      saveState();
      renderMyRoomTab();
      toast(`🐾 ${sv.name} 포우작 HP/ATK +${next.toLocaleString()} 달성!`);
    });

    box.querySelector('#btn-v24-special-asc')?.addEventListener('click', () => {
      if (state.specialAscUsed || own.ascension >= 4) return;
      state.specialAscUsed = true;
      own.ascension = 4;
      own.viewAsc = 4;
      own.level = Math.max(own.level, getMaxLevelCap(sv, own));
      SoundEngine.reveal(5, true);
      saveState();
      renderMyRoomTab();
      toast(`🌟 특별재림 완료! ${sv.name} 즉시 최종 재림 & 최대 레벨 달성!`);
    });

    box.querySelector('#btn-v24-bond-cap')?.addEventListener('click', () => {
      if (bondCap >= 16) return;
      own.bondCap = bondCap + 1;
      SoundEngine.levelUp();
      saveState();
      renderMyRoomTab();
      toast(`🔥 ${sv.name} 인연 상한 Lv.${own.bondCap} 개방 완료! (${own.bondCap === 16 ? '칼데아의 대몽화' : '칼데아의 몽화'})`);
    });

    box.querySelector('#btn-v24-grand')?.addEventListener('click', () => {
      if (!canGrand) {
        SoundEngine.error();
        toast('관위지정(Grand Graph)은 Lv.100 이상 & 스킬 10/10/10 달성 시 가능합니다!');
        return;
      }
      state.grandGraph[sv.cls] = sv.id;
      SoundEngine.reveal(5, true);
      saveState();
      renderMyRoomTab();
      toast(`👑 [${sv.cls}] 클래스 그랜드 서번트로 ${sv.name} 관위지정 완료!`);
    });

    box.querySelectorAll('.v24-append-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        if (apps[idx] === 0) {
          if ((own.coins || 0) < 120) {
            SoundEngine.error();
            toast(`어펜드 스킬 개방에는 서번트 코인 120개가 필요합니다! (현재: ${own.coins || 0}개)`);
            return;
          }
          own.coins -= 120;
          apps[idx] = 1;
          SoundEngine.levelUp();
          saveState();
          renderMyRoomTab();
          toast(`⚡ 어펜드 스킬 [${window.FGO_APPEND_SKILLS[idx].name}] 개방! (코인 -120)`);
        } else if (apps[idx] < 10) {
          apps[idx]++;
          SoundEngine.levelUp();
          saveState();
          renderMyRoomTab();
          toast(`⚡ 어펜드 스킬 [${window.FGO_APPEND_SKILLS[idx].name}] Lv.${apps[idx]} 강화!`);
        } else {
          toast('이미 Lv.10 MAX 상태입니다!');
        }
      });
    });
  }

  // 마이룸 FGO 타자기 대사 출력 상태
  let mrTypeTimer = null;
  let mrFullText = '';
  let mrTypingDone = true;

  function stopMyRoomTypewriter(showFull = true) {
    if (mrTypeTimer) {
      clearInterval(mrTypeTimer);
      mrTypeTimer = null;
    }
    mrTypingDone = true;
    const txtEl = document.getElementById('myroom-dialogue-text');
    const curEl = document.getElementById('myroom-dlg-cursor');
    if (showFull && txtEl) txtEl.textContent = mrFullText;
    if (curEl) curEl.classList.add('visible');
  }

  function playMyRoomTypewriter(speaker, badge, text) {
    stopMyRoomTypewriter(false);
    document.getElementById('myroom-speaker').textContent = speaker;
    const badgeEl = document.getElementById('myroom-dlg-badge');
    if (badgeEl) badgeEl.textContent = badge;
    const txtEl = document.getElementById('myroom-dialogue-text');
    const curEl = document.getElementById('myroom-dlg-cursor');

    mrFullText = text;
    const speedMap = { slow: 44, normal: 22, fast: 9, instant: 0 };
    const interval = speedMap[state.options.textSpeed || 'normal'] ?? 22;

    if (interval === 0) {
      txtEl.textContent = mrFullText;
      mrTypingDone = true;
      if (curEl) curEl.classList.add('visible');
      return;
    }

    let pos = 0;
    txtEl.textContent = '';
    mrTypingDone = false;
    if (curEl) curEl.classList.remove('visible');

    mrTypeTimer = setInterval(() => {
      pos += (state.options.textSpeed === 'fast' ? 2 : 1);
      if (pos >= mrFullText.length) {
        stopMyRoomTypewriter(true);
      } else {
        txtEl.textContent = mrFullText.slice(0, pos);
      }
    }, interval);
  }

  function triggerMyRoomLine(addBond = true) {
    if (!state.myRoomServantId || !state.servants[state.myRoomServantId]) return;
    if (!mrTypingDone) {
      stopMyRoomTypewriter(true);
      return;
    }
    const sv = SERVANT_MAP[state.myRoomServantId];
    const own = state.servants[state.myRoomServantId];

    SoundEngine.myRoomTap();
    const wrap = document.getElementById('myroom-portrait-wrap');
    wrap.classList.remove('bounce');
    void wrap.offsetWidth;
    wrap.classList.add('bounce');

    if (addBond && own.bond < 15) {
      own.bondExp = (own.bondExp || 0) + 1;
      const need = own.bond >= 10 ? 5 : 3;
      if (own.bondExp >= need) {
        own.bondExp = 0;
        own.bond++;
        const bondCoin = typeof window.getFgoBondCoins === 'function' ? window.getFgoBondCoins(own.bond) : 0;
        if (bondCoin > 0) own.coins = (own.coins || 0) + bondCoin;
        if (own.bond >= 11) {
          state.sq += 30;
          toast(`💖 ${sv.name} 인연 Lv.${own.bond} 달성! 성정석 +30${bondCoin ? ` · 코인 +${bondCoin}` : ''}!`);
        } else {
          state.sq += 3;
          toast(`💖 ${sv.name} 인연 Lv.${own.bond} 달성! 성정석 +3${bondCoin ? ` · 코인 +${bondCoin}` : ''}!`);
        }
        SoundEngine.levelUp();
      }
      saveState();
      renderResources();
      renderMyRoomTab();
    }

    const krVoices = window.SERVANT_VOICES && window.SERVANT_VOICES[sv.collectionNo];
    if (krVoices && krVoices.length) {
      const [label, text] = pickRandom(krVoices);
      playMyRoomTypewriter(sv.name, label, text);
    } else if (sv.officialLines && sv.officialLines.length) {
      const picked = pickRandom(sv.officialLines);
      playMyRoomTypewriter(sv.name, picked.label, picked.text);
    } else {
      const line = pickRandom(sv.lines);
      playMyRoomTypewriter(sv.name, `${own.ascension}차 재림`, line);
    }
  }

  // ================= 렌더링: 다 빈치 공방 =================
  const CHARGE_PACKS = [
    { id: 'pk_free', title: '🎁 운영자 사죄돌 배포', desc: '긴급 점검 보상! 현질 환산액에 포함되지 않는 무료 배포 성정석', sq: 300, krw: 0, badge: '무료 배포' },
    { id: 'pk_small', title: '💎 성정석 42개 팩', desc: '가볍게 단차·11연 1세트 맛보기 (시뮬레이션)', sq: 42, krw: 33000, badge: '₩33,000' },
    { id: 'pk_truck1', title: '🚚 성정석 1트럭 (167개)', desc: 'FGO 마스터의 기본 단위! 11연 5세트 + 알파', sq: 167, krw: 99000, badge: '₩99,000', truck: true },
    { id: 'pk_truck3', title: '🚚 성정석 3트럭 (501개)', desc: '픽업 저격용 중과금 패키지 (약 183연)', sq: 501, krw: 297000, badge: '₩297,000', truck: true },
    { id: 'pk_pity', title: '👑 천장 확정 풀패키지 (900개)', desc: '330연 천장을 뚫기 위한 성정석 900개 (약 5.4트럭)', sq: 900, krw: 534000, badge: '₩534,000', truck: true }
  ];

  const EXCHANGE_ITEMS = [
    { id: 'ex_ticket1', title: '🎫 호부 1장', desc: '단차 1회 소환권 (단차 보너스 적용)', costType: 'mp', cost: 20, reward: () => { state.tickets += 1; } },
    { id: 'ex_ticket5', title: '🎫 호부 5장 세트', desc: '매달 갱신되는 다 빈치 공방의 보물!', costType: 'mp', cost: 100, reward: () => { state.tickets += 5; } },
    { id: 'ex_fp10k', title: '🤝 프렌드 포인트 +10,000 FP', desc: '프렌드 가챠 50연분 (앙리마유·세이버 릴리 도전!)', costType: 'mp', cost: 20, reward: () => { state.fp = (state.fp || 0) + 10000; } },
    { id: 'ex_fp_free', title: '🎁 프렌드 포인트 무료 보급 (+20,000 FP)', desc: '마스터 지원 보급품! 무료로 20,000 FP 즉시 지급', costType: 'mp', cost: 0, reward: () => { state.fp = (state.fp || 0) + 20000; } },
    { id: 'ex_ember', title: '🔥 예지의 맹화(종화) 20개', desc: '마이룸 서번트 레벨업 재료', costType: 'mp', cost: 40, reward: () => { state.embers += 20; } },
    { id: 'ex_sq_rp', title: '💎 성정석 30개 교환', desc: '레어프리즘으로 성정석 11연치 확보', costType: 'rp', cost: 2, reward: () => { state.sq += 30; } },
    { id: 'ex_grail', title: '🏆 성배 1개 주조', desc: '레어프리즘으로 최애 서번트용 성배 획득', costType: 'rp', cost: 3, reward: () => { state.grails += 1; } },
    { id: 'ex_uso', title: '✨ 무기명 영기 → 원하는 ★5 교환', desc: '무기명 영기 10개로 현재 픽업 5성 즉시 소환!', costType: 'uso', cost: 10, reward: null }
  ];

  function renderWelfareShop() {
    const grid = document.getElementById('welfare-grid');
    if (!grid) return;
    const q = welfareQuery.trim().toLowerCase();
    const list = SERVANTS.filter(s => s.pool === 'welfare' && (!q || s.name.toLowerCase().includes(q) || String(s.collectionNo).includes(q)));
    grid.innerHTML = '';
    if (list.length === 0) {
      grid.innerHTML = '<div class="empty-hint">검색 조건에 맞는 배포 서번트가 없습니다.</div>';
      return;
    }
    list.forEach(sv => {
      const own = state.servants[sv.id];
      const cost = own ? 50 : 100;
      const isMaxNp = own && own.npLevel >= 5;
      const faceUrl = ArtRenderer.getFaceUrl(sv.id);
      const card = document.createElement('div');
      card.className = 'welfare-card';
      card.innerHTML = `
        ${faceUrl ? `<img class="welfare-face" src="${faceUrl}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
        <div class="welfare-info">
          <div class="welfare-name">No.${String(sv.collectionNo).padStart(3, '0')} ${sv.name}</div>
          <div class="welfare-meta">${'★'.repeat(sv.rarity)} ${CLASS_INFO[sv.cls]?.name || sv.cls} · ${own ? `보구 Lv.${own.npLevel}` : '미보유'}</div>
          <button class="small-outline-btn welfare-btn" ${isMaxNp ? 'disabled' : ''}>
            ${isMaxNp ? '✅ 보구 Lv.5 완료' : (own ? `보구 Lv.${own.npLevel + 1} (🟢마프 ${cost})` : `영입하기 (🟢마프 ${cost})`)}
          </button>
        </div>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (isMaxNp) return;
        if (state.mp < cost) {
          SoundEngine.error();
          toast(`마나프리즘이 ${cost}개 필요합니다!`);
          return;
        }
        state.mp -= cost;
        if (!state.servants[sv.id]) {
          state.servants[sv.id] = { copies: 1, extraCopies: 0, npLevel: 1, level: 1, ascension: 1, grailsUsed: 0, bond: 1, bondExp: 0, viewAsc: 1 };
        } else {
          state.servants[sv.id].copies++;
          state.servants[sv.id].npLevel = Math.min(5, state.servants[sv.id].npLevel + 1);
        }
        SoundEngine.reveal(sv.rarity, true);
        saveState();
        renderAll();
        toast(`🏆 순례의 축제: [${sv.name}] 보구 Lv.${state.servants[sv.id].npLevel} 영입 완료!`);
      });
      grid.appendChild(card);
    });
  }

  function renderShopTab() {
    document.getElementById('shop-currency-summary').innerHTML =
      `🟢 마프 <strong>${state.mp.toLocaleString()}</strong> · 🟡 레프 <strong>${state.rp.toLocaleString()}</strong> · 🤝 FP <strong>${(state.fp || 0).toLocaleString()}</strong> · 💠 무기명 영기 <strong>${state.uso}</strong>`;

    const chargeEl = document.getElementById('charge-grid');
    chargeEl.innerHTML = '';
    CHARGE_PACKS.forEach(pk => {
      const card = document.createElement('div');
      card.className = 'shop-card' + (pk.truck ? ' truck-card' : '');
      card.innerHTML = `
        <div>
          <div class="shop-card-title">${pk.title}</div>
          <div class="shop-card-desc">${pk.desc}</div>
        </div>
        <div class="shop-card-price">${pk.badge} → 💎 +${pk.sq.toLocaleString()}</div>
        <button class="small-gold-btn">충전하기 (무료 시뮬)</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        SoundEngine.shopBuy();
        state.sq += pk.sq;
        state.stats.simPaidKrw += pk.krw;
        saveState();
        renderResources();
        renderShopTab();
        toast(`💎 성정석 +${pk.sq}개 충전 완료!${pk.krw ? ` (가상 과금 +₩${pk.krw.toLocaleString()})` : ''}`);
      });
      chargeEl.appendChild(card);
    });

    const exEl = document.getElementById('exchange-grid');
    exEl.innerHTML = '';
    EXCHANGE_ITEMS.forEach(item => {
      const costLabel = item.costType === 'mp' ? `🟢 마프 ${item.cost}` : (item.costType === 'rp' ? `🟡 레프 ${item.cost}` : `💠 무기명 영기 ${item.cost}`);
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML = `
        <div>
          <div class="shop-card-title">${item.title}</div>
          <div class="shop-card-desc">${item.desc}</div>
        </div>
        <div class="shop-card-price">필요 재화: ${costLabel}</div>
        <button class="small-outline-btn">교환하기</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (state[item.costType] < item.cost) {
          SoundEngine.error();
          toast('재화가 부족합니다!');
          return;
        }
        if (item.id === 'ex_uso') {
          // 현재 배너의 픽업 5성 즉시 획득
          const banner = BANNER_MAP[state.activeBannerId] || BANNERS[0];
          const targetId = banner.pickup5[0] || 'sv_castoria';
          const sv = SERVANT_MAP[targetId];
          state.uso -= 10;
          if (!state.servants[targetId]) {
            state.servants[targetId] = { copies: 1, extraCopies: 0, npLevel: 1, level: 1, ascension: 1, grailsUsed: 0, bond: 1, bondExp: 0, viewAsc: 1 };
          } else {
            state.servants[targetId].copies++;
            state.servants[targetId].npLevel = Math.min(5, state.servants[targetId].npLevel + 1);
          }
          SoundEngine.reveal(5, true);
          toast(`💠 무기명 영기 10개로 ★5 [${sv.name}] 교환 완료!`);
        } else {
          state[item.costType] -= item.cost;
          item.reward();
          SoundEngine.shopBuy();
          toast(`✅ [${item.title}] 교환 완료!`);
        }
        saveState();
        renderAll();
      });
      exEl.appendChild(card);
    });
    renderWelfareShop();
    renderShopV24Section();
  }

  function renderShopV24Section() {
    const box = document.getElementById('v24-shop-section');
    if (!box) return;
    const totalCoins = Object.values(state.servants || {}).reduce((s, o) => s + (o.coins || 0), 0);
    const mats = window.FGO_MATERIALS_64 || { bronze: [], silver: [], gold: [] };
    const allMats = [...mats.bronze, ...mats.silver, ...mats.gold];

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">
        <div>
          <h3>💎 퓨어 프리즘 교환소 (강화소재 64종) · 🏆 성배주조</h3>
          <p class="panel-desc">보유 퓨어프리즘: <strong>${(state.purePrisms || 0).toLocaleString()}</strong> · 성배의 물방울: <strong>${state.grailDrops || 0}/7</strong> · 전체 서번트 코인: <strong>${totalCoins.toLocaleString()}</strong></p>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="small-gold-btn" id="btn-v24-grail-cast">🏆 성배주조 (코인 2,000 → 성배 1)</button>
          <button class="small-outline-btn" id="btn-v24-grail-drop">💧 성배의 물방울 교환 (7 → 성배 1)</button>
          <button class="small-outline-btn" id="btn-v24-pure-gift">✨ 퓨어프리즘 +50 보급</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:6px;max-height:260px;overflow-y:auto;padding-right:4px">
        ${allMats.map(m => {
          const owned = (state.materials && state.materials[m.name]) || 0;
          const border = m.tier === 'gold' ? '#ffd86b' : (m.tier === 'silver' ? '#b8d4ff' : '#cd8c52');
          return `
            <div style="padding:7px 9px;border-radius:8px;background:rgba(15,24,46,0.75);border:1px solid ${border}55;display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:12px">
              <div>
                <div>${m.icon} <strong>${m.name}</strong></div>
                <div style="font-size:10px;color:#9bb6df">보유 ${owned} · 퓨프 ${m.pureCost}</div>
              </div>
              <button class="small-outline-btn v24-buy-mat" data-name="${m.name}" data-cost="${m.pureCost}" style="padding:3px 7px;font-size:11px">+1</button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    box.querySelector('#btn-v24-grail-cast')?.addEventListener('click', () => {
      if (totalCoins < 2000) {
        SoundEngine.error();
        toast(`성배주조에는 서번트 코인 2,000개가 필요합니다! (현재 총합: ${totalCoins.toLocaleString()}개)`);
        return;
      }
      let need = 2000;
      for (const o of Object.values(state.servants)) {
        if (need <= 0) break;
        const take = Math.min(o.coins || 0, need);
        o.coins = (o.coins || 0) - take;
        need -= take;
      }
      state.grails = (state.grails || 0) + 1;
      SoundEngine.reveal(5, true);
      saveState();
      renderAll();
      toast('🏆 성배주조 완료! 서번트 코인 2,000개로 성배 +1개 획득!');
    });

    box.querySelector('#btn-v24-grail-drop')?.addEventListener('click', () => {
      if ((state.grailDrops || 0) < 7) {
        SoundEngine.error();
        toast(`성배의 물방울 7개가 필요합니다! (현재: ${state.grailDrops || 0}/7)`);
        return;
      }
      state.grailDrops -= 7;
      state.grails = (state.grails || 0) + 1;
      SoundEngine.reveal(5, true);
      saveState();
      renderAll();
      toast('💧 성배의 물방울 7개로 성배 +1개 교환 완료!');
    });

    box.querySelector('#btn-v24-pure-gift')?.addEventListener('click', () => {
      state.purePrisms = (state.purePrisms || 0) + 50;
      // v29: 피스·모뉴먼트·휘석·마석·비석·전승결정 및 64종 소재 각 +10 보급!
      const clsKo = ['세이버', '아처', '랜서', '라이더', '캐스터', '어새신', '버서커'];
      clsKo.forEach(c => {
        ['피스', '모뉴먼트'].forEach(t => { state.materials[`${c} ${t}`] = (state.materials[`${c} ${t}`] || 0) + 10; });
      });
      ['검', '궁', '창', '기', '술', '살', '광'].forEach(c => {
        ['휘석', '마석', '비석'].forEach(t => { state.materials[`${c}의 ${t}`] = (state.materials[`${c}의 ${t}`] || 0) + 10; });
      });
      state.materials['전승결정'] = (state.materials['전승결정'] || 0) + 3;
      allMats.forEach(m => { state.materials[m.name] = (state.materials[m.name] || 0) + 10; });
      SoundEngine.shopBuy();
      saveState();
      renderShopV24Section();
      toast('✨ 퓨어프리즘 +50 & 피스·모뉴·스킬석·64종 소재 각 +10, 전승결정 +3 보급 완료!');
    });

    box.querySelectorAll('.v24-buy-mat').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const cost = Number(btn.dataset.cost);
        if ((state.purePrisms || 0) < cost) {
          SoundEngine.error();
          toast('퓨어 프리즘이 부족합니다!');
          return;
        }
        state.purePrisms -= cost;
        state.materials[name] = (state.materials[name] || 0) + 1;
        SoundEngine.shopBuy();
        saveState();
        renderShopV24Section();
      });
    });
  }

  // ================= 렌더링: 가챠 통계 & 폭사력 분석 =================
  function evaluateLuckRank(s) {
    if (s.totalPulls < 11) {
      return { grade: '?', title: '측정 대기 중', desc: '최소 11회 이상 소환하면 당신의 비틱력 / 폭사력 등급이 판정됩니다!' };
    }
    const rate = (s.sv5 / s.totalPulls) * 100;
    if (rate >= 2.2) return { grade: 'EX', title: '우주급 비틱 마스터 (억까 면역)', desc: `실제 5성 확률 ${rate.toFixed(2)}%! 칼데아 확률 조작 의혹의 중심에 서 계십니다.` };
    if (rate >= 1.45) return { grade: 'A+', title: '축복받은 황금손 마스터', desc: `평균(1.00%)을 훌쩍 웃도는 ${rate.toFixed(2)}%! 무지개 회전이 당신을 사랑합니다.` };
    if (rate >= 0.95) return { grade: 'B', title: '수학적 기댓값의 화신', desc: `5성 확률 ${rate.toFixed(2)}%로 FGO 공식 확률 1%에 완벽히 수렴하고 있습니다.` };
    if (rate >= 0.55) return { grade: 'D', title: '마파두부 단골 손님 (폭사 주의)', desc: `5성 확률 ${rate.toFixed(2)}%… 지갑이 슬퍼하고 있습니다. 신부님이 웃고 계시네요.` };
    return { grade: 'E-', title: '칼데아 전설의 대폭사 (신부의 애제자)', desc: `5성 확률 ${rate.toFixed(2)}%!! 이 정도면 영령의 좌가 출입 금지령을 내린 수준입니다…` };
  }

  function renderStatsTab() {
    const s = state.stats;
    const total = s.totalPulls;
    const pct = (n) => total > 0 ? ((n / total) * 100).toFixed(2) : '0.00';

    // 현질 환산액 계산 (성정석 소비 기준: 167돌 = ₩99,000 + 호부는 3돌 환산)
    const eqSq = s.sqSpent + s.ticketsSpent * 3;
    const trucks = eqSq / 167;
    const estKrw = Math.round(trucks * 99000);

    const rank = evaluateLuckRank(s);
    document.getElementById('luck-rank-grade').textContent = rank.grade;
    document.getElementById('luck-rank-title').textContent = rank.title;
    document.getElementById('luck-rank-desc').textContent = rank.desc;
    document.getElementById('stat-krw').textContent = `₩${estKrw.toLocaleString()}`;
    document.getElementById('stat-trucks').textContent = `${trucks.toFixed(2)} 트럭 소비 (충전 시뮬 ₩${s.simPaidKrw.toLocaleString()})`;

    // KPI 카드
    const kpis = [
      { label: '총 소환 횟수', val: `${total.toLocaleString()}회`, sub: `성정석 ${s.sqSpent.toLocaleString()} · 호부 ${s.ticketsSpent}` },
      { label: '★5 서번트 획득', val: `${s.sv5}기`, sub: `실제 확률 ${pct(s.sv5)}% (공식 1.00%)` },
      { label: '픽업 성공 / 픽뚫', val: `${s.sv5Pickup} / ${s.sv5Spook}`, sub: `천장 도달 ${s.sv5Pity}회` },
      { label: '최대 연속 노5성', val: `${s.maxDryStreak}연`, sub: `현재 연속 노5성: ${s.curDryStreak}연` },
      { label: '★4 서번트 획득', val: `${s.sv4}기`, sub: `실제 확률 ${pct(s.sv4)}% (공식 3.00%)` },
      { label: '★5 개념예장 획득', val: `${s.ce5}장`, sub: `젤릿치 ${s.kscopeCount} · 흑성배 ${s.blackGrailCount}` }
    ];
    document.getElementById('stats-kpi-grid').innerHTML = kpis.map(k => `
      <div class="kpi-card">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-val">${k.val}</div>
        <div class="kpi-sub">${k.sub}</div>
      </div>
    `).join('');

    // 확률 비교 바
    const rows = [
      { name: '★5 서번트', count: s.sv5, official: 1, color: '#ffe666' },
      { name: '★4 서번트', count: s.sv4, official: 3, color: '#ffad42' },
      { name: '★5 개념예장', count: s.ce5, official: 4, color: '#c084fc' },
      { name: '★4 개념예장', count: s.ce4, official: 12, color: '#60a5fa' },
      { name: '★3 서번트', count: s.sv3, official: 40, color: '#94a3b8' },
      { name: '★3 개념예장', count: s.ce3, official: 40, color: '#64748b' }
    ];
    document.getElementById('stat-rate-bars').innerHTML = rows.map(r => {
      const actual = total > 0 ? (r.count / total) * 100 : 0;
      const width = Math.min(100, actual * (r.official <= 4 ? 12 : 2));
      return `
        <div class="rate-bar-row">
          <div class="rate-bar-head">
            <span>${r.name} (${r.count}장)</span>
            <span>실제 <strong>${actual.toFixed(2)}%</strong> / 공식 ${r.official}%</span>
          </div>
          <div class="rate-bar-track">
            <div class="rate-bar-fill" style="width:${width}%;background:${r.color}"></div>
          </div>
        </div>
      `;
    }).join('');

    // 밈 카운터
    const memes = [
      ['🌶️ 먹어치운 매운 마파두부', `${s.mapoCount}그릇`],
      ['⚡ 은테 → 금테 치직 승격 연출', `${s.sparkCount}회`],
      ['🌈 무지개 회전 연출 목격', `${s.rainbowCount}회`],
      ['💎 칼레이도스코프 (젤릿치) 획득', `${s.kscopeCount}장`],
      ['🩸 검은 성배 (흑성배) 획득', `${s.blackGrailCount}장`],
      ['💠 보유 무기명 영기 (USO)', `${state.uso}개`]
    ];
    document.getElementById('stat-meme-list').innerHTML = memes.map(([k, v]) => `
      <div class="meme-row"><span>${k}</span><strong>${v}</strong></div>
    `).join('');

    // 5성 히스토리
    const histEl = document.getElementById('ssr-history-list');
    if (s.ssrHistory.length === 0) {
      histEl.innerHTML = '<div class="empty-hint">아직 획득한 ★5 서번트가 없습니다.</div>';
    } else {
      histEl.innerHTML = s.ssrHistory.map(h => {
        const badge = h.isPity ? '👑천장' : (h.isSpook ? '💥픽뚫' : (h.isPickup ? '✨픽업' : '★상시'));
        return `<div class="ssr-hist-pill">#${h.pullNo}연 · <strong>${h.name}</strong> (${CLASS_INFO[h.cls]?.name || h.cls}) ${badge}</div>`;
      }).join('');
    }
  }

  // ================= 온디맨드 Atlas Academy 공식 KR/JP 로어 로드 =================
  async function fetchOfficialServantLore(sv, onLoaded) {
    if (!sv || !sv.atlasId || sv._loreLoaded || sv.profileSummary) return;
    sv._loreLoaded = true;
    try {
      const reg = sv.region || 'KR';
      const resp = await fetch(`https://api.atlasacademy.io/nice/${reg}/servant/${sv.atlasId}?lore=true`);
      if (!resp.ok) return;
      const data = await resp.json();
      const prof = data.profile || {};
      if (prof.cv) sv.cv = prof.cv;
      if (prof.illustrator) sv.illustrator = prof.illustrator;
      if (Array.isArray(prof.comments) && prof.comments.length) {
        sv.profileSummary = prof.comments[0].comment || '';
        sv.profileBond = prof.comments.slice(1, 5).map(c => c.comment).filter(Boolean);
      }
      if (Array.isArray(prof.voices)) {
        const lines = [];
        for (const vg of prof.voices) {
          for (const v of (vg.voiceLines || [])) {
            if (!v.subtitle) continue;
            if (v.type === 'firstGet' && !sv._hasOfficialSummon) {
              sv.summonQuote = v.subtitle;
              sv._hasOfficialSummon = true;
            } else if (vg.type === 'home' && lines.length < 8) {
              lines.push({ label: v.name || '마이룸', text: v.subtitle });
            }
          }
        }
        if (lines.length) sv.officialLines = lines;
      }
      if (typeof onLoaded === 'function') onLoaded();
    } catch (_) {}
  }

  // ================= 상세 모달 =================
  function openDetailModal(type, id) {
    SoundEngine.click();
    const modal = document.getElementById('detail-modal');
    const body = document.getElementById('detail-body');
    const isServant = type === 'servant';
    const item = isServant ? SERVANT_MAP[id] : CE_MAP[id];
    if (!item) return;

    const owned = isServant ? state.servants[id] : state.ces[id];
    const effR = isServant ? getEffectiveRarity(item, owned) : item.rarity;
    const tierTxt = RARITY_TIERS[effR] || '';
    document.getElementById('detail-modal-title').textContent = `${effR === 0 ? '☆0' : '★'.repeat(effR)} ${tierTxt}${item.variableRarity ? '(레어도 가변)' : ''} ${item.name}`;

    if (isServant && !item.profileSummary && !item._loreLoaded) {
      fetchOfficialServantLore(item, () => {
        if (!modal.classList.contains('hidden')) openDetailModal('servant', id);
      });
    }

    const customUploadHtml = `
      <div class="custom-img-row">
        <label class="upload-label-btn">
          📷 내 이미지로 교체
          <input type="file" id="input-custom-art" accept="image/*" style="display:none">
        </label>
        ${ArtRenderer.hasCustomImage(id) ? `<button class="small-outline-btn" id="btn-reset-custom-art">↩️ 공식 일러스트 복원</button>` : ''}
      </div>
    `;

    if (isServant) {
      const colNo = item.collectionNo || (typeof ATLAS_IMAGES !== 'undefined' && ATLAS_IMAGES.servants[id]?.collectionNo) || '-';
      const poolText = item.poolNote || POOL_LABELS[item.pool] || (item.limited ? '기간 한정' : (item.storyLocked ? '스토리 해금' : '상시'));
      const loreBlocks = [item.profileSummary, ...(item.profileBond || [])].filter(Boolean).join('\n\n──────────\n\n');
      const ps = (typeof getServantPassives === 'function') ? getServantPassives(item) : { n: [] };
      const cStd = (typeof CLASS_STANDARD_STATS !== 'undefined' && CLASS_STANDARD_STATS[item.cls]) || null;
      const npUpBadge = (typeof isNpUpgraded === 'function' && isNpUpgraded(item))
        ? ' <span style="color:#fde047;font-weight:800">🗡️ 보구 강화(+25%)</span>'
        : '';
      body.innerHTML = `
        <div class="detail-card-wrap">
          ${ArtRenderer.renderCardSVG(item, true, { ascension: owned ? owned.viewAsc : 1, npLevel: owned ? owned.npLevel : 0, rarityOverride: effR, eager: true })}
        </div>
        <div class="detail-info">
          <h3>${item.name}</h3>
          <div class="detail-meta">No.${String(colNo).padStart(3, '0')} · ${tierTxt}${item.variableRarity ? ' (가변 ★3→★4→★5)' : ''} · ${CLASS_INFO[item.cls]?.name || item.cls} · ${item.attribute ? item.attribute + ' 속성 · ' : ''}${poolText}</div>
          <div class="detail-credit-row">
            ${item.cv ? `<span>CV: <strong>${item.cv}</strong></span>` : ''}
            ${item.illustrator ? `<span>Illust: <strong>${item.illustrator}</strong></span>` : ''}
            <span>최대 ATK <strong>${item.atk.toLocaleString()}</strong> / HP <strong>${item.hp.toLocaleString()}</strong></span>
          </div>
          <div style="margin-top:4px;font-size:13px">
            <strong>보구:</strong> ${item.npName}${npUpBadge} <span style="color:#9cb2d9">(${item.npSub} · ${item.npType})</span>
            ${item.npDetail ? `<div class="np-detail">${item.npDetail}</div>` : ''}
          </div>
          <div class="detail-hidden-box">
            <div class="detail-lore-title">🧬 히든 스테이터스 · 클래스 패시브 & 특공 특성</div>
            <div class="detail-hidden-grid">
              <span>성별: <strong>${item.gender || '없음'}</strong></span>
              <span>속성: <strong>${item.attribute || '인(人)'}</strong></span>
              <span>성향: <strong>${item.alignment || '-/-'}</strong></span>
              ${cStd ? `<span>공격계수: <strong>×${cStd.atkMod.toFixed(2)}</strong></span><span>스타집중: <strong>${cStd.starWeight}</strong></span><span>스타발생/피즉사: <strong>${Math.round(cStd.starGen * 100)}% / ${Math.round(cStd.deathRate * 100)}%</strong></span>` : ''}
            </div>
            ${(ps.n || []).length ? `<div class="hidden-traits-wrap" style="margin-bottom:4px">${ps.n.map(p => `<span class="trait-pill" style="background:rgba(56,189,248,0.18);color:#93d5ff;border-color:rgba(56,189,248,0.35)">🛡️ ${p}</span>`).join('')}</div>` : ''}
            <div class="hidden-traits-wrap">
              ${(item.npSpecial || []).map(s => `<span class="trait-pill trait-sp">💥 보구 특공: ${s}</span>`).join('')}
              ${(item.traits || []).length ? item.traits.map(t => `<span class="trait-pill">${t}</span>`).join('') : '<span class="trait-pill">특수 특성 없음</span>'}
            </div>
          </div>
          ${item.skills && item.skills.length ? `<div class="mr-skills-row" style="margin-top:8px">${item.skills.map((sk, i) => `<span class="skill-chip">스킬${i + 1} · ${sk}</span>`).join('')}</div>` : ''}
          <div class="detail-quote"><div class="detail-lore-title">✦ 공식 소환 대사</div>“${item.summonQuote}”</div>
          ${loreBlocks ? `<div class="detail-lore-box"><div class="detail-lore-title">📖 영기 프로필 & 인연 스토리</div>${loreBlocks}</div>` : ''}
          <div style="font-size:13px;color:#dbe7ff;margin-top:10px">
            ${owned
              ? `✅ 보유 중 · Lv.${owned.level} · 보구 Lv.${owned.npLevel} (총 ${owned.copies}기 소환 / 인연 Lv.${owned.bond})`
              : '🔒 미보유 영기입니다.'}
          </div>
          <div class="detail-actions">
            ${owned ? `<button class="small-gold-btn" id="btn-detail-myroom">🏰 마이룸에 배치 & 육성하기</button>` : ''}
            <button class="small-outline-btn" id="btn-detail-close-in">닫기</button>
          </div>
          ${customUploadHtml}
        </div>
      `;
      const mrBtn = document.getElementById('btn-detail-myroom');
      if (mrBtn) {
        mrBtn.addEventListener('click', () => {
          state.myRoomServantId = id;
          saveState();
          modal.classList.add('hidden');
          switchTab('myroom');
          triggerMyRoomLine(false);
        });
      }
    } else {
      const colNo = (typeof ATLAS_IMAGES !== 'undefined' && ATLAS_IMAGES.ces[id]?.collectionNo) || (item.npcOnly ? 'NPC' : '-');
      const ceCost = getCeCost(item);
      const lb = owned ? getCeLimitBreak(owned) : 0;
      const mlb = isCeMlb(owned);
      const curSt = getCeCurrentStats(item, owned);
      const caps = CE_MLB_LEVEL_CAPS[item.rarity] || [20, 30, 40, 50, 60];
      const maxExp = CE_MAX_EXP_TABLE[item.rarity] || 3599000;
      const lbDots = '◆'.repeat(lb) + '◇'.repeat(4 - lb);
      body.innerHTML = `
        <div class="detail-card-wrap">
          ${ArtRenderer.renderCardSVG(item, false, { mlb, eager: true })}
        </div>
        <div class="detail-info">
          <h3>${item.name} ${mlb ? '<span style="color:#ffe666">✛ 풀돌</span>' : ''}</h3>
          <div class="detail-meta">개념예장 No.${colNo} · ${'★'.repeat(item.rarity)} ${RARITY_TIERS[item.rarity] || ''} · 코스트 ${ceCost}${item.fpOnly ? ' · 프렌드 가챠 전용' : (item.npcOnly ? ' · 스토리 NPC 전용' : '')}</div>
          <div class="detail-credit-row">
            ${item.illustrator ? `<span>Illust: <strong>${item.illustrator}</strong></span>` : ''}
            <span>현재 Lv.<strong>${curSt.level} / ${curSt.maxLv}</strong> (한계돌파 ${lbDots} ${lb}/4)</span>
            <span>적용 스탯 ATK <strong>+${curSt.atk.toLocaleString()}</strong> / HP <strong>+${curSt.hp.toLocaleString()}</strong></span>
            <span>만렙(Lv.${caps[4]}) 기준 ATK <strong>+${(item.atkMax ?? curSt.atk).toLocaleString()}</strong> / HP <strong>+${(item.hpMax ?? curSt.hp).toLocaleString()}</strong></span>
          </div>
          <div style="margin-top:6px;font-size:13px"><strong>기본 효과:</strong> ${item.effect}</div>
          ${item.effectMax ? `<div style="margin-top:4px;font-size:13px;color:${mlb ? '#6effa8' : '#ffe680'}"><strong>${mlb ? '✅ 최대 해방(풀돌 적용 중!):' : '최대 해방(4돌/5장):'}</strong> ${item.effectMax}</div>` : ''}
          ${!item.npcOnly ? `<div style="margin-top:6px;font-size:11.5px;color:#9cb2d9">한계돌파 상한: 초기 Lv.${caps[0]} → 1돌 ${caps[1]} → 2돌 ${caps[2]} → 3돌 ${caps[3]} → 4돌(풀돌) Lv.${caps[4]} (만렙 누적 EXP ${maxExp.toLocaleString()})</div>` : ''}
          <div class="detail-lore-box"><div class="detail-lore-title">📖 개념예장 해설</div>${item.flavor}</div>
          <div style="font-size:13px;color:#dbe7ff;margin-top:10px">
            ${owned ? `✅ 보유 수량: ${owned.copies}장 ${mlb ? '(✛ 최대 해방 풀돌 완료! 배틀 풀돌 수치 자동 적용)' : `(풀돌까지 ${5 - owned.copies}장 더 필요)`}` : (item.npcOnly ? '🛡️ 메인 퀘스트 대여 서포트 NPC 전용 개념예장입니다.' : '🔒 미보유 개념예장입니다.')}
          </div>
          <div class="detail-actions">
            ${owned && !item.npcOnly && curSt.level < curSt.maxLv ? `<button class="small-gold-btn" id="btn-ce-lvup">🔥 예장 강화 +10Lv (🪙 5만 QP)</button>` : ''}
            ${owned && !item.npcOnly && curSt.level < curSt.maxLv ? `<button class="small-outline-btn" id="btn-ce-lvmax">⚡ 상한 Lv.${curSt.maxLv} 일괄 강화</button>` : ''}
            <button class="small-outline-btn" id="btn-detail-close-in">닫기</button>
          </div>
          ${customUploadHtml}
        </div>
      `;
      const ceUpBtn = document.getElementById('btn-ce-lvup');
      if (ceUpBtn && owned) {
        ceUpBtn.addEventListener('click', () => {
          const qpCost = 50000;
          if (state.qp < qpCost) { SoundEngine.error(); toast('QP가 50,000 부족합니다!'); return; }
          state.qp -= qpCost;
          owned.level = Math.min(curSt.maxLv, (owned.level || 1) + 10);
          SoundEngine.levelUp();
          saveState();
          renderAll();
          openDetailModal('ce', id);
          toast(`✨ [${item.name}] Lv.${owned.level} 강화 완료! (ATK/HP 배틀 즉시 반영)`);
        });
      }
      const ceMaxBtn = document.getElementById('btn-ce-lvmax');
      if (ceMaxBtn && owned) {
        ceMaxBtn.addEventListener('click', () => {
          const steps = Math.ceil((curSt.maxLv - (owned.level || 1)) / 10);
          const qpCost = Math.max(50000, steps * 50000);
          if (state.qp < qpCost) { SoundEngine.error(); toast(`QP가 ${qpCost.toLocaleString()} 필요합니다!`); return; }
          state.qp -= qpCost;
          owned.level = curSt.maxLv;
          SoundEngine.reveal(item.rarity, false);
          saveState();
          renderAll();
          openDetailModal('ce', id);
          toast(`🔥 [${item.name}] 현재 상한 Lv.${owned.level} MAX 달성!`);
        });
      }
    }

    const fileInput = document.getElementById('input-custom-art');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const ok = ArtRenderer.setCustomImage(id, reader.result);
          if (!ok) {
            toast('⚠️ 이미지 용량이 너무 커서 저장할 수 없습니다. 더 작은 이미지를 사용해 주세요.');
            return;
          }
          toast('📷 커스텀 일러스트로 교체되었습니다!');
          renderAll();
          openDetailModal(type, id);
        };
        reader.readAsDataURL(file);
      });
    }
    const resetArtBtn = document.getElementById('btn-reset-custom-art');
    if (resetArtBtn) {
      resetArtBtn.addEventListener('click', () => {
        ArtRenderer.setCustomImage(id, null);
        toast('↩️ 공식 일러스트로 복원되었습니다!');
        renderAll();
        openDetailModal(type, id);
      });
    }

    document.getElementById('btn-detail-close-in').addEventListener('click', () => modal.classList.add('hidden'));
    modal.classList.remove('hidden');
  }

  // ================= 확률표 모달 =================
  function openRatesModal() {
    SoundEngine.click();
    const b = BANNER_MAP[state.activeBannerId] || BANNERS[0];
    document.getElementById('rates-body').innerHTML = `
      <p style="font-size:13px;color:#cbd5e1;margin-bottom:10px">
        본 시뮬레이터는 <strong>Fate/Grand Order 실제 확률 및 천장 규칙</strong>을 충실히 고증했습니다.
      </p>
      <table class="rates-table">
        <thead><tr><th>구분</th><th>확률</th><th>비고</th></tr></thead>
        <tbody>
          <tr><td>★★★★★ 서번트</td><td><strong>1.00%</strong></td><td>${b.isStory ? '상시 5★ 균등 출현' : '픽업 0.80% / 상시 픽뚫 0.20%'}</td></tr>
          <tr><td>★★★★ 서번트</td><td><strong>3.00%</strong></td><td>${b.pickup4.length ? '픽업 4★ 확률 상승 적용' : '상시 4★ 균등 출현'}</td></tr>
          <tr><td>★★★ 서번트</td><td><strong>40.00%</strong></td><td>상시 3★ 서번트 풀</td></tr>
          <tr><td>★★★★★ 개념예장</td><td><strong>4.00%</strong></td><td>젤릿치, 흑성배, 2030 및 픽업 예장</td></tr>
          <tr><td>★★★★ 개념예장</td><td><strong>12.00%</strong></td><td>허수마술 등 4★ 예장 풀</td></tr>
          <tr><td>★★★ 개념예장</td><td><strong>40.00%</strong></td><td>매운 마파두부, 흑건 3종 등</td></tr>
        </tbody>
      </table>
      <ul style="font-size:12.5px;color:#dbe7ff;padding-left:18px;display:flex;flex-direction:column;gap:5px;margin-top:8px">
        <li><strong>11연차 (10+1)</strong>: 성정석 30개로 11회 소환! ★4 이상 1장 + ★3 이상 서번트 1기 확정.</li>
        <li><strong>단차 10+1 보너스</strong>: 동일 배너에서 1회 소환(성정석/호부) 10회마다 보너스 1회 추가 소환.</li>
        <li><strong>330연 천장 (확정 소환)</strong>: 픽업 배너에서 329연 연속 픽업 ★5 미출현 시, 330번째 소환에서 픽업 ★5 확정! (픽업 ★5 획득 시 카운트 리셋)</li>
        <li><strong>보구 레벨 & 무기명 영기</strong>: 동일 서번트 중복 시 보구 Lv.5까지 자동 강화. ★5 서번트 6기 이상부터 무기명 영기(USO) +1 지급!</li>
      </ul>
    `;
    document.getElementById('rates-modal').classList.remove('hidden');
  }

  // ================= 렌더링: 설정 탭 =================
  function renderSettingsTab() {
    const curSpeed = state.options.skipFx ? 'skip' : (state.options.fastFx ? 'fast' : 'normal');
    document.querySelectorAll('#set-fx-speed .filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.speed === curSpeed);
    });
    document.getElementById('set-auto-skip-common').checked = !!state.options.autoSkipCommon;
    document.getElementById('set-high-particles').checked = state.options.highParticles !== false;

    document.getElementById('set-sfx-enabled').checked = !SoundEngine.isMuted();
    const volPct = Math.round(SoundEngine.getVolume() * 100);
    document.getElementById('set-sfx-volume').value = volPct;
    document.getElementById('set-vol-label').textContent = `${volPct}%`;

    const curTs = state.options.textSpeed || 'normal';
    document.querySelectorAll('#set-text-speed .filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.ts === curTs);
    });

    const curArt = ArtRenderer.getArtMode();
    document.querySelectorAll('#set-art-mode .filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.art === curArt);
    });
  }

  // 원작 FGO 가챠 연출 미리보기 (성정석 소모 없음)
  function previewSummonFX(mode) {
    const banner = BANNER_MAP[state.activeBannerId] || BANNERS[0];
    const p5 = SERVANT_MAP[banner.pickup5[0] || 'sv_castoria'];
    const p4 = SERVANT_MAP[banner.pickup4[0] || 'sv_emiya'];
    const sv3 = SERVANT_MAP.sv_cu;

    let sampleRoll;
    if (mode === 'normal') {
      sampleRoll = { type: 'servant', item: sv3, isNew: false, isPickup: false, isSpook: false, isPity: false, npLevelAfter: 1, usoGained: false, animTier: 'normal' };
    } else if (mode === 'gold') {
      sampleRoll = { type: 'servant', item: p4, isNew: true, isPickup: true, isSpook: false, isPity: false, npLevelAfter: 1, usoGained: false, animTier: 'gold' };
    } else if (mode === 'rainbow') {
      sampleRoll = { type: 'servant', item: p5, isNew: true, isPickup: true, isSpook: false, isPity: false, npLevelAfter: 1, usoGained: false, animTier: 'rainbow' };
    } else {
      sampleRoll = { type: 'servant', item: p5, isNew: true, isPickup: true, isSpook: false, isPity: false, npLevelAfter: 1, usoGained: false, animTier: 'spark_rainbow' };
    }

    SummonFX.playSequence([sampleRoll], () => {
      toast('🎬 원작 FGO 소환 연출 미리보기가 종료되었습니다.');
    }, {
      fastMode: state.options.fastFx,
      autoSkipCommon: false,
      highParticles: state.options.highParticles !== false,
      textSpeed: state.options.textSpeed || 'normal'
    });
  }

  // ================= 탭 전환 =================
  function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-panel').forEach(sec => {
      sec.classList.toggle('active', sec.id === `tab-${tabName}`);
    });
    if (tabName === 'terminal' && typeof window.FgoTerminal !== 'undefined') window.FgoTerminal.render();
    if (tabName === 'codex') renderCodexTab();
    if (tabName === 'myroom') renderMyRoomTab();
    if (tabName === 'shop') renderShopTab();
    if (tabName === 'stats') renderStatsTab();
    if (tabName === 'settings') renderSettingsTab();
    if (tabName === 'battle' && typeof window.FgoBattle !== 'undefined') window.FgoBattle.onEnterTab();
  }

  function renderAll() {
    renderResources();
    renderSummonTab();
    if (document.getElementById('tab-terminal')?.classList.contains('active') && typeof window.FgoTerminal !== 'undefined') {
      window.FgoTerminal.render();
    }
    if (document.getElementById('tab-codex').classList.contains('active')) renderCodexTab();
    if (document.getElementById('tab-myroom').classList.contains('active')) renderMyRoomTab();
    if (document.getElementById('tab-shop').classList.contains('active')) renderShopTab();
    if (document.getElementById('tab-stats').classList.contains('active')) renderStatsTab();
    if (document.getElementById('tab-settings').classList.contains('active')) renderSettingsTab();
    if (document.getElementById('tab-battle')?.classList.contains('active') && typeof window.FgoBattle !== 'undefined') {
      window.FgoBattle.renderLobbyIfIdle();
    }
  }

  // ================= 이벤트 바인딩 =================
  function bindEvents() {
    // 네비게이션 탭
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        switchTab(btn.dataset.tab);
      });
    });

    // 상단 버튼
    document.getElementById('btn-open-charge').addEventListener('click', () => {
      SoundEngine.click();
      switchTab('shop');
    });
    document.getElementById('btn-mute').addEventListener('click', () => {
      SoundEngine.toggleMute();
      renderResources();
    });
    document.getElementById('btn-art-mode').addEventListener('click', () => {
      SoundEngine.click();
      const mode = ArtRenderer.toggleArtMode();
      renderAll();
      toast(mode === 'official' ? '🖼️ 공식 일러스트 모드 (Atlas Academy)' : '🎨 프로시저럴 SVG 팬아트 모드');
    });

    // 소환 버튼 4종 (성정석/호부) + 프렌드 포인트 3종
    document.getElementById('btn-pull-ticket').addEventListener('click', () => executeSummon('ticket'));
    document.getElementById('btn-pull-1').addEventListener('click', () => executeSummon('single'));
    document.getElementById('btn-pull-11').addEventListener('click', () => executeSummon('multi'));
    document.getElementById('btn-pull-110').addEventListener('click', () => executeSummon('sim110'));
    document.getElementById('btn-pull-fp1')?.addEventListener('click', () => executeSummon('fp1'));
    document.getElementById('btn-pull-fp10')?.addEventListener('click', () => executeSummon('fp10'));
    document.getElementById('btn-pull-fp100')?.addEventListener('click', () => executeSummon('fp100'));

    // 커스텀 픽업 선택기
    document.getElementById('custom-pu5-search')?.addEventListener('input', populateCustomPickupSelectors);
    document.getElementById('custom-pu4-search')?.addEventListener('input', populateCustomPickupSelectors);
    document.getElementById('custom-pu5-sel')?.addEventListener('change', (e) => {
      state.customPickup.sv5 = e.target.value;
      if (BANNER_MAP.bn_custom) BANNER_MAP.bn_custom.pickup5 = [state.customPickup.sv5];
      saveState();
      renderSummonTab();
      toast(`🎯 커스텀 ★5 픽업 변경: [${SERVANT_MAP[state.customPickup.sv5]?.name}]`);
    });
    document.getElementById('custom-pu4-sel')?.addEventListener('change', (e) => {
      state.customPickup.sv4 = e.target.value;
      if (BANNER_MAP.bn_custom) BANNER_MAP.bn_custom.pickup4 = [state.customPickup.sv4];
      saveState();
      renderSummonTab();
      toast(`🎯 커스텀 ★4 픽업 변경: [${SERVANT_MAP[state.customPickup.sv4]?.name}]`);
    });

    // 소환 옵션
    document.getElementById('opt-fast-fx').addEventListener('change', (e) => {
      state.options.fastFx = e.target.checked;
      saveState();
    });
    document.getElementById('opt-skip-fx').addEventListener('change', (e) => {
      state.options.skipFx = e.target.checked;
      saveState();
    });
    document.getElementById('btn-show-rates').addEventListener('click', openRatesModal);
    document.getElementById('btn-goto-stats').addEventListener('click', () => switchTab('stats'));

    // 소환 연출 스테이지 클릭 / 스킵 / 키보드
    document.getElementById('summon-stage-clickzone').addEventListener('click', (e) => {
      if (e.target.closest('#btn-summon-skip')) return;
      SummonFX.handleStageClick();
    });
    document.getElementById('btn-summon-skip').addEventListener('click', (e) => {
      e.stopPropagation();
      SummonFX.skipAll();
    });
    window.addEventListener('keydown', (e) => {
      if (SummonFX.isActive() && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        SummonFX.handleStageClick();
      } else if (e.code === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      }
    });

    // 결과 모달
    const closeResult = () => document.getElementById('result-modal').classList.add('hidden');
    document.getElementById('btn-close-result').addEventListener('click', closeResult);
    document.getElementById('btn-result-close-2').addEventListener('click', closeResult);
    document.getElementById('btn-result-again').addEventListener('click', () => {
      closeResult();
      const nextMode = lastPullMode === 'sim110'
        ? 'sim110'
        : (lastPullMode === 'fp100' ? 'fp100' : ((lastPullMode === 'fp10' || lastPullMode === 'fp1') ? 'fp10' : 'multi'));
      executeSummon(nextMode);
    });

    // 상세 / 확률 모달 닫기
    document.getElementById('btn-close-detail').addEventListener('click', () => document.getElementById('detail-modal').classList.add('hidden'));
    document.getElementById('btn-close-rates').addEventListener('click', () => document.getElementById('rates-modal').classList.add('hidden'));
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
      });
    });

    // 도감 필터
    document.querySelectorAll('#codex-type-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        codexFilter.type = btn.dataset.type;
        codexLimit = 60;
        document.querySelectorAll('#codex-type-filter .filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderCodexTab();
      });
    });
    document.querySelectorAll('#codex-rarity-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        codexFilter.rarity = btn.dataset.rarity;
        codexLimit = 60;
        document.querySelectorAll('#codex-rarity-filter .filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderCodexTab();
      });
    });
    document.querySelectorAll('#codex-owned-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        codexFilter.owned = btn.dataset.owned;
        codexLimit = 60;
        document.querySelectorAll('#codex-owned-filter .filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderCodexTab();
      });
    });
    document.getElementById('codex-class-filter').addEventListener('change', (e) => {
      codexFilter.cls = e.target.value;
      codexLimit = 60;
      renderCodexTab();
    });
    document.getElementById('codex-pool-filter')?.addEventListener('change', (e) => {
      codexFilter.pool = e.target.value;
      codexLimit = 60;
      renderCodexTab();
    });
    document.getElementById('codex-trait-filter')?.addEventListener('change', (e) => {
      codexFilter.trait = e.target.value;
      codexLimit = 60;
      renderCodexTab();
    });
    document.getElementById('codex-sort-filter')?.addEventListener('change', (e) => {
      codexFilter.sort = e.target.value;
      codexLimit = 60;
      renderCodexTab();
    });
    document.getElementById('codex-search')?.addEventListener('input', (e) => {
      codexFilter.query = e.target.value;
      codexLimit = 60;
      renderCodexTab();
    });
    document.getElementById('myroom-roster-search')?.addEventListener('input', (e) => {
      myroomQuery = e.target.value;
      renderMyRoomTab();
    });
    document.getElementById('welfare-search')?.addEventListener('input', (e) => {
      welfareQuery = e.target.value;
      renderWelfareShop();
    });

    // 마이룸 상호작용 & 육성
    document.getElementById('myroom-portrait-wrap').addEventListener('click', () => triggerMyRoomLine(true));
    document.getElementById('myroom-dialogue-box').addEventListener('click', (e) => {
      if (e.target.closest('#btn-myroom-talk')) return;
      triggerMyRoomLine(true);
    });
    document.getElementById('btn-myroom-talk').addEventListener('click', () => triggerMyRoomLine(true));

    document.querySelectorAll('#myroom-asc-tabs .asc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const own = state.servants[state.myRoomServantId];
        if (!own) return;
        const asc = Number(btn.dataset.asc);
        if (asc > own.ascension) return;
        SoundEngine.click();
        own.viewAsc = asc;
        saveState();
        renderMyRoomTab();
      });
    });

    document.getElementById('btn-lv-up').addEventListener('click', () => {
      const sv = SERVANT_MAP[state.myRoomServantId];
      const own = state.servants[state.myRoomServantId];
      if (!sv || !own) return;
      const cap = getMaxLevelCap(sv, own);
      if (own.level >= cap) {
        SoundEngine.error();
        toast(own.ascension < 4 ? '최대 레벨입니다! 먼저 영기재림을 진행하세요.' : '현재 상한입니다! 성배전림으로 Lv.120까지 확장할 수 있습니다.');
        return;
      }
      if (state.embers < 5) {
        SoundEngine.error();
        toast('종화가 부족합니다! 배틀 종화 던전이나 다 빈치 공방에서 획득하세요.');
        return;
      }
      const lvQp = getLevelUpQp(sv.rarity, own.level);
      if (state.qp < lvQp) {
        SoundEngine.error();
        toast(`QP가 부족합니다! (필요: ${lvQp.toLocaleString()} QP)`);
        return;
      }
      state.embers -= 5;
      state.qp -= lvQp;
      // v24: 원작 FGO 대성공(10% · 2배) / 극대성공(2% · 3배)
      const r = Math.random();
      let lvGain = 10;
      let bonusTag = '';
      if (r < 0.02) { lvGain = 30; bonusTag = '🌟 극대성공 (3배)! '; }
      else if (r < 0.12) { lvGain = 20; bonusTag = '✨ 대성공 (2배)! '; }
      own.level = Math.min(cap, own.level + lvGain);
      SoundEngine.levelUp();
      saveState();
      renderMyRoomTab();
      toast(`🔥 ${bonusTag}${sv.name} Lv.${own.level} 달성! (-${lvQp.toLocaleString()} QP)`);
    });

    document.getElementById('btn-ascend').addEventListener('click', () => {
      const sv = SERVANT_MAP[state.myRoomServantId];
      const own = state.servants[state.myRoomServantId];
      if (!sv || !own) return;
      if (own.ascension >= 4) {
        toast('이미 최종 영기재림(4차) 상태입니다!');
        return;
      }
      const ascQp = getAscensionQp(sv.rarity, own.ascension);
      if (state.qp < ascQp) {
        SoundEngine.error();
        toast(`QP가 부족합니다! 필요: ${ascQp.toLocaleString()} QP (배틀 보물고에서 파밍하세요!)`);
        return;
      }
      // v29: 공식 영기재림 재료 실제 체크 및 소비!
      const matData = window.SERVANT_MATERIALS && window.SERVANT_MATERIALS[sv.collectionNo];
      const ascIdx = own.ascension - 1; // 1차→2차는 index 0, 2→3은 1, 3→4는 2
      const reqItems = matData && matData.asc && matData.asc[ascIdx] && matData.asc[ascIdx].items ? matData.asc[ascIdx].items : [];
      const missing = reqItems.filter(([name, amt]) => ((state.materials && state.materials[name]) || 0) < amt);
      if (missing.length) {
        SoundEngine.error();
        toast(`재림 재료가 부족합니다! 필요: ${missing.map(([n, a]) => `${n} ${a}개(보유 ${(state.materials && state.materials[n]) || 0})`).join(', ')} — 다 빈치 공방에서 교환하세요!`);
        return;
      }
      reqItems.forEach(([name, amt]) => { state.materials[name] = ((state.materials && state.materials[name]) || 0) - amt; });
      const prevR = getEffectiveRarity(sv, own);
      state.qp -= ascQp;
      own.ascension++;
      own.viewAsc = own.ascension;
      const nextR = getEffectiveRarity(sv, own);
      if (sv.variableRarity && nextR > prevR) {
        if (own.ascension === 4) {
          state.sq += 3;
          toast(`👑 ${sv.name} 레어도 승격!! ★★★★ SR → ★★★★★ SSR (팔라딘 해방) · 성정석 +3!`);
        } else {
          toast(`✨ ${sv.name} 레어도 승격!! ★★★ R → ★★★★ SR (금테 해방)!`);
        }
      } else if (own.ascension === 4) {
        state.sq += 3;
        toast(`✨ ${sv.name} 최종 재림 달성!! 일러스트 오라 해방 & 보너스 성정석 +3!`);
      } else {
        toast(`✨ ${sv.name} ${own.ascension}차 영기재림 완료!`);
      }
      SoundEngine.levelUp();
      saveState();
      renderResources();
      renderMyRoomTab();
    });

    document.getElementById('btn-grail').addEventListener('click', () => {
      const sv = SERVANT_MAP[state.myRoomServantId];
      const own = state.servants[state.myRoomServantId];
      if (!sv || !own) return;
      if (own.ascension < 4) {
        SoundEngine.error();
        toast('최종 재림(4차) 이후에만 성배전림이 가능합니다!');
        return;
      }
      const curCap = getMaxLevelCap(sv, own);
      if (curCap >= 120) {
        toast('이미 Lv.120 궁극의 성배전림을 완료했습니다!');
        return;
      }
      const step = typeof window.getFgoGrailStep === 'function'
        ? window.getFgoGrailStep(curCap)
        : { nextCap: curCap + 2, grails: 1, coins: curCap >= 100 ? 30 : 0, qp: 2000000 };
      if (state.grails < step.grails) {
        SoundEngine.error();
        toast('성배가 부족합니다! 다 빈치 공방에서 성배주조(코인 2,000) 또는 레어프리즘으로 획득하세요.');
        return;
      }
      if (step.coins > 0 && (own.coins || 0) < step.coins) {
        SoundEngine.error();
        toast(`Lv.100 초과 성배전림에는 서번트 코인 ${step.coins}개가 필요합니다! (현재: ${own.coins || 0}개)`);
        return;
      }
      state.grails -= step.grails;
      if (step.coins > 0) own.coins = (own.coins || 0) - step.coins;
      own.grailsUsed++;
      own.level = Math.min(120, own.level + (step.nextCap - curCap));
      SoundEngine.reveal(5, true);
      saveState();
      renderResources();
      renderMyRoomTab();
      toast(`🏆 ${sv.name} 성배전림 성공! 최대 레벨 Lv.${getMaxLevelCap(sv, own)} 해방!${step.coins ? ` (코인 -${step.coins})` : ''}`);
    });

    document.getElementById('btn-burn-extra').addEventListener('click', () => {
      const sv = SERVANT_MAP[state.myRoomServantId];
      const own = state.servants[state.myRoomServantId];
      if (!sv || !own || own.extraCopies <= 0) {
        SoundEngine.error();
        toast('보구 Lv.5를 초과한 잉여 영기가 없습니다.');
        return;
      }
      const cnt = own.extraCopies;
      own.extraCopies = 0;
      if (sv.rarity === 5) { state.rp += cnt * 5; state.mp += cnt * 10; }
      else if (sv.rarity === 4) { state.rp += cnt * 1; state.mp += cnt * 5; }
      else { state.mp += cnt * 3; }
      SoundEngine.shopBuy();
      saveState();
      renderAll();
      toast(`♻️ ${sv.name} 잉여 ${cnt}기 변환 완료!`);
    });

    // 상점 일괄 변환
    document.getElementById('btn-burn-ce3').addEventListener('click', () => {
      let gained = 0;
      CRAFT_ESSENCES.filter(c => c.rarity === 3).forEach(c => {
        const own = state.ces[c.id];
        if (own && own.copies > 1) {
          const burn = own.copies - 1;
          own.copies = 1;
          own.extraCopies = 0;
          gained += burn;
        }
      });
      if (gained === 0) { toast('변환할 중복 3★ 개념예장이 없습니다.'); return; }
      state.mp += gained;
      SoundEngine.shopBuy();
      saveState();
      renderAll();
      toast(`🌶️ 중복 3★ 예장 ${gained}장 변환 → 마나프리즘 +${gained}!`);
    });

    document.getElementById('btn-burn-ce4').addEventListener('click', () => {
      let burned = 0;
      CRAFT_ESSENCES.filter(c => c.rarity === 4).forEach(c => {
        const own = state.ces[c.id];
        if (own && own.copies > 5) {
          const burn = own.copies - 5;
          own.copies = 5;
          own.extraCopies = 0;
          burned += burn;
        }
      });
      if (burned === 0) { toast('풀돌(5장) 초과 중복 4★ 개념예장이 없습니다.'); return; }
      state.mp += burned * 3;
      SoundEngine.shopBuy();
      saveState();
      renderAll();
      toast(`✨ 4★ 예장 ${burned}장 변환 → 마나프리즘 +${burned * 3}!`);
    });

    document.getElementById('btn-burn-sv-overflow').addEventListener('click', () => {
      let mpGain = 0, rpGain = 0, cnt = 0;
      SERVANTS.forEach(sv => {
        const own = state.servants[sv.id];
        if (own && own.extraCopies > 0) {
          cnt += own.extraCopies;
          if (sv.rarity === 5) { rpGain += own.extraCopies * 5; mpGain += own.extraCopies * 10; }
          else if (sv.rarity === 4) { rpGain += own.extraCopies; mpGain += own.extraCopies * 5; }
          else { mpGain += own.extraCopies * 3; }
          own.extraCopies = 0;
        }
      });
      if (cnt === 0) { toast('보구 Lv.5를 초과한 잉여 서번트가 없습니다.'); return; }
      state.mp += mpGain;
      state.rp += rpGain;
      SoundEngine.shopBuy();
      saveState();
      renderAll();
      toast(`♻️ 잉여 서번트 ${cnt}기 변환 → 마프 +${mpGain}, 레프 +${rpGain}!`);
    });

    // 통계 탭 내보내기 / 초기화
    document.getElementById('btn-export-save').addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `chaldea_gacha_save_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      toast('💾 세이브 파일(JSON)을 다운로드했습니다!');
    });

    document.getElementById('btn-reset-save').addEventListener('click', () => {
      if (!confirm('정말 모든 가챠 기록, 보유 서번트, 통계를 초기화하시겠습니까?')) return;
      state = ensureStarterAndCustom(createDefaultState());
      saveState();
      renderAll();
      toast('🗑️ 칼데아 데이터가 초기화되었습니다. (기본 서번트 마슈 지급)');
    });

    // ================= 설정 탭 이벤트 바인딩 =================
    document.querySelectorAll('#set-fx-speed .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        const spd = btn.dataset.speed;
        state.options.fastFx = (spd === 'fast');
        state.options.skipFx = (spd === 'skip');
        saveState();
        renderAll();
      });
    });

    document.getElementById('set-auto-skip-common').addEventListener('change', (e) => {
      state.options.autoSkipCommon = e.target.checked;
      saveState();
      toast(e.target.checked ? '⚡ ★3 중복 카드는 연출을 자동 건너뜁니다.' : '✨ 모든 카드 소환 연출을 표시합니다.');
    });

    document.getElementById('set-high-particles').addEventListener('change', (e) => {
      state.options.highParticles = e.target.checked;
      saveState();
    });

    document.getElementById('set-sfx-enabled').addEventListener('change', (e) => {
      SoundEngine.setMuted(!e.target.checked);
      renderResources();
      if (e.target.checked) SoundEngine.click();
    });

    document.getElementById('set-sfx-volume').addEventListener('input', (e) => {
      const pct = Number(e.target.value);
      SoundEngine.setVolume(pct / 100);
      document.getElementById('set-vol-label').textContent = `${pct}%`;
    });
    document.getElementById('set-sfx-volume').addEventListener('change', () => SoundEngine.click());

    document.querySelectorAll('#set-text-speed .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        state.options.textSpeed = btn.dataset.ts;
        saveState();
        renderSettingsTab();
      });
    });

    document.querySelectorAll('#set-art-mode .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        ArtRenderer.setArtMode(btn.dataset.art);
        renderAll();
      });
    });

    // 연출 미리보기 테스트 4종
    document.getElementById('btn-test-fx-normal').addEventListener('click', () => previewSummonFX('normal'));
    document.getElementById('btn-test-fx-gold').addEventListener('click', () => previewSummonFX('gold'));
    document.getElementById('btn-test-fx-rainbow').addEventListener('click', () => previewSummonFX('rainbow'));
    document.getElementById('btn-test-fx-spark').addEventListener('click', () => previewSummonFX('spark'));

    // 설정 탭 데이터 관리
    document.getElementById('btn-set-export').addEventListener('click', () => {
      document.getElementById('btn-export-save').click();
    });

    document.getElementById('input-import-save').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!parsed || typeof parsed.sq !== 'number' || !parsed.stats) {
            throw new Error('invalid save');
          }
          const def = createDefaultState();
          state = ensureStarterAndCustom({
            ...def,
            ...parsed,
            customPickup: { ...def.customPickup, ...(parsed.customPickup || {}) },
            options: { ...def.options, ...(parsed.options || {}) },
            stats: { ...def.stats, ...(parsed.stats || {}) }
          });
          saveState();
          renderAll();
          SoundEngine.levelUp();
          toast('📂 세이브 데이터를 성공적으로 불러왔습니다!');
        } catch (_) {
          SoundEngine.error();
          toast('⚠️ 올바른 칼데아 세이브 JSON 파일이 아닙니다.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    document.getElementById('btn-set-clear-custom-art').addEventListener('click', () => {
      ArtRenderer.clearAllCustomImages();
      renderAll();
      toast('🖼️ 커스텀 이미지를 모두 공식 일러스트로 복원했습니다.');
    });

    document.getElementById('btn-set-reset-stats').addEventListener('click', () => {
      if (!confirm('보유 서번트와 성정석은 유지하고, 가챠 통계/기록만 초기화할까요?')) return;
      state.stats = createDefaultState().stats;
      saveState();
      renderAll();
      toast('📊 가챠 통계가 초기화되었습니다.');
    });

    document.getElementById('btn-set-reset-all').addEventListener('click', () => {
      document.getElementById('btn-reset-save').click();
    });
  }

  // 배틀 모듈(battle.js)과 상태를 안전하게 공유하는 브리지
  function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

    function refreshCommandSpellsDaily() {
      const today = getTodayKey();
      if (state.lastSpellResetDate !== today) {
        state.commandSpells = 3;
        state.lastSpellResetDate = today;
        saveState();
      }
      return state.commandSpells;
    }
    refreshCommandSpellsDaily();

    window.ChaldeaBridge = {
      getState: () => state,
      getCommandSpells: () => refreshCommandSpellsDaily(),
      consumeCommandSpells(count) {
        refreshCommandSpellsDaily();
        if (state.commandSpells < count) return false;
        state.commandSpells -= count;
        saveState();
        return true;
      },
      spendSqForRevive() {
        if (state.sq < 1) return false;
        state.sq -= 1;
        state.stats.sqSpent += 1;
        saveState();
        renderResources();
        return true;
      },
      switchToBattleTab: () => switchTab('battle'),
      getActiveMysticCodeId: () => state.activeMysticCodeId || 'mc_chaldea',
      getMysticCodeState: (id) => (state.mysticCodes && state.mysticCodes[id]) || null,
      setActiveMysticCode(id) {
        if (typeof MYSTIC_CODE_MAP === 'undefined' || !MYSTIC_CODE_MAP[id]) return false;
        if (!state.mysticCodes[id]) return false;
        state.activeMysticCodeId = id;
        saveState();
        return true;
      },
      unlockMysticCode(id, free = false) {
        if (typeof MYSTIC_CODE_MAP === 'undefined' || !MYSTIC_CODE_MAP[id]) return { ok: false, reason: 'invalid' };
        if (state.mysticCodes[id]) return { ok: true, already: true };
        const costMp = free ? 0 : 20;
        if (state.mp < costMp) return { ok: false, reason: 'mp' };
        state.mp -= costMp;
        state.mysticCodes[id] = { exp: 0, level: 1 };
        saveState();
        renderResources();
        return { ok: true };
      },
      unlockAllMysticCodes() {
        if (typeof MYSTIC_CODES === 'undefined') return 0;
        let added = 0;
        MYSTIC_CODES.forEach(mc => {
          if (!state.mysticCodes[mc.id]) {
            state.mysticCodes[mc.id] = { exp: 0, level: 1 };
            added++;
          }
        });
        saveState();
        return added;
      },
      trainMysticCodeLevel(id, toMax = false) {
        if (typeof MYSTIC_CODE_MAP === 'undefined' || !MYSTIC_CODE_MAP[id] || !state.mysticCodes[id]) return { ok: false };
        const mc = MYSTIC_CODE_MAP[id];
        const entry = state.mysticCodes[id];
        const curve = MYSTIC_CODE_EXP_CURVES[mc.expCurve] || MYSTIC_CODE_EXP_CURVES.event;
        const curLv = getMcLevelFromExp(mc.expCurve, entry.exp || 0);
        if (curLv >= 10) return { ok: false, reason: 'max' };
        const targetLv = toMax ? 10 : curLv + 1;
        const qpCost = toMax ? (10 - curLv) * 500000 : 500000;
        if (state.qp < qpCost) return { ok: false, reason: 'qp', need: qpCost };
        state.qp -= qpCost;
        entry.exp = curve[targetLv - 1];
        entry.level = targetLv;
        saveState();
        renderResources();
        return { ok: true, level: targetLv, qpCost };
      },
      grantMysticCodeExp(expAmount) {
        if (typeof MYSTIC_CODE_MAP === 'undefined' || !expAmount) return null;
        const id = state.activeMysticCodeId || 'mc_chaldea';
        const mc = MYSTIC_CODE_MAP[id];
        if (!mc) return null;
        if (!state.mysticCodes[id]) state.mysticCodes[id] = { exp: 0, level: 1 };
        const entry = state.mysticCodes[id];
        const curve = MYSTIC_CODE_EXP_CURVES[mc.expCurve] || MYSTIC_CODE_EXP_CURVES.event;
        const maxExp = curve[curve.length - 1];
        const prevLv = getMcLevelFromExp(mc.expCurve, entry.exp || 0);
        entry.exp = Math.min(maxExp, (entry.exp || 0) + expAmount);
        const newLv = getMcLevelFromExp(mc.expCurve, entry.exp);
        entry.level = newLv;
        saveState();
        if (newLv > prevLv) {
          toast(`🧤 마술예장 [${mc.name}] Lv.${newLv} 달성!!`);
        }
        return { mc, prevLv, newLv, gained: expAmount, exp: entry.exp, maxExp };
      },
      grantBattleRewards(rewards, partyServantIds) {
        if (rewards.sq) state.sq += rewards.sq;
        if (rewards.embers) state.embers += rewards.embers;
        if (rewards.qp) state.qp += rewards.qp;
        if (rewards.mp) state.mp += rewards.mp;
        if (rewards.rp) state.rp += rewards.rp;
        if (rewards.fp) state.fp = (state.fp || 0) + rewards.fp;
        if (rewards.tickets) state.tickets += rewards.tickets;
        if (rewards.grails) state.grails += rewards.grails;

        // 출격한 보유 서번트 인연 경험치 +1
        (partyServantIds || []).forEach(id => {
          const own = state.servants[id];
          if (own && own.bond < 15) {
            own.bondExp = (own.bondExp || 0) + 1;
            const need = own.bond >= 10 ? 5 : 3;
            if (own.bondExp >= need) {
              own.bondExp = 0;
              own.bond++;
              const bonusSq = own.bond >= 11 ? 30 : 3;
              state.sq += bonusSq;
              const sv = SERVANT_MAP[id];
              toast(`💖 전투 승리! ${sv?.name || ''} 인연 Lv.${own.bond} 달성 (성정석 +${bonusSq}!)`);
            }
          }
        });
        // 장착 마술예장 경험치 지급
        const mcRes = rewards.mcExp ? window.ChaldeaBridge.grantMysticCodeExp(rewards.mcExp) : null;
        if (rewards.questId) {
          if (!state.clearedQuests) state.clearedQuests = {};
          state.clearedQuests[rewards.questId] = (state.clearedQuests[rewards.questId] || 0) + 1;
        }
        if (rewards.unlockMcId) {
          const uRes = window.ChaldeaBridge.unlockMysticCode(rewards.unlockMcId, true);
          if (uRes && uRes.ok && !uRes.already && typeof MYSTIC_CODE_MAP !== 'undefined' && MYSTIC_CODE_MAP[rewards.unlockMcId]) {
            toast(`🧤 마술예장 퀘스트 클리어! [${MYSTIC_CODE_MAP[rewards.unlockMcId].name}] 해금 완료!!`);
          }
        }
        if (typeof window.FgoTerminal !== 'undefined' && window.FgoTerminal.grantMasterExp) {
          window.FgoTerminal.grantMasterExp(Math.max(15000, Math.round((rewards.mcExp || 100000) * 0.2)));
        }
        saveState();
        renderResources();
        return mcRes;
      },
      getClearedQuestCount: (qid) => (state.clearedQuests && state.clearedQuests[qid]) || 0,
      getTerminalState: () => state.terminal,
      saveState: () => saveState(),
      renderAll: () => renderAll(),
      openBattleCategory(catId) {
        switchTab('battle');
        if (window.FgoBattle && typeof window.FgoBattle.openCategory === 'function') {
          window.FgoBattle.openCategory(catId);
        }
      },
      grantWelfareServant(svId) {
        if (!SERVANT_MAP[svId]) return false;
        if (!state.servants[svId]) {
          state.servants[svId] = { copies: 1, extraCopies: 0, npLevel: 1, level: 1, ascension: 1, grailsUsed: 0, bond: 1, bondExp: 0, viewAsc: 1 };
        } else {
          state.servants[svId].copies++;
          if (state.servants[svId].npLevel < 5) state.servants[svId].npLevel++;
          else state.servants[svId].extraCopies++;
        }
        saveState();
        return true;
      },
      toast
    };

  // 초기화 시작
  bindEvents();
  renderAll();
})();
