// ============================================================
// CHALDEA SUMMON SIMULATOR — 칼데아 게이트 (CHALDEA GATE) 완전 데이터 (chaldea_gate.js)
// - 요일 퀘스트 (7주년/한그오 2024 개편 공식 요일 스케줄 · 종화 초~극급 · 7클래스 수련장 · 보물창고 초~극급)
// - 막간의 이야기 & 영기해방 퀘스트 (Break the Seal)
// - 강화 퀘스트 (Rank Up Quest)
// - 어드밴스드 퀘스트 (Advanced Quest)
// - 마술예장 획득 퀘스트 3종 (전투복 · 마술협회 · 아틀라스원 원작 HP/적 완벽 고증) & 과거 이벤트 2종
// ============================================================

const CHALDEA_GATE_TABS = [
  { id: 'daily',     label: '📅 요일 퀘스트',       sub: '종화 · 수련장 · 보물창고' },
  { id: 'interlude', label: '📖 막간 · 영기해방',    sub: '성정석 +2 · 3차 영기해방' },
  { id: 'rankup',    label: '⚔️ 강화 퀘스트',       sub: '보구·스킬 강화 · 성정석 +2' },
  { id: 'advanced',  label: '🏆 어드밴스드',         sub: '소재 드랍 특화 고난이도' },
  { id: 'mc_past',   label: '🧤 마술예장 · 과거이벤트', sub: '전투복/협회/아틀라스 · 감옥탑' },
  { id: 'free_p1a',  label: '🗺️ 1부 프리퀘 (전반)',   sub: '후유키·오를레앙·세프템·오케아노스' },
  { id: 'free_p1b',  label: '🗺️ 1부 프리퀘 (후반)',   sub: '런던·북미·카멜롯·바빌로니아' },
  { id: 'boss',      label: '🐉 메인 보스 · EX',     sub: '특이점 · 비스트 · 케르눈노스' }
];

// 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토 (일그오 7주년 / 한그오 2024.05 개편 공식 스케줄)
const CHALDEA_WEEKLY_SCHEDULE = {
  0: { dayKo: '일요일', embers: ['살·창', '기·검', '술·궁', '창·살', '검·기', '궁·술', '종합편'], emberClasses: ['Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker'], trainings: ['Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker'], allOpen: true },
  1: { dayKo: '월요일', embers: ['살·창 편 (어새신/랜서/버서커)'], emberClasses: ['Assassin', 'Lancer', 'Berserker'], trainings: ['Archer'], allOpen: false },
  2: { dayKo: '화요일', embers: ['기·검 편 (라이더/세이버/버서커)', '궁·술 편 (아처/캐스터/버서커)'], emberClasses: ['Rider', 'Saber', 'Archer', 'Caster', 'Berserker'], trainings: ['Lancer'], allOpen: false },
  3: { dayKo: '수요일', embers: ['술·궁 편 (캐스터/아처/버서커)'], emberClasses: ['Caster', 'Archer', 'Berserker'], trainings: ['Berserker', 'Assassin'], allOpen: false },
  4: { dayKo: '목요일', embers: ['창·살 편 (랜서/어새신/버서커)'], emberClasses: ['Lancer', 'Assassin', 'Berserker'], trainings: ['Rider', 'Saber'], allOpen: false },
  5: { dayKo: '금요일', embers: ['검·기 편 (세이버/라이더/버서커)'], emberClasses: ['Saber', 'Rider', 'Berserker'], trainings: ['Caster'], allOpen: false },
  6: { dayKo: '토요일', embers: ['살·창', '기·검', '술·궁', '창·살', '검·기', '궁·술', '종합편'], emberClasses: ['Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker'], trainings: ['Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker'], allOpen: true }
};

const EMBER_CLS_EMOJI = { Saber: '⚔️', Archer: '🏹', Lancer: '🔱', Rider: '🐎', Caster: '🔮', Assassin: '🗡️', Berserker: '🔥' };

function getTodayGateSchedule() {
  const day = new Date().getDay();
  return { dayIdx: day, ...(CHALDEA_WEEKLY_SCHEDULE[day] || CHALDEA_WEEKLY_SCHEDULE[0]) };
}

