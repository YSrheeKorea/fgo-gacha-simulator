// ============================================================
// CHALDEA SUMMON SIMULATOR — 원작 FGO 마술예장 28종 전체 데이터 (mystic_codes.js)
// - 1. 마술예장 칼데아 ~ 28. 칼데아 학원제복 (총 28종 · 마스터 스킬 84종)
// - 원작 4종 공식 누적 경험치 테이블 (7,660,000 / 8,950,000 / 70,605,000 / 155,331,000)
// - 스킬 Lv.1~Lv.10 정확한 수치 보간 & Lv.6(-1T) / Lv.10(-2T) 쿨타임 감소
// - Atlas Academy KR/JP 공식 마술예장 아이콘 URL 포함
// ============================================================

// 원작 FGO 마술예장 누적 경험치 테이블 4종 (인덱스 0 = Lv.1, 인덱스 9 = Lv.10)
const MYSTIC_CODE_EXP_CURVES = {
  chaldea:  [0, 10000, 40000, 100000, 220000, 460000, 940000, 1900000, 3820000, 7660000],
  event:    [0, 53000, 132500, 305000, 609000, 1218000, 2200000, 3727000, 5963000, 8950000],
  standard: [0, 1569000, 4707000, 9414000, 15690000, 23535000, 32949000, 43932000, 56484000, 70605000],
  part2:    [0, 3451800, 10355400, 20710800, 34518000, 51777000, 72487800, 96650400, 124264800, 155331000]
};

// 기본 해금(스토리/상시) 마술예장 7종 — 나머지 21종은 다 빈치 공방/마술예장 선택기에서 해금 가능!
const DEFAULT_UNLOCKED_MYSTIC_CODES = [
  'mc_chaldea',
  'mc_combat',
  'mc_mage_assoc',
  'mc_atlas',
  'mc_arctic',
  'mc_decisive',
  'mc_normal_chaldea'
];

// Lv.1~Lv.10 선형 보간 (원작 FGO 마술예장 10단계 표와 일치)
function interpMcVal(v1, v10, lv, roundStep = 0) {
  const clamped = Math.max(1, Math.min(10, Number(lv) || 1));
  if (clamped === 1) return v1;
  if (clamped === 10) return v10;
  // 원작 FGO 규칙: Lv.1~9는 step 단위, Lv.10에서 점프하는 경우(예: 1000->3000은 +200씩, Lv.9=2600, Lv.10=3000)
  const raw = v1 + ((v10 - v1) * (clamped - 1)) / 9;
  if (roundStep > 0) return Math.round(raw / roundStep) * roundStep;
  return Math.round(raw * 1000) / 1000;
}

// 쿨타임 계산 (Lv.1~5: base, Lv.6~9: base-1, Lv.10: base-2)
function getMcSkillCd(cdBase, lv) {
  const clamped = Math.max(1, Math.min(10, Number(lv) || 1));
  if (clamped >= 10) return cdBase - 2;
  if (clamped >= 6) return cdBase - 1;
  return cdBase;
}

// 경험치로 현재 레벨 계산 (1~10)
function getMcLevelFromExp(expCurveKey, exp) {
  const table = MYSTIC_CODE_EXP_CURVES[expCurveKey] || MYSTIC_CODE_EXP_CURVES.event;
  let lv = 1;
  for (let i = 1; i < table.length; i++) {
    if (exp >= table[i]) lv = i + 1;
    else break;
  }
  return Math.min(10, lv);
}

