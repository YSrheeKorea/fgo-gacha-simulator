// ============================================================
// CHALDEA SUMMON SIMULATOR — 원작 고증 FGO 커맨드 카드 배틀 엔진 (battle.js)
// (버스터/아츠/퀵 15장 덱 · 체인 5종 · 크리스타 분배 · 클래스 상성 · 스킬 · 보구 컷인)
// ============================================================

window.FgoBattle = (() => {
  // ================= 클래스 상성표 (FGO 고증) =================
  const ADVANTAGE = {
    Saber:      ['Lancer'],
    Archer:     ['Saber'],
    Lancer:     ['Archer'],
    Rider:      ['Caster'],
    Caster:     ['Assassin'],
    Assassin:   ['Rider'],
    Ruler:      ['MoonCancer'],
    Avenger:    ['Ruler'],
    MoonCancer: ['Avenger'],
    AlterEgo:   ['Rider', 'Caster', 'Assassin', 'Foreigner'],
    Foreigner:  ['Berserker', 'Foreigner'],
    Pretender:  ['Saber', 'Archer', 'Lancer', 'AlterEgo']
  };

  function getClassMultiplier(atkCls, defCls) {
    if (atkCls === 'Berserker') {
      return defCls === 'Foreigner' ? 0.5 : 1.5;
    }
    if (defCls === 'Berserker') return 2.0;
    if (atkCls === 'Shielder' || defCls === 'Shielder') return 1.0;
    if (atkCls === 'AlterEgo' && ['Rider', 'Caster', 'Assassin'].includes(defCls)) return 1.5;
    if (atkCls === 'AlterEgo' && ['Saber', 'Archer', 'Lancer'].includes(defCls)) return 0.5;
    if (atkCls === 'Pretender' && ['Saber', 'Archer', 'Lancer'].includes(defCls)) return 1.5;
    if (atkCls === 'Pretender' && ['Rider', 'Caster', 'Assassin'].includes(defCls)) return 0.5;
    if (defCls === 'Ruler' && !['Avenger', 'Berserker', 'MoonCancer'].includes(atkCls)) return 0.5;
    if (ADVANTAGE[atkCls]?.includes(defCls)) return 2.0;
    if (ADVANTAGE[defCls]?.includes(atkCls)) return 0.5;
    return 1.0;
  }

  // 서번트별 커맨드 덱 (5장 구성)
  function getServantDeckTypes(sv) {
    if (sv.cls === 'Berserker') return ['Buster', 'Buster', 'Buster', 'Arts', 'Quick'];
    if (sv.cls === 'Caster') return ['Arts', 'Arts', 'Arts', 'Buster', 'Quick'];
    if (sv.cls === 'Assassin') return ['Quick', 'Quick', 'Quick', 'Arts', 'Buster'];
    if (sv.npType === 'Buster') return ['Buster', 'Buster', 'Arts', 'Arts', 'Quick'];
    if (sv.npType === 'Arts') return ['Arts', 'Arts', 'Buster', 'Quick', 'Quick'];
    return ['Quick', 'Quick', 'Arts', 'Buster', 'Buster'];
  }

  // 서번트별 보구 역할 (대군 / 단일 / 서포트)
  const SUPPORT_NPS = new Set(['sv_castoria', 'sv_waver', 'sv_jeanne', 'sv_tamamo', 'sv_xu_fu', 'sv_stheno']);
  const SINGLE_NPS  = new Set(['sv_melusine', 'sv_enkidu', 'sv_ozymandias', 'sv_jack', 'sv_cu_alter', 'sv_heracles', 'sv_baobhan', 'sv_tristan', 'sv_cu', 'sv_ushiwaka', 'sv_robin', 'sv_bedivere', 'sv_euryale', 'sv_izok', 'sv_mandricardo']);

  function getNpCategory(sv) {
    if (SUPPORT_NPS.has(sv.id)) return 'support';
    if (SINGLE_NPS.has(sv.id)) return 'single';
    return 'aoe';
  }

  // 서번트 스킬 3종 생성 (공식 스킬명 사용 + 역할별 FGO 고증 효과!)
  function buildServantSkills(sv) {
    const names = (sv.skills && sv.skills.length >= 3)
      ? sv.skills
      : ['카리스마 A', '마력방출 A', '심안(진) B'];

    // 대표 인권 서포터 / 핵심 딜러 고증 스킬셋
    if (sv.id === 'sv_castoria') {
      return [
        { name: names[0], cd: 5, curCd: 0, icon: '⚔️', desc: '아군 전체 공격력 +20%(3T) & NP +30%', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.atk += 0.2; m.buffs.atkT = 3; m.np = Math.min(200, m.np + 30); } }); return '아군 전체 공격력 UP & NP +30%!'; } },
        { name: names[1], cd: 5, curCd: 0, icon: '💎', desc: '아군 전체 NP +20% & NP 획득량 UP', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.np = Math.min(200, m.np + 20); m.buffs.npGain += 0.3; m.buffs.npGainT = 3; } }); return '호수의 가호! 아군 전체 NP +20%!'; } },
        { name: names[2], cd: 6, curCd: 0, icon: '🔵', desc: '아군 전체 Arts 성능 +50%(3T) & 무적(1T)', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.arts += 0.5; m.buffs.cardT = 3; m.buffs.invul = Math.max(m.buffs.invul, 1); } }); return '선정의 검 EX! 아군 전체 Arts +50% & 무적!'; } }
      ];
    }
    if (sv.id === 'sv_oberon') {
      return [
        { name: names[0], cd: 5, curCd: 0, icon: '🦋', desc: '아군 전체 보구 위력 +30%(3T) & NP +20%', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.npDmg += 0.3; m.buffs.npDmgT = 3; m.np = Math.min(200, m.np + 20); } }); return '새벽의 커튼! 아군 전체 보구 위력 +30% & NP +20%!'; } },
        { name: names[1], cd: 5, curCd: 0, icon: '💎', desc: '아군 전체 NP +50% & 크리스타 +20', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) m.np = Math.min(200, m.np + 50); }); b.stars = Math.min(99, b.stars + 20); return '아침 종달새! 아군 전체 NP +50% & 스타 +20!'; } },
        { name: names[2], cd: 6, curCd: 0, icon: '🔥', desc: '아군 전체 Buster +50% & 보구 위력 2배 부스트(1T)!', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.buster += 0.5; m.buffs.cardT = 3; m.buffs.npBoost = 2.0; } }); return '꿈의 끝 EX! 아군 전체 Buster +50% & 보구 위력 2배 부스트!!'; } }
      ];
    }
    if (sv.id === 'sv_koyanskaya') {
      return [
        { name: names[0], cd: 6, curCd: 0, icon: '💎', desc: '아군 전체 NP +50% & 스킬 쿨타임 -2턴', fn: (b, caster) => { b.party.forEach(m => { if (m.hp > 0) { m.np = Math.min(200, m.np + 50); m.skills.forEach(sk => { if (sk.curCd > 0) sk.curCd = Math.max(0, sk.curCd - 2); }); } }); return '이노센트 블루! 아군 전체 NP +50% & 쿨타임 감소!'; } },
        { name: names[1], cd: 5, curCd: 0, icon: '⭐', desc: '아군 전체 공격력 +25%(3T) & 크리스타 +20', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.atk += 0.25; m.buffs.atkT = 3; } }); b.stars = Math.min(99, b.stars + 20); return '살육 기교! 아군 공격력 UP & 스타 +20!'; } },
        { name: names[2], cd: 5, curCd: 0, icon: '🔴', desc: '아군 전체 Buster +50%(3T) & 크리티컬 위력 UP', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.buster += 0.5; m.buffs.cardT = 3; m.buffs.crit += 0.5; m.buffs.critT = 3; } }); return 'NFF 스페셜! 아군 전체 Buster +50% & 크리 위력 UP!'; } }
      ];
    }
    if (sv.id === 'sv_waver') {
      return [
        { name: names[0], cd: 5, curCd: 0, icon: '💎', desc: '아군 전체 크리 위력 +40% & NP +30%', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.crit += 0.4; m.buffs.critT = 3; m.np = Math.min(200, m.np + 30); } }); return '감식안! 아군 전체 NP +30% & 크리 UP!'; } },
        { name: names[1], cd: 5, curCd: 0, icon: '🛡️', desc: '아군 전체 방어력 +30%(3T) & NP +10%', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.def += 0.3; m.buffs.defT = 3; m.np = Math.min(200, m.np + 10); } }); return '군사의 충언! 방어력 UP & NP +10%!'; } },
        { name: names[2], cd: 5, curCd: 0, icon: '⚔️', desc: '아군 전체 공격력 +30%(3T) & NP +10%', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.atk += 0.3; m.buffs.atkT = 3; m.np = Math.min(200, m.np + 10); } }); return '군사의 지휘! 공격력 UP & NP +10%!'; } }
      ];
    }

    // 일반 서번트: 보구 색깔 & 역할에 맞춘 강력한 3스킬 자동 생성
    const mainCard = sv.npType.toLowerCase(); // 'buster' | 'arts' | 'quick'
    const cardLabel = sv.npType;
    const cardIcon = sv.npType === 'Buster' ? '🔴' : (sv.npType === 'Arts' ? '🔵' : '🟢');
    const npCharge = sv.id === 'sv_arcueid' ? 100 : (sv.rarity === 5 ? 50 : (sv.rarity === 4 ? 30 : 25));

    return [
      {
        name: names[0], cd: 5, curCd: 0, icon: '⚔️',
        desc: `아군 전체 공격력 +20%(3T) & 자신의 ${cardLabel} 성능 +30%(3T)`,
        fn: (b, caster) => {
          b.party.forEach(m => { if (m.hp > 0) { m.buffs.atk += 0.2; m.buffs.atkT = 3; } });
          caster.buffs[mainCard] += 0.3;
          caster.buffs.cardT = 3;
          return `${caster.sv.name} [${names[0]}] 발동! 공격력 & ${cardLabel} UP!`;
        }
      },
      {
        name: names[1], cd: 5, curCd: 0, icon: '💎',
        desc: `자신의 NP +${npCharge}% 차지 & 크리티컬 스타 +12`,
        fn: (b, caster) => {
          caster.np = Math.min(200, caster.np + npCharge);
          b.stars = Math.min(99, b.stars + 12);
          return `${caster.sv.name} [${names[1]}] 발동! NP +${npCharge}% & 스타 +12!`;
        }
      },
      {
        name: names[2], cd: 6, curCd: 0, icon: cardIcon,
        desc: `자신에게 회피/무적(1T) & 보구 위력 +30%(3T) & HP +2500`,
        fn: (b, caster) => {
          caster.buffs.invul = Math.max(caster.buffs.invul, 1);
          caster.buffs.npDmg += 0.3;
          caster.buffs.npDmgT = 3;
          caster.hp = Math.min(caster.maxHp, caster.hp + 2500);
          return `${caster.sv.name} [${names[2]}] 발동! 무적(1T) & 보구 위력 UP & 회복!`;
        }
      }
    ];
  }

  // 개념예장 전투 패시브 파싱
  function getCePassive(ceId) {
    if (!ceId) return { startNp: 0, npDmg: 0, buster: 0, arts: 0, quick: 0, starsPerTurn: 0, npPerTurn: 0, crit: 0, label: '미장착' };
    const map = {
      ce_kscope:            { startNp: 80, label: '개시 NP +80%' },
      ce_black_grail:       { npDmg: 0.6, hpDrain: 500, label: '보구 위력 +60%' },
      ce_2030:              { starsPerTurn: 8, label: '매 턴 스타 +8' },
      ce_prisma:            { npPerTurn: 10, label: '매 턴 NP +10%' },
      ce_formalcraft:       { arts: 0.25, label: 'Arts +25%' },
      ce_limited_zero:      { buster: 0.25, label: 'Buster +25%' },
      ce_imaginary_around:  { quick: 0.25, label: 'Quick +25%' },
      ce_heavens_feel:      { npDmg: 0.4, label: '보구 위력 +40%' },
      ce_imaginary_element: { startNp: 60, label: '개시 NP +60%' },
      ce_dragon_meridian:   { startNp: 30, label: '개시 NP +30%' },
      ce_ryuudou:           { startNp: 30, npDmg: 0.15, label: 'NP+30% · 보구+15%' },
      ce_projection:        { arts: 0.15, label: 'Arts +15%' },
      ce_verdant:           { buster: 0.15, label: 'Buster +15%' },
      ce_gandr:             { quick: 0.15, label: 'Quick +15%' },
      ce_knights_dignity:   { crit: 0.4, label: '크리 위력 +40%' },
      ce_magical_sapphire:  { crit: 0.2, startNp: 20, label: 'NP+20% · 크리+20%' }
    };
    const base = map[ceId] || { startNp: 15, label: '개시 NP +15%' };
    return { startNp: 0, npDmg: 0, buster: 0, arts: 0, quick: 0, starsPerTurn: 0, npPerTurn: 0, crit: 0, hpDrain: 0, ...base };
  }

  // ================= 퀘스트 / 던전 5종 =================
  const QUESTS = [
    {
      id: 'q_embers',
      name: '🔥 칼데아 게이트 — 종화 수집 (초급)',
      desc: '3웨이브 주회 던전! 대군 보구 3연사 시스템을 체험해 보세요.',
      difficulty: '초급 · 추천 Lv.30',
      rewardText: '💎 성정석 +3 · 🔥 종화 +15 · 🪙 QP +500,000',
      rewards: { sq: 3, embers: 15, qp: 500000 },
      waves: [
        [
          { name: '불꽃의 팔', cls: 'Saber', hp: 14500, atk: 1200, maxCharge: 4, emoji: '🔥' },
          { name: '창의 팔', cls: 'Lancer', hp: 15500, atk: 1250, maxCharge: 4, emoji: '⚡' },
          { name: '활의 팔', cls: 'Archer', hp: 14000, atk: 1200, maxCharge: 3, emoji: '🏹' }
        ],
        [
          { name: '황금의 팔', cls: 'Rider', hp: 22000, atk: 1500, maxCharge: 4, emoji: '✨' },
          { name: '황금의 팔', cls: 'Caster', hp: 23500, atk: 1500, maxCharge: 4, emoji: '🔮' },
          { name: '황금의 팔', cls: 'Assassin', hp: 21500, atk: 1500, maxCharge: 3, emoji: '🗡️' }
        ],
        [
          { name: '초월의 팔', cls: 'Berserker', hp: 36000, atk: 1900, maxCharge: 4, emoji: '💀' },
          { name: '예지의 대팔', cls: 'Saber', hp: 52000, atk: 2100, maxCharge: 4, emoji: '👑', isBoss: true },
          { name: '초월의 팔', cls: 'Lancer', hp: 34000, atk: 1900, maxCharge: 4, emoji: '💀' }
        ]
      ]
    },
    {
      id: 'q_qp',
      name: '💰 보물고의 문 — QP 대수집 (중급)',
      desc: '캐스터 적들이 대거 출현! 라이더·버서커로 쓸어버리고 QP와 마프를 챙기세요.',
      difficulty: '중급 · 추천 Lv.50',
      rewardText: '💎 성정석 +5 · 🪙 QP +2,000,000 · 🟢 마프 +20',
      rewards: { sq: 5, qp: 2000000, mp: 20 },
      waves: [
        [
          { name: '청동의 문', cls: 'Caster', hp: 24000, atk: 1500, maxCharge: 5, emoji: '🚪' },
          { name: '백은의 문', cls: 'Caster', hp: 28000, atk: 1600, maxCharge: 5, emoji: '🏛️' },
          { name: '청동의 문', cls: 'Caster', hp: 24000, atk: 1500, maxCharge: 5, emoji: '🚪' }
        ],
        [
          { name: '황금의 문', cls: 'Caster', hp: 42000, atk: 1850, maxCharge: 5, emoji: '💰' },
          { name: '황금의 문', cls: 'Caster', hp: 45000, atk: 1850, maxCharge: 5, emoji: '💰' },
          { name: '황금의 문', cls: 'Caster', hp: 42000, atk: 1850, maxCharge: 5, emoji: '💰' }
        ],
        [
          { name: '황금의 문', cls: 'Caster', hp: 48000, atk: 2000, maxCharge: 5, emoji: '💰' },
          { name: '여왕의 보물고', cls: 'Caster', hp: 96000, atk: 2400, maxCharge: 4, emoji: '👑', isBoss: true },
          { name: '황금의 문', cls: 'Caster', hp: 48000, atk: 2000, maxCharge: 5, emoji: '💰' }
        ]
      ]
    },
    {
      id: 'q_salter',
      name: '⚔️ 특이점 F — 흑화 세이버 결전 (상급)',
      desc: '강력한 세이버 얼터 보스전! 아처 클래스 상성과 무적/회피로 엑스칼리버 모르간을 막아내세요.',
      difficulty: '상급 · 추천 Lv.70',
      rewardText: '💎 성정석 +10 · 🔥 종화 +25 · 🟢 마프 +35',
      rewards: { sq: 10, embers: 25, mp: 35 },
      waves: [
        [
          { name: '스켈레톤 검사', cls: 'Saber', hp: 38000, atk: 1900, maxCharge: 4, emoji: '☠️' },
          { name: '섀도우 랜서', cls: 'Lancer', hp: 46000, atk: 2100, maxCharge: 4, emoji: '👤' },
          { name: '스켈레톤 검사', cls: 'Saber', hp: 38000, atk: 1900, maxCharge: 4, emoji: '☠️' }
        ],
        [
          { name: '흑화 기사왕 [얼터]', cls: 'Saber', hp: 145000, breakBars: [175000], atk: 3200, maxCharge: 4, emoji: '🖤', isBoss: true, npName: '엑스칼리버 모르간' }
        ]
      ]
    },
    {
      id: 'q_babylonia',
      name: '🐉 바빌로니아 — 라흐무 & 흑성배의 용 (고난이도)',
      desc: '브레이크 게이지 보스전! 체인 보너스와 크리티컬, 보구 2배 부스트를 총동원하세요.',
      difficulty: '고난이도 · 추천 Lv.85',
      rewardText: '💎 성정석 +20 · 🟡 레프 +1 · 🔥 종화 +35',
      rewards: { sq: 20, rp: 1, embers: 35 },
      waves: [
        [
          { name: '라흐무', cls: 'Lancer', hp: 62000, atk: 2400, maxCharge: 4, emoji: '👾' },
          { name: '라흐무', cls: 'Archer', hp: 62000, atk: 2400, maxCharge: 3, emoji: '👾' },
          { name: '라흐무', cls: 'Assassin', hp: 58000, atk: 2400, maxCharge: 3, emoji: '👾' }
        ],
        [
          { name: '벨 라흐무', cls: 'Berserker', hp: 110000, atk: 2900, maxCharge: 4, emoji: '😈' },
          { name: '흑성배의 마룡', cls: 'Rider', hp: 165000, breakBars: [195000], atk: 3400, maxCharge: 4, emoji: '🐉', isBoss: true, npName: '심연의 브레스' }
        ]
      ]
    },
    {
      id: 'q_challenge',
      name: '👑 이문대 챌린지 — 종언의 요정왕 & 거신 (EX)',
      desc: '2중 브레이크 게이지 최종 챌린지! 승리 시 호부와 대량의 성정석을 획득합니다.',
      difficulty: 'EX 챌린지 · 추천 Lv.90+',
      rewardText: '💎 성정석 +30 · 🎫 호부 +1 · 🟡 레프 +2',
      rewards: { sq: 30, tickets: 1, rp: 2 },
      waves: [
        [
          { name: '재액의 거신 케르눈노스', cls: 'Berserker', hp: 220000, breakBars: [260000, 310000], atk: 3900, maxCharge: 4, emoji: '👁️', isBoss: true, npName: '칼라미티 커스' }
        ]
      ]
    }
  ];

  // 칼데아 무료 서포트 프렌드 (보유 서번트가 적어도 바로 플레이 가능!)
  const SUPPORT_FRIENDS = [
    { id: 'sv_castoria', level: 90, npLevel: 2, ceId: 'ce_2030', isSupport: true },
    { id: 'sv_oberon', level: 90, npLevel: 2, ceId: 'ce_kscope', isSupport: true },
    { id: 'sv_gilgamesh', level: 90, npLevel: 3, ceId: 'ce_black_grail', isSupport: true }
  ];

  // ================= 배틀 상태 =================
  let selectedQuestId = QUESTS[0].id;
  let partySlots = [null, null, null]; // [{ id, ceId, isSupport }]
  let battle = null; // null이면 로비, 객체면 전투 진행 중!
  let busy = false;

  function getBridge() { return window.ChaldeaBridge; }

  // 기본 파티 자동 채우기 (보유 서번트 상위 2~3기 + 부족하면 무료 서포트)
  function ensureDefaultParty() {
    const st = getBridge()?.getState();
    if (!st) return;
    const ownedIds = Object.keys(st.servants).sort((a, b) =>
      (SERVANT_MAP[b].rarity - SERVANT_MAP[a].rarity) || (st.servants[b].level - st.servants[a].level)
    );
    const ownedCes = Object.keys(st.ces).sort((a, b) => CE_MAP[b].rarity - CE_MAP[a].rarity);

    for (let i = 0; i < 3; i++) {
      if (partySlots[i] && (partySlots[i].isSupport || st.servants[partySlots[i].id])) continue;
      if (ownedIds[i]) {
        partySlots[i] = { id: ownedIds[i], ceId: ownedCes[i] || null, isSupport: false };
      } else {
        const sup = SUPPORT_FRIENDS[i % SUPPORT_FRIENDS.length];
        partySlots[i] = { id: sup.id, ceId: sup.ceId, isSupport: true };
      }
    }
  }

  // ================= 로비 렌더링 (퀘스트 + 파티 편성) =================
  function renderLobby() {
    ensureDefaultParty();
    document.getElementById('battle-lobby').classList.remove('hidden');
    document.getElementById('battle-arena').classList.add('hidden');

    const qList = document.getElementById('battle-quest-list');
    qList.innerHTML = '';
    QUESTS.forEach(q => {
      const card = document.createElement('button');
      card.className = 'quest-card' + (q.id === selectedQuestId ? ' active' : '');
      card.innerHTML = `
        <div class="quest-card-head">
          <strong>${q.name}</strong>
          <span class="quest-diff">${q.difficulty}</span>
        </div>
        <div class="quest-desc">${q.desc}</div>
        <div class="quest-reward">보상: ${q.rewardText}</div>
      `;
      card.addEventListener('click', () => {
        SoundEngine.click();
        selectedQuestId = q.id;
        renderLobby();
      });
      qList.appendChild(card);
    });

    const st = getBridge().getState();
    const ownedSvIds = Object.keys(st.servants).sort((a, b) => (SERVANT_MAP[b].rarity - SERVANT_MAP[a].rarity));
    const ownedCeIds = Object.keys(st.ces).sort((a, b) => (CE_MAP[b].rarity - CE_MAP[a].rarity));

    const slotsEl = document.getElementById('battle-party-slots');
    slotsEl.innerHTML = '';
    partySlots.forEach((slot, idx) => {
      const sv = SERVANT_MAP[slot.id];
      const own = slot.isSupport ? { level: 90, npLevel: 2, viewAsc: 4 } : st.servants[slot.id];
      const faceUrl = ArtRenderer.getFaceUrl(slot.id);
      const ceName = slot.ceId && CE_MAP[slot.ceId] ? CE_MAP[slot.ceId].name : '개념예장 미장착';
      const cePassive = getCePassive(slot.ceId);
      const deckTypes = getServantDeckTypes(sv);

      const svOptions = [
        ...ownedSvIds.map(id => `<option value="own:${id}" ${!slot.isSupport && slot.id === id ? 'selected' : ''}>★${SERVANT_MAP[id].rarity} ${SERVANT_MAP[id].name} (Lv.${st.servants[id].level} · 보${st.servants[id].npLevel})</option>`),
        `<optgroup label="── 무료 프렌드 서포트 (Lv.90) ──">`,
        ...SUPPORT_FRIENDS.map(sf => `<option value="sup:${sf.id}" ${slot.isSupport && slot.id === sf.id ? 'selected' : ''}>[서포트] ★5 ${SERVANT_MAP[sf.id].name} (Lv.90)</option>`),
        `</optgroup>`
      ].join('');

      const ceOptions = [
        `<option value="">(개념예장 미장착)</option>`,
        ...ownedCeIds.map(id => `<option value="${id}" ${slot.ceId === id ? 'selected' : ''}>★${CE_MAP[id].rarity} ${CE_MAP[id].name} (${getCePassive(id).label})</option>`),
        ...(slot.isSupport && slot.ceId && !ownedCeIds.includes(slot.ceId)
          ? [`<option value="${slot.ceId}" selected>[서포트] ★${CE_MAP[slot.ceId].rarity} ${CE_MAP[slot.ceId].name}</option>`]
          : [])
      ].join('');

      const div = document.createElement('div');
      div.className = 'party-slot-card';
      div.innerHTML = `
        <div class="party-slot-top">
          ${faceUrl ? `<img src="${faceUrl}" class="party-slot-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div style="flex:1;min-width:0">
            <div class="party-slot-badge">${slot.isSupport ? '🤝 FRIEND SUPPORT' : `SLOT ${idx + 1}`} · ${CLASS_INFO[sv.cls]?.name}</div>
            <div class="party-slot-name">${'★'.repeat(sv.rarity)} ${sv.name}</div>
            <div class="party-slot-meta">Lv.${own.level} · 보구 Lv.${own.npLevel} (${sv.npType})</div>
          </div>
        </div>
        <div class="party-deck-dots">
          ${deckTypes.map(t => `<span class="deck-dot ${t}">${t[0]}</span>`).join('')}
          <span class="deck-np-dot ${sv.npType}">보구:${sv.npType[0]}</span>
        </div>
        <label class="party-select-label">서번트 선택
          <select class="filter-select party-sv-sel" data-idx="${idx}">${svOptions}</select>
        </label>
        <label class="party-select-label">개념예장 (${cePassive.label})
          <select class="filter-select party-ce-sel" data-idx="${idx}">${ceOptions}</select>
        </label>
      `;
      slotsEl.appendChild(div);
    });

    slotsEl.querySelectorAll('.party-sv-sel').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.idx);
        const [kind, id] = e.target.value.split(':');
        // 중복 서번트 방지 (본인 보유끼리 중복 시 스왑)
        const dupIdx = partySlots.findIndex((p, i) => i !== idx && p.id === id && !p.isSupport && kind === 'own');
        if (dupIdx !== -1) {
          const tmp = partySlots[dupIdx];
          partySlots[dupIdx] = partySlots[idx];
          partySlots[idx] = tmp;
        } else {
          const sup = SUPPORT_FRIENDS.find(s => s.id === id);
          partySlots[idx] = {
            id,
            ceId: kind === 'sup' ? (sup?.ceId || null) : partySlots[idx].ceId,
            isSupport: kind === 'sup'
          };
        }
        SoundEngine.click();
        renderLobby();
      });
    });

    slotsEl.querySelectorAll('.party-ce-sel').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.idx);
        partySlots[idx].ceId = e.target.value || null;
        SoundEngine.click();
        renderLobby();
      });
    });
  }

  // ================= 전투 시작 =================
  function startBattle() {
    ensureDefaultParty();
    const st = getBridge().getState();
    const quest = QUESTS.find(q => q.id === selectedQuestId) || QUESTS[0];

    const party = partySlots.map((slot, idx) => {
      const sv = SERVANT_MAP[slot.id];
      const own = slot.isSupport ? { level: 90, npLevel: 2, viewAsc: 4 } : st.servants[slot.id];
      const baseMaxLv = sv.rarity === 5 ? 90 : (sv.rarity === 4 ? 80 : 70);
      // 초보 레벨 1 서번트도 전투 재미를 느낄 수 있게 기본 보정 0.62~1.22 적용
      const scale = 0.62 + (own.level / baseMaxLv) * 0.45;
      const maxHp = Math.round(sv.hp * scale);
      const atk = Math.round(sv.atk * scale);
      const ce = getCePassive(slot.ceId);

      return {
        slotIdx: idx,
        id: sv.id,
        sv,
        isSupport: slot.isSupport,
        level: own.level,
        npLevel: own.npLevel,
        viewAsc: own.viewAsc || 1,
        ceId: slot.ceId,
        ce,
        maxHp,
        hp: maxHp,
        atk,
        np: Math.min(200, ce.startNp),
        skills: buildServantSkills(sv),
        buffs: { atk: 0, atkT: 0, def: 0, defT: 0, buster: 0, arts: 0, quick: 0, cardT: 0, npDmg: 0, npDmgT: 0, npGain: 0, npGainT: 0, crit: 0, critT: 0, invul: 0, npBoost: 1 }
      };
    });

    const masterSkills = [
      { name: '순간 강화', cd: 6, curCd: 0, icon: '🔥', desc: '아군 전체 공격력 +30% (1턴)', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.buffs.atk += 0.3; m.buffs.atkT = Math.max(m.buffs.atkT, 1); } }); return '마스터 예장 [순간 강화]! 아군 전체 공격력 +30%!'; } },
      { name: '응급 수당 & 회피', cd: 7, curCd: 0, icon: '🛡️', desc: '아군 전체 HP +3500 & 회피(1턴)', fn: (b) => { b.party.forEach(m => { if (m.hp > 0) { m.hp = Math.min(m.maxHp, m.hp + 3500); m.buffs.invul = Math.max(m.buffs.invul, 1); } }); return '마스터 예장 [긴급 회피]! 아군 전체 회복 & 회피!'; } },
      { name: '간드 (스턴)', cd: 8, curCd: 0, icon: '⚡', desc: '타겟 적 1턴 행동 불능(스턴) & 크리스타 +10', fn: (b) => { const t = b.enemies[b.targetIdx]; if (t && t.hp > 0) t.stunned = true; b.stars = Math.min(99, b.stars + 10); return `마스터 예장 [간드]! ${t ? t.name : '적'} 스턴 & 스타 +10!`; } }
    ];

    battle = {
      quest,
      waveIdx: 0,
      turn: 1,
      stars: 0,
      party,
      masterSkills,
      enemies: [],
      targetIdx: 0,
      deck: [],
      hand: [],
      selectedCards: [], // [{ kind: 'cmd'|'np', handIdx?, slotIdx, type, critPct }]
      phase: 'command', // 'command' | 'cards' | 'animating' | 'ended'
      logs: []
    };
    busy = false;

    spawnWave(0);
    buildNewDeck();
    drawTurnHand();
    addLog(`⚔️ [${quest.name}] 전투 개시! (WAVE 1 / ${quest.waves.length})`);

    document.getElementById('battle-lobby').classList.add('hidden');
    document.getElementById('battle-arena').classList.remove('hidden');
    SoundEngine.summonStart();
    renderArena();
  }

  function spawnWave(wIdx) {
    battle.waveIdx = wIdx;
    battle.enemies = battle.quest.waves[wIdx].map((e, i) => ({
      idx: i,
      name: e.name,
      cls: e.cls,
      maxHp: e.hp,
      hp: e.hp,
      breakBars: [...(e.breakBars || [])],
      atk: e.atk,
      charge: 0,
      maxCharge: e.maxCharge || 4,
      emoji: e.emoji || '👾',
      isBoss: !!e.isBoss,
      npName: e.npName || '강력한 일격',
      stunned: false
    }));
    battle.targetIdx = 0;
  }

  // 15장 커맨드 덱 생성 & 셔플 (원작 FGO 3턴 순환 룰)
  function buildNewDeck() {
    const cards = [];
    battle.party.forEach(m => {
      if (m.hp <= 0) return;
      getServantDeckTypes(m.sv).forEach(type => {
        cards.push({ slotIdx: m.slotIdx, svId: m.id, type });
      });
    });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    battle.deck = cards;
  }

  function drawTurnHand() {
    if (battle.deck.length < 5) buildNewDeck();
    const hand = battle.deck.splice(0, 5);
    // 크리티컬 스타 분배 (0% ~ 100%, 10% 단위 — FGO 고증)
    const starAlloc = [0, 0, 0, 0, 0];
    let pool = Math.min(50, Math.floor(battle.stars));
    const weights = hand.map(c => {
      const cls = battle.party[c.slotIdx]?.sv.cls;
      if (cls === 'Rider') return 200;
      if (cls === 'Archer') return 150;
      if (cls === 'Berserker') return 25;
      if (cls === 'Caster') return 55;
      return 100;
    });
    while (pool > 0) {
      const avail = weights.map((w, i) => (starAlloc[i] < 10 ? w : 0));
      const sum = avail.reduce((a, b) => a + b, 0);
      if (sum <= 0) break;
      let r = Math.random() * sum;
      for (let i = 0; i < 5; i++) {
        r -= avail[i];
        if (r <= 0) { starAlloc[i]++; break; }
      }
      pool--;
    }
    battle.stars = 0;
    battle.hand = hand.map((c, i) => ({ ...c, handIdx: i, critPct: starAlloc[i] * 10 }));
    battle.selectedCards = [];
  }

  function addLog(msg) {
    if (!battle) return;
    battle.logs.unshift(msg);
    if (battle.logs.length > 18) battle.logs.pop();
  }

  // 체인 판정 (버스터 / 아츠 / 퀵 / 마이티 / 브레이브 체인!)
  function analyzeChain(cards) {
    if (cards.length < 3) return { colorChain: null, mighty: false, brave: false, badges: [] };
    const types = cards.map(c => c.type);
    const sameColor = types[0] === types[1] && types[1] === types[2];
    const colorChain = sameColor ? types[0] : null;
    const mighty = !sameColor && types.includes('Buster') && types.includes('Arts') && types.includes('Quick');
    const brave = cards[0].slotIdx === cards[1].slotIdx && cards[1].slotIdx === cards[2].slotIdx;

    const badges = [];
    if (colorChain === 'Buster') badges.push({ cls: 'ch-buster', text: '🔴 BUSTER CHAIN (화력 대폭 UP!)' });
    if (colorChain === 'Arts') badges.push({ cls: 'ch-arts', text: '🔵 ARTS CHAIN (전원 NP +20%!)' });
    if (colorChain === 'Quick') badges.push({ cls: 'ch-quick', text: '🟢 QUICK CHAIN (스타 +10!)' });
    if (mighty) badges.push({ cls: 'ch-mighty', text: '🌈 MIGHTY CHAIN (3색 퍼스트 보너스 + 크리 UP!)' });
    if (brave) badges.push({ cls: 'ch-brave', text: '⚡ BRAVE CHAIN (EXTRA 공격 추가!)' });
    return { colorChain, mighty, brave, badges };
  }

  // ================= 전장 UI 렌더링 =================
  function renderArena() {
    if (!battle) return;
    document.getElementById('ba-quest-name').textContent = battle.quest.name;
    document.getElementById('ba-wave').textContent = `WAVE ${battle.waveIdx + 1} / ${battle.quest.waves.length}`;
    document.getElementById('ba-turn').textContent = `TURN ${battle.turn}`;
    document.getElementById('ba-stars').textContent = `★ ${Math.floor(battle.stars)}`;

    // 1) 적 전장 렌더링
    const enemiesEl = document.getElementById('ba-enemies');
    enemiesEl.innerHTML = '';
    battle.enemies.forEach((en, idx) => {
      const dead = en.hp <= 0;
      const isTarget = idx === battle.targetIdx && !dead;
      const hpPct = Math.max(0, Math.min(100, (en.hp / en.maxHp) * 100));
      const chargeDots = Array.from({ length: en.maxCharge }, (_, i) =>
        `<span class="charge-pip ${i < en.charge ? 'filled' : ''}"></span>`
      ).join('');
      const breakDots = en.breakBars.map(() => `<span class="break-gem" title="브레이크 게이지">◆</span>`).join('');

      const card = document.createElement('div');
      card.className = `enemy-unit ${dead ? 'dead' : ''} ${isTarget ? 'targeted' : ''} ${en.isBoss ? 'boss' : ''}`;
      card.id = `enemy-unit-${idx}`;
      card.innerHTML = `
        ${isTarget ? '<div class="target-reticle">🎯 TARGET</div>' : ''}
        <div class="enemy-head">
          <span class="enemy-cls-badge">${CLASS_INFO[en.cls]?.name || en.cls}</span>
          <span class="enemy-breaks">${breakDots}</span>
        </div>
        <div class="enemy-sprite">${en.emoji}</div>
        <div class="enemy-name">${en.name}${en.stunned ? ' ⚡스턴' : ''}</div>
        <div class="hp-bar-track"><div class="hp-bar-fill enemy-hp" style="width:${hpPct}%"></div></div>
        <div class="enemy-hp-text">HP ${Math.max(0, en.hp).toLocaleString()} / ${en.maxHp.toLocaleString()}</div>
        <div class="enemy-charge-row ${en.charge >= en.maxCharge ? 'danger' : ''}">
          <span>${en.charge >= en.maxCharge ? '⚠️ DANGER!' : '차지'}</span>
          <div class="charge-pips">${chargeDots}</div>
        </div>
        <div class="dmg-float-layer" id="enemy-dmg-${idx}"></div>
      `;
      if (!dead) {
        card.addEventListener('click', () => {
          SoundEngine.click();
          battle.targetIdx = idx;
          renderArena();
        });
      }
      enemiesEl.appendChild(card);
    });

    // 2) 아군 3인 전열 렌더링
    const partyEl = document.getElementById('ba-party');
    partyEl.innerHTML = '';
    battle.party.forEach(m => {
      const dead = m.hp <= 0;
      const hpPct = Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100));
      const npPct = Math.min(100, m.np);
      const faceUrl = ArtRenderer.getFaceUrl(m.id);
      const activeBuffs = [];
      if (m.buffs.atk > 0) activeBuffs.push(`⚔️공+${Math.round(m.buffs.atk * 100)}%`);
      if (m.buffs.buster > 0) activeBuffs.push(`🔴B+${Math.round(m.buffs.buster * 100)}%`);
      if (m.buffs.arts > 0) activeBuffs.push(`🔵A+${Math.round(m.buffs.arts * 100)}%`);
      if (m.buffs.quick > 0) activeBuffs.push(`🟢Q+${Math.round(m.buffs.quick * 100)}%`);
      if (m.buffs.npDmg > 0) activeBuffs.push(`✨보구+${Math.round(m.buffs.npDmg * 100)}%`);
      if (m.buffs.npBoost > 1) activeBuffs.push(`🔥보구×2`);
      if (m.buffs.invul > 0) activeBuffs.push(`🛡️무적`);

      const unit = document.createElement('div');
      unit.className = `ally-unit ${dead ? 'dead' : ''} ${m.np >= 100 ? 'np-ready' : ''}`;
      unit.id = `ally-unit-${m.slotIdx}`;
      unit.innerHTML = `
        <div class="ally-top">
          ${faceUrl ? `<img src="${faceUrl}" class="ally-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div style="flex:1;min-width:0">
            <div class="ally-name">${m.sv.nickname || m.sv.name} <small>(${CLASS_INFO[m.sv.cls]?.name})</small></div>
            <div class="hp-bar-track"><div class="hp-bar-fill ally-hp" style="width:${hpPct}%"></div></div>
            <div class="ally-stat-line">HP ${Math.max(0, m.hp).toLocaleString()} / ${m.maxHp.toLocaleString()}</div>
            <div class="np-bar-track"><div class="np-bar-fill ${m.np >= 100 ? 'full' : ''}" style="width:${npPct}%"></div></div>
            <div class="ally-stat-line">NP <strong style="color:${m.np >= 100 ? '#ffe666' : '#70e0ff'}">${Math.floor(m.np)}%</strong> · 보${m.npLevel}</div>
          </div>
        </div>
        <div class="ally-buffs">${activeBuffs.map(t => `<span class="buff-pill">${t}</span>`).join('')}</div>
        <div class="ally-skills">
          ${m.skills.map((sk, sIdx) => `
            <button class="skill-btn ${sk.curCd > 0 ? 'cooldown' : ''}" data-slot="${m.slotIdx}" data-sidx="${sIdx}" ${dead || sk.curCd > 0 || battle.phase !== 'command' || busy ? 'disabled' : ''} title="${sk.name}: ${sk.desc}">
              <span class="sk-ico">${sk.icon}</span>
              <span class="sk-nm">${sk.curCd > 0 ? `${sk.curCd}T` : sk.name.slice(0, 6)}</span>
            </button>
          `).join('')}
        </div>
        <div class="dmg-float-layer" id="ally-dmg-${m.slotIdx}"></div>
      `;
      partyEl.appendChild(unit);
    });

    partyEl.querySelectorAll('.skill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (busy || battle.phase !== 'command') return;
        const m = battle.party[Number(btn.dataset.slot)];
        const sk = m.skills[Number(btn.dataset.sidx)];
        if (!m || !sk || sk.curCd > 0 || m.hp <= 0) return;
        sk.curCd = sk.cd;
        const msg = sk.fn(battle, m);
        SoundEngine.levelUp();
        addLog(`✨ ${msg}`);
        getBridge().toast(msg);
        renderArena();
      });
    });

    // 3) 마스터 마술예장 스킬 바
    const msEl = document.getElementById('ba-master-skills');
    msEl.innerHTML = battle.masterSkills.map((sk, i) => `
      <button class="master-skill-btn ${sk.curCd > 0 ? 'cooldown' : ''}" data-ms="${i}" ${sk.curCd > 0 || battle.phase !== 'command' || busy ? 'disabled' : ''} title="${sk.desc}">
        ${sk.icon} ${sk.name}${sk.curCd > 0 ? ` (${sk.curCd}T)` : ''}
      </button>
    `).join('');
    msEl.querySelectorAll('.master-skill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (busy || battle.phase !== 'command') return;
        const sk = battle.masterSkills[Number(btn.dataset.ms)];
        if (!sk || sk.curCd > 0) return;
        sk.curCd = sk.cd;
        const msg = sk.fn(battle);
        SoundEngine.levelUp();
        addLog(`🧤 ${msg}`);
        getBridge().toast(msg);
        renderArena();
      });
    });

    // 4) 하단 커맨드 영역: ATTACK 버튼 vs B/A/Q 카드 선택 팬
    const attackWrap = document.getElementById('ba-attack-bar');
    const cardDrawer = document.getElementById('ba-card-drawer');

    if (battle.phase === 'command') {
      attackWrap.classList.remove('hidden');
      cardDrawer.classList.add('hidden');
    } else if (battle.phase === 'cards') {
      attackWrap.classList.add('hidden');
      cardDrawer.classList.remove('hidden');
      renderCommandCards();
    } else {
      attackWrap.classList.add('hidden');
      cardDrawer.classList.add('hidden');
    }

    // 5) 전투 로그
    document.getElementById('ba-log').innerHTML = battle.logs.slice(0, 6).map(l => `<div class="ba-log-line">${l}</div>`).join('');
  }

  // 커맨드 카드 팬(5장 + NP 100% 보구 카드 3칸) 렌더링
  function renderCommandCards() {
    const target = battle.enemies[battle.targetIdx];
    const npRow = document.getElementById('ba-np-cards');
    const cmdRow = document.getElementById('ba-cmd-cards');
    const chainBar = document.getElementById('ba-chain-preview');

    // 보구 카드 3칸 (NP 100% 이상인 생존 서번트만 활성화!)
    npRow.innerHTML = '';
    battle.party.forEach(m => {
      const ready = m.hp > 0 && m.np >= 100;
      const selIdx = battle.selectedCards.findIndex(c => c.kind === 'np' && c.slotIdx === m.slotIdx);
      const faceUrl = ArtRenderer.getFaceUrl(m.id);
      const catLabel = getNpCategory(m.sv) === 'support' ? '보조' : (getNpCategory(m.sv) === 'single' ? '단일' : '대군');

      const btn = document.createElement('button');
      btn.className = `np-cmd-card ${m.sv.npType} ${ready ? 'ready' : 'locked'} ${selIdx !== -1 ? 'selected' : ''}`;
      btn.disabled = !ready;
      btn.innerHTML = `
        ${selIdx !== -1 ? `<span class="cmd-order-badge">${selIdx + 1}st</span>` : ''}
        <div class="np-cmd-top">
          ${faceUrl ? `<img src="${faceUrl}" class="np-cmd-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div>
            <div class="np-cmd-type">${m.sv.npType.toUpperCase()} 보구 · ${catLabel}</div>
            <div class="np-cmd-name">${m.sv.npName}</div>
          </div>
        </div>
        <div class="np-cmd-sub">${ready ? `NP ${Math.floor(m.np)}% 발동 가능!` : `NP ${Math.floor(m.np)}% / 100%`}</div>
      `;
      if (ready) {
        btn.addEventListener('click', () => toggleSelectCard({ kind: 'np', slotIdx: m.slotIdx, type: m.sv.npType, critPct: 0 }));
      }
      npRow.appendChild(btn);
    });

    // 5장 커맨드 카드 (Buster / Arts / Quick)
    cmdRow.innerHTML = '';
    battle.hand.forEach(card => {
      const m = battle.party[card.slotIdx];
      const selIdx = battle.selectedCards.findIndex(c => c.kind === 'cmd' && c.handIdx === card.handIdx);
      const mult = target ? getClassMultiplier(m.sv.cls, target.cls) : 1.0;
      const affTag = mult > 1 ? '<span class="aff-weak">WEAK</span>' : (mult < 1 ? '<span class="aff-resist">RESIST</span>' : '');
      const faceUrl = ArtRenderer.getFaceUrl(m.id);
      const koType = card.type === 'Buster' ? '버스터' : (card.type === 'Arts' ? '아츠' : '퀵');

      const btn = document.createElement('button');
      btn.className = `cmd-card ${card.type} ${selIdx !== -1 ? 'selected' : ''}`;
      btn.innerHTML = `
        ${selIdx !== -1 ? `<span class="cmd-order-badge">${selIdx + 1}</span>` : ''}
        <div class="cmd-card-top">
          ${affTag}
          ${card.critPct > 0 ? `<span class="cmd-crit-badge">★${card.critPct}%</span>` : ''}
        </div>
        <div class="cmd-face-wrap">
          ${faceUrl ? `<img src="${faceUrl}" class="cmd-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : `<div class="cmd-face-fallback">${m.sv.name[0]}</div>`}
        </div>
        <div class="cmd-sv-name">${m.sv.nickname || m.sv.name}</div>
        <div class="cmd-type-ribbon">${card.type.toUpperCase()}<span>${koType}</span></div>
      `;
      btn.addEventListener('click', () => toggleSelectCard({ kind: 'cmd', handIdx: card.handIdx, slotIdx: card.slotIdx, type: card.type, critPct: card.critPct }));
      cmdRow.appendChild(btn);
    });

    // 체인 미리보기 배지
    const chain = analyzeChain(battle.selectedCards);
    if (battle.selectedCards.length < 3) {
      chainBar.innerHTML = `<span class="chain-hint">커맨드 카드 3장을 선택하세요 (${battle.selectedCards.length} / 3) · 첫 카드에 따라 B/A/Q 퍼스트 보너스 적용!</span>`;
    } else if (chain.badges.length) {
      chainBar.innerHTML = chain.badges.map(b => `<span class="chain-badge ${b.cls}">${b.text}</span>`).join('');
    } else {
      chainBar.innerHTML = `<span class="chain-hint">3장 선택 완료! 공격을 개시합니다!</span>`;
    }
  }

  function toggleSelectCard(cardObj) {
    if (busy || battle.phase !== 'cards') return;
    const existIdx = battle.selectedCards.findIndex(c =>
      c.kind === cardObj.kind && (c.kind === 'np' ? c.slotIdx === cardObj.slotIdx : c.handIdx === cardObj.handIdx)
    );
    if (existIdx !== -1) {
      SoundEngine.click();
      battle.selectedCards.splice(existIdx, 1);
      renderCommandCards();
      return;
    }
    if (battle.selectedCards.length >= 3) return;
    SoundEngine.click();
    battle.selectedCards.push(cardObj);
    renderCommandCards();

    // 3장 선택 즉시 0.35초 뒤 자동 전투 시퀀스 돌입 (원작 FGO와 동일!)
    if (battle.selectedCards.length === 3) {
      busy = true;
      setTimeout(() => executeTurnSequence(), 360);
    }
  }

  // ================= 턴 전투 실행 (플레이어 3타 + EXTRA + 적 반격) =================
  function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

  function showFloatDmg(containerId, text, cssClass = '') {
    const el = document.getElementById(containerId);
    if (!el) return;
    const pop = document.createElement('div');
    pop.className = `dmg-pop ${cssClass}`;
    pop.textContent = text;
    el.appendChild(pop);
    setTimeout(() => pop.remove(), 950);
  }

  function pickAliveTarget() {
    if (battle.enemies[battle.targetIdx]?.hp > 0) return battle.enemies[battle.targetIdx];
    const next = battle.enemies.find(e => e.hp > 0);
    if (next) battle.targetIdx = next.idx;
    return next || null;
  }

  function damageEnemy(enemy, dmg, tagClass = '') {
    if (!enemy || enemy.hp <= 0) return;
    const finalDmg = Math.max(100, Math.round(dmg));
    enemy.hp -= finalDmg;
    showFloatDmg(`enemy-dmg-${enemy.idx}`, `${finalDmg.toLocaleString()}`, tagClass);
    const unitEl = document.getElementById(`enemy-unit-${enemy.idx}`);
    if (unitEl) {
      unitEl.classList.remove('hit-shake');
      void unitEl.offsetWidth;
      unitEl.classList.add('hit-shake');
    }

    // 브레이크 게이지 처리!
    if (enemy.hp <= 0 && enemy.breakBars.length > 0) {
      const nextHp = enemy.breakBars.shift();
      enemy.maxHp = nextHp;
      enemy.hp = nextHp;
      enemy.charge = Math.min(enemy.maxCharge, enemy.charge + 1);
      addLog(`💥 ${enemy.name} 브레이크!! 새 HP ${nextHp.toLocaleString()} 해방!`);
      showFloatDmg(`enemy-dmg-${enemy.idx}`, `BREAK!!`, 'dmg-break');
      SoundEngine.sparkPromotion();
    } else if (enemy.hp <= 0) {
      enemy.hp = 0;
      addLog(`💀 ${enemy.name} 격파!`);
    }
  }

  async function playNpCutin(member) {
    const overlay = document.getElementById('np-cutin-overlay');
    const imgUrl = ArtRenderer.getCardArtUrl(member.sv, true, member.viewAsc || 4);
    overlay.className = `np-cutin-overlay ${member.sv.npType}`;
    overlay.innerHTML = `
      <div class="np-cutin-inner">
        ${imgUrl ? `<img src="${imgUrl}" class="np-cutin-img" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
        <div class="np-cutin-text">
          <div class="np-cutin-ruby">${member.sv.npSub || 'NOBLE PHANTASM'}</div>
          <div class="np-cutin-name">${member.sv.npName}</div>
          <div class="np-cutin-sv">${member.sv.name} · 보구 Lv.${member.npLevel} (${member.sv.npType})</div>
        </div>
      </div>
    `;
    SoundEngine.reveal(5, true);
    await sleep(1050);
    overlay.className = 'np-cutin-overlay hidden';
  }

  async function executeTurnSequence() {
    battle.phase = 'animating';
    renderArena();

    const cards = [...battle.selectedCards];
    const chain = analyzeChain(cards);
    const firstType = cards[0].type;

    // 체인 즉발 보너스 (아츠 체인 / 퀵 체인)
    if (chain.colorChain === 'Arts') {
      const participants = new Set(cards.map(c => c.slotIdx));
      participants.forEach(sIdx => {
        const m = battle.party[sIdx];
        if (m && m.hp > 0) m.np = Math.min(200, m.np + 20);
      });
      addLog('🔵 ARTS CHAIN! 참가 서번트 NP +20%!');
    } else if (chain.colorChain === 'Quick') {
      battle.stars = Math.min(99, battle.stars + 10);
      addLog('🟢 QUICK CHAIN! 크리티컬 스타 +10!');
    } else if (chain.colorChain === 'Buster') {
      addLog('🔴 BUSTER CHAIN! 전 카드 공격력 대폭 보너스!');
    } else if (chain.mighty) {
      addLog('🌈 MIGHTY CHAIN! 3색 퍼스트 보너스 전원 적용!');
    }

    // 3장 카드 순차 발동
    for (let step = 0; step < cards.length; step++) {
      const c = cards[step];
      const m = battle.party[c.slotIdx];
      if (!m || m.hp <= 0) continue;

      let target = pickAliveTarget();
      if (!target) break;

      const allyEl = document.getElementById(`ally-unit-${m.slotIdx}`);
      if (allyEl) allyEl.classList.add('attacking');

      if (c.kind === 'np') {
        const ocBonus = 1 + Math.max(0, (m.np - 100) / 200);
        m.np = 0;
        await playNpCutin(m);
        const cat = getNpCategory(m.sv);
        const npLvMult = [0, 1.0, 1.25, 1.4, 1.5, 1.65][m.npLevel] || 1.0;
        const cardBuff = (c.type === 'Buster' ? m.buffs.buster + m.ce.buster : (c.type === 'Arts' ? m.buffs.arts + m.ce.arts : m.buffs.quick + m.ce.quick));
        const npDmgMult = (1 + m.buffs.npDmg + m.ce.npDmg) * m.buffs.npBoost;

        if (cat === 'support') {
          battle.party.forEach(ally => {
            if (ally.hp > 0) {
              ally.buffs.atk += 0.3; ally.buffs.atkT = 3;
              ally.buffs.invul = Math.max(ally.buffs.invul, 1);
              ally.hp = Math.min(ally.maxHp, ally.hp + 3000);
              if (m.id === 'sv_tamamo') ally.np = Math.min(200, ally.np + 25);
            }
          });
          addLog(`✨ ${m.sv.name} 보구 [${m.sv.npName}]! 아군 전체 대숙정방어/무적 + 공업 + 회복!`);
        } else if (cat === 'aoe') {
          const baseMult = c.type === 'Buster' ? 3.8 : (c.type === 'Arts' ? 3.3 : 3.5);
          battle.enemies.forEach(en => {
            if (en.hp <= 0) return;
            const clsMult = getClassMultiplier(m.sv.cls, en.cls);
            const dmg = m.atk * baseMult * npLvMult * (1 + m.buffs.atk) * (1 + cardBuff) * npDmgMult * clsMult * ocBonus * (0.95 + Math.random() * 0.1);
            damageEnemy(en, dmg, clsMult > 1 ? 'dmg-weak' : 'dmg-np');
            // 대군 보구 리차지 (아츠/퀵 시스템!)
            if (c.type === 'Arts') m.np = Math.min(200, m.np + Math.round(18 * (1 + cardBuff) * (1 + m.buffs.npGain)));
            if (c.type === 'Quick') {
              m.np = Math.min(200, m.np + Math.round(10 * (1 + cardBuff)));
              battle.stars = Math.min(99, battle.stars + 9);
            }
          });
          addLog(`💥 ${m.sv.name} 대군 보구 [${m.sv.npName}] 작렬!`);
        } else {
          const baseMult = c.type === 'Buster' ? 6.2 : (c.type === 'Arts' ? 5.6 : 5.9);
          const clsMult = getClassMultiplier(m.sv.cls, target.cls);
          const dmg = m.atk * baseMult * npLvMult * (1 + m.buffs.atk) * (1 + cardBuff) * npDmgMult * clsMult * ocBonus * (0.95 + Math.random() * 0.1);
          damageEnemy(target, dmg, clsMult > 1 ? 'dmg-weak' : 'dmg-np');
          if (c.type === 'Arts') m.np = Math.min(200, m.np + Math.round(24 * (1 + cardBuff) * (1 + m.buffs.npGain)));
          if (c.type === 'Quick') battle.stars = Math.min(99, battle.stars + 16);
          addLog(`💥 ${m.sv.name} 단일 보구 [${m.sv.npName}] → ${target.name} ${Math.round(dmg).toLocaleString()}!`);
        }
        m.buffs.npBoost = 1;
      } else {
        // 일반 커맨드 카드 (Buster / Arts / Quick)
        const orderMult = [1.0, 1.2, 1.4][step];
        const typeDmgBase = c.type === 'Buster' ? 1.5 : (c.type === 'Arts' ? 1.0 : 0.8);
        const firstBusterBonus = (firstType === 'Buster' || chain.mighty) ? 0.5 : 0;
        const firstArtsBonus = (firstType === 'Arts' || chain.mighty) ? 1.0 : 0;
        const firstQuickBonus = (firstType === 'Quick' || chain.mighty) ? 0.25 : 0;
        const busterChainAdd = chain.colorChain === 'Buster' ? m.atk * 0.25 : 0;

        const cardBuff = (c.type === 'Buster' ? m.buffs.buster + m.ce.buster : (c.type === 'Arts' ? m.buffs.arts + m.ce.arts : m.buffs.quick + m.ce.quick));
        const clsMult = getClassMultiplier(m.sv.cls, target.cls);
        const critChance = Math.min(100, c.critPct + (chain.mighty ? 20 : 0));
        const isCrit = Math.random() * 100 < critChance;
        const critMult = isCrit ? (2.0 + m.buffs.crit + m.ce.crit) : 1.0;

        const dmg = (m.atk * (typeDmgBase * orderMult * (1 + cardBuff) + firstBusterBonus) * (1 + m.buffs.atk) * clsMult * critMult + busterChainAdd) * (0.92 + Math.random() * 0.16);
        const npBase = c.type === 'Arts' ? 13 : (c.type === 'Quick' ? 6 : 2);
        const npGain = Math.round((npBase * orderMult + firstArtsBonus * 7) * (1 + cardBuff * 0.6) * (1 + m.buffs.npGain) * (isCrit ? 1.8 : 1));
        const starBase = c.type === 'Quick' ? 11 : (c.type === 'Arts' ? 3 : 2);
        const starGain = Math.round((starBase * orderMult + firstQuickBonus * 14) * (isCrit ? 1.5 : 1));

        m.np = Math.min(200, m.np + npGain);
        battle.stars = Math.min(99, battle.stars + starGain);

        SoundEngine.cardFlip();
        damageEnemy(target, dmg, isCrit ? 'dmg-crit' : (clsMult > 1 ? 'dmg-weak' : ''));
        addLog(`${c.type === 'Buster' ? '🔴' : (c.type === 'Arts' ? '🔵' : '🟢')} ${m.sv.nickname || m.sv.name} ${c.type}${isCrit ? ' ★CRIT!' : ''} → ${Math.round(dmg).toLocaleString()} (NP+${npGain}%, ★+${starGain})`);
      }

      renderArena();
      await sleep(520);
      if (allyEl) allyEl.classList.remove('attacking');
    }

    // 브레이브 체인 → EXTRA ATTACK 4타 발동!
    if (chain.brave) {
      const m = battle.party[cards[0].slotIdx];
      const target = pickAliveTarget();
      if (m && m.hp > 0 && target) {
        const extraMult = chain.colorChain ? 3.5 : 2.2;
        const clsMult = getClassMultiplier(m.sv.cls, target.cls);
        const dmg = m.atk * extraMult * (1 + m.buffs.atk) * clsMult;
        m.np = Math.min(200, m.np + 14);
        battle.stars = Math.min(99, battle.stars + 8);
        SoundEngine.pillarBurst();
        damageEnemy(target, dmg, 'dmg-extra');
        addLog(`⚡ EXTRA ATTACK! ${m.sv.name} → ${Math.round(dmg).toLocaleString()}!`);
        renderArena();
        await sleep(540);
      }
    }

    // 모든 적 전멸 체크 → 다음 웨이브 or 승리!
    if (battle.enemies.every(e => e.hp <= 0)) {
      if (battle.waveIdx + 1 < battle.quest.waves.length) {
        addLog(`🌟 WAVE ${battle.waveIdx + 1} 클리어! 다음 웨이브 진입!`);
        SoundEngine.levelUp();
        await sleep(650);
        spawnWave(battle.waveIdx + 1);
        advanceTurnCounters();
        drawTurnHand();
        battle.phase = 'command';
        busy = false;
        renderArena();
        return;
      } else {
        finishBattle(true);
        return;
      }
    }

    // 적 턴 반격
    await sleep(360);
    for (const en of battle.enemies) {
      if (en.hp <= 0) continue;
      if (en.stunned) {
        en.stunned = false;
        addLog(`⚡ ${en.name}은(는) 스턴으로 행동 불능!`);
        continue;
      }
      const aliveAllies = battle.party.filter(m => m.hp > 0);
      if (aliveAllies.length === 0) break;

      en.charge++;
      if (en.charge >= en.maxCharge) {
        // 적 보구 발동! (전체 공격)
        en.charge = 0;
        SoundEngine.error();
        addLog(`⚠️ ${en.name}의 보구 [${en.npName}] 발동!!`);
        aliveAllies.forEach(ally => {
          if (ally.buffs.invul > 0) {
            showFloatDmg(`ally-dmg-${ally.slotIdx}`, '무적 회피!', 'dmg-block');
          } else {
            const clsMult = getClassMultiplier(en.cls, ally.sv.cls);
            const dmg = Math.round(en.atk * 1.9 * clsMult * Math.max(0.3, 1 - ally.buffs.def));
            ally.hp = Math.max(0, ally.hp - dmg);
            ally.np = Math.min(200, ally.np + 14);
            showFloatDmg(`ally-dmg-${ally.slotIdx}`, `-${dmg.toLocaleString()}`, 'dmg-enemy-hit');
          }
        });
      } else {
        const victim = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
        if (victim.buffs.invul > 0) {
          showFloatDmg(`ally-dmg-${victim.slotIdx}`, 'EVADE!', 'dmg-block');
        } else {
          const clsMult = getClassMultiplier(en.cls, victim.sv.cls);
          const dmg = Math.round(en.atk * clsMult * Math.max(0.3, 1 - victim.buffs.def) * (0.9 + Math.random() * 0.2));
          victim.hp = Math.max(0, victim.hp - dmg);
          victim.np = Math.min(200, victim.np + 8);
          showFloatDmg(`ally-dmg-${victim.slotIdx}`, `-${dmg.toLocaleString()}`, 'dmg-enemy-hit');
        }
      }
      renderArena();
      await sleep(380);
    }

    // 전멸 체크
    if (battle.party.every(m => m.hp <= 0)) {
      finishBattle(false);
      return;
    }

    // 턴 종료 패시브(2030 스타, 프리즈마 NP, 흑성배 HP감소) & 버프/쿨타임 갱신
    advanceTurnCounters();
    drawTurnHand();
    battle.phase = 'command';
    busy = false;
    renderArena();
  }

  function advanceTurnCounters() {
    battle.turn++;
    battle.masterSkills.forEach(sk => { if (sk.curCd > 0) sk.curCd--; });
    battle.party.forEach(m => {
      if (m.hp <= 0) return;
      m.skills.forEach(sk => { if (sk.curCd > 0) sk.curCd--; });
      if (m.ce.starsPerTurn) battle.stars = Math.min(99, battle.stars + m.ce.starsPerTurn);
      if (m.ce.npPerTurn) m.np = Math.min(200, m.np + m.ce.npPerTurn);
      if (m.ce.hpDrain) m.hp = Math.max(1, m.hp - m.ce.hpDrain);

      // 버프 턴 감소
      m.buffs.invul = 0;
      m.buffs.npBoost = 1;
      if (m.buffs.atkT > 0 && --m.buffs.atkT === 0) m.buffs.atk = 0;
      if (m.buffs.defT > 0 && --m.buffs.defT === 0) m.buffs.def = 0;
      if (m.buffs.cardT > 0 && --m.buffs.cardT === 0) { m.buffs.buster = 0; m.buffs.arts = 0; m.buffs.quick = 0; }
      if (m.buffs.npDmgT > 0 && --m.buffs.npDmgT === 0) m.buffs.npDmg = 0;
      if (m.buffs.npGainT > 0 && --m.buffs.npGainT === 0) m.buffs.npGain = 0;
      if (m.buffs.critT > 0 && --m.buffs.critT === 0) m.buffs.crit = 0;
    });
  }

  function finishBattle(victory) {
    battle.phase = 'ended';
    busy = false;
    renderArena();

    const modal = document.getElementById('battle-result-modal');
    const titleEl = document.getElementById('battle-result-title');
    const bodyEl = document.getElementById('battle-result-body');

    if (victory) {
      SoundEngine.reveal(5, true);
      const ownedInParty = battle.party.filter(m => !m.isSupport).map(m => m.id);
      getBridge().grantBattleRewards(battle.quest.rewards, ownedInParty);
      titleEl.textContent = '🏆 QUEST CLEAR!!';
      bodyEl.innerHTML = `
        <div class="br-quest">${battle.quest.name}</div>
        <div class="br-meta">${battle.turn}턴 만에 클리어 성공!</div>
        <div class="br-rewards-box">
          <div class="br-rw-title">✨ 획득 보상 (자동 지급 완료)</div>
          <div>${battle.quest.rewardText}</div>
          <div style="font-size:12px;color:#9cb2d9;margin-top:4px">출격한 보유 서번트의 인연 포인트가 상승했습니다!</div>
        </div>
      `;
    } else {
      SoundEngine.error();
      titleEl.textContent = '💀 DEFEAT — 전열 전멸';
      bodyEl.innerHTML = `
        <div class="br-quest">${battle.quest.name}</div>
        <div class="br-meta">아군이 모두 쓰러졌습니다. 마이룸에서 레벨업하거나 상성 서번트·개념예장을 편성해 다시 도전해 보세요!</div>
      `;
    }
    modal.classList.remove('hidden');
  }

  // ================= 이벤트 바인딩 =================
  function bindEvents() {
    document.getElementById('btn-start-battle')?.addEventListener('click', startBattle);
    document.getElementById('btn-ba-attack')?.addEventListener('click', () => {
      if (!battle || busy || battle.phase !== 'command') return;
      SoundEngine.click();
      battle.phase = 'cards';
      renderArena();
    });
    document.getElementById('btn-ba-back')?.addEventListener('click', () => {
      if (!battle || busy || battle.phase !== 'cards') return;
      SoundEngine.click();
      battle.selectedCards = [];
      battle.phase = 'command';
      renderArena();
    });
    document.getElementById('btn-ba-retreat')?.addEventListener('click', () => {
      if (!confirm('전투에서 철수하고 퀘스트 선택 화면으로 돌아갈까요?')) return;
      battle = null;
      busy = false;
      renderLobby();
    });
    document.getElementById('btn-br-lobby')?.addEventListener('click', () => {
      document.getElementById('battle-result-modal').classList.add('hidden');
      battle = null;
      renderLobby();
    });
    document.getElementById('btn-br-retry')?.addEventListener('click', () => {
      document.getElementById('battle-result-modal').classList.add('hidden');
      startBattle();
    });
  }

  window.addEventListener('DOMContentLoaded', bindEvents);

  return {
    onEnterTab() {
      if (!battle) renderLobby();
      else renderArena();
    },
    renderLobbyIfIdle() {
      if (!battle) renderLobby();
    }
  };
})();
