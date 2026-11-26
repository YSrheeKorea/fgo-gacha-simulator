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
      uso: 0,            // 무기명 영기
      grails: 3,         // 성배
      embers: 40,        // 종화 (예지의 맹화)
      qp: 15000000,      // QP
      activeBannerId: BANNERS[0].id,
      bannerState: {},   // { [bannerId]: { pity: 0, singleBonus: 0, totalPulls: 0 } }
      servants: {},      // { [id]: { copies, extraCopies, npLevel, level, ascension, grailsUsed, bond, bondExp, viewAsc } }
      ces: {},           // { [id]: { copies, extraCopies } }
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

  let state = loadState();
  let codexFilter = { type: 'servant', rarity: 'all', owned: 'all', cls: 'all' };
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
    // - 픽업 배너 비픽업(픽뚫) 풀: 순수 상시(!limited && !storyLocked)만 등장
    // - 스토리 소환 풀: 상시 + 스토리 해금(!limited) 전부 등장 (환상종 획득 가능!)
    const poolSv5 = SERVANTS.filter(s => s.rarity === 5 && !s.limited && (banner.isStory || !s.storyLocked));
    const poolSv4 = SERVANTS.filter(s => s.rarity === 4 && !s.limited && (banner.isStory || !s.storyLocked));
    const poolSv3 = SERVANTS.filter(s => s.rarity === 3 && !s.limited && (banner.isStory || !s.storyLocked));
    const allCe5  = CRAFT_ESSENCES.filter(c => c.rarity === 5);
    const allCe4  = CRAFT_ESSENCES.filter(c => c.rarity === 4);
    const allCe3  = CRAFT_ESSENCES.filter(c => c.rarity === 3);

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

  // ================= 소환 액션 핸들러 =================
  function executeSummon(mode) {
    const banner = BANNER_MAP[state.activeBannerId] || BANNERS[0];
    const bState = getBannerState(banner.id);
    lastPullMode = mode;

    let results = [];
    let modalTitle = '✨ 소환 결과';

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

    // 110연이나 스킵 옵션이면 바로 결과 모달 표시
    if (mode === 'sim110' || state.options.skipFx) {
      const hasSsr = results.some(r => r.type === 'servant' && r.item.rarity === 5);
      SoundEngine.reveal(hasSsr ? 5 : 4, hasSsr);
      showResultModal(results, modalTitle);
    } else {
      SummonFX.playSequence(results, (doneRolls) => {
        showResultModal(doneRolls, modalTitle);
      }, {
        fastMode: state.options.fastFx,
        autoSkipCommon: state.options.autoSkipCommon,
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
    const ce5Count = results.filter(r => r.type === 'ce' && r.item.rarity === 5).length;
    const mapoCount = results.filter(r => r.item.id === 'ce_mapo_tofu').length;

    let comment = '';
    if (sv5Count >= 2) comment = '🔥 미친 비틱!! 5성 다중 출현!!';
    else if (sv5Count === 1) comment = '🎉 축하합니다! ★5 서번트 강림!';
    else if (sv4Count >= 1) comment = '✨ 금테 서번트 확보!';
    else if (mapoCount >= 2) comment = '🌶️ 신부의 은총이 가득합니다… (대폭사)';
    else comment = '💀 최소 보장… 다음 11연엔 뜰 겁니다!';

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
      : '✨ 한 번 더 11회 소환 (💎30)';

    modal.classList.remove('hidden');
  }

  // ================= 렌더링: 상단 재화 =================
  function renderResources() {
    document.getElementById('res-sq').textContent = state.sq.toLocaleString();
    document.getElementById('res-ticket').textContent = state.tickets.toLocaleString();
    document.getElementById('res-mp').textContent = state.mp.toLocaleString();
    document.getElementById('res-rp').textContent = state.rp.toLocaleString();
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
    if (activeBanner.isStory) {
      pityBadge.textContent = '천장 없음 (상시)';
      pityWrap.style.display = 'none';
    } else {
      pityBadge.textContent = `천장까지 ${pityLeft}회`;
      pityWrap.style.display = 'block';
      document.getElementById('pity-bar-text').textContent = `${bState.pity} / 330 회 (${Math.floor((bState.pity / 330) * 100)}%)`;
      document.getElementById('pity-bar-fill').style.width = `${Math.min(100, (bState.pity / 330) * 100)}%`;
    }
    document.getElementById('banner-bonus-badge').textContent = `단차 보너스 ${bState.singleBonus}/10`;

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
        return `<span class="recent-pill ${cls}">${'★'.repeat(r.rarity)} ${r.name} ${tag}</span>`;
      }).join('');
    }
  }

  // ================= 렌더링: 영기 일람 (도감) =================
  function renderCodexTab() {
    const grid = document.getElementById('codex-grid');
    const clsSelect = document.getElementById('codex-class-filter');

    // 클래스 필터 드롭다운 1회 채우기
    if (clsSelect.options.length <= 1) {
      Object.entries(CLASS_INFO).forEach(([k, v]) => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = v.name;
        clsSelect.appendChild(opt);
      });
    }

    const isServant = codexFilter.type === 'servant';
    clsSelect.style.display = isServant ? 'inline-block' : 'none';

    const list = isServant ? SERVANTS : CRAFT_ESSENCES;
    const ownedMap = isServant ? state.servants : state.ces;
    const ownedTotal = list.filter(x => !!ownedMap[x.id]).length;
    const pct = Math.round((ownedTotal / list.length) * 100);
    document.getElementById('codex-progress-box').textContent =
      `${isServant ? '서번트' : '개념예장'} 수집률 ${ownedTotal}/${list.length} (${pct}%)`;

    const filtered = list.filter(item => {
      if (codexFilter.rarity !== 'all' && String(item.rarity) !== codexFilter.rarity) return false;
      const isOwned = !!ownedMap[item.id];
      if (codexFilter.owned === 'owned' && !isOwned) return false;
      if (codexFilter.owned === 'unowned' && isOwned) return false;
      if (isServant && codexFilter.cls !== 'all' && item.cls !== codexFilter.cls) return false;
      return true;
    });

    grid.innerHTML = '';
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="empty-hint">조건에 맞는 영기가 없습니다.</div>';
      return;
    }

    filtered.forEach(item => {
      const owned = ownedMap[item.id];
      const div = document.createElement('div');
      div.className = 'codex-item' + (owned ? '' : ' unowned');
      div.innerHTML = ArtRenderer.renderCardSVG(item, isServant, {
        ascension: isServant && owned ? owned.viewAsc : 1,
        npLevel: isServant && owned ? owned.npLevel : 0,
        compact: true
      }) + (owned ? `<span class="codex-item-count">${isServant ? `Lv.${owned.level}` : `x${owned.copies}`}</span>` : '');
      div.addEventListener('click', () => openDetailModal(codexFilter.type, item.id));
      grid.appendChild(div);
    });
  }

  // ================= 렌더링: 마이룸 & 육성 =================
  function getMaxLevelCap(sv, owned) {
    const baseMax = sv.rarity === 5 ? 90 : (sv.rarity === 4 ? 80 : 70);
    const ascCap = Math.min(baseMax, (baseMax - 30) + (owned.ascension - 1) * 10);
    if (owned.ascension < 4) return ascCap;
    // 성배전림으로 최대 Lv.120까지 확장!
    return Math.min(120, baseMax + owned.grailsUsed * 2);
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

    // 레어도 높은 순 정렬
    ownedIds.sort((a, b) => (SERVANT_MAP[b].rarity - SERVANT_MAP[a].rarity) || (state.servants[b].level - state.servants[a].level));
    ownedIds.forEach(id => {
      const sv = SERVANT_MAP[id];
      const own = state.servants[id];
      const chip = document.createElement('button');
      chip.className = 'roster-chip' + (id === state.myRoomServantId ? ' active' : '');
      const faceUrl = ArtRenderer.getFaceUrl(id);
      const faceHtml = faceUrl
        ? `<img class="roster-face" src="${faceUrl}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`
        : '';
      chip.innerHTML = `
        <div class="roster-chip-row">
          ${faceHtml}
          <div style="flex:1;min-width:0">
            <div class="roster-chip-top"><span>${sv.nickname || sv.name}</span><span style="color:#ffe666">★${sv.rarity}</span></div>
            <div class="roster-chip-sub">Lv.${own.level} · 보${own.npLevel} · 인연${own.bond}</div>
          </div>
        </div>
      `;
      chip.addEventListener('click', () => {
        SoundEngine.click();
        state.myRoomServantId = id;
        saveState();
        renderMyRoomTab();
        triggerMyRoomLine(false);
      });
      rosterEl.appendChild(chip);
    });

    const sv = SERVANT_MAP[state.myRoomServantId];
    const own = state.servants[state.myRoomServantId];
    const maxCap = getMaxLevelCap(sv, own);

    // 영기재림 보기 탭
    document.querySelectorAll('#myroom-asc-tabs .asc-btn').forEach(btn => {
      const asc = Number(btn.dataset.asc);
      btn.disabled = asc > own.ascension;
      btn.classList.toggle('active', asc === own.viewAsc);
    });

    // 대형 포트레이트
    document.getElementById('myroom-portrait-wrap').innerHTML = ArtRenderer.renderCardSVG(sv, true, {
      ascension: own.viewAsc,
      npLevel: own.npLevel
    });

    // 스탯 계산
    const lvRatio = 0.35 + (own.level / (sv.rarity === 5 ? 90 : (sv.rarity === 4 ? 80 : 70))) * 0.65;
    const curAtk = Math.round(sv.atk * lvRatio);
    const curHp = Math.round(sv.hp * lvRatio);

    document.getElementById('mr-name').textContent = `${'★'.repeat(sv.rarity)} ${sv.name}`;
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
    document.getElementById('mr-np-name').textContent = sv.npName;
    document.getElementById('mr-np-sub').textContent = sv.npSub || '';
    document.getElementById('mr-np-detail').textContent = sv.npDetail || '';
    const skillsRow = document.getElementById('mr-skills-row');
    skillsRow.innerHTML = (sv.skills || []).map((sk, idx) => `<span class="skill-chip">스킬${idx + 1} · ${sk}</span>`).join('');
    document.getElementById('myroom-speaker').textContent = `${sv.name} (${own.ascension}차 재림)`;
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
        if (own.bond >= 11) {
          state.sq += 30;
          toast(`💖 ${sv.name} 인연 Lv.${own.bond} 달성! 몽화 보너스 성정석 +30 지급!`);
        } else {
          state.sq += 3;
          toast(`💖 ${sv.name} 인연 Lv.${own.bond} 달성! 성정석 +3 지급!`);
        }
        SoundEngine.levelUp();
      }
      saveState();
      renderResources();
      renderMyRoomTab();
    }

    if (sv.officialLines && sv.officialLines.length) {
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
    { id: 'ex_ember', title: '🔥 예지의 맹화(종화) 20개', desc: '마이룸 서번트 레벨업 재료', costType: 'mp', cost: 40, reward: () => { state.embers += 20; } },
    { id: 'ex_sq_rp', title: '💎 성정석 30개 교환', desc: '레어프리즘으로 성정석 11연치 확보', costType: 'rp', cost: 2, reward: () => { state.sq += 30; } },
    { id: 'ex_grail', title: '🏆 성배 1개 주조', desc: '레어프리즘으로 최애 서번트용 성배 획득', costType: 'rp', cost: 3, reward: () => { state.grails += 1; } },
    { id: 'ex_uso', title: '✨ 무기명 영기 → 원하는 ★5 교환', desc: '무기명 영기 10개로 미보유/최애 5성 즉시 소환!', costType: 'uso', cost: 10, reward: null }
  ];

  function renderShopTab() {
    document.getElementById('shop-currency-summary').innerHTML =
      `🟢 마프 <strong>${state.mp.toLocaleString()}</strong> · 🟡 레프 <strong>${state.rp.toLocaleString()}</strong> · 💠 무기명 영기 <strong>${state.uso}</strong>`;

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

  // ================= 상세 모달 =================
  function openDetailModal(type, id) {
    SoundEngine.click();
    const modal = document.getElementById('detail-modal');
    const body = document.getElementById('detail-body');
    const isServant = type === 'servant';
    const item = isServant ? SERVANT_MAP[id] : CE_MAP[id];
    if (!item) return;

    const owned = isServant ? state.servants[id] : state.ces[id];
    document.getElementById('detail-modal-title').textContent = `${'★'.repeat(item.rarity)} ${item.name}`;

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
      const colNo = (typeof ATLAS_IMAGES !== 'undefined' && ATLAS_IMAGES.servants[id]?.collectionNo) || '-';
      const loreBlocks = [item.profileSummary, ...(item.profileBond || [])].filter(Boolean).join('\n\n──────────\n\n');
      body.innerHTML = `
        <div class="detail-card-wrap">
          ${ArtRenderer.renderCardSVG(item, true, { ascension: owned ? owned.viewAsc : 1, npLevel: owned ? owned.npLevel : 0, eager: true })}
        </div>
        <div class="detail-info">
          <h3>${item.name}</h3>
          <div class="detail-meta">No.${colNo} · ${CLASS_INFO[item.cls]?.name || item.cls} · ${item.attribute ? item.attribute + ' 속성 · ' : ''}${item.limited ? '기간 한정' : (item.storyLocked ? '스토리 해금' : '상시')}</div>
          <div class="detail-credit-row">
            ${item.cv ? `<span>CV: <strong>${item.cv}</strong></span>` : ''}
            ${item.illustrator ? `<span>Illust: <strong>${item.illustrator}</strong></span>` : ''}
            <span>최대 ATK <strong>${item.atk.toLocaleString()}</strong> / HP <strong>${item.hp.toLocaleString()}</strong></span>
          </div>
          <div style="margin-top:4px;font-size:13px">
            <strong>보구:</strong> ${item.npName} <span style="color:#9cb2d9">(${item.npSub} · ${item.npType})</span>
            ${item.npDetail ? `<div class="np-detail">${item.npDetail}</div>` : ''}
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
      const colNo = (typeof ATLAS_IMAGES !== 'undefined' && ATLAS_IMAGES.ces[id]?.collectionNo) || '-';
      body.innerHTML = `
        <div class="detail-card-wrap">
          ${ArtRenderer.renderCardSVG(item, false, { eager: true })}
        </div>
        <div class="detail-info">
          <h3>${item.name}</h3>
          <div class="detail-meta">개념예장 No.${colNo} · ${'★'.repeat(item.rarity)}</div>
          <div class="detail-credit-row">
            ${item.illustrator ? `<span>Illust: <strong>${item.illustrator}</strong></span>` : ''}
            ${item.atkMax !== undefined ? `<span>최대 ATK <strong>${item.atkMax.toLocaleString()}</strong> / HP <strong>${item.hpMax.toLocaleString()}</strong></span>` : ''}
          </div>
          <div style="margin-top:6px;font-size:13px"><strong>기본 효과:</strong> ${item.effect}</div>
          ${item.effectMax ? `<div style="margin-top:4px;font-size:13px;color:#ffe680"><strong>최대 해방(풀돌):</strong> ${item.effectMax}</div>` : ''}
          <div class="detail-lore-box"><div class="detail-lore-title">📖 개념예장 해설</div>${item.flavor}</div>
          <div style="font-size:13px;color:#dbe7ff;margin-top:10px">
            ${owned ? `✅ 보유 수량: ${owned.copies}장 ${owned.copies >= 5 ? '(최대 해방 풀돌 가능!)' : ''}` : '🔒 미보유 개념예장입니다.'}
          </div>
          <div class="detail-actions">
            <button class="small-outline-btn" id="btn-detail-close-in">닫기</button>
          </div>
          ${customUploadHtml}
        </div>
      `;
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

    // 소환 버튼 4종
    document.getElementById('btn-pull-ticket').addEventListener('click', () => executeSummon('ticket'));
    document.getElementById('btn-pull-1').addEventListener('click', () => executeSummon('single'));
    document.getElementById('btn-pull-11').addEventListener('click', () => executeSummon('multi'));
    document.getElementById('btn-pull-110').addEventListener('click', () => executeSummon('sim110'));

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
      executeSummon(lastPullMode === 'sim110' ? 'sim110' : 'multi');
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
        document.querySelectorAll('#codex-type-filter .filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderCodexTab();
      });
    });
    document.querySelectorAll('#codex-rarity-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        codexFilter.rarity = btn.dataset.rarity;
        document.querySelectorAll('#codex-rarity-filter .filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderCodexTab();
      });
    });
    document.querySelectorAll('#codex-owned-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        codexFilter.owned = btn.dataset.owned;
        document.querySelectorAll('#codex-owned-filter .filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderCodexTab();
      });
    });
    document.getElementById('codex-class-filter').addEventListener('change', (e) => {
      codexFilter.cls = e.target.value;
      renderCodexTab();
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
        toast('종화가 부족합니다! 다 빈치 공방에서 마나프리즘으로 교환하세요.');
        return;
      }
      state.embers -= 5;
      own.level = Math.min(cap, own.level + 10);
      SoundEngine.levelUp();
      saveState();
      renderMyRoomTab();
      toast(`🔥 ${sv.name} Lv.${own.level} 달성!`);
    });

    document.getElementById('btn-ascend').addEventListener('click', () => {
      const sv = SERVANT_MAP[state.myRoomServantId];
      const own = state.servants[state.myRoomServantId];
      if (!sv || !own) return;
      if (own.ascension >= 4) {
        toast('이미 최종 영기재림(4차) 상태입니다!');
        return;
      }
      if (state.qp < 500000) {
        SoundEngine.error();
        toast('QP가 부족합니다!');
        return;
      }
      state.qp -= 500000;
      own.ascension++;
      own.viewAsc = own.ascension;
      if (own.ascension === 4) {
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
      if (getMaxLevelCap(sv, own) >= 120) {
        toast('이미 Lv.120 궁극의 성배전림을 완료했습니다!');
        return;
      }
      if (state.grails < 1) {
        SoundEngine.error();
        toast('성배가 부족합니다! 다 빈치 공방에서 레어프리즘으로 주조할 수 있습니다.');
        return;
      }
      state.grails -= 1;
      own.grailsUsed++;
      own.level = Math.min(120, own.level + 2);
      SoundEngine.reveal(5, true);
      saveState();
      renderResources();
      renderMyRoomTab();
      toast(`🏆 ${sv.name} 성배전림 성공! 최대 레벨 Lv.${getMaxLevelCap(sv, own)} 해방!`);
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
      state = createDefaultState();
      saveState();
      renderAll();
      toast('🗑️ 칼데아 데이터가 초기화되었습니다.');
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
          state = {
            ...def,
            ...parsed,
            options: { ...def.options, ...(parsed.options || {}) },
            stats: { ...def.stats, ...(parsed.stats || {}) }
          };
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
  window.ChaldeaBridge = {
    getState: () => state,
    grantBattleRewards(rewards, partyServantIds) {
      if (rewards.sq) state.sq += rewards.sq;
      if (rewards.embers) state.embers += rewards.embers;
      if (rewards.qp) state.qp += rewards.qp;
      if (rewards.mp) state.mp += rewards.mp;
      if (rewards.rp) state.rp += rewards.rp;
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
      saveState();
      renderResources();
    },
    toast
  };

  // 초기화 시작
  bindEvents();
  renderAll();
})();
