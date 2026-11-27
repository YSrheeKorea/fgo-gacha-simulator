// =========================================================================
// CHALDEA SUMMON SIMULATOR — FGO Part 1 First Half Free Quests (v33)
// 특이점 F 후유키 · 제1특이점 오를레앙 · 제2특이점 세프템 · 제3특이점 오케아노스
// =========================================================================

window.FGO_FREE_QUESTS_P1A = [
  // ---- 특이점 F 염상오염도시 후유키 ----
  {
    id: 'fq_fuyuki_xa', category: 'free_p1a', chapter: '특이점 F 후유키',
    name: '🗺️ 후유키 미확인좌표 X-A — 집터',
    desc: 'AP 3 · 추천 Lv.1 · 흉골 파밍 / AP 대비 인연·FP 효율 최강',
    difficulty: 'AP 3 · 추천 Lv.1',
    rewardText: '🦴 흉골 ×1~2 · 🪙 650 QP · 인연 +25',
    drops: [['흉골', 2]],
    rewards: { sq: 1, embers: 1, qp: 650, fp: 300, mcExp: 400 },
    waves: [
      [{ name: '스켈레톤', cls: 'Saber', attr: '지(地)', hp: 808, atk: 220, maxCharge: 3, emoji: '💀' }],
      [
        { name: '스켈레톤 A', cls: 'Saber', attr: '지(地)', hp: 808, atk: 220, maxCharge: 3, emoji: '💀' },
        { name: '스켈레톤 B', cls: 'Saber', attr: '지(地)', hp: 1007, atk: 240, maxCharge: 3, emoji: '💀' }
      ]
    ]
  },
  {
    id: 'fq_fuyuki_xc', category: 'free_p1a', chapter: '특이점 F 후유키',
    name: '🗺️ 후유키 미확인좌표 X-C — 대교',
    desc: 'AP 4 · 추천 Lv.2 · 흉골 AP 효율 1위 성지!',
    difficulty: 'AP 4 · 추천 Lv.2',
    rewardText: '🦴 흉골 ×2~3 · 🪙 780 QP · 인연 +35',
    drops: [['흉골', 3]],
    rewards: { sq: 1, embers: 1, qp: 780, fp: 300, mcExp: 500 },
    waves: [
      [{ name: '스켈레톤 A', cls: 'Saber', attr: '지(地)', hp: 808, atk: 240, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 B', cls: 'Saber', attr: '지(地)', hp: 808, atk: 240, maxCharge: 3, emoji: '💀' }],
      [{ name: '스켈레톤 A', cls: 'Saber', attr: '지(地)', hp: 1007, atk: 260, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 B', cls: 'Lancer', attr: '지(地)', hp: 1017, atk: 260, maxCharge: 3, emoji: '💀' }],
      [{ name: '스켈레톤 A', cls: 'Lancer', attr: '지(地)', hp: 1421, atk: 280, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 C', cls: 'Saber', attr: '지(地)', hp: 1807, atk: 320, maxCharge: 3, emoji: '💀' }]
    ]
  },
  {
    id: 'fq_fuyuki_xf', category: 'free_p1a', chapter: '특이점 F 후유키',
    name: '🗺️ 후유키 미확인좌표 X-F — 불타 무너진 학교',
    desc: 'AP 6 · 추천 Lv.8 · 흉골 · 허영의 먼지 · 랜서/어새신 피스',
    difficulty: 'AP 6 · 추천 Lv.8',
    rewardText: '🦴 흉골 ×2 · 💨 허영의 먼지 ×1 · 피스',
    drops: [['흉골', 2], ['허영의 먼지', 1], ['랜서 피스', 1], ['어새신 피스', 1]],
    rewards: { sq: 1, embers: 2, qp: 1560, fp: 400, mcExp: 1200 },
    waves: [
      [{ name: '스켈레톤 A', cls: 'Archer', attr: '지(地)', hp: 1754, atk: 320, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 C', cls: 'Archer', attr: '지(地)', hp: 2937, atk: 380, maxCharge: 3, emoji: '💀' }],
      [{ name: '스켈레톤 A', cls: 'Saber', attr: '지(地)', hp: 2407, atk: 360, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 C', cls: 'Saber', attr: '지(地)', hp: 3027, atk: 400, maxCharge: 3, emoji: '💀' }],
      [{ name: '섀도 벤케이', cls: 'Lancer', attr: '인(人)', hp: 8121, atk: 650, maxCharge: 4, emoji: '👤' }, { name: '섀도 주완의 하산', cls: 'Assassin', attr: '인(人)', hp: 9533, atk: 720, maxCharge: 3, emoji: '👤' }]
    ]
  },
  {
    id: 'fq_fuyuki_xg', category: 'free_p1a', chapter: '특이점 F 후유키',
    name: '🗺️ 후유키 미확인좌표 X-G — 활활 타는 숲',
    desc: 'AP 15 · 추천 Lv.40 · 흉골 최고 드랍률 (60%+)',
    difficulty: 'AP 15 · 추천 Lv.40',
    rewardText: '🦴 흉골 ×3 · 🪙 5,720 QP · 인연 +415',
    drops: [['흉골', 3]],
    rewards: { sq: 1, embers: 3, qp: 5720, fp: 600, mcExp: 4552 },
    waves: [
      [{ name: '스켈레톤 A', cls: 'Saber', attr: '지(地)', hp: 8667, atk: 900, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 B', cls: 'Saber', attr: '지(地)', hp: 9087, atk: 920, maxCharge: 3, emoji: '💀' }],
      [{ name: '스켈레톤 A', cls: 'Lancer', attr: '지(地)', hp: 9177, atk: 950, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 B', cls: 'Archer', attr: '지(地)', hp: 8817, atk: 920, maxCharge: 3, emoji: '💀' }],
      [{ name: '스켈레톤 A', cls: 'Lancer', attr: '지(地)', hp: 8753, atk: 950, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 C', cls: 'Lancer', attr: '지(地)', hp: 10388, atk: 1100, maxCharge: 3, emoji: '💀' }]
    ]
  },
  {
    id: 'fq_fuyuki_0', category: 'free_p1a', chapter: '특이점 F 후유키',
    name: '🗺️ 후유키 변동좌표점 0호 — 대동굴',
    desc: 'AP 7 · 추천 Lv.10 · 용의 송곳니 · 허영의 먼지 · 세이버 피스',
    difficulty: 'AP 7 · 추천 Lv.10',
    rewardText: '🦷 용의 송곳니 ×2 · 💨 허영의 먼지 ×1 · 세이버 피스',
    drops: [['용의 송곳니', 2], ['허영의 먼지', 1], ['세이버 피스', 1]],
    rewards: { sq: 1, embers: 2, qp: 1820, fp: 400, mcExp: 1800 },
    waves: [
      [{ name: '용아병 A', cls: 'Assassin', attr: '지(地)', hp: 3763, atk: 420, maxCharge: 3, emoji: '🐉' }, { name: '용아병 B', cls: 'Assassin', attr: '지(地)', hp: 3763, atk: 420, maxCharge: 3, emoji: '🐉' }],
      [{ name: '용아병 B', cls: 'Saber', attr: '지(地)', hp: 5140, atk: 480, maxCharge: 3, emoji: '🐉' }, { name: '용아병 C', cls: 'Archer', attr: '지(地)', hp: 4988, atk: 480, maxCharge: 3, emoji: '🐉' }],
      [{ name: '섀도 세이버 얼터', cls: 'Saber', attr: '인(人)', hp: 25416, atk: 1100, maxCharge: 4, emoji: '👑' }]
    ]
  },
  // ---- 제1특이점 오를레앙 ----
  {
    id: 'fq_orleans_thiers', category: 'free_p1a', chapter: '제1특이점 오를레앙',
    name: '🗺️ 오를레앙 티에르 — 칼날의 거리',
    desc: 'AP 7 · 추천 Lv.12 · 용의 송곳니 · 기의 휘석 · 버서커 피스',
    difficulty: 'AP 7 · 추천 Lv.12',
    rewardText: '🦷 용의 송곳니 ×2 · 기의 휘석 ×2 · 버서커 피스',
    drops: [['용의 송곳니', 2], ['기의 휘석', 2], ['버서커 피스', 1]],
    rewards: { sq: 1, embers: 2, qp: 2080, fp: 450, mcExp: 2000 },
    waves: [
      [{ name: '와이번 A', cls: 'Rider', attr: '지(地)', hp: 5400, atk: 520, maxCharge: 4, emoji: '🐲' }, { name: '와이번 B', cls: 'Rider', attr: '지(地)', hp: 5400, atk: 520, maxCharge: 4, emoji: '🐲' }],
      [{ name: '와이번 드레드', cls: 'Rider', attr: '지(地)', hp: 5700, atk: 560, maxCharge: 4, emoji: '🐲' }, { name: '와이번 B', cls: 'Rider', attr: '지(地)', hp: 6597, atk: 600, maxCharge: 4, emoji: '🐲' }],
      [{ name: '섀도 버서커 랜슬롯', cls: 'Berserker', attr: '지(地)', hp: 43114, atk: 1450, maxCharge: 4, emoji: '⚔️' }]
    ]
  },
  {
    id: 'fq_orleans_bordeaux', category: 'free_p1a', chapter: '제1특이점 오를레앙',
    name: '🗺️ 오를레앙 보르도 — 와인으로 건배',
    desc: 'AP 7 · 추천 Lv.12 · 세계수의 씨앗 집중 파밍',
    difficulty: 'AP 7 · 추천 Lv.12',
    rewardText: '🌱 세계수의 씨앗 ×2 · 🪙 2,080 QP',
    drops: [['세계수의 씨앗', 2]],
    rewards: { sq: 1, embers: 2, qp: 2080, fp: 450, mcExp: 2000 },
    waves: [
      [{ name: '웨어울프 A', cls: 'Lancer', attr: '지(地)', hp: 5191, atk: 500, maxCharge: 3, emoji: '🐺' }, { name: '웨어울프 B', cls: 'Lancer', attr: '지(地)', hp: 5191, atk: 500, maxCharge: 3, emoji: '🐺' }],
      [{ name: '웨어울프 A', cls: 'Saber', attr: '지(地)', hp: 6280, atk: 540, maxCharge: 3, emoji: '🐺' }, { name: '웨어울프 B', cls: 'Lancer', attr: '지(地)', hp: 6342, atk: 540, maxCharge: 3, emoji: '🐺' }],
      [{ name: '웨어울프 A', cls: 'Assassin', attr: '지(地)', hp: 11322, atk: 750, maxCharge: 3, emoji: '🐺' }, { name: '웨어울프 B', cls: 'Assassin', attr: '지(地)', hp: 7033, atk: 600, maxCharge: 3, emoji: '🐺' }]
    ]
  },
  {
    id: 'fq_orleans_paris', category: 'free_p1a', chapter: '제1특이점 오를레앙',
    name: '🗺️ 오를레앙 파리 — 예술의 도시',
    desc: 'AP 13 · 추천 Lv.30 · 흉골 · 용의 송곳니 · 3기사 피스',
    difficulty: 'AP 13 · 추천 Lv.30',
    rewardText: '🦴 흉골 ×2 · 🦷 용의 송곳니 ×2 · 3기사 피스',
    drops: [['흉골', 2], ['용의 송곳니', 2], ['세이버 피스', 1], ['아처 피스', 1], ['랜서 피스', 1]],
    rewards: { sq: 1, embers: 3, qp: 4420, fp: 550, mcExp: 3500 },
    waves: [
      [{ name: '스켈레톤 A', cls: 'Archer', attr: '지(地)', hp: 4490, atk: 550, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 B', cls: 'Archer', attr: '지(地)', hp: 4490, atk: 550, maxCharge: 3, emoji: '💀' }],
      [{ name: '와이번 이블', cls: 'Rider', attr: '지(地)', hp: 18662, atk: 980, maxCharge: 4, emoji: '🐲' }, { name: '와이번 A', cls: 'Rider', attr: '지(地)', hp: 9052, atk: 720, maxCharge: 4, emoji: '🐲' }],
      [{ name: '섀도 잔 다르크 [얼터]', cls: 'Ruler', attr: '인(人)', hp: 94212, atk: 1850, maxCharge: 4, emoji: '🔥' }]
    ]
  },
  // ---- 제2특이점 세프템 ----
  {
    id: 'fq_septem_etna', category: 'free_p1a', chapter: '제2특이점 세프템',
    name: '🗺️ 세프템 에트나 화산 — 끓어오르는 대지',
    desc: 'AP 9 · 추천 Lv.16 · 고스트 랜턴 파밍',
    difficulty: 'AP 9 · 추천 Lv.16',
    rewardText: '🏮 고스트 랜턴 ×2 · 🪙 2,600 QP',
    drops: [['고스트 랜턴', 2]],
    rewards: { sq: 1, embers: 2, qp: 2600, fp: 500, mcExp: 2500 },
    waves: [
      [{ name: '고스트 A', cls: 'Assassin', attr: '천(天)', hp: 9177, atk: 650, maxCharge: 3, emoji: '👻' }, { name: '고스트 B', cls: 'Assassin', attr: '천(天)', hp: 8105, atk: 620, maxCharge: 3, emoji: '👻' }],
      [{ name: '고스트 A', cls: 'Assassin', attr: '천(天)', hp: 10249, atk: 700, maxCharge: 3, emoji: '👻' }, { name: '고스트 B', cls: 'Assassin', attr: '천(天)', hp: 10249, atk: 700, maxCharge: 3, emoji: '👻' }],
      [{ name: '고스트 B', cls: 'Assassin', attr: '천(天)', hp: 14056, atk: 820, maxCharge: 3, emoji: '👻' }, { name: '고스트 C', cls: 'Assassin', attr: '천(天)', hp: 9177, atk: 680, maxCharge: 3, emoji: '👻' }]
    ]
  },
  {
    id: 'fq_septem_germania', category: 'free_p1a', chapter: '제2특이점 세프템',
    name: '🗺️ 세프템 게르마니아 — 검은 숲',
    desc: 'AP 15 · 추천 Lv.40 · 흉골 & 금테 혼돈의 발톱 파밍!',
    difficulty: 'AP 15 · 추천 Lv.40',
    rewardText: '🐾 혼돈의 발톱 ×1 · 🦴 흉골 ×2 · 🪙 5,720 QP',
    drops: [['혼돈의 발톱', 1], ['흉골', 2]],
    rewards: { sq: 1, embers: 4, qp: 5720, fp: 650, mcExp: 4552 },
    waves: [
      [{ name: '스켈레톤 A', cls: 'Saber', attr: '지(地)', hp: 5847, atk: 680, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 B', cls: 'Lancer', attr: '지(地)', hp: 5501, atk: 660, maxCharge: 3, emoji: '💀' }],
      [{ name: '스켈레톤 A', cls: 'Saber', attr: '지(地)', hp: 8667, atk: 880, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 B', cls: 'Archer', attr: '지(地)', hp: 8817, atk: 880, maxCharge: 3, emoji: '💀' }],
      [{ name: '키메라', cls: 'Berserker', attr: '지(地)', hp: 125860, atk: 2400, maxCharge: 4, emoji: '🦁' }]
    ]
  },
  {
    id: 'fq_septem_gaul', category: 'free_p1a', chapter: '제2특이점 세프템',
    name: '🗺️ 세프템 갈리아 — 피어오르는 전쟁의 불씨',
    desc: 'AP 9 · 추천 Lv.18 · 영웅의 증표 · 팔연쌍정 · 세이버 피스',
    difficulty: 'AP 9 · 추천 Lv.18',
    rewardText: '💎 팔연쌍정 ×2 · 🛡️ 영웅의 증표 ×2 · 세이버 피스',
    drops: [['팔연쌍정', 2], ['영웅의 증표', 2], ['세이버 피스', 1]],
    rewards: { sq: 1, embers: 2, qp: 2860, fp: 500, mcExp: 2800 },
    waves: [
      [{ name: '연합 로마 병사', cls: 'Archer', attr: '인(人)', hp: 1488, atk: 380, maxCharge: 3, emoji: '🛡️' }, { name: '골렘', cls: 'Berserker', attr: '천(天)', hp: 9278, atk: 750, maxCharge: 4, emoji: '🗿' }],
      [{ name: '연합 로마 병사 A', cls: 'Lancer', attr: '인(人)', hp: 1740, atk: 420, maxCharge: 3, emoji: '🛡️' }, { name: '연합 로마 병사 B', cls: 'Lancer', attr: '인(人)', hp: 1548, atk: 400, maxCharge: 3, emoji: '🛡️' }],
      [{ name: '골렘 A', cls: 'Berserker', attr: '천(天)', hp: 19551, atk: 1100, maxCharge: 4, emoji: '🗿' }, { name: '섀도 카이사르', cls: 'Saber', attr: '인(人)', hp: 48625, atk: 1400, maxCharge: 4, emoji: '👑' }]
    ]
  },
  // ---- 제3특이점 오케아노스 ----
  {
    id: 'fq_okeanos_ship', category: 'free_p1a', chapter: '제3특이점 오케아노스',
    name: '🗺️ 오케아노스 해적선 — 사략 선단',
    desc: 'AP 12 · 추천 Lv.28 · 영웅의 증표 AP 효율 1위 성지!',
    difficulty: 'AP 12 · 추천 Lv.28',
    rewardText: '🛡️ 영웅의 증표 ×3 · 🪙 4,160 QP · 인연 +295',
    drops: [['영웅의 증표', 3]],
    rewards: { sq: 1, embers: 3, qp: 4160, fp: 550, mcExp: 3200 },
    waves: [
      [{ name: '해적 A', cls: 'Archer', attr: '인(人)', hp: 3136, atk: 520, maxCharge: 3, emoji: '🏴‍☠️' }, { name: '해적 B', cls: 'Archer', attr: '인(人)', hp: 3136, atk: 520, maxCharge: 3, emoji: '🏴‍☠️' }],
      [{ name: '해적 A', cls: 'Saber', attr: '인(人)', hp: 3838, atk: 580, maxCharge: 3, emoji: '🏴‍☠️' }, { name: '해적 B', cls: 'Saber', attr: '인(人)', hp: 3838, atk: 580, maxCharge: 3, emoji: '🏴‍☠️' }],
      [{ name: '해적 두목', cls: 'Saber', attr: '인(人)', hp: 13332, atk: 980, maxCharge: 4, emoji: '🏴‍☠️' }, { name: '해적 A', cls: 'Archer', attr: '인(人)', hp: 8232, atk: 750, maxCharge: 3, emoji: '🏴‍☠️' }]
    ]
  },
  {
    id: 'fq_okeanos_reef', category: 'free_p1a', chapter: '제3특이점 오케아노스',
    name: '🗺️ 오케아노스 암초 해역 — 배의 무덤',
    desc: 'AP 17 · 추천 Lv.50 · 뱀의 보옥 & 흉골 파밍!',
    difficulty: 'AP 17 · 추천 Lv.50',
    rewardText: '🟢 뱀의 보옥 ×2 · 🦴 흉골 ×2 · 🪙 7,020 QP',
    drops: [['뱀의 보옥', 2], ['흉골', 2]],
    rewards: { sq: 1, embers: 4, qp: 7020, fp: 700, mcExp: 8152 },
    waves: [
      [{ name: '스켈레톤 A', cls: 'Archer', attr: '지(地)', hp: 7252, atk: 850, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 B', cls: 'Archer', attr: '지(地)', hp: 7252, atk: 850, maxCharge: 3, emoji: '💀' }],
      [{ name: '라미아', cls: 'Caster', attr: '지(地)', hp: 33795, atk: 1350, maxCharge: 4, emoji: '🐍' }, { name: '스켈레톤 A', cls: 'Archer', attr: '지(地)', hp: 10388, atk: 950, maxCharge: 3, emoji: '💀' }],
      [{ name: '나가', cls: 'Caster', attr: '지(地)', hp: 70383, atk: 1950, maxCharge: 4, emoji: '🐍' }, { name: '라미아 A', cls: 'Caster', attr: '지(地)', hp: 56325, atk: 1600, maxCharge: 4, emoji: '🐍' }]
    ]
  },
  {
    id: 'fq_okeanos_caldera', category: 'free_p1a', chapter: '제3특이점 오케아노스',
    name: '🗺️ 오케아노스 칼데라의 섬 — 사람의 발길이 닿지 않은 섬',
    desc: 'AP 17 · 추천 Lv.54 · 운제철 & 세계수의 씨앗 파밍',
    difficulty: 'AP 17 · 추천 Lv.54',
    rewardText: '🧲 운제철 ×2 · 🌱 세계수의 씨앗 ×2 · 🪙 7,540 QP',
    drops: [['운제철', 2], ['세계수의 씨앗', 2]],
    rewards: { sq: 1, embers: 4, qp: 7540, fp: 750, mcExp: 9816 },
    waves: [
      [{ name: '웨어울프 A', cls: 'Saber', attr: '지(地)', hp: 23603, atk: 1200, maxCharge: 3, emoji: '🐺' }, { name: '켄타우로스', cls: 'Rider', attr: '지(地)', hp: 30528, atk: 1380, maxCharge: 4, emoji: '🐎' }],
      [{ name: '웨어울프 A', cls: 'Saber', attr: '지(地)', hp: 24755, atk: 1250, maxCharge: 3, emoji: '🐺' }, { name: '웨어울프 B', cls: 'Saber', attr: '지(地)', hp: 24755, atk: 1250, maxCharge: 3, emoji: '🐺' }],
      [{ name: '켄타우로스 B', cls: 'Rider', attr: '지(地)', hp: 67968, atk: 1900, maxCharge: 4, emoji: '🐎' }, { name: '켄타우로스 A', cls: 'Rider', attr: '지(地)', hp: 31680, atk: 1400, maxCharge: 4, emoji: '🐎' }]
    ]
  },
  {
    id: 'fq_okeanos_shell', category: 'free_p1a', chapter: '제3특이점 오케아노스',
    name: '🗺️ 오케아노스 군도 — 숨겨진 섬',
    desc: 'AP 16 · 추천 Lv.46 · 추억의 소라껍데기 전용 파밍 성지!',
    difficulty: 'AP 16 · 추천 Lv.46',
    rewardText: '🐚 추억의 소라껍데기 ×3 · 🪙 6,500 QP',
    drops: [['추억의 소라껍데기', 3]],
    rewards: { sq: 1, embers: 4, qp: 6500, fp: 700, mcExp: 6616 },
    waves: [
      [{ name: '큰 소라게 A', cls: 'Saber', attr: '지(地)', hp: 5711, atk: 720, maxCharge: 3, emoji: '🦀' }, { name: '독 소라게', cls: 'Saber', attr: '지(地)', hp: 7565, atk: 820, maxCharge: 3, emoji: '🦀' }],
      [{ name: '독 소라게', cls: 'Saber', attr: '지(地)', hp: 15130, atk: 1050, maxCharge: 3, emoji: '🦀' }, { name: '큰 소라게 A', cls: 'Saber', attr: '지(地)', hp: 11421, atk: 900, maxCharge: 3, emoji: '🦀' }],
      [{ name: '천년 소라게', cls: 'Saber', attr: '지(地)', hp: 131519, atk: 2300, maxCharge: 4, emoji: '🐚' }, { name: '큰 소라게 A', cls: 'Saber', attr: '지(地)', hp: 20318, atk: 1200, maxCharge: 3, emoji: '🦀' }]
    ]
  },
  {
    id: 'fq_okeanos_sea', category: 'free_p1a', chapter: '제3특이점 오케아노스',
    name: '🗺️ 오케아노스 풍요로운 바다 — 비밀 항로',
    desc: 'AP 18 · 추천 Lv.60 · 봉황의 깃털 & 세계수의 씨앗 파밍!',
    difficulty: 'AP 18 · 추천 Lv.60',
    rewardText: '🪶 봉황의 깃털 ×2 · 🌱 세계수의 씨앗 ×2 · 🪙 8,320 QP',
    drops: [['봉황의 깃털', 2], ['세계수의 씨앗', 2]],
    rewards: { sq: 1, embers: 5, qp: 8320, fp: 800, mcExp: 12552 },
    waves: [
      [{ name: '아마조네스 A', cls: 'Lancer', attr: '인(人)', hp: 23776, atk: 1300, maxCharge: 3, emoji: '🏹' }, { name: '아마조네스 B', cls: 'Saber', attr: '인(人)', hp: 23543, atk: 1300, maxCharge: 3, emoji: '⚔️' }],
      [{ name: '아마조네스 리더', cls: 'Archer', attr: '인(人)', hp: 68453, atk: 1850, maxCharge: 4, emoji: '🏹' }, { name: '아마조네스 A', cls: 'Lancer', attr: '인(人)', hp: 25061, atk: 1350, maxCharge: 3, emoji: '⚔️' }],
      [{ name: '아마조네스 리더 B', cls: 'Archer', attr: '인(人)', hp: 81389, atk: 2150, maxCharge: 4, emoji: '🏹' }, { name: '아마조네스 리더 A', cls: 'Lancer', attr: '인(人)', hp: 74613, atk: 2050, maxCharge: 4, emoji: '⚔️' }]
    ]
  }
];
