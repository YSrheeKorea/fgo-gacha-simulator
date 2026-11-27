// ============================================================
// CHALDEA SUMMON SIMULATOR — 원작 FGO 터미널 (TERMINAL) 엔진 (terminal.js)
// - 마스터 레벨 1~200 공식 최대 AP 테이블 (20~152) · 5분당 AP 1 실시간 자연 회복
// - AP 회복 (금/은/동/청동 사과 · 청동색 묘목 + AP 40 → 청동사과 제작 · 무지개 사과)
// - 좌측 파티 서번트 순환 터치(1~6번 → 숨김 시 회전 지구본/백지화 지구 맵!)
// - 마스터 마름모(♂/♀ · 마술예장 · 1부 종장 황금 십자) · 영주 · 성정석/성정편(7→1)
// - 공지사항(4탭) · 선물상자 · 마스터 미션 · 관위대관전(붉은 터미널) · 오딜 콜(스톰 포드/별빛의 모래)
// - 칼데아 게이트 · 메인 시나리오(NEXT) · 메인 레코드 1/1.5/2 · 메인 인터루드 8종
// ============================================================

window.FgoTerminal = (() => {
  // 원작 FGO 공식 마스터 레벨(1~200) → 최대 AP 테이블
  function getMaxApForMasterLevel(lv) {
    const L = Math.max(1, Math.min(200, Math.floor(Number(lv) || 1)));
    if (L <= 9) return 19 + L;               // Lv.1~9: 20~28
    if (L === 10) return 30;                 // Lv.10: 30
    if (L <= 14) return 21 + L;              // Lv.11~14: 32~35
    if (L === 15) return 38;                 // Lv.15: 38
    if (L <= 19) return 23 + L;              // Lv.16~19: 39~42
    if (L === 20) return 45;                 // Lv.20: 45
    if (L <= 100) return 25 + L;             // Lv.21~100: 46~125
    if (L <= 120) return 126 + Math.floor((L - 101) / 2); // Lv.101~120: 126~135
    if (L <= 124) return 136;
    if (L <= 128) return 137;
    if (L <= 131) return 138;
    if (L <= 136) return 139;
    if (L <= 142) return 140;
    if (L <= 146) return 141;
    if (L <= 152) return 142;
    if (L <= 156) return 143;
    if (L <= 162) return 144;
    if (L <= 166) return 145;
    if (L <= 172) return 146;
    if (L <= 176) return 147;
    if (L <= 182) return 148;
    if (L <= 186) return 149;
    if (L <= 192) return 150;
    if (L <= 196) return 151;
    return 152;                              // Lv.197~200: 152
  }

  function getMasterExpNeed(lv) {
    if (lv >= 200) return 0;
    return Math.round(12000 + lv * lv * 180);
  }

  const MAIN_INTERLUDES = [
    { id: 'mi_dubai',     title: 'BB 프레젠츠☆셀럽 서머 익스피리언스! ~역습의 두바이~', cond: '오딜 콜 0 클리어 · 무료', reward: '주장Ⅲ 연계 · 성정석 +3', svId: null },
    { id: 'mi_traum',     title: '사상현현계역 트라움 (2부 6.5장)', cond: '퉁구스카 에필로그 클리어', reward: '프리 퀘스트 개방 · 성정석 +3', svId: null },
    { id: 'mi_tunguska',  title: '비영장생존권 퉁구스카 생추어리', cond: '프롤로그 클리어 · 무료', reward: '비스트Ⅳ 결전 · 성정석 +3', svId: null },
    { id: 'mi_heiankyo',  title: '지옥계만다라 헤이안쿄 (2부 5.5장)', cond: '2부 5장 올림포스 클리어', reward: '프리 퀘스트 개방 · 성정석 +3', svId: null },
    { id: 'mi_imaginary', title: '허수대해전 이매지너리 스크램블 ~노틸러스 부상하라~', cond: '2부 4장 클리어 · 무료', reward: '해역 탐색 · 성정석 +3', svId: null },
    { id: 'mi_ooku',      title: '도쿠가와 회천 미궁 오오쿠', cond: '2부 3장 + SE.RA.PH 클리어 · 무료', reward: '비스트Ⅲ/L 재대결 · 성정석 +3', svId: null },
    { id: 'mi_seraph',    title: '심해전뇌낙토 SE.RA.PH', cond: '1부 종장 클리어 · 무료', reward: '★4 BB 정식 가입 · 비스트Ⅲ/R', svId: 'sv_no_166' },
    { id: 'mi_christmas', title: '명계의 메리 크리스마스', cond: '1부 7장 클리어 · 무료', reward: '★4 알테라 더 산[타] 정식 가입', svId: 'sv_no_197' }
  ];

  const MAIN_RECORDS = [
    { id: 'mr_1',   label: '메인 레코드 1 (1부: 특이점 F ~ 종국특이점 솔로몬)', chapters: '후유키 · 오를레앙 · 세프템 · 오케아노스 · 런던 · 북미 · 카멜롯 · 바빌로니아 · 솔로몬', sqReward: 1 },
    { id: 'mr_15',  label: '메인 레코드 1.5 (아종특이점 Ⅰ~Ⅳ)', chapters: '신주쿠 · 아가르타 · 시모사노쿠니 · 세일럼', sqReward: 1 },
    { id: 'mr_2',   label: '메인 레코드 2 (2부: 로스트벨트 No.1~7 + 주장 Ⅰ~Ⅳ)', chapters: '아나스타샤 · 괴테르다메룽 · 신 · 유가 크셰트라 · 아틀란티스/올림푸스 · 아발론 르 페이 · 나우이 믹틀란 · 오딜 콜', sqReward: 1 }
  ];

  const NOTICES_DATA = {
    notice: [
      { tag: 'NEW!', date: '2026.11.27', title: '[칼데아 터미널 v23] 마스터 Lv.200 · AP 5분 자연회복 · 오딜 콜 · 관위대관전 실장!' },
      { tag: '개최 중', date: '2026.11.27', title: '[캠페인] 칼데아 게이트 전 요일 퀘스트 상시 개방 & 메인 인터루드 8종 무료 개방!' },
      { tag: '상시', date: '2026.11.27', title: '[가챠 안내] 전체 475기 마테리얼 영기 · 커스텀 픽업 330연 천장 · 은/동테 스킵 고증 적용' }
    ],
    maint: [
      { tag: '완료', date: '2026.11.27 13:00~18:00', title: '정기 데이터베이스 갱신 및 칼데아 터미널/게이트 v23 업데이트 완료 (사과/성정석 지급)' }
    ],
    update: [
      { tag: 'v23', date: '2026.11.27', title: '터미널(AP·사과·묘목·스톰포드·공지·선물상자·메인 레코드/인터루드) 추가' },
      { tag: 'v22', date: '2026.11.27', title: '칼데아 게이트 6대 카테고리 (종화·7수련장·보물창고·막간·강화퀘·마술예장 3종) 추가' },
      { tag: 'v14~v21', date: '2026.11.27', title: 'FGO 전체 15클래스 475기 패시브·보구 강화(🗡️)·전설 기믹 전수 완결' }
    ],
    bug: [
      { tag: '수정 완료', date: '2026.11.27', title: '개인 지정 스킬 전열 서번트 직접 클릭 선택 및 비스트 쌍방향 상성 보정 완료' },
      { tag: '수정 완료', date: '2026.11.27', title: '은테·동테만 스킵되고 금테 이상 연출이 유지되도록 소환 스킵 로직 보정 완료' }
    ]
  };

  let stageSlotIdx = 0; // 0..5 = 파티 서번트, 6 = 서번트 숨김(지구본/백지화 지구 맵!)
  let globeAngle = 24;
  let mapMode = 'part1'; // 'part1' 지구본 | 'part2' 평면 백지화 지구
  let activeModal = null; // 'ap' | 'notice' | 'gift' | 'mission' | 'record' | 'interlude' | null
  let noticeTab = 'notice';
  let showNextExpDetail = false;
  let tickTimer = null;

  function getBridge() { return window.ChaldeaBridge; }

  function syncApAndPods() {
    const bridge = getBridge();
    if (!bridge || !bridge.getTerminalState) return null;
    const t = bridge.getTerminalState();
    const maxAp = getMaxApForMasterLevel(t.masterLevel);
    const now = Date.now();

    // 5분(300,000ms)당 AP 1 회복
    if (!t.lastApTick) t.lastApTick = now;
    if (t.ap < maxAp) {
      const elapsed = now - t.lastApTick;
      const gained = Math.floor(elapsed / 300000);
      if (gained > 0) {
        t.ap = Math.min(maxAp, t.ap + gained);
        t.lastApTick = (t.ap >= maxAp) ? now : (t.lastApTick + gained * 300000);
        bridge.saveState();
      }
    } else {
      t.lastApTick = now;
    }

    // 스톰 포드 매일 3개 지급 (최대 9개 보관)
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (t.lastPodResetDate !== today) {
      t.stormPods = Math.min(9, (t.stormPods || 0) + 3);
      t.lastPodResetDate = today;
      bridge.saveState();
    }

    const secToNext = t.ap >= maxAp ? 0 : Math.max(0, Math.ceil((300000 - ((now - t.lastApTick) % 300000)) / 1000));
    const secToFull = t.ap >= maxAp ? 0 : secToNext + Math.max(0, maxAp - t.ap - 1) * 300;
    return { t, maxAp, secToNext, secToFull, today };
  }

  function fmtMMSS(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  function fmtHHMM(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}시간 ${String(m).padStart(2, '0')}분`;
  }

  function getPartyForStage() {
    const st = getBridge()?.getState();
    if (!st) return [];
    if (window.FgoBattle && typeof window.FgoBattle.getPartyServantIds === 'function') {
      const ids = window.FgoBattle.getPartyServantIds().filter(id => SERVANT_MAP[id]);
      if (ids.length) return ids;
    }
    const owned = Object.keys(st.servants || {});
    return owned.length ? owned.slice(0, 6) : ['sv_no_001'];
  }

  function render() {
    const root = document.getElementById('terminal-root');
    if (!root) return;
    const bridge = getBridge();
    if (!bridge) return;
    const st = bridge.getState();
    const info = syncApAndPods();
    if (!info) return;
    const { t, maxAp, secToNext, secToFull, today } = info;

    const partyIds = getPartyForStage();
    const isMapView = stageSlotIdx >= partyIds.length;
    const activeSvId = !isMapView ? partyIds[stageSlotIdx] : null;
    const activeSv = activeSvId ? SERVANT_MAP[activeSvId] : null;
    const activeOwn = activeSvId ? st.servants[activeSvId] : null;
    const activeArtUrl = activeSv ? ArtRenderer.getCardArtUrl(activeSv, true, activeOwn?.viewAsc || 4) : '';

    const spells = bridge.getCommandSpells();
    const mcId = bridge.getActiveMysticCodeId();
    const mcObj = (typeof MYSTIC_CODE_MAP !== 'undefined' && MYSTIC_CODE_MAP[mcId]) || null;
    const expNeed = getMasterExpNeed(t.masterLevel);
    const expPct = t.masterLevel >= 200 ? 100 : Math.min(100, Math.round(((t.masterExp || 0) / Math.max(1, expNeed)) * 100));
    const apPct = Math.min(100, Math.round((t.ap / Math.max(1, maxAp)) * 100));
    const dailyUnclaimed = t.dailyGiftDate !== today;
    const totalClears = Object.values(st.clearedQuests || {}).reduce((a, b) => a + b, 0);

    root.innerHTML = `
      <div class="terminal-shell ${t.grandRedMode ? 'grand-red' : ''}">
        <!-- 상단 터미널 툴바 (공지 · 선물상자 · 마스터 미션 · 스톰포드) -->
        <div class="term-top-strip">
          <div class="term-top-left">
            <button class="term-mini-btn" id="btn-term-notice">📢 공지사항 <span class="term-new-dot">NEW!</span></button>
            <button class="term-mini-btn" id="btn-term-gift">🎁 선물상자 ${dailyUnclaimed ? '<span class="term-new-dot">1</span>' : ''}</button>
            <button class="term-mini-btn" id="btn-term-mission">📜 마스터 미션</button>
          </div>
          <div class="term-top-right">
            <span class="term-pod-pill" title="오딜 콜 백지화 지구 / 관위연찬전 전용 (매일 3개 지급)">⚡ 스톰 포드 <strong>${t.stormPods || 0}/9</strong></span>
            <span class="term-pod-pill" title="백지화 지구 프리퀘 클리어 보상">✨ 별빛의 모래 <strong>${t.starSand || 0}</strong></span>
            <button class="term-mini-btn ${t.grandRedMode ? 'red-active' : ''}" id="btn-term-grand-red" title="관위대관전 스톰포드 무소비 기간 붉은 터미널 테마 전환">
              ${t.grandRedMode ? '🔴 관위대관전 무소비 ON' : '⚪ 관위 무소비 테마'}
            </button>
          </div>
        </div>

        <div class="terminal-grid">
          <!-- 좌측: 파티 서번트 순환 스테이지 (또는 회전 지구본/백지화 지구) + 마스터 HUD -->
          <div class="term-left-col">
            <div class="term-stage-card" id="term-stage-click" title="터치하면 파티 1→6번 서번트 순환, 마지막 터치 시 지구본/백지화 지구 맵 표시!">
              ${!isMapView && activeSv ? `
                <div class="term-stage-badge">파티 ${stageSlotIdx + 1}/${partyIds.length} · 터치하여 다음 서번트 / 지구본 전환</div>
                <div class="term-sv-portrait-wrap">
                  ${activeArtUrl ? `<img src="${activeArtUrl}" class="term-sv-img" alt="${activeSv.name}" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : ''}
                </div>
                <div class="term-sv-caption">
                  <span class="term-sv-cls">${CLASS_INFO[activeSv.cls]?.name || activeSv.cls}</span>
                  <strong>${activeSv.name}</strong>
                  <div class="term-sv-quote">“${activeSv.summonQuote ? activeSv.summonQuote.slice(0, 72) : '마스터, 오늘도 인리 수복을 향해 나아가죠!'}${activeSv.summonQuote && activeSv.summonQuote.length > 72 ? '…' : ''}”</div>
                </div>
              ` : `
                <div class="term-stage-badge">🌍 ${mapMode === 'part1' ? '1부 지구본 (칼데아스)' : '2부 백지화 지구 평면지도'} · 터치 시 1번 서번트 복귀</div>
                <div class="term-globe-box ${mapMode}">
                  <div class="term-globe-orb" style="transform:rotate(${globeAngle}deg)">
                    <span class="term-hotspot" style="top:28%;left:34%" title="특이점 F / 후유키"></span>
                    <span class="term-hotspot" style="top:42%;left:52%" title="제7특이점 / 바빌로니아"></span>
                    <span class="term-hotspot" style="top:35%;left:72%" title="2부 6장 / 아발론 르 페이"></span>
                    <span class="term-hotspot" style="top:64%;left:44%" title="오딜 콜 / 백지화 지구"></span>
                  </div>
                  <div class="term-globe-controls">
                    <button class="small-outline-btn" id="btn-globe-rot" type="button">🔄 지도 회전</button>
                    <button class="small-outline-btn" id="btn-globe-mode" type="button">${mapMode === 'part1' ? '🗺️ 2부 평면지도' : '🌍 1부 지구본'}</button>
                  </div>
                </div>
              `}
            </div>

            <!-- 마스터 마름모 · 영주 · 성정석/성정편 · 레벨 · AP 바 (원작 터미널 하단 고증!) -->
            <div class="term-master-hud">
              <div class="term-hud-row">
                <button class="term-master-diamond" id="btn-term-gender" title="클릭하여 마스터 성별 전환 (구다오 ⇄ 구다코)">
                  ${mcObj?.icon ? `<img src="${mcObj.icon}" class="term-mc-mini" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : ''}
                  <span>${t.masterGender === 'male' ? '♂ 구다오' : '♀ 구다코'}</span>
                  ${t.part1Cleared ? '<span class="term-part1-cross" title="1부 종장 클리어 증표">✦</span>' : ''}
                </button>
                <div class="term-spell-diamond" title="영주 최대 3획 (매일 0시 회복)">
                  <div style="font-size:10px;color:#fca5a5">영주</div>
                  <strong style="color:#ff6b8b">${'✦'.repeat(spells)}${'✧'.repeat(3 - spells)}</strong>
                </div>
                <div class="term-sq-frag-box">
                  <div>💎 성정석 <strong>${st.sq.toLocaleString()}</strong></div>
                  <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
                    <span>🔹 성정편 <strong>${t.fragments || 0}</strong></span>
                    <button class="term-frag-btn" id="btn-frag-exchange" ${(t.fragments || 0) < 7 ? 'disabled' : ''}>7→💎1</button>
                  </div>
                </div>
              </div>

              <!-- 마스터 레벨 & 노란 EXP 바 -->
              <div class="term-bar-block" id="btn-term-exp-toggle" style="cursor:pointer" title="터치하면 다음 레벨까지 필요 EXP 확인">
                <div class="term-bar-head">
                  <span>MASTER <strong>Lv.${t.masterLevel} / 200</strong></span>
                  <span style="font-size:11px;color:#fde047">${showNextExpDetail ? (t.masterLevel >= 200 ? 'NEXT: 0 (MAX!)' : `NEXT: ${(expNeed - (t.masterExp || 0)).toLocaleString()} EXP`) : `${expPct}% (터치하여 NEXT 확인)`}</span>
                </div>
                <div class="term-bar-track"><div class="term-bar-fill exp" style="width:${expPct}%"></div></div>
              </div>

              <!-- AP 바 & + 회복 버튼 (5분당 1 회복 타이머) -->
              <div class="term-bar-block">
                <div class="term-bar-head">
                  <button class="term-ap-plus" id="btn-term-ap-modal" title="사과 / 묘목 / 성정석으로 AP 회복">+</button>
                  <span>AP <strong>${t.ap} / ${maxAp}</strong></span>
                  <span class="term-ap-timer" id="term-ap-timer">${t.ap >= maxAp ? '✅ AP FULL' : `다음 ${fmtMMSS(secToNext)} · 전체 ${fmtHHMM(secToFull)}`}</span>
                </div>
                <div class="term-bar-track" id="btn-term-ap-bar" style="cursor:pointer"><div class="term-bar-fill ap" style="width:${apPct}%"></div></div>
              </div>
            </div>
          </div>

          <!-- 우측: 원작 터미널 배너 스택 (관위대관전 · 오딜 콜 · 칼데아 게이트 · 메인 시나리오 · 레코드 · 인터루드) -->
          <div class="term-right-col">
            <div class="term-banner-list">
              ${t.grandRedMode ? `
                <button class="term-banner-card bn-grand" id="btn-bn-grand">
                  <div class="term-bn-tag">🔴 스톰 포드 무소비 기간!</div>
                  <div class="term-bn-title">👑 관위대관전 (Grand Battle) — 관위연찬전</div>
                  <div class="term-bn-sub">클래스별 관위 서번트 대결 · 스톰 포드 무소비 주회 가능! (클릭 시 도전)</div>
                </button>
              ` : ''}

              <button class="term-banner-card bn-gate" id="btn-bn-gate">
                <div class="term-bn-tag">CHALDEA GATE · 31종 퀘스트</div>
                <div class="term-bn-title">🚪 칼데아 게이트 (Chaldea Gate)</div>
                <div class="term-bn-sub">요일 퀘스트(종화·7수련장·보물창고) · 막간/영기해방 · 강화퀘 · 어드밴스드 · 마술예장 3종</div>
              </button>

              <button class="term-banner-card bn-ordeal" id="btn-bn-ordeal">
                <div class="term-bn-tag">ORDEAL CALL · 스톰 포드 1 소모</div>
                <div class="term-bn-title">🌍 오딜 콜 — 백지화 지구 프리 퀘스트 (별빛의 모래 +10)</div>
                <div class="term-bn-sub">보유 스톰 포드 ${t.stormPods || 0}개 · 클리어 시 ✨ 별빛의 모래 +10 · 🔥 종화 +15 · 🪙 120만 QP · 마스터 EXP!</div>
              </button>

              ${!t.grandRedMode ? `
                <button class="term-banner-card bn-grand" id="btn-bn-grand">
                  <div class="term-bn-tag">GRAND BATTLE · 스톰 포드 1 소모</div>
                  <div class="term-bn-title">👑 관위대관전 — 관위연찬전</div>
                  <div class="term-bn-sub">그랜드 서번트 육성 · 클리어 시 ✨ 별빛의 모래 +15 · 💎 성정석 +2 · 마스터 EXP 대량 획득!</div>
                </button>
              ` : ''}

              <button class="term-banner-card bn-story" id="btn-bn-story">
                <div class="term-bn-tag next-tag">▶ NEXT · 메인 시나리오</div>
                <div class="term-bn-title">🐉 메인 시나리오 — 특이점 · 비스트 · 이문대 결전</div>
                <div class="term-bn-sub">누적 클리어 ${totalClears}회 · 1부/1.5부/2부 보스전 및 EX 챌린지 출격!</div>
              </button>

              <button class="term-banner-card bn-record" id="btn-bn-record">
                <div class="term-bn-tag">MAIN RECORD 1 · 1.5 · 2</div>
                <div class="term-bn-title">📚 메인 레코드 (1부 · 1.5부 · 2부 프리 퀘스트)</div>
                <div class="term-bn-sub">프리 퀘스트 3회 클리어마다 💎 성정석 +1 보상! (터치하여 열기)</div>
              </button>

              <button class="term-banner-card bn-interlude" id="btn-bn-interlude">
                <div class="term-bn-tag">MAIN INTERLUDE · 8종 무료 개방</div>
                <div class="term-bn-title">🎞️ 메인 인터루드 (SE.RA.PH · 오오쿠 · 헤이안쿄 · 퉁구스카 · 트라움 · 두바이)</div>
                <div class="term-bn-sub">무료 개방 8종 · ★4 BB & ★4 알테라 더 산[타] 정식 가입 지원!</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      ${activeModal ? renderModalHtml(st, info) : ''}
    `;

    bindEvents(st, info);
  }

  function renderModalHtml(st, info) {
    const { t, maxAp, today } = info;
    if (activeModal === 'ap') {
      const a = t.apples || { gold: 0, silver: 0, bronze: 0, blue: 0, sapling: 0 };
      return `
        <div class="modal-overlay" id="term-modal-bg">
          <div class="modal-box">
            <div class="modal-header">
              <h2>🍎 AP 회복 & 청동색 묘목 변환</h2>
              <button class="modal-close" id="btn-term-modal-close">✕</button>
            </div>
            <p style="font-size:12.5px;color:#b8d0f5;margin-bottom:12px">현재 AP: <strong>${t.ap} / ${maxAp}</strong> (자연 회복: 5분당 AP +1 · 마스터 Lv.${t.masterLevel})</p>
            <div class="term-apple-grid">
              <button class="term-apple-btn" data-apple="gold" ${a.gold <= 0 ? 'disabled' : ''}>🟡 <strong>황금색 과일 (금사과)</strong><span>AP +100% (+${maxAp}) · 보유 ${a.gold}</span></button>
              <button class="term-apple-btn" data-apple="silver" ${a.silver <= 0 ? 'disabled' : ''}>⚪ <strong>백은색 과일 (은사과)</strong><span>AP +50% (+${Math.round(maxAp / 2)}) · 보유 ${a.silver}</span></button>
              <button class="term-apple-btn" data-apple="blue" ${a.blue <= 0 ? 'disabled' : ''}>🔵 <strong>청동색 과일 (청동사과)</strong><span>AP +40 · 보유 ${a.blue}</span></button>
              <button class="term-apple-btn" data-apple="bronze" ${a.bronze <= 0 ? 'disabled' : ''}>🟤 <strong>적동색 과일 (동사과)</strong><span>AP +10 · 보유 ${a.bronze}</span></button>
              <button class="term-apple-btn" data-apple="sq" ${st.sq < 1 ? 'disabled' : ''}>🌈 <strong>무지개 사과 (성정석 1개)</strong><span>AP +100% (+${maxAp}) · 보유 ${st.sq}</span></button>
              <button class="term-apple-btn sapling" data-apple="craft_blue" ${(a.sapling <= 0 || t.ap < 40) ? 'disabled' : ''}>🌱 <strong>청동색 묘목 → 청동사과 제작</strong><span>묘목 1 + AP 40 소모 · 묘목 ${a.sapling}</span></button>
            </div>
          </div>
        </div>
      `;
    }
    if (activeModal === 'notice') {
      const list = NOTICES_DATA[noticeTab] || [];
      return `
        <div class="modal-overlay" id="term-modal-bg">
          <div class="modal-box modal-wide">
            <div class="modal-header">
              <h2>📢 칼데아 공지사항</h2>
              <button class="modal-close" id="btn-term-modal-close">✕</button>
            </div>
            <div class="gate-tabs-bar" style="margin-bottom:12px">
              ${[['notice','📣 공지'],['maint','🔧 메인터넌스'],['update','✨ 업데이트'],['bug','🐞 오류 대응']].map(([k, lbl]) =>
                `<button class="gate-tab-btn ${noticeTab === k ? 'active' : ''}" data-ntab="${k}">${lbl}</button>`
              ).join('')}
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${list.map(item => `
                <div class="term-notice-item">
                  <span class="term-notice-tag">${item.tag}</span>
                  <div>
                    <div style="font-size:11px;color:#93c5fd">${item.date}</div>
                    <strong style="font-size:13px">${item.title}</strong>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
    if (activeModal === 'gift') {
      const svCnt = Object.keys(st.servants || {}).length;
      const ceCnt = Object.keys(st.ces || {}).length;
      const unclaimed = t.dailyGiftDate !== today;
      return `
        <div class="modal-overlay" id="term-modal-bg">
          <div class="modal-box modal-wide">
            <div class="modal-header">
              <h2>🎁 선물상자 & 칼데아 보유 자산 현황</h2>
              <button class="modal-close" id="btn-term-modal-close">✕</button>
            </div>
            <div class="term-gift-box">
              ${unclaimed
                ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
                    <div><strong>🌟 오늘의 로그인 보너스 (${today})</strong><div style="font-size:12px;color:#b8d0f5">💎 성정석 +3 · 🟡 황금색 과일 +2 · 🌱 청동색 묘목 +2 · 🤝 FP +2,000</div></div>
                    <button class="small-gold-btn" id="btn-claim-daily-gift">🎁 일괄 수령</button>
                  </div>`
                : `<div style="color:#86efac;font-size:13px">✅ 오늘의 로그인 선물을 모두 수령했습니다! (${today})</div>`}
            </div>
            <div class="term-asset-grid">
              <div>서번트 <strong>${svCnt} / ${SERVANTS.length}기</strong></div>
              <div>개념예장 <strong>${ceCnt} / ${CRAFT_ESSENCES.length}종</strong></div>
              <div>💎 성정석 <strong>${st.sq.toLocaleString()}</strong></div>
              <div>🔹 성정편 <strong>${t.fragments || 0}</strong></div>
              <div>🟡 레어프리즘 <strong>${st.rp.toLocaleString()}</strong></div>
              <div>🟢 마나프리즘 <strong>${st.mp.toLocaleString()}</strong></div>
              <div>🪙 QP <strong>${st.qp.toLocaleString()}</strong></div>
              <div>🤝 FP <strong>${(st.fp || 0).toLocaleString()}</strong></div>
              <div>⚡ 스톰 포드 <strong>${t.stormPods || 0}</strong></div>
              <div>✨ 별빛의 모래 <strong>${t.starSand || 0}</strong></div>
            </div>
          </div>
        </div>
      `;
    }
    if (activeModal === 'mission') {
      const totalClears = Object.values(st.clearedQuests || {}).reduce((a, b) => a + b, 0);
      const missions = [
        { id: 'ms_clear1',  title: '임의의 퀘스트 1회 클리어', cur: Math.min(1, totalClears), goal: 1, frag: 7 },
        { id: 'ms_clear3',  title: '임의의 퀘스트 3회 클리어', cur: Math.min(3, totalClears), goal: 3, frag: 7 },
        { id: 'ms_clear5',  title: '임의의 퀘스트 5회 클리어', cur: Math.min(5, totalClears), goal: 5, frag: 7 },
        { id: 'ms_sv20',    title: '영기 20기 이상 소환 (엑스트라 미션)', cur: Math.min(20, Object.keys(st.servants || {}).length), goal: 20, frag: 21 }
      ];
      return `
        <div class="modal-overlay" id="term-modal-bg">
          <div class="modal-box modal-wide">
            <div class="modal-header">
              <h2>📜 마스터 미션 (성정편 보상)</h2>
              <button class="modal-close" id="btn-term-modal-close">✕</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${missions.map(m => {
                const claimed = !!(t.claimedMissions && t.claimedMissions[m.id]);
                const ready = m.cur >= m.goal && !claimed;
                return `
                  <div class="term-notice-item" style="justify-content:space-between;align-items:center">
                    <div>
                      <strong>${m.title}</strong>
                      <div style="font-size:11.5px;color:#93c5fd">진행도: ${m.cur} / ${m.goal} · 보상: 🔹 성정편 +${m.frag} (성정석 ${Math.floor(m.frag / 7)}개분)</div>
                    </div>
                    ${claimed
                      ? '<span class="gate-clear-badge">✅ 수령 완료</span>'
                      : `<button class="small-gold-btn" data-claim-ms="${m.id}" data-frag="${m.frag}" ${ready ? '' : 'disabled'}>${ready ? '수령하기' : '진행 중'}</button>`}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }
    if (activeModal === 'record') {
      return `
        <div class="modal-overlay" id="term-modal-bg">
          <div class="modal-box modal-wide">
            <div class="modal-header">
              <h2>📚 메인 레코드 1 · 1.5 · 2 (프리 퀘스트)</h2>
              <button class="modal-close" id="btn-term-modal-close">✕</button>
            </div>
            <p style="font-size:12px;color:#b8d0f5;margin-bottom:10px">프리 퀘스트는 AP 20을 소모해 주회하며, 3회 클리어 달성 시 💎 성정석 +1을 지급합니다!</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${MAIN_RECORDS.map(r => {
                const cnt = (t.freeQuestClears && t.freeQuestClears[r.id]) || 0;
                return `
                  <div class="term-notice-item" style="justify-content:space-between;align-items:center;gap:10px">
                    <div>
                      <strong>${r.label}</strong>
                      <div style="font-size:11.5px;color:#93c5fd">${r.chapters}</div>
                      <div style="font-size:11px;color:#fde047;margin-top:2px">주회 횟수: ${cnt}회 (3회마다 💎 성정석 +1!)</div>
                    </div>
                    <button class="small-gold-btn" data-run-mr="${r.id}">⚡ 프리퀘 (AP 20)</button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }
    if (activeModal === 'interlude') {
      return `
        <div class="modal-overlay" id="term-modal-bg">
          <div class="modal-box modal-wide">
            <div class="modal-header">
              <h2>🎞️ 메인 인터루드 8종 (무료 개방)</h2>
              <button class="modal-close" id="btn-term-modal-close">✕</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;max-height:58vh;overflow-y:auto">
              ${MAIN_INTERLUDES.map(mi => {
                const done = !!(t.claimedInterludes && t.claimedInterludes[mi.id]);
                return `
                  <div class="term-notice-item" style="justify-content:space-between;align-items:center;gap:10px">
                    <div>
                      <strong>${mi.title}</strong>
                      <div style="font-size:11.5px;color:#93c5fd">조건: ${mi.cond} · 보상: ${mi.reward}</div>
                    </div>
                    ${done
                      ? '<span class="gate-clear-badge">✅ 클리어</span>'
                      : `<button class="small-gold-btn" data-run-mi="${mi.id}">🔓 무료 개방 & 클리어</button>`}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }
    return '';
  }

  function grantMasterExp(amount) {
    const bridge = getBridge();
    if (!bridge || !bridge.getTerminalState) return;
    const t = bridge.getTerminalState();
    if (t.masterLevel >= 200) return;
    t.masterExp = (t.masterExp || 0) + amount;
    let leveled = false;
    while (t.masterLevel < 200) {
      const need = getMasterExpNeed(t.masterLevel);
      if (t.masterExp < need) break;
      t.masterExp -= need;
      t.masterLevel++;
      t.ap = Math.max(t.ap, getMaxApForMasterLevel(t.masterLevel)); // 레벨업 시 AP 전회복!
      leveled = true;
    }
    if (leveled) {
      bridge.toast(`🎉 마스터 레벨 UP! Lv.${t.masterLevel} (최대 AP ${getMaxApForMasterLevel(t.masterLevel)} · AP 전회복!)`);
    }
  }

  function bindEvents(st, info) {
    const bridge = getBridge();
    const { t, maxAp, today } = info;
    const partyIds = getPartyForStage();

    document.getElementById('term-stage-click')?.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      SoundEngine.click();
      stageSlotIdx = (stageSlotIdx + 1) % (partyIds.length + 1);
      render();
    });
    document.getElementById('btn-globe-rot')?.addEventListener('click', (e) => {
      e.stopPropagation(); SoundEngine.click(); globeAngle = (globeAngle + 45) % 360; render();
    });
    document.getElementById('btn-globe-mode')?.addEventListener('click', (e) => {
      e.stopPropagation(); SoundEngine.click(); mapMode = (mapMode === 'part1' ? 'part2' : 'part1'); render();
    });
    document.getElementById('btn-term-gender')?.addEventListener('click', () => {
      SoundEngine.click();
      t.masterGender = t.masterGender === 'male' ? 'female' : 'male';
      bridge.saveState(); render();
    });
    document.getElementById('btn-frag-exchange')?.addEventListener('click', () => {
      if ((t.fragments || 0) < 7) return;
      const gainSq = Math.floor(t.fragments / 7);
      t.fragments -= gainSq * 7;
      st.sq += gainSq;
      SoundEngine.shopBuy();
      bridge.saveState();
      bridge.toast(`🔹 성정편 ${gainSq * 7}개 → 💎 성정석 +${gainSq} 교환 완료!`);
      bridge.renderAll();
    });
    document.getElementById('btn-term-exp-toggle')?.addEventListener('click', () => {
      SoundEngine.click(); showNextExpDetail = !showNextExpDetail; render();
    });
    document.getElementById('btn-term-ap-modal')?.addEventListener('click', () => { SoundEngine.click(); activeModal = 'ap'; render(); });
    document.getElementById('btn-term-ap-bar')?.addEventListener('click', () => { SoundEngine.click(); activeModal = 'ap'; render(); });
    document.getElementById('btn-term-notice')?.addEventListener('click', () => { SoundEngine.click(); activeModal = 'notice'; render(); });
    document.getElementById('btn-term-gift')?.addEventListener('click', () => { SoundEngine.click(); activeModal = 'gift'; render(); });
    document.getElementById('btn-term-mission')?.addEventListener('click', () => { SoundEngine.click(); activeModal = 'mission'; render(); });
    document.getElementById('btn-term-grand-red')?.addEventListener('click', () => {
      SoundEngine.click();
      t.grandRedMode = !t.grandRedMode;
      bridge.saveState();
      bridge.toast(t.grandRedMode ? '🔴 관위대관전 스톰 포드 무소비 기간 테마 ON!' : '⚪ 통상 터미널 테마로 복귀했습니다.');
      render();
    });

    // 우측 배너 동작
    document.getElementById('btn-bn-gate')?.addEventListener('click', () => {
      SoundEngine.click();
      bridge.openBattleCategory('daily');
    });
    document.getElementById('btn-bn-story')?.addEventListener('click', () => {
      SoundEngine.click();
      bridge.openBattleCategory('boss');
    });
    document.getElementById('btn-bn-record')?.addEventListener('click', () => { SoundEngine.click(); activeModal = 'record'; render(); });
    document.getElementById('btn-bn-interlude')?.addEventListener('click', () => { SoundEngine.click(); activeModal = 'interlude'; render(); });

    document.getElementById('btn-bn-ordeal')?.addEventListener('click', () => {
      if ((t.stormPods || 0) < 1) { SoundEngine.error(); bridge.toast('⚡ 스톰 포드가 부족합니다! (매일 0시 3개 자동 지급)'); return; }
      if (t.ap < 40) { SoundEngine.error(); bridge.toast('AP가 부족합니다! (필요: 40 · + 버튼으로 사과를 드세요)'); return; }
      t.stormPods -= 1;
      t.ap -= 40;
      t.starSand = (t.starSand || 0) + 10;
      st.embers += 15;
      st.qp += 1200000;
      grantMasterExp(85000);
      SoundEngine.reveal(4, true);
      bridge.saveState();
      bridge.toast('🌍 오딜 콜 백지화 지구 클리어! ✨ 별빛의 모래 +10 · 🔥 종화 +15 · 🪙 120만 QP!');
      bridge.renderAll();
    });

    document.getElementById('btn-bn-grand')?.addEventListener('click', () => {
      const podCost = t.grandRedMode ? 0 : 1;
      if ((t.stormPods || 0) < podCost) { SoundEngine.error(); bridge.toast('⚡ 스톰 포드가 부족합니다! (상단 "관위 무소비 테마" 켜면 0소모!)'); return; }
      if (t.ap < 40) { SoundEngine.error(); bridge.toast('AP가 부족합니다! (필요: 40)'); return; }
      t.stormPods -= podCost;
      t.ap -= 40;
      t.starSand = (t.starSand || 0) + 15;
      st.sq += 2;
      grantMasterExp(140000);
      SoundEngine.reveal(5, true);
      bridge.saveState();
      bridge.toast(`👑 관위연찬전 클리어! ✨ 별빛의 모래 +15 · 💎 성정석 +2${podCost === 0 ? ' (스톰 포드 무소비!)' : ''}`);
      bridge.renderAll();
    });

    // 모달 닫기 및 모달 내부 액션
    document.getElementById('btn-term-modal-close')?.addEventListener('click', () => { activeModal = null; render(); });
    document.getElementById('term-modal-bg')?.addEventListener('click', (e) => {
      if (e.target.id === 'term-modal-bg') { activeModal = null; render(); }
    });

    document.querySelectorAll('[data-ntab]').forEach(btn => {
      btn.addEventListener('click', () => { SoundEngine.click(); noticeTab = btn.dataset.ntab; render(); });
    });

    document.querySelectorAll('[data-apple]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.apple;
        const a = t.apples;
        if (k === 'gold' && a.gold > 0) { a.gold--; t.ap += maxAp; bridge.toast(`🟡 황금색 과일 사용! AP +${maxAp}`); }
        else if (k === 'silver' && a.silver > 0) { a.silver--; t.ap += Math.round(maxAp / 2); bridge.toast(`⚪ 백은색 과일 사용! AP +${Math.round(maxAp / 2)}`); }
        else if (k === 'blue' && a.blue > 0) { a.blue--; t.ap += 40; bridge.toast('🔵 청동색 과일 사용! AP +40'); }
        else if (k === 'bronze' && a.bronze > 0) { a.bronze--; t.ap += 10; bridge.toast('🟤 적동색 과일 사용! AP +10'); }
        else if (k === 'sq' && st.sq >= 1) { st.sq--; t.ap += maxAp; bridge.toast(`🌈 성정석 1개(무지개 사과) 사용! AP +${maxAp}`); }
        else if (k === 'craft_blue' && a.sapling > 0 && t.ap >= 40) { a.sapling--; t.ap -= 40; a.blue++; bridge.toast('🌱 청동색 묘목 + AP 40 → 🔵 청동색 과일 1개 제작 완료!'); }
        else return;
        SoundEngine.levelUp();
        bridge.saveState();
        bridge.renderAll();
      });
    });

    document.getElementById('btn-claim-daily-gift')?.addEventListener('click', () => {
      t.dailyGiftDate = today;
      st.sq += 3;
      st.fp = (st.fp || 0) + 2000;
      t.apples.gold += 2;
      t.apples.sapling += 2;
      SoundEngine.reveal(4, true);
      bridge.saveState();
      bridge.toast('🎁 오늘의 로그인 보너스 수령 완료! (💎+3 · 금사과+2 · 묘목+2 · FP+2,000)');
      bridge.renderAll();
    });

    document.querySelectorAll('[data-claim-ms]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mid = btn.dataset.claimMs;
        const frag = Number(btn.dataset.frag) || 7;
        if (!t.claimedMissions) t.claimedMissions = {};
        if (t.claimedMissions[mid]) return;
        t.claimedMissions[mid] = true;
        t.fragments = (t.fragments || 0) + frag;
        SoundEngine.levelUp();
        bridge.saveState();
        bridge.toast(`📜 마스터 미션 달성! 🔹 성정편 +${frag} 획득!`);
        render();
      });
    });

    document.querySelectorAll('[data-run-mr]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (t.ap < 20) { SoundEngine.error(); bridge.toast('AP가 부족합니다! (필요: 20)'); return; }
        const rid = btn.dataset.runMr;
        t.ap -= 20;
        if (!t.freeQuestClears) t.freeQuestClears = {};
        t.freeQuestClears[rid] = (t.freeQuestClears[rid] || 0) + 1;
        grantMasterExp(25000);
        if (t.freeQuestClears[rid] % 3 === 0) {
          st.sq += 1;
          SoundEngine.reveal(4, true);
          bridge.toast(`📚 프리 퀘스트 3회 달성 보너스! 💎 성정석 +1 획득!`);
        } else {
          SoundEngine.levelUp();
          bridge.toast(`📚 프리 퀘스트 클리어 (${t.freeQuestClears[rid] % 3}/3 · 3회 시 성정석 +1)`);
        }
        bridge.saveState();
        bridge.renderAll();
      });
    });

    document.querySelectorAll('[data-run-mi]').forEach(btn => {
      btn.addEventListener('click', () => {
        const miId = btn.dataset.runMi;
        const mi = MAIN_INTERLUDES.find(x => x.id === miId);
        if (!mi) return;
        if (!t.claimedInterludes) t.claimedInterludes = {};
        if (t.claimedInterludes[miId]) return;
        t.claimedInterludes[miId] = true;
        st.sq += 3;
        if (mi.svId && bridge.grantWelfareServant) bridge.grantWelfareServant(mi.svId);
        SoundEngine.reveal(5, true);
        bridge.saveState();
        bridge.toast(`🎞️ 메인 인터루드 [${mi.title}] 클리어! 💎 성정석 +3${mi.svId ? ` · ${SERVANT_MAP[mi.svId]?.name} 정식 가입!` : ''}`);
        bridge.renderAll();
      });
    });
  }

  function startTicker() {
    if (tickTimer) return;
    tickTimer = setInterval(() => {
      if (!document.getElementById('tab-terminal')?.classList.contains('active')) return;
      const info = syncApAndPods();
      const timerEl = document.getElementById('term-ap-timer');
      if (info && timerEl) {
        timerEl.textContent = info.t.ap >= info.maxAp
          ? '✅ AP FULL'
          : `다음 ${fmtMMSS(info.secToNext)} · 전체 ${fmtHHMM(info.secToFull)}`;
      }
    }, 1000);
  }

  return {
    getMaxApForMasterLevel,
    grantMasterExp,
    render() {
      startTicker();
      render();
    }
  };
})();