// 마술예장 28종 전체 목록 (원작 실장 순서 2.1 ~ 2.28)
const MYSTIC_CODES = [
  {
    id: 'mc_chaldea',
    atlasId: 1,
    no: 1,
    name: '마술예장 칼데아',
    category: '상시·기본',
    obtain: '게임 시작 시 기본 지급',
    expCurve: 'chaldea',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00002.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00001.png',
    emoji: '🧥',
    desc: '인리계속보장기관 칼데아의 마스터에게 기본 지급되는 마술예장. 순간 강화(+50%)와 긴급회피로 범용성이 뛰어납니다.',
    skills: [
      {
        name: '응급처치', icon: '💚', cdBase: 9, target: 'ally',
        effects: { heal: [1000, 3000] },
        descFn: (lv) => `아군 한 명의 HP ${interpMcVal(1000, 3000, lv, 100).toLocaleString()} 회복`
      },
      {
        name: '순간 강화', icon: '⚔️', cdBase: 15, target: 'ally',
        effects: { atk: [0.30, 0.50] },
        descFn: (lv) => `아군 한 명의 공격력 +${Math.round(interpMcVal(30, 50, lv, 1))}% (1턴)`
      },
      {
        name: '긴급회피', icon: '💨', cdBase: 15, target: 'ally',
        effects: { evade: 1 },
        descFn: () => '아군 한 명에게 회피 상태 부여 (1턴)'
      }
    ]
  },
  {
    id: 'mc_combat',
    atlasId: 20,
    no: 2,
    name: '마술예장 칼데아 전투복',
    category: '상시·퀘스트',
    obtain: '칼데아 게이트 [칼데아 전투복] 퀘스트 클리어',
    expCurve: 'standard',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00022.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00021.png',
    emoji: '🥋',
    desc: '전설의 오더 체인지(오첸) + 간드(확정 스턴) + 전체 강화! 3턴 주회와 고난이도 모두의 핵심 예장.',
    skills: [
      {
        name: '전체 강화', icon: '🔥', cdBase: 12, target: 'all',
        effects: { atk: [0.20, 0.30] },
        descFn: (lv) => `아군 전체 공격력 +${Math.round(interpMcVal(20, 30, lv, 1))}% (1턴)`
      },
      {
        name: '간드', icon: '⚡', cdBase: 15, target: 'enemy',
        effects: { stun: 1 },
        descFn: () => '타겟 적에게 스턴 상태 부여 (1턴 · 500%)'
      },
      {
        name: '오더 체인지', icon: '🔄', cdBase: 15, target: 'order_change',
        effects: { orderChange: 1 },
        descFn: () => '전열 멤버 1명과 후열 서브 멤버 1명을 교체 (버프 유지 · 덱 리셋 없음)'
      }
    ]
  },
  {
    id: 'mc_mage_assoc',
    atlasId: 30,
    no: 3,
    name: '마술예장 마술협회 제복',
    category: '상시·퀘스트',
    obtain: '칼데아 게이트 [마술협회 제복] 퀘스트 클리어',
    expCurve: 'standard',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00032.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00031.png',
    emoji: '🎓',
    desc: '아군 1체 NP +20% 충전 [영자 양도]와 유일무이한 [커맨드 셔플]을 보유한 마술협회 시계탑 제복.',
    skills: [
      {
        name: '전체 회복', icon: '💚', cdBase: 12, target: 'all',
        effects: { heal: [800, 2800] },
        descFn: (lv) => `아군 전체 HP ${interpMcVal(800, 2800, lv, 100).toLocaleString()} 회복`
      },
      {
        name: '영자 양도', icon: '💎', cdBase: 15, target: 'ally',
        effects: { np: [20, 20] },
        descFn: () => '아군 한 명의 NP +20% 증가'
      },
      {
        name: '커맨드 셔플', icon: '🃏', cdBase: 15, target: 'shuffle',
        effects: { shuffle: 1 },
        descFn: () => '현재 턴의 커맨드 카드 5장을 새로 재분배'
      }
    ]
  },
  {
    id: 'mc_atlas',
    atlasId: 40,
    no: 4,
    name: '마술예장 아틀라스원 제복',
    category: '상시·퀘스트',
    obtain: '칼데아 게이트 [아틀라스원 제복] 퀘스트 클리어',
    expCurve: 'standard',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00042.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00041.png',
    emoji: '🏛️',
    desc: '무적·약화해제·쿨타임 -2턴 [메제드의 눈]으로 구성된 최강의 고난이도·버스터 시스템 특화 예장.',
    skills: [
      {
        name: '오시리스의 먼지', icon: '🛡️', cdBase: 15, target: 'ally',
        effects: { invul: 1 },
        descFn: () => '아군 한 명에게 무적 상태 부여 (1턴)'
      },
      {
        name: '이시스의 비', icon: '💧', cdBase: 15, target: 'ally',
        effects: { cleanse: 'all' },
        descFn: () => '아군 한 명의 모든 약화 상태 해제'
      },
      {
        name: '메제드의 눈', icon: '👁️', cdBase: 15, target: 'ally',
        effects: { cdReduce: 2 },
        descFn: () => '아군 한 명의 스킬 쿨타임 2턴 감소'
      }
    ]
  },
  {
    id: 'mc_anniv_blonde',
    atlasId: 50,
    no: 5,
    name: '애니버서리 블론드',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (구 500만 DL 기념)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00052.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00051.png',
    emoji: '🦁',
    desc: '기사왕의 사복을 본뜬 버스터 극딜 예장! 버스터 +60%, 스타 +20, 근성(최대 4,000 부활) 보유.',
    skills: [
      {
        name: '마력방출', icon: '🔴', cdBase: 15, target: 'ally',
        effects: { buster: [0.40, 0.60] },
        descFn: (lv) => `아군 한 명의 버스터 카드 성능 +${Math.round(interpMcVal(40, 60, lv, 1))}% (1턴)`
      },
      {
        name: '승리에 대한 확신', icon: '⭐', cdBase: 12, target: 'none',
        effects: { stars: [10, 20] },
        descFn: (lv) => `크리티컬 스타 +${Math.round(interpMcVal(10, 20, lv, 1))} 대량 획득`
      },
      {
        name: '기사의 맹세', icon: '❤️‍🔥', cdBase: 15, target: 'ally',
        effects: { guts: [2000, 4000] },
        descFn: (lv) => `아군 한 명에게 근성 부여 (1회·1턴 · HP ${interpMcVal(2000, 4000, lv, 100).toLocaleString()} 부활)`
      }
    ]
  },
  {
    id: 'mc_royal_brand',
    atlasId: 60,
    no: 6,
    name: '로열 브랜드',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (Fate/Zero 콜라보)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00062.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00061.png',
    emoji: '🤵',
    desc: 'Fate/Zero 세이버 정장! 퀵 +50%, 스타 집중 +1000%, 필중 부여로 퀵 크리티컬 딜러에 최적화.',
    skills: [
      {
        name: '반응 강화', icon: '🟢', cdBase: 15, target: 'ally',
        effects: { quick: [0.30, 0.50] },
        descFn: (lv) => `아군 한 명의 퀵 카드 성능 +${Math.round(interpMcVal(30, 50, lv, 1))}% (1턴)`
      },
      {
        name: '철의 전심', icon: '🎯', cdBase: 12, target: 'ally',
        effects: { starWeight: [500, 1000] },
        descFn: (lv) => `아군 한 명의 스타 집중도 +${Math.round(interpMcVal(500, 1000, lv, 50))}% (1턴)`
      },
      {
        name: '필지', icon: '👁️‍🗨️', cdBase: 10, target: 'ally',
        effects: { sureHit: 1 },
        descFn: () => '아군 한 명에게 필중 상태 부여 (1턴)'
      }
    ]
  },
  {
    id: 'mc_brilliant_summer',
    atlasId: 70,
    no: 7,
    name: '브릴리언트 서머',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (2016 여름 이벤트)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00072.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00071.png',
    emoji: '🏖️',
    desc: '아군 전체 퀵 +30%, 무적 관통, HP 회복 + NP 10% 충전까지 갖춘 여름 퀵 서포트 예장.',
    skills: [
      {
        name: '럼블 파티', icon: '🟢', cdBase: 15, target: 'all',
        effects: { quick: [0.20, 0.30] },
        descFn: (lv) => `아군 전체 퀵 카드 성능 +${Math.round(interpMcVal(20, 30, lv, 1))}% (1턴)`
      },
      {
        name: '필살 트라이던트', icon: '🔱', cdBase: 12, target: 'ally',
        effects: { invulPierce: 1 },
        descFn: () => '아군 한 명에게 무적 관통 상태 부여 (1턴)'
      },
      {
        name: '씨 하우스 샤워', icon: '🌊', cdBase: 12, target: 'ally',
        effects: { heal: [1000, 3000], np: [10, 10] },
        descFn: (lv) => `아군 한 명의 HP ${interpMcVal(1000, 3000, lv, 100).toLocaleString()} 회복 & NP +10%`
      }
    ]
  },
  {
    id: 'mc_lunar_sea',
    atlasId: 80,
    no: 8,
    name: '달의 바다의 기억',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (Fate/EXTELLA 기념)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00082.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00081.png',
    emoji: '🌙',
    desc: '아츠 +50%, 스타 발생률 +100%, 적 강화 무효(1회) [퍼니시먼트]를 갖춘 츠쿠미하라 교복 예장.',
    skills: [
      {
        name: '영자향상', icon: '🔵', cdBase: 15, target: 'ally',
        effects: { arts: [0.30, 0.50] },
        descFn: (lv) => `아군 한 명의 아츠 카드 성능 +${Math.round(interpMcVal(30, 50, lv, 1))}% (1턴)`
      },
      {
        name: '완승으로의 포석', icon: '✨', cdBase: 12, target: 'ally',
        effects: { starGen: [0.50, 1.00] },
        descFn: (lv) => `아군 한 명의 스타 발생률 +${Math.round(interpMcVal(50, 100, lv, 5))}% (1턴)`
      },
      {
        name: '퍼니시먼트', icon: '🚫', cdBase: 15, target: 'enemy',
        effects: { buffBlock: 1 },
        descFn: () => '타겟 적에게 강화 무효 상태(1회) 부여'
      }
    ]
  },
  {
    id: 'mc_far_side',
    atlasId: 90,
    no: 9,
    name: '달의 뒤편의 기억',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (CCC 콜라보 기념)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00092.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00091.png',
    emoji: '🌘',
    desc: '아군 전체 아츠 +30%, 약화 무효(1회), 유일한 적 차지 -1칸 [다운·슬라이드]를 가진 아츠 고난이도 예장.',
    skills: [
      {
        name: '영자향상·전', icon: '🔵', cdBase: 15, target: 'all',
        effects: { arts: [0.20, 0.30] },
        descFn: (lv) => `아군 전체 아츠 카드 성능 +${Math.round(interpMcVal(20, 30, lv, 1))}% (1턴)`
      },
      {
        name: '생존으로의 포석', icon: '🔰', cdBase: 12, target: 'ally',
        effects: { debuffImmune: 1 },
        descFn: () => '아군 한 명에게 약화 무효 상태(1회) 부여'
      },
      {
        name: '다운·슬라이드', icon: '⏬', cdBase: 15, target: 'enemy',
        effects: { drainCharge: 1 },
        descFn: () => '타겟 적의 차지를 1칸 감소'
      }
    ]
  },
  {
    id: 'mc_fragment_2004',
    atlasId: 100,
    no: 10,
    name: '2004년의 단편',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (HF 1장 개봉 기념)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00102.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00101.png',
    emoji: '🏫',
    desc: '보구 위력 +50% · 버스터 스타집중 +10,000% · NP 획득량 +50%! 3턴 시스템 주회의 명품 예장.',
    skills: [
      {
        name: '코드:F', icon: '💥', cdBase: 12, target: 'ally',
        effects: { npDmg: [0.30, 0.50] },
        descFn: (lv) => `아군 한 명의 보구 위력 +${Math.round(interpMcVal(30, 50, lv, 1))}% (1턴)`
      },
      {
        name: '코드:U', icon: '🔴', cdBase: 12, target: 'ally',
        effects: { busterStarWeight: [5000, 10000] },
        descFn: (lv) => `아군 한 명의 버스터 카드 스타 집중도 +${Math.round(interpMcVal(5000, 10000, lv, 500)).toLocaleString()}% (1턴)`
      },
      {
        name: '코드:H', icon: '💎', cdBase: 12, target: 'ally',
        effects: { npGain: [0.30, 0.50] },
        descFn: (lv) => `아군 한 명의 NP 획득량 +${Math.round(interpMcVal(30, 50, lv, 1))}% (1턴)`
      }
    ]
  },
  {
    id: 'mc_arctic',
    atlasId: 110,
    no: 11,
    name: '마술예장 극지용 칼데아 제복',
    category: '스토리·2부',
    obtain: '2부 프롤로그 / 2부 1장 입수',
    expCurve: 'part2',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00112.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00111.png',
    emoji: '❄️',
    desc: '공격력 +40% & 보구 위력 +20% 곱연산 [환상강화]와 회피(1회·3T)를 갖춘 2부 메인 제복.',
    skills: [
      {
        name: '정화회복', icon: '💚', cdBase: 12, target: 'ally',
        effects: { heal: [1000, 3000], cleanse: 'def' },
        descFn: (lv) => `아군 한 명의 HP ${interpMcVal(1000, 3000, lv, 100).toLocaleString()} 회복 & 방어 약화 해제`
      },
      {
        name: '환상강화', icon: '⚔️', cdBase: 15, target: 'ally',
        effects: { atk: [0.20, 0.40], npDmg: [0.10, 0.20] },
        descFn: (lv) => `아군 한 명의 공격력 +${Math.round(interpMcVal(20, 40, lv, 1))}% & 보구 위력 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '예측회피', icon: '💨', cdBase: 12, target: 'ally',
        effects: { evadeHits: 1, evadeT: 3 },
        descFn: () => '아군 한 명에게 회피 상태 부여 (1회·3턴)'
      }
    ]
  },
  {
    id: 'mc_tropical_summer',
    atlasId: 120,
    no: 12,
    name: '트로피컬 서머',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (서번트 서머 페스티벌)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00122.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00121.png',
    emoji: '🌺',
    desc: '아츠+보뻥 곱연산 + 아츠 스타집중 +10,000% + 강화해제 내성 & NP 10% 충전의 아츠 특화 예장.',
    skills: [
      {
        name: '블루 스플래시', icon: '🔵', cdBase: 15, target: 'ally',
        effects: { arts: [0.20, 0.30], npDmg: [0.10, 0.20] },
        descFn: (lv) => `아군 한 명의 아츠 +${Math.round(interpMcVal(20, 30, lv, 1))}% & 보구 위력 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '서플라이 워터', icon: '💧', cdBase: 12, target: 'ally',
        effects: { artsStarWeight: [5000, 10000] },
        descFn: (lv) => `아군 한 명의 아츠 카드 스타 집중도 +${Math.round(interpMcVal(5000, 10000, lv, 500)).toLocaleString()}% (1턴)`
      },
      {
        name: '세이프티 오일', icon: '🧴', cdBase: 12, target: 'ally',
        effects: { buffProtect: [0.50, 1.00], np: [10, 10] },
        descFn: (lv) => `아군 한 명의 강화 해제 내성 +${Math.round(interpMcVal(50, 100, lv, 5))}% (1턴) & NP +10%`
      }
    ]
  },
  {
    id: 'mc_new_year',
    atlasId: 130,
    no: 13,
    name: '경사스런 신년',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (2019 신년 캠페인)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00132.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00131.png',
    emoji: '🎍',
    desc: '아군 전체 보구 위력 +35% [퍼스트 샤인]과 NP +10% + 스타 +15 [리틀 기프트]의 주회용 신년 예장.',
    skills: [
      {
        name: '퍼스트 샤인', icon: '🌅', cdBase: 12, target: 'all',
        effects: { npDmg: [0.25, 0.35] },
        descFn: (lv) => `아군 전체 보구 위력 +${Math.round(interpMcVal(25, 35, lv, 1))}% (1턴)`
      },
      {
        name: '리틀 기프트', icon: '🎁', cdBase: 12, target: 'ally',
        effects: { np: [10, 10], stars: [5, 15] },
        descFn: (lv) => `아군 한 명의 NP +10% & 스타 +${Math.round(interpMcVal(5, 15, lv, 1))} 획득`
      },
      {
        name: '오세치 패키지', icon: '🍱', cdBase: 10, target: 'ally',
        effects: { maxHpUp: [1000, 3000] },
        descFn: (lv) => `아군 한 명의 최대 HP +${interpMcVal(1000, 3000, lv, 100).toLocaleString()} UP (1턴)`
      }
    ]
  },
  {
    id: 'mc_captain_chaldea',
    atlasId: 150,
    no: 14,
    name: '캡틴 칼데아',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (세이버워즈2)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00152.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00151.png',
    emoji: '🚀',
    desc: '보구 위력 +50% + 크리 위력 +50% + 회피(1회·3T) & HP 회복을 갖춘 우주복 예장.',
    skills: [
      {
        name: '오버 차저', icon: '💥', cdBase: 15, target: 'ally',
        effects: { npDmg: [0.30, 0.50], cleanse: 'atk' },
        descFn: (lv) => `아군 한 명의 보구 위력 +${Math.round(interpMcVal(30, 50, lv, 1))}% (1턴) & 공격 약화 해제`
      },
      {
        name: '스타 블래스터', icon: '🌠', cdBase: 12, target: 'ally',
        effects: { crit: [0.30, 0.50] },
        descFn: (lv) => `아군 한 명의 크리티컬 위력 +${Math.round(interpMcVal(30, 50, lv, 1))}% (1턴)`
      },
      {
        name: '이스케이프 포드', icon: '🛸', cdBase: 15, target: 'ally',
        effects: { evadeHits: 1, evadeT: 3, heal: [1000, 3000] },
        descFn: (lv) => `아군 한 명에게 회피(1회·3턴) & HP ${interpMcVal(1000, 3000, lv, 100).toLocaleString()} 회복`
      }
    ]
  },
  {
    id: 'mc_babylonia',
    atlasId: 160,
    no: 15,
    name: '제5진설요소환경용 칼데아 제복',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (바빌로니아 애니 기념)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00162.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00161.png',
    emoji: '🏺',
    desc: '아군 전체 버스터 +35%, 3턴 지속 도트힐(총 6,000), NP +10% & NP 획득량 +40%의 바빌로니아 제복.',
    skills: [
      {
        name: '일제돌격', icon: '🔴', cdBase: 15, target: 'all',
        effects: { buster: [0.25, 0.35] },
        descFn: (lv) => `아군 전체 버스터 카드 성능 +${Math.round(interpMcVal(25, 35, lv, 1))}% (1턴)`
      },
      {
        name: '삼중치료', icon: '💚', cdBase: 12, target: 'ally',
        effects: { regen: [1000, 2000], regenT: 3 },
        descFn: (lv) => `아군 한 명에게 매 턴 HP ${interpMcVal(1000, 2000, lv, 100).toLocaleString()} 회복 부여 (3턴)`
      },
      {
        name: '마력변환', icon: '💎', cdBase: 12, target: 'ally',
        effects: { np: [10, 10], npGain: [0.20, 0.40] },
        descFn: (lv) => `아군 한 명의 NP +10% & NP 획득량 +${Math.round(interpMcVal(20, 40, lv, 2))}% (1턴)`
      }
    ]
  },
  {
    id: 'mc_pathfinder',
    atlasId: 170,
    no: 16,
    name: '칼데아 패스파인더',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (칼데아 스릴러 나이트)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00172.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00171.png',
    emoji: '🏕️',
    desc: '퀵+보뻥 곱연산, 아군 전체 크리 위력 +30%, 독/저주/화상 해제 + NP +10%의 여름 캠프 스카우트 예장.',
    skills: [
      {
        name: '오리엔티어링', icon: '🟢', cdBase: 15, target: 'ally',
        effects: { quick: [0.20, 0.30], npDmg: [0.10, 0.20] },
        descFn: (lv) => `아군 한 명의 퀵 +${Math.round(interpMcVal(20, 30, lv, 1))}% & 보구 위력 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '캠프파이어', icon: '🔥', cdBase: 12, target: 'all',
        effects: { crit: [0.20, 0.30] },
        descFn: (lv) => `아군 전체 크리티컬 위력 +${Math.round(interpMcVal(20, 30, lv, 1))}% (1턴)`
      },
      {
        name: '서바이벌 키트', icon: '🧰', cdBase: 12, target: 'ally',
        effects: { cleanse: 'dot', np: [10, 10] },
        descFn: () => '아군 한 명의 독·저주·화상 해제 & NP +10%'
      }
    ]
  },
  {
    id: 'mc_halloween_royalty',
    atlasId: 190,
    no: 17,
    name: '할로윈 로열티',
    category: '레프·한정',
    obtain: '레어프리즘 교환 (할로윈 라이징)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00192.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00191.png',
    emoji: '🎃',
    desc: '버스터+보뻥 곱연산 + 무적(2회·1T) + 행동불가 해제 & NP +10%의 화려한 할로윈 정장 예장.',
    skills: [
      {
        name: '빛의 에스코트', icon: '🔴', cdBase: 15, target: 'ally',
        effects: { buster: [0.20, 0.30], npDmg: [0.10, 0.20] },
        descFn: (lv) => `아군 한 명의 버스터 +${Math.round(interpMcVal(20, 30, lv, 1))}% & 보구 위력 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '순결의 코디네이트', icon: '🛡️', cdBase: 12, target: 'ally',
        effects: { invulHits: 2 },
        descFn: () => '아군 한 명에게 무적 상태 부여 (2회·1턴)'
      },
      {
        name: '행복의 리제너레이트', icon: '💎', cdBase: 12, target: 'ally',
        effects: { cleanse: 'cc', np: [10, 10] },
        descFn: () => '아군 한 명의 행동불가·봉인 해제 & NP +10%'
      }
    ]
  },
  {
    id: 'mc_decisive',
    atlasId: 210,
    no: 18,
    name: '결전용 칼데아 제복',
    category: '스토리·2부',
    obtain: '2부 비공식/퉁구스카 · 스톰 보더 제복',
    expCurve: 'part2',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00212.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00211.png',
    emoji: '🎖️',
    desc: '최강 오더 체인지 예장! 전체 공+20% × 보뻥+20% 곱연산 [결전강화]로 전투복의 상위 화력을 자랑합니다.',
    skills: [
      {
        name: '결전강화', icon: '⚔️', cdBase: 15, target: 'all',
        effects: { atk: [0.10, 0.20], npDmg: [0.10, 0.20] },
        descFn: (lv) => `아군 전체 공격력 +${Math.round(interpMcVal(10, 20, lv, 1))}% & 보구 위력 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '전선회복', icon: '💚', cdBase: 12, target: 'ally',
        effects: { heal: [1000, 3000], cleanse: 'atk' },
        descFn: (lv) => `아군 한 명의 HP ${interpMcVal(1000, 3000, lv, 100).toLocaleString()} 회복 & 공격 약화 해제`
      },
      {
        name: '오더 체인지', icon: '🔄', cdBase: 15, target: 'order_change',
        effects: { orderChange: 1 },
        descFn: () => '전열 멤버 1명과 후열 서브 멤버 1명을 교체 (버프 유지 · 덱 리셋 없음)'
      }
    ]
  },
  {
    id: 'mc_souya',
    atlasId: 240,
    no: 19,
    name: '소야고교 학생복',
    category: '이벤트·한정',
    obtain: '7주년 기념 (월희 리메이크 콜라보 모티브)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00242.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00241.png',
    emoji: '🍛',
    desc: '버스터 +50% & HP 회복 [고급 카레빵], 적 즉사 내성 DOWN + 스타 +15, 정신이상 해제 + NP +10%.',
    skills: [
      {
        name: '고급 카레빵', icon: '🔴', cdBase: 15, target: 'ally',
        effects: { buster: [0.30, 0.50], heal: [1000, 2000] },
        descFn: (lv) => `아군 한 명의 버스터 +${Math.round(interpMcVal(30, 50, lv, 1))}% (1턴) & HP ${interpMcVal(1000, 2000, lv, 100).toLocaleString()} 회복`
      },
      {
        name: '경계를 보다', icon: '👁️', cdBase: 12, target: 'enemy',
        effects: { deathResistDown: [0.30, 0.50], stars: [5, 15] },
        descFn: (lv) => `적 즉사 내성 -${Math.round(interpMcVal(30, 50, lv, 2))}% (1턴) + 스타 +${Math.round(interpMcVal(5, 15, lv, 1))}`
      },
      {
        name: '석양의 교실', icon: '🌆', cdBase: 12, target: 'ally',
        effects: { cleanse: 'mental', np: [10, 10] },
        descFn: () => '아군 한 명의 정신이상 해제 & NP +10%'
      }
    ]
  },
  {
    id: 'mc_new_year_attire',
    atlasId: 260,
    no: 20,
    name: '새해의 옷차림',
    category: '이벤트·한정',
    obtain: '2023 신년 캠페인 로그인 보상',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00262.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00261.png',
    emoji: '👘',
    desc: '유일한 보구 오버차지 +1단계 부여 [심원성취] & 전체 보뻥+NP획득 UP을 갖춘 신년 기모노 예장.',
    skills: [
      {
        name: '제염초복', icon: '✨', cdBase: 12, target: 'all',
        effects: { npDmg: [0.15, 0.25], npGain: [0.10, 0.20] },
        descFn: (lv) => `아군 전체 보구 위력 +${Math.round(interpMcVal(15, 25, lv, 1))}% & NP 획득량 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '심원성취', icon: '🌟', cdBase: 12, target: 'ally',
        effects: { ocUp: 1, np: [10, 10] },
        descFn: () => '아군 한 명에게 보구 오버차지 +1단계(1턴) & NP +10%'
      },
      {
        name: '무병식재', icon: '🔰', cdBase: 12, target: 'ally',
        effects: { debuffImmune: 1, stars: [5, 15] },
        descFn: (lv) => `아군 한 명에게 약화 무효(1회·3턴) + 스타 +${Math.round(interpMcVal(5, 15, lv, 1))}`
      }
    ]
  },
  {
    id: 'mc_summer_street',
    atlasId: 330,
    no: 21,
    name: '서머 스트리트',
    category: '이벤트·한정',
    obtain: '서번트 서머 페스티벌 2023 (A·A 제작)',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00332.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00331.png',
    emoji: '🧢',
    desc: '스킬 2종에 NP +10%가 각각 탑재된 최초의 10+10 분산 주유 예장! 아츠 크리티컬+생존까지 완비.',
    skills: [
      {
        name: '스카이 블루', icon: '🔵', cdBase: 12, target: 'ally',
        effects: { arts: [0.20, 0.30], crit: [0.20, 0.30] },
        descFn: (lv) => `아군 한 명의 아츠 +${Math.round(interpMcVal(20, 30, lv, 1))}% & 크리티컬 위력 +${Math.round(interpMcVal(20, 30, lv, 1))}% (1턴)`
      },
      {
        name: '윈드 그린', icon: '🍃', cdBase: 15, target: 'ally',
        effects: { evadeHits: 1, evadeT: 3, np: [10, 10] },
        descFn: () => '아군 한 명에게 회피(1회·3턴) & NP +10%'
      },
      {
        name: '라이트닝 옐로', icon: '⚡', cdBase: 15, target: 'ally',
        effects: { artsStarWeight: [5000, 10000], np: [10, 10] },
        descFn: (lv) => `아군 한 명의 아츠 스타 집중도 +${Math.round(interpMcVal(5000, 10000, lv, 500)).toLocaleString()}% (1턴) & NP +10%`
      }
    ]
  },
  {
    id: 'mc_white_xmas',
    atlasId: 340,
    no: 22,
    name: '화이트 크리스마스',
    category: '이벤트·한정',
    obtain: '크리스마스 2023 이벤트 메인 클리어',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00342.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00341.png',
    emoji: '🎄',
    desc: '보구 위력 +50% & NP 획득 +30% [홀리 샤인] + 전체 NP 5% & 스타 15 [리틀 프레젠트]의 산타 예장.',
    skills: [
      {
        name: '홀리 샤인', icon: '✨', cdBase: 15, target: 'ally',
        effects: { npDmg: [0.30, 0.50], npGain: [0.20, 0.30] },
        descFn: (lv) => `아군 한 명의 보구 위력 +${Math.round(interpMcVal(30, 50, lv, 1))}% & NP 획득량 +${Math.round(interpMcVal(20, 30, lv, 1))}% (1턴)`
      },
      {
        name: '파우더 스노우', icon: '❄️', cdBase: 12, target: 'ally',
        effects: { heal: [1000, 3000], cleanse: 'dot' },
        descFn: (lv) => `아군 한 명의 HP ${interpMcVal(1000, 3000, lv, 100).toLocaleString()} 회복 & 독·저주·화상 해제`
      },
      {
        name: '리틀 프레젠트', icon: '🎁', cdBase: 9, target: 'all',
        effects: { stars: [5, 15], np: [5, 5] },
        descFn: (lv) => `스타 +${Math.round(interpMcVal(5, 15, lv, 1))} 획득 + 아군 전체 NP +5%`
      }
    ]
  },
  {
    id: 'mc_misaki',
    atlasId: 360,
    no: 23,
    name: '미사키고교 학생복',
    category: '이벤트·한정',
    obtain: '마법사의 밤 콜라보 메인 퀘스트',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00362.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00361.png',
    emoji: '📘',
    desc: '마법사의 밤 콜라보 예장! 전체 아츠+버스터 UP, 스타집중+스타획득, 근성+NP 10%의 밸런스형 예장.',
    skills: [
      {
        name: '어셈블', icon: '🔷', cdBase: 15, target: 'all',
        effects: { arts: [0.10, 0.20], buster: [0.10, 0.20] },
        descFn: (lv) => `아군 전체 아츠 +${Math.round(interpMcVal(10, 20, lv, 1))}% & 버스터 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '고 포 잇', icon: '🎯', cdBase: 15, target: 'ally',
        effects: { starWeight: [500, 1000], stars: [5, 15] },
        descFn: (lv) => `아군 한 명의 스타 집중도 +${Math.round(interpMcVal(500, 1000, lv, 50))}% (1턴) + 스타 +${Math.round(interpMcVal(5, 15, lv, 1))}`
      },
      {
        name: '네버 기브 업', icon: '❤️‍🔥', cdBase: 15, target: 'ally',
        effects: { guts: [1000, 2000], np: [10, 10] },
        descFn: (lv) => `아군 한 명에게 근성(1회·1턴 · HP ${interpMcVal(1000, 2000, lv, 100).toLocaleString()}) & NP +10%`
      }
    ]
  },
  {
    id: 'mc_winter_casual',
    atlasId: 410,
    no: 24,
    name: '윈터 캐주얼',
    category: '이벤트·한정',
    obtain: '2024 크리스마스 / 3000만 DL',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/KR/Items/masterequip00412.png',
    iconAlt: 'https://static.atlasacademy.io/KR/Items/masterequip00411.png',
    emoji: '🧣',
    desc: '최초의 아군 전체 NP +10% & 전체 회복 [핫코코아 브레이크]! 더블 딜러 주회의 슈퍼 서포트 예장.',
    skills: [
      {
        name: '스노우볼 파이트', icon: '❄️', cdBase: 15, target: 'all',
        effects: { quick: [0.10, 0.20], arts: [0.10, 0.20] },
        descFn: (lv) => `아군 전체 퀵 +${Math.round(interpMcVal(10, 20, lv, 1))}% & 아츠 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '쿨 스케이팅', icon: '⛸️', cdBase: 15, target: 'ally',
        effects: { evadeHits: 1, evadeT: 3, stars: [5, 15] },
        descFn: (lv) => `아군 한 명에게 회피(1회·3턴) + 스타 +${Math.round(interpMcVal(5, 15, lv, 1))}`
      },
      {
        name: '핫코코아 브레이크', icon: '☕', cdBase: 15, target: 'all',
        effects: { heal: [1000, 2000], np: [10, 10] },
        descFn: (lv) => `아군 전체 HP ${interpMcVal(1000, 2000, lv, 100).toLocaleString()} 회복 & 아군 전체 NP +10%`
      }
    ]
  },
  {
    id: 'mc_shinsengumi',
    atlasId: 430,
    no: 25,
    name: '옥색의 대원복',
    category: '이벤트·한정',
    obtain: '구다구다 신선조 디 엔드 3절 클리어',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/JP/Items/masterequip00432.png',
    iconAlt: 'https://static.atlasacademy.io/JP/Items/masterequip00431.png',
    emoji: '⚔️',
    desc: '신선조의 옥색 하오리! 전체 퀵+버스터 UP, 근성+스타, 전체 회복+스타로 크리티컬&생존력이 탁월합니다.',
    skills: [
      {
        name: '미부로 스피리츠', icon: '🔥', cdBase: 15, target: 'all',
        effects: { quick: [0.10, 0.20], buster: [0.10, 0.20] },
        descFn: (lv) => `아군 전체 퀵 +${Math.round(interpMcVal(10, 20, lv, 1))}% & 버스터 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '순찰 당번', icon: '❤️‍🔥', cdBase: 15, target: 'ally',
        effects: { guts: [1000, 2000], stars: [5, 15] },
        descFn: (lv) => `아군 한 명에게 근성(1회·1턴 · HP ${interpMcVal(1000, 2000, lv, 100).toLocaleString()}) + 스타 +${Math.round(interpMcVal(5, 15, lv, 1))}`
      },
      {
        name: '신선조 주먹밥', icon: '🍙', cdBase: 12, target: 'all',
        effects: { heal: [1000, 2000], stars: [5, 15] },
        descFn: (lv) => `아군 전체 HP ${interpMcVal(1000, 2000, lv, 100).toLocaleString()} 회복 + 스타 +${Math.round(interpMcVal(5, 15, lv, 1))}`
      }
    ]
  },
  {
    id: 'mc_normal_chaldea',
    atlasId: 440,
    no: 26,
    name: '노멀 칼데아 제복',
    category: '스토리·애프터',
    obtain: '애프터 타임의 시작 클리어 (메인 3번째 예장)',
    expCurve: 'part2',
    icon: 'https://static.atlasacademy.io/JP/Items/masterequip00442.png',
    iconAlt: 'https://static.atlasacademy.io/JP/Items/masterequip00441.png',
    emoji: '👔',
    desc: '세 번째 오더 체인지 마술예장! 단일 공업 +40% & NP +10% [마력강화]로 선충전 없이 3연사를 열어줍니다.',
    skills: [
      {
        name: '응급지원', icon: '💚', cdBase: 9, target: 'ally',
        effects: { heal: [1000, 2000], stars: [5, 15] },
        descFn: (lv) => `아군 한 명의 HP ${interpMcVal(1000, 2000, lv, 100).toLocaleString()} 회복 + 스타 +${Math.round(interpMcVal(5, 15, lv, 1))}`
      },
      {
        name: '마력강화', icon: '⚔️', cdBase: 15, target: 'ally',
        effects: { atk: [0.20, 0.40], np: [10, 10] },
        descFn: (lv) => `아군 한 명의 공격력 +${Math.round(interpMcVal(20, 40, lv, 2))}% (1턴) & NP +10%`
      },
      {
        name: '오더 체인지', icon: '🔄', cdBase: 15, target: 'order_change',
        effects: { orderChange: 1 },
        descFn: () => '전열 멤버 1명과 후열 서브 멤버 1명을 교체 (버프 유지 · 덱 리셋 없음)'
      }
    ]
  },
  {
    id: 'mc_clan_calatin',
    atlasId: 460,
    no: 27,
    name: '클랜 칼라틴',
    category: '이벤트·한정',
    obtain: 'Fate/strange Fake 콜라보 에필로그Ⅰ 클리어',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/JP/Items/masterequip00462.png',
    iconAlt: 'https://static.atlasacademy.io/JP/Items/masterequip00461.png',
    emoji: '🚔',
    desc: '최초의 전체 3색 뻥 [올 아웃 어택] + 유일한 엑스트라 어택 +100% [엑스트라 인핸스먼트] 보유!',
    skills: [
      {
        name: '올 아웃 어택', icon: '🌈', cdBase: 18, target: 'all',
        effects: { quick: [0.10, 0.20], arts: [0.10, 0.20], buster: [0.10, 0.20] },
        descFn: (lv) => `아군 전체 퀵·아츠·버스터 성능 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '엑스트라 인핸스먼트', icon: '⚡', cdBase: 9, target: 'ally',
        effects: { extraUp: [0.50, 1.00] },
        descFn: (lv) => `아군 한 명의 엑스트라 어택 카드 성능 +${Math.round(interpMcVal(50, 100, lv, 5))}% (1턴)`
      },
      {
        name: '카운터 오펜시브', icon: '💎', cdBase: 12, target: 'ally',
        effects: { cleanse: 'atk', np: [10, 10] },
        descFn: () => '아군 한 명의 공격 약화 상태 해제 & NP +10%'
      }
    ]
  },
  {
    id: 'mc_chaldea_academy',
    atlasId: 470,
    no: 28,
    name: '칼데아 학원제복',
    category: '이벤트·11주년',
    obtain: 'FGO Fes. 2026 칼데아 학원제 11주년 미션',
    expCurve: 'event',
    icon: 'https://static.atlasacademy.io/JP/Items/masterequip00472.png',
    iconAlt: 'https://static.atlasacademy.io/JP/Items/masterequip00471.png',
    emoji: '🎒',
    desc: '11주년 기념 학원제복! 전체 아츠+보뻥 곱연산, 회피+도트해제, HP 회복+NP 10%+크리 +30% [응급조변].',
    skills: [
      {
        name: '청춘호령', icon: '📣', cdBase: 15, target: 'all',
        effects: { arts: [0.10, 0.20], npDmg: [0.10, 0.20] },
        descFn: (lv) => `아군 전체 아츠 +${Math.round(interpMcVal(10, 20, lv, 1))}% & 보구 위력 +${Math.round(interpMcVal(10, 20, lv, 1))}% (1턴)`
      },
      {
        name: '긴급조퇴', icon: '💨', cdBase: 18, target: 'ally',
        effects: { evade: 1, cleanse: 'dot' },
        descFn: () => '아군 한 명에게 회피(1턴) & 독·저주·화상 해제'
      },
      {
        name: '응급조변', icon: '🍱', cdBase: 15, target: 'ally',
        effects: { heal: [1000, 3000], np: [10, 10], crit: [0.20, 0.30] },
        descFn: (lv) => `아군 한 명의 HP ${interpMcVal(1000, 3000, lv, 100).toLocaleString()} 회복 & NP +10% & 크리티컬 위력 +${Math.round(interpMcVal(20, 30, lv, 1))}% (1턴)`
      }
    ]
  }
];

const MYSTIC_CODE_MAP = Object.fromEntries(MYSTIC_CODES.map(mc => [mc.id, mc]));