function buildEmberWavesForTier(tier, dayClasses) {
  const pick = (i) => dayClasses[i % dayClasses.length] || 'Saber';
  const hand = (name, cls, hp, atk, isBoss = false, traits = []) => ({
    name, cls, attr: '천(天)', gender: '없음', align: '-/-',
    traits, hp, atk, maxCharge: cls === 'Archer' || cls === 'Assassin' ? 3 : (cls === 'Caster' || cls === 'Rider' || cls === 'Berserker' ? 5 : 4),
    emoji: EMBER_CLS_EMOJI[cls] || '🔥', isBoss
  });

  if (tier === 'beg') {
    return [
      [hand('여명의 손', pick(0), 6500, 700), hand('여명의 손', pick(1), 6800, 700), hand('여명의 손', pick(2), 6200, 700)],
      [hand('여명의 손', pick(1), 8500, 850), hand('여명의 팔', pick(0), 10500, 950), hand('여명의 손', pick(2), 8200, 850)],
      [hand('여명의 팔', pick(0), 12500, 1050), hand('여명의 팔', pick(1), 15000, 1150, true), hand('여명의 손', pick(2), 11000, 1000)]
    ];
  }
  if (tier === 'mid') {
    return [
      [hand('여명의 팔', pick(0), 12000, 1050), hand('여명의 팔', pick(1), 12500, 1050), hand('여명의 팔', pick(2), 11500, 1050)],
      [hand('여명의 팔', pick(1), 16500, 1250), hand('여명의 강완', pick(0), 21000, 1350), hand('여명의 팔', pick(2), 16000, 1250)],
      [hand('여명의 강완', pick(0), 24000, 1450), hand('여명의 강완', pick(1), 29000, 1550, true), hand('여명의 팔', pick(2), 20000, 1400)]
    ];
  }
  if (tier === 'adv') {
    return [
      [hand('여명의 강완', pick(0), 18500, 1350), hand('여명의 강완', pick(1), 19500, 1350), hand('여명의 강완', pick(2), 18000, 1350)],
      [hand('여명의 강완', pick(1), 26000, 1550), hand('여명의 신완', pick(0), 32000, 1700), hand('여명의 강완', pick(2), 25500, 1550)],
      [hand('여명의 신완', pick(0), 38000, 1850), hand('여명의 신완', pick(1), 48000, 2000, true), hand('여명의 신완', pick(2), 36000, 1850)]
    ];
  }
  if (tier === 'sup') {
    return [
      [hand('여명의 신완', pick(0), 26000, 1650), hand('여명의 신완', pick(1), 27500, 1650), hand('여명의 신완', pick(2), 25000, 1650)],
      [hand('여명의 신완', pick(1), 36000, 1850), hand('여명의 신완', pick(0), 42000, 1950), hand('여명의 신완', pick(2), 35000, 1850)],
      [hand('여명의 신완', pick(0), 52000, 2150), hand('여명의 신완', pick(1), 68000, 2300, true), hand('여명의 신완', pick(2), 50000, 2150)]
    ];
  }
  // 극급 (3-3-1 · 여명의 염완 · 천(天) + 신성!)
  return [
    [hand('여명의 염완', pick(0), 35000, 1950, false, ['신성']), hand('여명의 염완', pick(1), 38000, 1950, false, ['신성']), hand('여명의 염완', pick(2), 34000, 1950, false, ['신성'])],
    [hand('여명의 염완', pick(1), 52000, 2200, false, ['신성']), hand('여명의 염완', pick(0), 58000, 2250, false, ['신성']), hand('여명의 염완', pick(2), 50000, 2200, false, ['신성'])],
    [hand('여명의 대염완', pick(0), 175000, 2850, true, ['신성'])]
  ];
}

function buildGateQuestCatalog() {
  const sched = getTodayGateSchedule();
  const emberLabel = sched.allOpen ? '전 7클래스 종합편 개방!' : sched.embers.join(' · ');

  const trainingDefs = [
    { cls: 'Saber',    hanja: '검(劍)', days: [0, 4, 6], dayStr: '목/토/일', boss: '알트리아 펜드래곤',   drop: '검의 비석 · 세이버 모뉴먼트 · 정령근 · 고담곡옥', emoji: '⚔️' },
    { cls: 'Archer',   hanja: '궁(弓)', days: [0, 1, 6], dayStr: '월/토/일', boss: '길가메시',           drop: '궁의 비석 · 아처 모뉴먼트 · 기기신주 · 혈루석',   emoji: '🏹' },
    { cls: 'Lancer',   hanja: '창(槍)', days: [0, 2, 6], dayStr: '화/토/일', boss: '카르나',             drop: '창의 비석 · 랜서 모뉴먼트 · 전마의 유각 · 훈장',  emoji: '🔱' },
    { cls: 'Rider',    hanja: '기(騎)', days: [0, 4, 6], dayStr: '목/토/일', boss: '이스칸다르',         drop: '기의 비석 · 라이더 모뉴먼트 · 용의 역린 · 산모',  emoji: '🐎' },
    { cls: 'Caster',   hanja: '술(術)', days: [0, 5, 6], dayStr: '금/토/일', boss: '제갈공명',           drop: '술의 비석 · 캐스터 모뉴먼트 · 만신의 심장 · 스카라베', emoji: '🔮' },
    { cls: 'Assassin', hanja: '살(殺)', days: [0, 3, 6], dayStr: '수/토/일', boss: '잭 더 리퍼',         drop: '살의 비석 · 어새신 모뉴먼트 · 흑수지 · 고스트 랜턴', emoji: '🗡️' },
    { cls: 'Berserker',hanja: '광(狂)', days: [0, 3, 6], dayStr: '수/토/일', boss: '헤라클레스',         drop: '광의 비석 · 버서커 모뉴먼트 · 주수담석 · 혼돈의 발톱', emoji: '🔥' }
  ];

  const trainingQuests = trainingDefs.map(t => ({
    id: `gate_tr_${t.cls.toLowerCase()}`,
    category: 'daily',
    subType: 'training',
    openDays: t.days,
    ap: 40,
    name: `${t.emoji} ${t.hanja}의 수련장 — 극급 (${t.dayStr})`,
    desc: `드랍: ${t.drop} (2R 희귀 소재 몬스터 · 3R ${t.boss} 출현!)`,
    difficulty: `극급 · AP 40 · 추천 Lv.60`,
    rewardText: `💎 성정석 +3 · 🔥 종화 +12 · 🟢 마프 +15 · 🪙 QP +450,000`,
    rewards: { sq: 3, embers: 12, mp: 15, qp: 450000, mcExp: 480000 },
    waves: [
      [
        { name: `${t.cls} 섀도우 병사`, cls: t.cls, attr: '지(地)', traits: ['인간형'], hp: 26000, atk: 1600, maxCharge: 4, emoji: '👤' },
        { name: `${t.cls} 섀도우 병사`, cls: t.cls, attr: '지(地)', traits: ['인간형'], hp: 28000, atk: 1650, maxCharge: 4, emoji: '👤' },
        { name: `${t.cls} 섀도우 병사`, cls: t.cls, attr: '지(地)', traits: ['인간형'], hp: 26000, atk: 1600, maxCharge: 4, emoji: '👤' }
      ],
      [
        { name: '희귀 소재 수호수 (드래곤/데몬)', cls: t.cls, attr: '지(地)', traits: ['용', '마성', '초거대'], hp: 74000, atk: 2150, maxCharge: 4, emoji: '🐉' },
        { name: `${t.cls} 정예 섀도우`, cls: t.cls, attr: '지(地)', traits: ['서번트'], hp: 42000, atk: 1900, maxCharge: 4, emoji: '👤' }
      ],
      [
        { name: `${t.boss} (수련장 보스)`, cls: t.cls, attr: '천(天)', traits: ['서번트', '신성'], hp: 148000, atk: 2700, maxCharge: 4, emoji: t.emoji, isBoss: true },
        { name: `섀도우 서번트 (${t.cls})`, cls: t.cls, attr: '인(人)', traits: ['서번트'], hp: 62000, atk: 2100, maxCharge: 4, emoji: '👤' }
      ]
    ]
  }));

  return [
    // ==================== 1) 요일 퀘스트: 종화 수집 (초~극급 5단계) ====================
    {
      id: 'gate_emb_ext', category: 'daily', subType: 'embers', openDays: [0,1,2,3,4,5,6], ap: 40,
      name: `🔥 종화 수집 — 극급 [${sched.dayKo}: ${emberLabel}]`,
      desc: '3-3-1 구성 · 여명의 염완 전원 [천(天)·신성] 속성! ★5 예지의 업화(+81,000 EXP) 9장 확정 드랍!',
      difficulty: '극급 · AP 40 · 추천 Lv.60',
      rewardText: '🔥 ★5 종화 +35 · 💎 성정석 +4 · 🪙 QP +400,000',
      rewards: { embers: 35, sq: 4, qp: 400000, mcExp: 450000 },
      waves: buildEmberWavesForTier('ext', sched.emberClasses)
    },
    {
      id: 'gate_emb_sup', category: 'daily', subType: 'embers', openDays: [0,1,2,3,4,5,6], ap: 40,
      name: `🔥 종화 수집 — 초월급 [${sched.dayKo}]`,
      desc: '3-3-3 구성 · 여명의 신완(★4 맹화·★5 업화 드랍) · 인연 615 · 전원 [천(天)] 속성!',
      difficulty: '초월급 · AP 40 · 추천 Lv.40',
      rewardText: '🔥 ★4~5 종화 +22 · 💎 성정석 +3 · 🪙 QP +250,000',
      rewards: { embers: 22, sq: 3, qp: 250000, mcExp: 310000 },
      waves: buildEmberWavesForTier('sup', sched.emberClasses)
    },
    {
      id: 'gate_emb_adv', category: 'daily', subType: 'embers', openDays: [0,1,2,3,4,5,6], ap: 30,
      name: `🔥 종화 수집 — 상급 (마프 파밍 최적)`,
      desc: '3-3-3 구성 · 여명의 강완/신완 · ★3 대화 자동판매 마나프리즘 파밍 명당!',
      difficulty: '상급 · AP 30 · 추천 Lv.25',
      rewardText: '🔥 종화 +14 · 🟢 마프 +18 · 💎 성정석 +2',
      rewards: { embers: 14, mp: 18, sq: 2, mcExp: 210000 },
      waves: buildEmberWavesForTier('adv', sched.emberClasses)
    },
    {
      id: 'gate_emb_mid', category: 'daily', subType: 'embers', openDays: [0,1,2,3,4,5,6], ap: 20,
      name: `🔥 종화 수집 — 중급`,
      desc: '3-3-3 구성 · 여명의 팔/강완 · ★2 등화·★3 대화 9장 드랍!',
      difficulty: '중급 · AP 20 · 추천 Lv.10',
      rewardText: '🔥 종화 +10 · 🟢 마프 +12 · 💎 성정석 +1',
      rewards: { embers: 10, mp: 12, sq: 1, mcExp: 130000 },
      waves: buildEmberWavesForTier('mid', sched.emberClasses)
    },
    {
      id: 'gate_emb_beg', category: 'daily', subType: 'embers', openDays: [0,1,2,3,4,5,6], ap: 10,
      name: `🔥 종화 수집 — 초급`,
      desc: '3-3-3 구성 · 여명의 손/팔 · 뉴비 입문 종화 던전!',
      difficulty: '초급 · AP 10 · 추천 Lv.5',
      rewardText: '🔥 종화 +6 · 💎 성정석 +1 · 🪙 QP +80,000',
      rewards: { embers: 6, sq: 1, qp: 80000, mcExp: 70000 },
      waves: buildEmberWavesForTier('beg', sched.emberClasses)
    },

    // ==================== 2) 요일 퀘스트: 보물창고 (QP던 초~극급 5단계) ====================
    {
      id: 'gate_qp_ext', category: 'daily', subType: 'qp', openDays: [0,1,2,3,4,5,6], ap: 40, isQpQuest: true,
      name: '💰 보물창고 — 극급 (고마운 황금상)',
      desc: '3-3-1 캐스터 [천(天)]! 패자의 문×6 → 고마운 황금상 · 기본 355만 QP + 모나리자(+10%)/벨라리자(+15%) 반영!',
      difficulty: '극급 · AP 40 · 추천 Lv.60',
      rewardText: '🪙 QP +3,550,000 (예장 보너스 적용!) · 💎 성정석 +4 · 🟢 마프 +15',
      rewards: { qp: 3550000, sq: 4, mp: 15, mcExp: 450000 },
      waves: [
        [
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 36000, atk: 1800, maxCharge: 5, emoji: '💰' },
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 38000, atk: 1850, maxCharge: 5, emoji: '💰' },
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 36000, atk: 1800, maxCharge: 5, emoji: '💰' }
        ],
        [
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 52000, atk: 2050, maxCharge: 5, emoji: '💰' },
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 56000, atk: 2100, maxCharge: 5, emoji: '💰' },
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 52000, atk: 2050, maxCharge: 5, emoji: '💰' }
        ],
        [
          { name: '고마운 황금상', cls: 'Caster', attr: '천(天)', traits: ['신성', '초거대'], hp: 168000, atk: 2700, maxCharge: 5, emoji: '🗿', isBoss: true }
        ]
      ]
    },
    {
      id: 'gate_qp_sup', category: 'daily', subType: 'qp', openDays: [0,1,2,3,4,5,6], ap: 40, isQpQuest: true,
      name: '💰 보물창고 — 초월급',
      desc: '3-3-3 성자의 문·패자의 문 (캐스터 [천(天)]) · 기본 215만 QP + QP 예장 보너스!',
      difficulty: '초월급 · AP 40 · 추천 Lv.40',
      rewardText: '🪙 QP +2,150,000 (예장 보너스!) · 💎 성정석 +3 · 🟢 마프 +10',
      rewards: { qp: 2150000, sq: 3, mp: 10, mcExp: 310000 },
      waves: [
        [
          { name: '성자의 문', cls: 'Caster', attr: '천(天)', hp: 24000, atk: 1500, maxCharge: 5, emoji: '🏛️' },
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 30000, atk: 1650, maxCharge: 5, emoji: '💰' },
          { name: '성자의 문', cls: 'Caster', attr: '천(天)', hp: 24000, atk: 1500, maxCharge: 5, emoji: '🏛️' }
        ],
        [
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 38000, atk: 1800, maxCharge: 5, emoji: '💰' },
          { name: '성자의 문', cls: 'Caster', attr: '천(天)', hp: 32000, atk: 1700, maxCharge: 5, emoji: '🏛️' },
          { name: '성자의 문', cls: 'Caster', attr: '천(天)', hp: 32000, atk: 1700, maxCharge: 5, emoji: '🏛️' }
        ],
        [
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 46000, atk: 1950, maxCharge: 5, emoji: '💰' },
          { name: '패자의 대문', cls: 'Caster', attr: '천(天)', hp: 82000, atk: 2250, maxCharge: 5, emoji: '👑', isBoss: true },
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 46000, atk: 1950, maxCharge: 5, emoji: '💰' }
        ]
      ]
    },
    {
      id: 'gate_qp_adv', category: 'daily', subType: 'qp', openDays: [0,1,2,3,4,5,6], ap: 30, isQpQuest: true,
      name: '💰 보물창고 — 상급',
      desc: '3-3-3 용사·성자·패자의 문 · 기본 108만 QP + QP 예장 보너스!',
      difficulty: '상급 · AP 30 · 추천 Lv.25',
      rewardText: '🪙 QP +1,080,000 (예장 보너스!) · 💎 성정석 +2',
      rewards: { qp: 1080000, sq: 2, mcExp: 200000 },
      waves: [
        [
          { name: '용사의 문', cls: 'Caster', attr: '천(天)', hp: 16000, atk: 1200, maxCharge: 5, emoji: '🚪' },
          { name: '성자의 문', cls: 'Caster', attr: '천(天)', hp: 20000, atk: 1350, maxCharge: 5, emoji: '🏛️' },
          { name: '용사의 문', cls: 'Caster', attr: '천(天)', hp: 16000, atk: 1200, maxCharge: 5, emoji: '🚪' }
        ],
        [
          { name: '패자의 문', cls: 'Caster', attr: '천(天)', hp: 34000, atk: 1650, maxCharge: 5, emoji: '💰', isBoss: true },
          { name: '성자의 문', cls: 'Caster', attr: '천(天)', hp: 24000, atk: 1450, maxCharge: 5, emoji: '🏛️' },
          { name: '성자의 문', cls: 'Caster', attr: '천(天)', hp: 24000, atk: 1450, maxCharge: 5, emoji: '🏛️' }
        ]
      ]
    },
    {
      id: 'gate_qp_beg', category: 'daily', subType: 'qp', openDays: [0,1,2,3,4,5,6], ap: 10, isQpQuest: true,
      name: '💰 보물창고 — 초급/중급',
      desc: '망자의 문 · 용사의 문 입문 QP 던전! 기본 35만 QP + QP 예장 보너스!',
      difficulty: '초·중급 · AP 10~20 · 추천 Lv.10',
      rewardText: '🪙 QP +350,000 (예장 보너스!) · 💎 성정석 +1',
      rewards: { qp: 350000, sq: 1, mcExp: 100000 },
      waves: [
        [
          { name: '망자의 문', cls: 'Caster', attr: '천(天)', hp: 8500, atk: 850, maxCharge: 5, emoji: '🚪' },
          { name: '용사의 문', cls: 'Caster', attr: '천(天)', hp: 12000, atk: 1000, maxCharge: 5, emoji: '🚪', isBoss: true },
          { name: '망자의 문', cls: 'Caster', attr: '천(天)', hp: 8500, atk: 850, maxCharge: 5, emoji: '🚪' }
        ]
      ]
    },

    // ==================== 3) 요일 퀘스트: 7클래스 수련장 ====================
    ...trainingQuests,

    // ==================== 4) 막간의 이야기 & 영기해방 퀘스트 ====================
    {
      id: 'gate_int_nero', category: 'interlude', ap: 20,
      name: '📖 [막간] 네로 클라우디우스 — 세 번의 낙일을 맞아도',
      desc: '3스킬 개방 전설의 막간의 이야기! 클리어 시 성정석 +2 (6주년 2배 개편 고증).',
      difficulty: '막간 · 추천 Lv.50',
      rewardText: '💎 성정석 +2 · 🔥 종화 +10 · 🪙 QP +300,000',
      rewards: { sq: 2, embers: 10, qp: 300000, mcExp: 260000 },
      waves: [
        [
          { name: '로마 병사', cls: 'Saber', attr: '인(人)', traits: ['로마', '인간형'], hp: 32000, atk: 1650, maxCharge: 4, emoji: '🛡️' },
          { name: '로마 백부장', cls: 'Lancer', attr: '인(人)', traits: ['로마', '인간형'], hp: 38000, atk: 1750, maxCharge: 4, emoji: '🔱' }
        ],
        [
          { name: '환영의 황제 네로', cls: 'Saber', attr: '인(人)', gender: '여성', align: '혼돈/선', traits: ['서번트', '로마', '왕', '알트리아 얼굴'], hp: 118000, atk: 2450, maxCharge: 4, emoji: '🌹', isBoss: true, npName: '라우스 세인트 클라우디우스' }
        ]
      ]
    },
    {
      id: 'gate_int_gil', category: 'interlude', ap: 25,
      name: '📖 [막간] 길가메시 — 개벽의 이치 (보구 강화)',
      desc: '에누마 엘리시 강화 막간의 이야기! 천(天) 속성 영웅왕과의 시련.',
      difficulty: '막간 · 추천 Lv.70',
      rewardText: '💎 성정석 +2 · 🟡 레프 +1 · 🔥 종화 +15',
      rewards: { sq: 2, rp: 1, embers: 15, mcExp: 420000 },
      waves: [
        [
          { name: '황금의 수호병', cls: 'Archer', attr: '천(天)', traits: ['신성'], hp: 46000, atk: 1950, maxCharge: 3, emoji: '✨' },
          { name: '영웅왕 길가메시 (환영)', cls: 'Archer', attr: '천(天)', gender: '남성', align: '혼돈/선', traits: ['서번트', '왕', '신성'], hp: 165000, atk: 2950, maxCharge: 3, emoji: '👑', isBoss: true, npName: '에누마 엘리시' }
        ]
      ]
    },
    {
      id: 'gate_int_angra', category: 'interlude', ap: 30,
      name: '📖 [막간] ★0 앙리마유 — 언리미티드 레이즈/데드',
      desc: '요구 인연 Lv.10 최난관 조건의 전설 막간! 그림자 영령 군단과의 사투.',
      difficulty: '막간 · 인연 Lv.10 · 추천 Lv.80',
      rewardText: '💎 성정석 +5 · 🤝 FP +10,000 · 🔥 종화 +20',
      rewards: { sq: 5, fp: 10000, embers: 20, mcExp: 550000 },
      waves: [
        [
          { name: '이 세상의 모든 악의 잔재', cls: 'Avenger', attr: '인(人)', traits: ['마성'], hp: 62000, atk: 2150, maxCharge: 5, emoji: '🖤' },
          { name: '앙리마유 (흑화 환영)', cls: 'Avenger', attr: '인(人)', gender: '남성', align: '혼돈/악', traits: ['서번트'], hp: 155000, breakBars: [130000], atk: 2800, maxCharge: 5, emoji: '💀', isBoss: true, npName: '베르그 아베스타' }
        ]
      ]
    },
    {
      id: 'gate_seal_oberon', category: 'interlude', ap: 25,
      name: '🔓 [영기해방] ★5 오베론 — Break the Seal (2부 6장)',
      desc: '아발론 르 페이 클리어 후 3차 영기 보티건 해방 퀘스트! 프리텐더 보스전.',
      difficulty: '영기해방 · 추천 Lv.85',
      rewardText: '💎 성정석 +3 · 🔥 종화 +20 · 🟢 마프 +30',
      rewards: { sq: 3, embers: 20, mp: 30, mcExp: 650000 },
      waves: [
        [
          { name: '나락의 벌레 · 모스맨', cls: 'Berserker', attr: '지(地)', traits: ['요정', '마성'], hp: 58000, atk: 2250, maxCharge: 5, emoji: '🦋' },
          { name: '오베론 보티건', cls: 'Pretender', attr: '천(天)', gender: '남성', align: '혼돈/악', traits: ['서번트', '왕', '요정', '용'], hp: 180000, breakBars: [195000], atk: 3250, maxCharge: 4, emoji: '🦋', isBoss: true, npName: '라이 라이크 보티건' }
        ]
      ]
    },
    {
      id: 'gate_seal_draco', category: 'interlude', ap: 25,
      name: '🔓 [영기해방] ★5 소돔즈 비스트/드라코 — Break the Seal',
      desc: '릴림 할롯 영기해방! 정규 7클래스 반감 · 엑스트라 클래스 2.0배 약점의 비스트Ⅵ:S!',
      difficulty: '영기해방 · 추천 Lv.85',
      rewardText: '💎 성정석 +3 · 🟡 레프 +1 · 🔥 종화 +20',
      rewards: { sq: 3, rp: 1, embers: 20, mcExp: 720000 },
      waves: [
        [
          { name: '소돔즈 비스트/드라코', cls: 'Beast', attr: '수(獸)', gender: '여성', align: '혼돈/악', traits: ['서번트', '용', '로마', '왕', '비스트', '인류의 위협'], hp: 185000, breakBars: [210000], atk: 3350, maxCharge: 5, emoji: '🐉', isBoss: true, npName: '바빌론 돔' }
        ]
      ]
    },

    // ==================== 5) 강화 퀘스트 (Rank Up Quest) ====================
    {
      id: 'gate_ru_emiya', category: 'rankup', ap: 20,
      name: '⚔️ [강화퀘] 에미야 — 최다 4회 강화의 전설 (투영마술→회로접속)',
      desc: '강화 퀘스트 4회 수혜 서번트 에미야의 시련! 클리어 시 성정석 +2.',
      difficulty: '강화퀘 · 추천 Lv.65',
      rewardText: '💎 성정석 +2 · 🔥 종화 +15 · 🟢 마프 +20',
      rewards: { sq: 2, embers: 15, mp: 20, mcExp: 360000 },
      waves: [
        [
          { name: '투영된 검의 환영', cls: 'Saber', attr: '인(人)', hp: 38000, atk: 1850, maxCharge: 4, emoji: '⚔️' },
          { name: '투영된 창의 환영', cls: 'Lancer', attr: '인(人)', hp: 40000, atk: 1900, maxCharge: 4, emoji: '🔱' }
        ],
        [
          { name: '붉은 궁병 에미야 (강화)', cls: 'Archer', attr: '인(人)', gender: '남성', align: '중립/중용', traits: ['서번트', '사랑하는 자'], hp: 145000, atk: 2700, maxCharge: 3, emoji: '🏹', isBoss: true, npName: '무한의 검제' }
        ]
      ]
    },
    {
      id: 'gate_ru_vlad', category: 'rankup', ap: 25,
      name: '⚔️ [강화퀘] 블라드 3세 — FGO 최초 2차 보구강화 (🗡️🗡️)',
      desc: '2021년 4월 강화퀘 13탄! FGO 사상 최초의 2차 보구 퀘스트를 재현.',
      difficulty: '강화퀘 · 추천 Lv.75',
      rewardText: '💎 성정석 +2 · 🔥 종화 +18 · 🪙 QP +500,000',
      rewards: { sq: 2, embers: 18, qp: 500000, mcExp: 480000 },
      waves: [
        [
          { name: '흡혈 박쥐 무리', cls: 'Assassin', attr: '지(地)', traits: ['마성', '맹수'], hp: 44000, atk: 1950, maxCharge: 3, emoji: '🦇' },
          { name: '가시공 블라드 3세', cls: 'Berserker', attr: '지(地)', gender: '남성', align: '혼돈/악', traits: ['서번트', '왕', '마성'], hp: 175000, atk: 3100, maxCharge: 5, emoji: '🧛', isBoss: true, npName: '카지클 베이' }
        ]
      ]
    },
    {
      id: 'gate_ru_angra', category: 'rankup', ap: 30,
      name: '⚔️ [강화퀘] ★0 앙리마유 — 강화퀘 최초 브레이크 비스트 3연전!',
      desc: '카마 · 드라코 · 스페이스 에레쉬키갈 3비스트가 브레이크를 들고 등장하는 전설의 강화퀘!',
      difficulty: '강화퀘 EX · 추천 Lv.90',
      rewardText: '💎 성정석 +5 · 🟡 레프 +1 · 🤝 FP +8,000',
      rewards: { sq: 5, rp: 1, fp: 8000, mcExp: 900000 },
      waves: [
        [
          { name: '■■ (마라 / 비스트Ⅲ/L)', cls: 'Assassin', attr: '수(獸)', gender: '여성', align: '혼돈/악', traits: ['서번트', '신성', '비스트'], hp: 115000, breakBars: [120000], atk: 2700, maxCharge: 3, emoji: '💘', isBoss: true },
          { name: '■■ (드라코 / 비스트Ⅵ)', cls: 'Beast', attr: '수(獸)', gender: '여성', align: '혼돈/악', traits: ['서번트', '용', '비스트'], hp: 120000, breakBars: [130000], atk: 2800, maxCharge: 5, emoji: '🐉', isBoss: true },
          { name: '■■ (에레쉬키갈 / 비스트)', cls: 'Beast', attr: '수(獸)', gender: '여성', align: '혼돈/선', traits: ['서번트', '신성', '비스트'], hp: 125000, breakBars: [135000], atk: 2850, maxCharge: 5, emoji: '🌌', isBoss: true }
        ]
      ]
    },

    // ==================== 6) 어드밴스드 퀘스트 (Advanced Quest) ====================
    {
      id: 'gate_adv_fang', category: 'advanced', ap: 5,
      name: '🏆 [어드밴스드] 5용의 시험 — 용의 송곳니 드랍 UP 기념전',
      desc: '1부 임프루브 4탄 추가! 용(龍) 특성 보스 연속 출현 — 용 특공(지크프리트·시구르드) 대활약!',
      difficulty: '어드밴스드 · AP 5 · 추천 Lv.80',
      rewardText: '💎 성정석 +5 · 🟡 레프 +1 · 🔥 종화 +25',
      rewards: { sq: 5, rp: 1, embers: 25, mcExp: 650000 },
      waves: [
        [
          { name: '와이번 드레드', cls: 'Rider', attr: '지(地)', traits: ['용', '맹수'], hp: 68000, atk: 2250, maxCharge: 5, emoji: '🐉' },
          { name: '와이번 에빌', cls: 'Rider', attr: '지(地)', traits: ['용', '맹수'], hp: 72000, atk: 2300, maxCharge: 5, emoji: '🐉' },
          { name: '파프니르 (고룡)', cls: 'Rider', attr: '지(地)', traits: ['용', '초거대'], hp: 190000, breakBars: [165000], atk: 3200, maxCharge: 5, emoji: '🐲', isBoss: true }
        ]
      ]
    },
    {
      id: 'gate_adv_heart', category: 'advanced', ap: 5,
      name: '🏆 [어드밴스드] 신대의 마수전 — 만신의 심장 드랍 UP 기념전',
      desc: '초거대·마성 데몬 군단 고난이도전! 라이더·얼터에고 및 마성/초거대 특공 딜러 추천!',
      difficulty: '어드밴스드 · AP 5 · 추천 Lv.85',
      rewardText: '💎 성정석 +5 · 🟡 레프 +1 · 🪙 QP +1,500,000',
      rewards: { sq: 5, rp: 1, qp: 1500000, mcExp: 780000 },
      waves: [
        [
          { name: '에인션트 데몬', cls: 'Caster', attr: '천(天)', traits: ['마성', '초거대'], hp: 120000, atk: 2650, maxCharge: 5, emoji: '👹' },
          { name: '심연의 대악마', cls: 'Caster', attr: '천(天)', traits: ['마성', '초거대', '인류의 위협'], hp: 220000, breakBars: [195000], atk: 3350, maxCharge: 5, emoji: '😈', isBoss: true }
        ]
      ]
    },

    // ==================== 7) 마술예장 퀘스트 3종 (원작 적 HP 100% 고증!) & 과거 이벤트 ====================
    {
      id: 'gate_mc_plugsuit', category: 'mc_past', ap: 40, unlockMcId: 'mc_plugsuit',
      name: '🧤 [마술예장 퀘스트] 칼데아 전투복 (원작 최종 진행도)',
      desc: '1/2 테러 고스트(어새신) Lv.36×3 → 2/2 데몬(캐스터) Lv.40 HP 303,554! 클리어 시 칼데아 전투복 해금!',
      difficulty: 'AP 40 · 추천 Lv.50',
      rewardText: '🧤 칼데아 전투복 해금 · 💎 성정석 +5 · 🔥 종화 +15',
      rewards: { sq: 5, embers: 15, qp: 540000, mcExp: 350000 },
      waves: [
        [
          { name: '테러 고스트 Lv.36', cls: 'Assassin', attr: '지(地)', traits: ['마성', '사령'], hp: 32144, atk: 1650, maxCharge: 3, emoji: '👻' },
          { name: '테러 고스트 Lv.36', cls: 'Assassin', attr: '지(地)', traits: ['마성', '사령'], hp: 32144, atk: 1650, maxCharge: 3, emoji: '👻' },
          { name: '테러 고스트 Lv.36', cls: 'Assassin', attr: '지(地)', traits: ['마성', '사령'], hp: 32144, atk: 1650, maxCharge: 3, emoji: '👻' }
        ],
        [
          { name: '데몬 Lv.40', cls: 'Caster', attr: '천(天)', traits: ['마성', '초거대'], hp: 303554, atk: 2750, maxCharge: 5, emoji: '👹', isBoss: true }
        ]
      ]
    },
    {
      id: 'gate_mc_mage', category: 'mc_past', ap: 40, unlockMcId: 'mc_mage_assoc',
      name: '🧤 [마술예장 퀘스트] 마술협회 제복 (원작 최종 진행도)',
      desc: '스펠북/파이어·윈드·아이스북 → 3/3 그리모어(캐스터) Lv.49 HP 124,951! 클리어 시 마술협회 제복 해금!',
      difficulty: 'AP 40 · 추천 Lv.50',
      rewardText: '🧤 마술협회 제복 해금 · 💎 성정석 +5 · 🔥 종화 +15',
      rewards: { sq: 5, embers: 15, qp: 540000, mcExp: 350000 },
      waves: [
        [
          { name: '스펠 북 Lv.39', cls: 'Caster', attr: '천(天)', traits: ['마성'], hp: 26477, atk: 1550, maxCharge: 5, emoji: '📘' },
          { name: '스펠 북 Lv.39', cls: 'Caster', attr: '천(天)', traits: ['마성'], hp: 26477, atk: 1550, maxCharge: 5, emoji: '📘' },
          { name: '선더 북 Lv.36', cls: 'Caster', attr: '천(天)', traits: ['마성'], hp: 28579, atk: 1600, maxCharge: 5, emoji: '⚡' }
        ],
        [
          { name: '파이어 북 Lv.39', cls: 'Caster', attr: '천(天)', traits: ['마성'], hp: 32156, atk: 1700, maxCharge: 5, emoji: '🔥' },
          { name: '윈드 북 Lv.39', cls: 'Caster', attr: '천(天)', traits: ['마성'], hp: 32156, atk: 1700, maxCharge: 5, emoji: '🌪️' },
          { name: '아이스 북 Lv.44', cls: 'Caster', attr: '천(天)', traits: ['마성'], hp: 40597, atk: 1850, maxCharge: 5, emoji: '❄️' }
        ],
        [
          { name: '스펠 북 Lv.47', cls: 'Caster', attr: '천(天)', traits: ['마성'], hp: 44530, atk: 1950, maxCharge: 5, emoji: '📘' },
          { name: '그리모어 Lv.49', cls: 'Caster', attr: '천(天)', traits: ['마성'], hp: 124951, atk: 2550, maxCharge: 5, emoji: '📖', isBoss: true },
          { name: '스펠 북 Lv.47', cls: 'Caster', attr: '천(天)', traits: ['마성'], hp: 44530, atk: 1950, maxCharge: 5, emoji: '📘' }
        ]
      ]
    },
    {
      id: 'gate_mc_atlas', category: 'mc_past', ap: 40, unlockMcId: 'mc_atlas',
      name: '🧤 [마술예장 퀘스트] 아틀라스원 제복 (원작 최종 진행도)',
      desc: '호문쿨루스(랜서) → 키메라(버서커) → 3/3 화이트 키메라(버서커) Lv.46 HP 191,624! 클리어 시 아틀라스원 해금!',
      difficulty: 'AP 40 · 추천 Lv.50',
      rewardText: '🧤 아틀라스원 제복 해금 · 💎 성정석 +5 · 🔥 종화 +15',
      rewards: { sq: 5, embers: 15, qp: 540000, mcExp: 350000 },
      waves: [
        [
          { name: '호문쿨루스 Lv.33', cls: 'Lancer', attr: '인(人)', traits: ['인간형'], hp: 28080, atk: 1550, maxCharge: 4, emoji: '🧬' },
          { name: '호문쿨루스 Lv.36', cls: 'Lancer', attr: '인(人)', traits: ['인간형'], hp: 30086, atk: 1600, maxCharge: 4, emoji: '🧬' },
          { name: '호문쿨루스 Lv.33', cls: 'Lancer', attr: '인(人)', traits: ['인간형'], hp: 28080, atk: 1550, maxCharge: 4, emoji: '🧬' }
        ],
        [
          { name: '키메라 Lv.36', cls: 'Berserker', attr: '지(地)', traits: ['맹수', '마성'], hp: 36585, atk: 1950, maxCharge: 5, emoji: '🦁' },
          { name: '키메라 Lv.40', cls: 'Berserker', attr: '지(地)', traits: ['맹수', '마성'], hp: 48230, atk: 2150, maxCharge: 5, emoji: '🦁' },
          { name: '키메라 Lv.36', cls: 'Berserker', attr: '지(地)', traits: ['맹수', '마성'], hp: 36585, atk: 1950, maxCharge: 5, emoji: '🦁' }
        ],
        [
          { name: '화이트 키메라 Lv.46', cls: 'Berserker', attr: '지(地)', traits: ['맹수', '마성', '초거대'], hp: 191624, atk: 2950, maxCharge: 5, emoji: '🦁', isBoss: true }
        ]
      ]
    },
    {
      id: 'gate_past_prison', category: 'mc_past', ap: 40,
      name: '⛓️ [과거 이벤트] 감옥탑에서 복수귀는 울부짖는다 (무료 개방)',
      desc: '1부 4장 클리어 무료화 이벤트! 칠죄종 사도와 암굴왕 에드몽 당테스의 복수전.',
      difficulty: '고난이도 · 추천 Lv.80',
      rewardText: '💎 성정석 +10 · 🎫 호부 +1 · 🔥 종화 +20',
      rewards: { sq: 10, tickets: 1, embers: 20, mcExp: 720000 },
      waves: [
        [
          { name: '분노의 유령 (어벤저)', cls: 'Avenger', attr: '인(人)', traits: ['사령', '마성'], hp: 58000, atk: 2150, maxCharge: 5, emoji: '⛓️' },
          { name: '암굴왕 에드몽 당테스', cls: 'Avenger', attr: '인(人)', gender: '남성', align: '혼돈/악', traits: ['서번트'], hp: 185000, breakBars: [170000], atk: 3150, maxCharge: 5, emoji: '🔥', isBoss: true, npName: '앙페르 샤토 디프' }
        ]
      ]
    },
    {
      id: 'gate_past_bunyan', category: 'mc_past', ap: 20,
      name: '🪓 [과거 이벤트] 올 더 스테이츠멘! ~합중국 개척사~ (무료 개방)',
      desc: '만화로 알아보는 FGO! 초거대 ★1 폴 버니언과 함께하는 유쾌한 개척전.',
      difficulty: '중급 · 추천 Lv.55',
      rewardText: '💎 성정석 +10 · 🔥 종화 +20 · 🪙 QP +800,000',
      rewards: { sq: 10, embers: 20, qp: 800000, mcExp: 350000 },
      waves: [
        [
          { name: '개척지의 맹수', cls: 'Berserker', attr: '지(地)', traits: ['맹수'], hp: 42000, atk: 1850, maxCharge: 5, emoji: '🐂' },
          { name: '거인 소녀 폴 버니언', cls: 'Berserker', attr: '인(人)', gender: '여성', align: '중립/중용', traits: ['서번트', '어린이', '초거대', '거인'], hp: 132000, atk: 2550, maxCharge: 5, emoji: '🪓', isBoss: true, npName: '마블러스 익스플로이츠' }
        ]
      ]
    }
  ];
}
