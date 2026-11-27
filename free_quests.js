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
    drops: [['흉골', 2], ['허영의 먼지', 1], ['랜서 피스', 1], ['어쌔신 피스', 1]],
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

// =========================================================================
// FGO Part 1 Second Half Free Quests (v34)
// 제4특이점 런던 · 제5특이점 북미 · 제6특이점 카멜롯 · 제7특이점 바빌로니아
// =========================================================================
window.FGO_FREE_QUESTS_P1B = [
  // ---- 제4특이점 사계마무도시 런던 ----
  {
    id: 'fq_london_oldst', category: 'free_p1b', chapter: '제4특이점 런던',
    name: '🗺️ 런던 올드 스트리트 — 안개와 마차 그리고 가스등',
    desc: 'AP 15 · 추천 Lv.42 · 무간의 톱니바퀴 집중 파밍',
    difficulty: 'AP 15 · 추천 Lv.42',
    rewardText: '⚙️ 무간의 톱니바퀴 ×2 · 🪙 5,980 QP',
    drops: [['무간의 톱니바퀴', 2]],
    rewards: { sq: 1, embers: 3, qp: 5980, fp: 600, mcExp: 5208 },
    waves: [
      [{ name: '오토마타 A', cls: 'Assassin', attr: '지(地)', hp: 7286, atk: 750, maxCharge: 3, emoji: '⚙️' }, { name: '오토마타 B', cls: 'Assassin', attr: '지(地)', hp: 7286, atk: 750, maxCharge: 3, emoji: '⚙️' }],
      [{ name: '오토마타 A', cls: 'Assassin', attr: '지(地)', hp: 12286, atk: 900, maxCharge: 3, emoji: '⚙️' }, { name: '오토마타 B', cls: 'Assassin', attr: '지(地)', hp: 12286, atk: 900, maxCharge: 3, emoji: '⚙️' }],
      [{ name: '오토마타 B', cls: 'Assassin', attr: '지(地)', hp: 22286, atk: 1200, maxCharge: 3, emoji: '⚙️' }, { name: '오토마타 A', cls: 'Assassin', attr: '지(地)', hp: 18286, atk: 1050, maxCharge: 3, emoji: '⚙️' }]
    ]
  },
  {
    id: 'fq_london_southwark', category: 'free_p1b', chapter: '제4특이점 런던',
    name: '🗺️ 런던 서더크 — 버러 마켓',
    desc: 'AP 19 · 추천 Lv.64 · 호문쿨루스 베이비 & 흉골 파밍',
    difficulty: 'AP 19 · 추천 Lv.64',
    rewardText: '🧫 호문쿨루스 베이비 ×2 · 🦴 흉골 ×2 · 🪙 8,840 QP',
    drops: [['호문쿨루스 베이비', 2], ['흉골', 2]],
    rewards: { sq: 1, embers: 4, qp: 8840, fp: 750, mcExp: 14536 },
    waves: [
      [{ name: '호문쿨루스', cls: 'Lancer', attr: '지(地)', hp: 56191, atk: 1400, maxCharge: 4, emoji: '🧪' }, { name: '스켈레톤 A', cls: 'Archer', attr: '지(地)', hp: 6412, atk: 720, maxCharge: 3, emoji: '💀' }],
      [{ name: '호문쿨루스 A', cls: 'Lancer', attr: '지(地)', hp: 56191, atk: 1450, maxCharge: 4, emoji: '🧪' }, { name: '호문쿨루스 B', cls: 'Lancer', attr: '지(地)', hp: 56191, atk: 1450, maxCharge: 4, emoji: '🧪' }],
      [{ name: '프로토 호문쿨루스 A', cls: 'Lancer', attr: '지(地)', hp: 80684, atk: 1900, maxCharge: 4, emoji: '🧪' }, { name: '프로토 호문쿨루스 B', cls: 'Lancer', attr: '지(地)', hp: 80684, atk: 1900, maxCharge: 4, emoji: '🧪' }]
    ]
  },
  {
    id: 'fq_london_hydepark', category: 'free_p1b', chapter: '제4특이점 런던',
    name: '🗺️ 런던 하이드 파크 — 수정궁의 잔영',
    desc: 'AP 20 · 추천 Lv.68 · 금단의 페이지 & 흉골 파밍 성지!',
    difficulty: 'AP 20 · 추천 Lv.68',
    rewardText: '📜 금단의 페이지 ×2 · 🦴 흉골 ×2 · 🪙 9,360 QP',
    drops: [['금단의 페이지', 2], ['흉골', 2]],
    rewards: { sq: 1, embers: 4, qp: 9360, fp: 800, mcExp: 16648 },
    waves: [
      [{ name: '스켈레톤 A', cls: 'Lancer', attr: '지(地)', hp: 7213, atk: 780, maxCharge: 3, emoji: '💀' }, { name: '스켈레톤 B', cls: 'Lancer', attr: '지(地)', hp: 7213, atk: 780, maxCharge: 3, emoji: '💀' }],
      [{ name: '선더 북', cls: 'Caster', attr: '천(天)', hp: 90392, atk: 1850, maxCharge: 4, emoji: '📖' }, { name: '스펠 북', cls: 'Caster', attr: '천(天)', hp: 40605, atk: 1350, maxCharge: 4, emoji: '📖' }],
      [{ name: '그리모어', cls: 'Caster', attr: '천(天)', hp: 108705, atk: 2150, maxCharge: 4, emoji: '📕' }, { name: '선더 북 A', cls: 'Caster', attr: '천(天)', hp: 90843, atk: 1900, maxCharge: 4, emoji: '📖' }]
    ]
  },
  // ---- 제5특이점 북미신화대전 ----
  {
    id: 'fq_america_charlotte', category: 'free_p1b', chapter: '제5특이점 북미',
    name: '🗺️ 북미 샬럿 — 골드러시',
    desc: 'AP 20 · 추천 Lv.70 · 허영의 먼지 & 영웅의 증표 최고 성지!',
    difficulty: 'AP 20 · 추천 Lv.70',
    rewardText: '💨 허영의 먼지 ×3 · 🛡️ 영웅의 증표 ×2 · 버서커/랜서 피스·모뉴',
    drops: [['허영의 먼지', 3], ['영웅의 증표', 2], ['버서커 피스', 1], ['버서커 모뉴먼트', 1]],
    rewards: { sq: 1, embers: 5, qp: 9620, fp: 850, mcExp: 17752 },
    waves: [
      [{ name: '드루이드', cls: 'Caster', attr: '인(人)', hp: 17052, atk: 980, maxCharge: 4, emoji: '🧙' }, { name: '켈트 병사 A', cls: 'Archer', attr: '인(人)', hp: 17052, atk: 950, maxCharge: 3, emoji: '🏹' }],
      [{ name: '섀도 스파르타쿠스', cls: 'Berserker', attr: '인(人)', hp: 50193, atk: 1650, maxCharge: 4, emoji: '👤' }, { name: '섀도 에릭', cls: 'Berserker', attr: '인(人)', hp: 46802, atk: 1600, maxCharge: 4, emoji: '👤' }],
      [{ name: '섀도 여포', cls: 'Berserker', attr: '인(人)', hp: 103775, atk: 2350, maxCharge: 4, emoji: '👤' }, { name: '섀도 레오니다스', cls: 'Lancer', attr: '인(人)', hp: 103138, atk: 2100, maxCharge: 4, emoji: '👤' }]
    ]
  },
  {
    id: 'fq_america_chicago', category: 'free_p1b', chapter: '제5특이점 북미',
    name: '🗺️ 북미 시카고 — 윈디 시티',
    desc: 'AP 21 · 추천 Lv.76 · 무간의 톱니바퀴 최고 효율!',
    difficulty: 'AP 21 · 추천 Lv.76',
    rewardText: '⚙️ 무간의 톱니바퀴 ×3 · 🪙 10,400 QP',
    drops: [['무간의 톱니바퀴', 3]],
    rewards: { sq: 1, embers: 5, qp: 10400, fp: 900, mcExp: 21256 },
    waves: [
      [{ name: '기계화 보병 A', cls: 'Archer', attr: '인(人)', hp: 20682, atk: 1050, maxCharge: 3, emoji: '🤖' }, { name: '기계화 보병 B', cls: 'Archer', attr: '인(人)', hp: 20682, atk: 1050, maxCharge: 3, emoji: '🤖' }],
      [{ name: '기계화 보병 A', cls: 'Archer', attr: '인(人)', hp: 65135, atk: 1650, maxCharge: 3, emoji: '🤖' }, { name: '기계화 보병 B', cls: 'Archer', attr: '인(人)', hp: 65135, atk: 1650, maxCharge: 3, emoji: '🤖' }],
      [{ name: '기계화 보병 대장', cls: 'Archer', attr: '인(人)', hp: 219912, atk: 2650, maxCharge: 3, emoji: '🤖' }]
    ]
  },
  {
    id: 'fq_america_washington', category: 'free_p1b', chapter: '제5특이점 북미',
    name: '🗺️ 북미 워싱턴 — 특별 행정구',
    desc: 'AP 20 · 추천 Lv.73 · 정령근 & 영웅의 증표 파밍',
    difficulty: 'AP 20 · 추천 Lv.73',
    rewardText: '🌿 정령근 ×1 · 🛡️ 영웅의 증표 ×2 · 🪙 10,010 QP',
    drops: [['정령근', 1], ['영웅의 증표', 2]],
    rewards: { sq: 1, embers: 5, qp: 10010, fp: 850, mcExp: 19468 },
    waves: [
      [{ name: '켈트 병사 A', cls: 'Saber', attr: '인(人)', hp: 20361, atk: 1050, maxCharge: 3, emoji: '⚔️' }, { name: '켈트 병사 B', cls: 'Archer', attr: '인(人)', hp: 19756, atk: 1020, maxCharge: 3, emoji: '🏹' }],
      [{ name: '드루이드', cls: 'Caster', attr: '인(人)', hp: 44237, atk: 1450, maxCharge: 4, emoji: '🧙' }, { name: '켈트 병사 A', cls: 'Lancer', attr: '인(人)', hp: 46042, atk: 1480, maxCharge: 3, emoji: '🔱' }],
      [{ name: '스프리건', cls: 'Saber', attr: '지(地)', hp: 227689, atk: 2700, maxCharge: 4, emoji: '🌿' }]
    ]
  },
  // ---- 제6특이점 신성원탁영역 카멜롯 ----
  {
    id: 'fq_camelot_wilderness', category: 'free_p1b', chapter: '제6특이점 카멜롯',
    name: '🗺️ 카멜롯 죽음의 황야 — 피가 끓어오르는 광연',
    desc: 'AP 19 · 추천 Lv.64 · 우자의 사슬 파밍 성지!',
    difficulty: 'AP 19 · 추천 Lv.64',
    rewardText: '⛓️ 우자의 사슬 ×3 · 🪙 8,840 QP',
    drops: [['우자의 사슬', 3]],
    rewards: { sq: 1, embers: 4, qp: 8840, fp: 800, mcExp: 14536 },
    waves: [
      [{ name: '마음을 잃은 자 A', cls: 'Assassin', attr: '인(人)', hp: 15594, atk: 920, maxCharge: 3, emoji: '⛓️' }, { name: '마음을 잃은 자 B', cls: 'Assassin', attr: '인(人)', hp: 15594, atk: 920, maxCharge: 3, emoji: '⛓️' }],
      [{ name: '마음을 잃은 죄인', cls: 'Berserker', attr: '인(人)', hp: 48600, atk: 1600, maxCharge: 4, emoji: '⛓️' }, { name: '마음을 잃은 자', cls: 'Assassin', attr: '인(人)', hp: 23464, atk: 1100, maxCharge: 3, emoji: '⛓️' }],
      [{ name: '마음을 잃은 죄인 A', cls: 'Berserker', attr: '인(人)', hp: 93312, atk: 2150, maxCharge: 4, emoji: '⛓️' }, { name: '마음을 잃은 죄인 B', cls: 'Berserker', attr: '인(人)', hp: 87091, atk: 2050, maxCharge: 4, emoji: '⛓️' }]
    ]
  },
  {
    id: 'fq_camelot_gate', category: 'free_p1b', chapter: '제6특이점 카멜롯',
    name: '🗺️ 카멜롯 성도 정문 — 성별의 문',
    desc: 'AP 20 · 추천 Lv.70 · 2라운드 구성 · 대기사 훈장 최고 파밍 성지!',
    difficulty: 'AP 20 · 추천 Lv.70',
    rewardText: '🎖️ 대기사 훈장 ×3 · 🪙 9,620 QP',
    drops: [['대기사 훈장', 3]],
    rewards: { sq: 1, embers: 5, qp: 9620, fp: 850, mcExp: 17752 },
    waves: [
      [{ name: '숙정기사 A', cls: 'Saber', attr: '인(人)', hp: 65448, atk: 1700, maxCharge: 4, emoji: '🛡️' }, { name: '숙정기사 B', cls: 'Saber', attr: '인(人)', hp: 65448, atk: 1700, maxCharge: 4, emoji: '🛡️' }],
      [{ name: '숙정기사 C', cls: 'Archer', attr: '인(人)', hp: 73500, atk: 1900, maxCharge: 3, emoji: '🛡️' }, { name: '숙정기사 A', cls: 'Lancer', attr: '인(人)', hp: 75735, atk: 1950, maxCharge: 4, emoji: '🛡️' }]
    ]
  },
  {
    id: 'fq_camelot_temple', category: 'free_p1b', chapter: '제6특이점 카멜롯',
    name: '🗺️ 카멜롯 대신전 — 태양왕의 성',
    desc: 'AP 22 · 추천 Lv.84 · 지혜의 스카라베 & 우자의 사슬 파밍!',
    difficulty: 'AP 22 · 추천 Lv.84',
    rewardText: '🪲 지혜의 스카라베 ×1 · ⛓️ 우자의 사슬 ×2 · 🪙 11,440 QP',
    drops: [['지혜의 스카라베', 1], ['우자의 사슬', 2]],
    rewards: { sq: 1, embers: 5, qp: 11440, fp: 950, mcExp: 26376 },
    waves: [
      [{ name: '마음을 잃은 죄인', cls: 'Berserker', attr: '인(人)', hp: 14337, atk: 980, maxCharge: 4, emoji: '⛓️' }, { name: '마음을 잃은 자', cls: 'Assassin', attr: '인(人)', hp: 11010, atk: 880, maxCharge: 3, emoji: '⛓️' }],
      [{ name: '마음을 잃은 죄인 A', cls: 'Berserker', attr: '인(人)', hp: 20071, atk: 1150, maxCharge: 4, emoji: '⛓️' }, { name: '마음을 잃은 죄인 B', cls: 'Berserker', attr: '인(人)', hp: 20071, atk: 1150, maxCharge: 4, emoji: '⛓️' }],
      [{ name: '마리카 스핑크스', cls: 'Caster', attr: '천(天)', hp: 197521, atk: 2650, maxCharge: 4, emoji: '🦁' }, { name: '스핑크스', cls: 'Caster', attr: '천(天)', hp: 183173, atk: 2500, maxCharge: 4, emoji: '🦁' }]
    ]
  },
  // ---- 제7특이점 절대마수전선 바빌로니아 ----
  {
    id: 'fq_babylonia_reed', category: 'free_p1b', chapter: '제7특이점 바빌로니아',
    name: '🗺️ 바빌로니아 갈대밭 — 풍요 기원',
    desc: 'AP 21 · 추천 Lv.76 · 만사의 독침 최고 파밍 성지!',
    difficulty: 'AP 21 · 추천 Lv.76',
    rewardText: '💉 만사의 독침 ×3 · 🪙 10,400 QP',
    drops: [['만사의 독침', 3]],
    rewards: { sq: 1, embers: 5, qp: 10400, fp: 900, mcExp: 21256 },
    waves: [
      [{ name: '무슈후슈 A', cls: 'Lancer', attr: '지(地)', hp: 28764, atk: 1250, maxCharge: 4, emoji: '🐉' }, { name: '무슈후슈 B', cls: 'Lancer', attr: '지(地)', hp: 28764, atk: 1250, maxCharge: 4, emoji: '🐉' }],
      [{ name: '무슈후슈 A', cls: 'Lancer', attr: '지(地)', hp: 37864, atk: 1450, maxCharge: 4, emoji: '🐉' }, { name: '무슈후슈 B', cls: 'Lancer', attr: '지(地)', hp: 37864, atk: 1450, maxCharge: 4, emoji: '🐉' }],
      [{ name: '무슈후슈 A', cls: 'Lancer', attr: '지(地)', hp: 122015, atk: 2350, maxCharge: 4, emoji: '🐉' }, { name: '무슈후슈 B', cls: 'Lancer', attr: '지(地)', hp: 86034, atk: 1950, maxCharge: 4, emoji: '🐉' }]
    ]
  },
  {
    id: 'fq_babylonia_nippur', category: 'free_p1b', chapter: '제7특이점 바빌로니아',
    name: '🗺️ 바빌로니아 니푸르 — 하늘과 땅의 매듭',
    desc: 'AP 21 · 추천 Lv.80 · 용의 역린 & 만사의 독침 파밍!',
    difficulty: 'AP 21 · 추천 Lv.80',
    rewardText: '🐉 용의 역린 ×1 · 💉 만사의 독침 ×2 · 🪙 10,920 QP',
    drops: [['용의 역린', 1], ['만사의 독침', 2]],
    rewards: { sq: 1, embers: 5, qp: 10920, fp: 950, mcExp: 23752 },
    waves: [
      [{ name: '무슈후슈 A', cls: 'Lancer', attr: '지(地)', hp: 25169, atk: 1200, maxCharge: 4, emoji: '🐉' }, { name: '무슈후슈 B', cls: 'Lancer', attr: '지(地)', hp: 25169, atk: 1200, maxCharge: 4, emoji: '🐉' }],
      [{ name: '무슈후슈 A', cls: 'Lancer', attr: '지(地)', hp: 39137, atk: 1450, maxCharge: 4, emoji: '🐉' }, { name: '무슈후슈 B', cls: 'Lancer', attr: '지(地)', hp: 39137, atk: 1450, maxCharge: 4, emoji: '🐉' }],
      [{ name: '바슈무', cls: 'Rider', attr: '지(地)', hp: 288970, atk: 2950, maxCharge: 4, emoji: '🐲' }]
    ]
  },
  {
    id: 'fq_babylonia_blood', category: 'free_p1b', chapter: '제7특이점 바빌로니아',
    name: '🗺️ 바빌로니아 선혈신전 — 태동하는 산',
    desc: 'AP 21 · 추천 Lv.80 · 2라운드 구성 · 원초의 산모 최고 효율!',
    difficulty: 'AP 21 · 추천 Lv.80',
    rewardText: '☁️ 원초의 산모 ×2 · 🌱 세계수의 씨앗 ×2 · 🪙 10,920 QP',
    drops: [['원초의 산모', 2], ['세계수의 씨앗', 2]],
    rewards: { sq: 1, embers: 5, qp: 10920, fp: 950, mcExp: 23752 },
    waves: [
      [{ name: '우리딤무 A', cls: 'Rider', attr: '지(地)', hp: 19243, atk: 1050, maxCharge: 4, emoji: '🐺' }, { name: '우리딤무 B', cls: 'Rider', attr: '지(地)', hp: 19243, atk: 1050, maxCharge: 4, emoji: '🐺' }],
      [{ name: '우갈루 B', cls: 'Rider', attr: '지(地)', hp: 254016, atk: 2800, maxCharge: 4, emoji: '🦁' }, { name: '우갈루 A', cls: 'Rider', attr: '지(地)', hp: 182476, atk: 2450, maxCharge: 4, emoji: '🦁' }]
    ]
  },
  {
    id: 'fq_babylonia_ebih', category: 'free_p1b', chapter: '제7특이점 바빌로니아',
    name: '🗺️ 바빌로니아 에비흐 산 — 흔들리는 영봉',
    desc: 'AP 21 · 추천 Lv.80 · 주수담석 & 세계수의 씨앗 파밍!',
    difficulty: 'AP 21 · 추천 Lv.80',
    rewardText: '🪨 주수담석 ×1 · 🌱 세계수의 씨앗 ×2 · 🪙 10,920 QP',
    drops: [['주수담석', 1], ['세계수의 씨앗', 2]],
    rewards: { sq: 1, embers: 5, qp: 10920, fp: 950, mcExp: 23752 },
    waves: [
      [{ name: '괴물 멧돼지 A', cls: 'Berserker', attr: '지(地)', hp: 22852, atk: 1200, maxCharge: 4, emoji: '🐗' }, { name: '괴물 멧돼지 B', cls: 'Berserker', attr: '지(地)', hp: 22852, atk: 1200, maxCharge: 4, emoji: '🐗' }],
      [{ name: '괴물 멧돼지 A', cls: 'Berserker', attr: '지(地)', hp: 42798, atk: 1550, maxCharge: 4, emoji: '🐗' }, { name: '괴물 멧돼지 B', cls: 'Berserker', attr: '지(地)', hp: 42798, atk: 1550, maxCharge: 4, emoji: '🐗' }],
      [{ name: '거대 괴물 멧돼지', cls: 'Berserker', attr: '지(地)', hp: 269478, atk: 2950, maxCharge: 4, emoji: '🐗' }]
    ]
  }
];

// =========================================================================
// FGO Part 1.5 Free Quests (v35)
// 아종특이점Ⅰ 신주쿠 · Ⅱ 아가르타 · Ⅲ 시모사노쿠니 · Ⅳ 세일럼
// =========================================================================
window.FGO_FREE_QUESTS_P15 = [
  // ---- 신주쿠 ----
  {
    id: 'fq_shinjuku_station', category: 'free_p15', chapter: '1.5부 신주쿠',
    name: '🗺️ 신주쿠 역 — 콘크리트 던전',
    desc: 'AP 21 · 추천 Lv.74 · 마술수액 최고 파밍 성지!',
    difficulty: 'AP 21 · 추천 Lv.74',
    rewardText: '🧪 마술수액 ×3 · 🪙 10,140 QP',
    drops: [['마술수액', 3]],
    rewards: { sq: 1, embers: 5, qp: 10140, fp: 900, mcExp: 20056 },
    waves: [
      [{ name: '말벌 A', cls: 'Archer', attr: '인(人)', hp: 24225, atk: 1200, maxCharge: 3, emoji: '🔫' }, { name: '말벌 B', cls: 'Archer', attr: '인(人)', hp: 13867, atk: 980, maxCharge: 3, emoji: '🔫' }],
      [{ name: '말벌 C', cls: 'Archer', attr: '인(人)', hp: 30937, atk: 1350, maxCharge: 3, emoji: '🔫' }, { name: '말벌 A', cls: 'Archer', attr: '인(人)', hp: 17991, atk: 1080, maxCharge: 3, emoji: '🔫' }],
      [{ name: '말벌 B', cls: 'Archer', attr: '인(人)', hp: 115889, atk: 2300, maxCharge: 3, emoji: '🔫' }, { name: '말벌 A', cls: 'Archer', attr: '인(人)', hp: 92977, atk: 2000, maxCharge: 3, emoji: '🔫' }]
    ]
  },
  {
    id: 'fq_shinjuku_gyoen', category: 'free_p15', chapter: '1.5부 신주쿠',
    name: '🗺️ 신주쿠 교엔 — 데몬즈 가든',
    desc: 'AP 21 · 추천 Lv.80 · 만신의 심장 & 마술수액 파밍!',
    difficulty: 'AP 21 · 추천 Lv.80',
    rewardText: '❤️‍🔥 만신의 심장 ×1 · 🧪 마술수액 ×2 · 🪙 10,920 QP',
    drops: [['만신의 심장', 1], ['마술수액', 2]],
    rewards: { sq: 1, embers: 5, qp: 10920, fp: 950, mcExp: 23752 },
    waves: [
      [{ name: '야쿠자 A', cls: 'Caster', attr: '인(人)', hp: 19597, atk: 1100, maxCharge: 4, emoji: '🕶️' }, { name: '야쿠자 B', cls: 'Caster', attr: '인(人)', hp: 21394, atk: 1150, maxCharge: 4, emoji: '🕶️' }],
      [{ name: '야쿠자 A', cls: 'Caster', attr: '인(人)', hp: 31784, atk: 1400, maxCharge: 4, emoji: '🕶️' }, { name: '야쿠자 B', cls: 'Caster', attr: '인(人)', hp: 28917, atk: 1350, maxCharge: 4, emoji: '🕶️' }],
      [{ name: '데몬', cls: 'Caster', attr: '천(天)', hp: 401055, atk: 3100, maxCharge: 4, emoji: '😈' }]
    ]
  },
  {
    id: 'fq_shinjuku_barrel', category: 'free_p15', chapter: '1.5부 신주쿠',
    name: '🗺️ 신주쿠 배럴 타워 — 라이플링 홀',
    desc: 'AP 21 · 추천 Lv.76 · 무간의 톱니바퀴 대량 파밍!',
    difficulty: 'AP 21 · 추천 Lv.76',
    rewardText: '⚙️ 무간의 톱니바퀴 ×3 · 🪙 10,400 QP',
    drops: [['무간의 톱니바퀴', 3]],
    rewards: { sq: 1, embers: 5, qp: 10400, fp: 900, mcExp: 21256 },
    waves: [
      [{ name: '콜로라투라 A', cls: 'Assassin', attr: '지(地)', hp: 11457, atk: 900, maxCharge: 3, emoji: '⚙️' }, { name: '콜로라투라 B', cls: 'Assassin', attr: '지(地)', hp: 18393, atk: 1050, maxCharge: 3, emoji: '⚙️' }],
      [{ name: '콜로라투라 A', cls: 'Assassin', attr: '지(地)', hp: 27204, atk: 1300, maxCharge: 3, emoji: '⚙️' }, { name: '콜로라투라 B', cls: 'Assassin', attr: '지(地)', hp: 32474, atk: 1400, maxCharge: 3, emoji: '⚙️' }],
      [{ name: '콜로라투라 C', cls: 'Assassin', attr: '지(地)', hp: 174084, atk: 2500, maxCharge: 3, emoji: '⚙️' }, { name: '콜로라투라 A', cls: 'Assassin', attr: '지(地)', hp: 74846, atk: 1800, maxCharge: 3, emoji: '⚙️' }]
    ]
  },
  // ---- 아가르타 ----
  {
    id: 'fq_agartha_peach', category: 'free_p15', chapter: '1.5부 아가르타',
    name: '🗺️ 아가르타 도원향 — 몽상의 마을',
    desc: 'AP 21 · 추천 Lv.72 · 팔연쌍정 최고 파밍 성지!',
    difficulty: 'AP 21 · 추천 Lv.72',
    rewardText: '💎 팔연쌍정 ×3 · 🪙 10,140 QP',
    drops: [['팔연쌍정', 3]],
    rewards: { sq: 1, embers: 5, qp: 10140, fp: 900, mcExp: 20056 },
    waves: [
      [{ name: '스톤 골렘 A', cls: 'Berserker', attr: '천(天)', hp: 16656, atk: 1100, maxCharge: 4, emoji: '🗿' }, { name: '스톤 골렘 B', cls: 'Berserker', attr: '천(天)', hp: 17540, atk: 1150, maxCharge: 4, emoji: '🗿' }],
      [{ name: '아이언 골렘 A', cls: 'Berserker', attr: '천(天)', hp: 25616, atk: 1350, maxCharge: 4, emoji: '🗿' }, { name: '아이언 골렘 B', cls: 'Berserker', attr: '천(天)', hp: 26500, atk: 1380, maxCharge: 4, emoji: '🗿' }],
      [{ name: '크리스탈 골렘', cls: 'Berserker', attr: '천(天)', hp: 277318, atk: 2900, maxCharge: 4, emoji: '💎' }]
    ]
  },
  {
    id: 'fq_agartha_dragon', category: 'free_p15', chapter: '1.5부 아가르타',
    name: '🗺️ 아가르타 용궁성 — 호중누각',
    desc: 'AP 21 · 추천 Lv.78 · 기신주 & 영웅의 증표 파밍!',
    difficulty: 'AP 21 · 추천 Lv.78',
    rewardText: '🍶 기신주 ×1 · 🛡️ 영웅의 증표 ×2 · 🪙 10,660 QP',
    drops: [['기기신주', 1], ['영웅의 증표', 2]],
    rewards: { sq: 1, embers: 5, qp: 10660, fp: 950, mcExp: 22488 },
    waves: [
      [{ name: '여해적 A', cls: 'Rider', attr: '인(人)', hp: 10451, atk: 880, maxCharge: 4, emoji: '🏴‍☠️' }, { name: '여해적 B', cls: 'Rider', attr: '인(人)', hp: 10055, atk: 850, maxCharge: 4, emoji: '🏴‍☠️' }],
      [{ name: '여해적 A', cls: 'Rider', attr: '인(人)', hp: 11015, atk: 900, maxCharge: 4, emoji: '🏴‍☠️' }, { name: '여해적 C', cls: 'Rider', attr: '인(人)', hp: 11955, atk: 950, maxCharge: 4, emoji: '🏴‍☠️' }],
      [{ name: '히드라', cls: 'Archer', attr: '지(地)', hp: 344794, atk: 3000, maxCharge: 3, emoji: '🐉' }]
    ]
  },
  {
    id: 'fq_agartha_rift', category: 'free_p15', chapter: '1.5부 아가르타',
    name: '🗺️ 아가르타 대지의 갈라진 틈 — 다이아몬드의 계곡',
    desc: 'AP 21 · 추천 Lv.80 · 뱀의 보옥 최고 효율!',
    difficulty: 'AP 21 · 추천 Lv.80',
    rewardText: '🟢 뱀의 보옥 ×3 · 🪙 10,920 QP',
    drops: [['뱀의 보옥', 3]],
    rewards: { sq: 1, embers: 5, qp: 10920, fp: 950, mcExp: 23752 },
    waves: [
      [{ name: '라미아 A', cls: 'Caster', attr: '지(地)', hp: 12649, atk: 950, maxCharge: 4, emoji: '🐍' }, { name: '라미아 C', cls: 'Caster', attr: '지(地)', hp: 13202, atk: 980, maxCharge: 4, emoji: '🐍' }],
      [{ name: '나가', cls: 'Caster', attr: '지(地)', hp: 25665, atk: 1300, maxCharge: 4, emoji: '🐍' }, { name: '라미아 A', cls: 'Caster', attr: '지(地)', hp: 19644, atk: 1100, maxCharge: 4, emoji: '🐍' }],
      [{ name: '나가라자', cls: 'Caster', attr: '지(地)', hp: 232310, atk: 2700, maxCharge: 4, emoji: '🐍' }, { name: '나가 A', cls: 'Caster', attr: '지(地)', hp: 68311, atk: 1750, maxCharge: 4, emoji: '🐍' }]
    ]
  },
  // ---- 시모사노쿠니 ----
  {
    id: 'fq_shimousa_castle', category: 'free_p15', chapter: '1.5부 시모사노쿠니',
    name: '🗺️ 시모사노쿠니 성 주변 마을 — 영고성쇠',
    desc: 'AP 21 · 추천 Lv.76 · 고담곡옥 최고 파밍 성지!',
    difficulty: 'AP 21 · 추천 Lv.76',
    rewardText: '📿 고담곡옥 ×3 · 🪙 10,400 QP',
    drops: [['고담곡옥', 3]],
    rewards: { sq: 1, embers: 5, qp: 10400, fp: 900, mcExp: 21256 },
    waves: [
      [{ name: '검은 무사 A', cls: 'Saber', attr: '지(地)', hp: 26978, atk: 1250, maxCharge: 4, emoji: '⚔️' }, { name: '검은 무사 B', cls: 'Saber', attr: '지(地)', hp: 24467, atk: 1200, maxCharge: 4, emoji: '⚔️' }],
      [{ name: '검은 무사 A', cls: 'Saber', attr: '지(地)', hp: 37051, atk: 1450, maxCharge: 4, emoji: '⚔️' }, { name: '검은 무사 B', cls: 'Saber', attr: '지(地)', hp: 39210, atk: 1500, maxCharge: 4, emoji: '⚔️' }],
      [{ name: '검은 무사 C', cls: 'Saber', attr: '지(地)', hp: 196041, atk: 2600, maxCharge: 4, emoji: '⚔️' }, { name: '검은 무사 A', cls: 'Saber', attr: '지(地)', hp: 54413, atk: 1650, maxCharge: 4, emoji: '⚔️' }]
    ]
  },
  {
    id: 'fq_shimousa_backmt', category: 'free_p15', chapter: '1.5부 시모사노쿠니',
    name: '🗺️ 시모사노쿠니 뒷산 — 전전긍긍',
    desc: 'AP 21 · 추천 Lv.80 · 구십구경 & 고스트 랜턴 파밍!',
    difficulty: 'AP 21 · 추천 Lv.80',
    rewardText: '🪞 구십구경 ×1 · 🏮 고스트 랜턴 ×2 · 🪙 10,920 QP',
    drops: [['구십구경', 1], ['고스트 랜턴', 2]],
    rewards: { sq: 1, embers: 5, qp: 10920, fp: 950, mcExp: 23752 },
    waves: [
      [{ name: '기령 A', cls: 'Assassin', attr: '천(天)', hp: 30627, atk: 1300, maxCharge: 3, emoji: '👻' }, { name: '기령 B', cls: 'Assassin', attr: '천(天)', hp: 31565, atk: 1320, maxCharge: 3, emoji: '👻' }],
      [{ name: '기령 A', cls: 'Assassin', attr: '천(天)', hp: 42490, atk: 1550, maxCharge: 3, emoji: '👻' }, { name: '기령 B', cls: 'Assassin', attr: '천(天)', hp: 34379, atk: 1400, maxCharge: 3, emoji: '👻' }],
      [{ name: '부정한 신', cls: 'Assassin', attr: '천(天)', hp: 160487, atk: 2500, maxCharge: 3, emoji: '🪞' }, { name: '기령', cls: 'Assassin', attr: '천(天)', hp: 70506, atk: 1750, maxCharge: 3, emoji: '👻' }]
    ]
  },
  // ---- 세일럼 ----
  {
    id: 'fq_salem_carter', category: 'free_p15', chapter: '1.5부 세일럼',
    name: '🗺️ 세일럼 카터 가 — 크로우즈 네스트',
    desc: 'AP 20 · 추천 Lv.72 · 만신의 심장 최고 효율 + 소곡의 말뚝 동시 파밍!',
    difficulty: 'AP 20 · 추천 Lv.72',
    rewardText: '❤️‍🔥 만신의 심장 ×1 · 🪵 소곡의 말뚝 ×2 · 🪙 9,880 QP',
    drops: [['만신의 심장', 1], ['소곡의 철항', 2]],
    rewards: { sq: 1, embers: 5, qp: 9880, fp: 900, mcExp: 18888 },
    waves: [
      [{ name: '엘더 구울 A', cls: 'Assassin', attr: '지(地)', hp: 30685, atk: 1300, maxCharge: 3, emoji: '🧟' }, { name: '엘더 구울 B', cls: 'Assassin', attr: '지(地)', hp: 35865, atk: 1400, maxCharge: 3, emoji: '🧟' }],
      [{ name: '엘더 구울 A', cls: 'Assassin', attr: '지(地)', hp: 40944, atk: 1500, maxCharge: 3, emoji: '🧟' }, { name: '엘더 구울 B', cls: 'Assassin', attr: '지(地)', hp: 38912, atk: 1450, maxCharge: 3, emoji: '🧟' }],
      [{ name: '데몬', cls: 'Caster', attr: '천(天)', hp: 199841, atk: 2650, maxCharge: 4, emoji: '😈' }]
    ]
  },
  {
    id: 'fq_salem_gallows', category: 'free_p15', chapter: '1.5부 세일럼',
    name: '🗺️ 세일럼 교수대의 언덕 — 익스큐션 사이트',
    desc: 'AP 21 · 추천 Lv.78 · 소곡의 말뚝(철항) 최고 드랍률 성지!',
    difficulty: 'AP 21 · 추천 Lv.78',
    rewardText: '🪵 소곡의 말뚝 ×3 · 🪙 10,660 QP',
    drops: [['소곡의 철항', 3]],
    rewards: { sq: 1, embers: 5, qp: 10660, fp: 950, mcExp: 22488 },
    waves: [
      [{ name: '구울 글러튼', cls: 'Berserker', attr: '지(地)', hp: 13057, atk: 1050, maxCharge: 4, emoji: '🧟' }, { name: '구울 엔비야', cls: 'Berserker', attr: '지(地)', hp: 13077, atk: 1050, maxCharge: 4, emoji: '🧟' }],
      [{ name: '엘더 구울', cls: 'Assassin', attr: '지(地)', hp: 38912, atk: 1450, maxCharge: 3, emoji: '🧟' }, { name: '구울 엔비야', cls: 'Berserker', attr: '지(地)', hp: 16695, atk: 1150, maxCharge: 4, emoji: '🧟' }],
      [{ name: '엘더 구울 A', cls: 'Assassin', attr: '지(地)', hp: 192012, atk: 2550, maxCharge: 3, emoji: '🧟' }, { name: '엘더 구울 B', cls: 'Assassin', attr: '지(地)', hp: 51180, atk: 1600, maxCharge: 3, emoji: '🧟' }]
    ]
  },
  {
    id: 'fq_salem_whateley', category: 'free_p15', chapter: '1.5부 세일럼',
    name: '🗺️ 세일럼 웨이틀리 가 — 알케믹 필드',
    desc: 'AP 21 · 추천 Lv.76 · 호문쿨루스 베이비 최고 효율!',
    difficulty: 'AP 21 · 추천 Lv.76',
    rewardText: '🧫 호문쿨루스 베이비 ×3 · 🪙 10,400 QP',
    drops: [['호문쿨루스 베이비', 3]],
    rewards: { sq: 1, embers: 5, qp: 10400, fp: 900, mcExp: 21256 },
    waves: [
      [{ name: '호문쿨루스 A', cls: 'Lancer', attr: '지(地)', hp: 10986, atk: 900, maxCharge: 4, emoji: '🧪' }, { name: '호문쿨루스 C', cls: 'Lancer', attr: '지(地)', hp: 11505, atk: 920, maxCharge: 4, emoji: '🧪' }],
      [{ name: '프로토 호문쿨루스', cls: 'Lancer', attr: '지(地)', hp: 24749, atk: 1300, maxCharge: 4, emoji: '🧪' }, { name: '호문쿨루스 A', cls: 'Lancer', attr: '지(地)', hp: 20913, atk: 1150, maxCharge: 4, emoji: '🧪' }],
      [{ name: '프로토 호문쿨루스 B', cls: 'Lancer', attr: '지(地)', hp: 189802, atk: 2550, maxCharge: 4, emoji: '🧪' }, { name: '프로토 호문쿨루스 A', cls: 'Lancer', attr: '지(地)', hp: 64306, atk: 1700, maxCharge: 4, emoji: '🧪' }]
    ]
  }
];

// =========================================================================
// FGO Part 2 First Half Free Quests (v36)
// LB1 아나스타샤 · LB2 괴터데머룽 · LB3 신 · LB4 유가 크셰트라 · LB5 아틀란티스
// =========================================================================
window.FGO_FREE_QUESTS_P2A = [
  // ---- LB1 아나스타샤 ----
  {
    id: 'fq_lb1_smolensk', category: 'free_p2a', chapter: '2부 1장 아나스타샤',
    name: '🗺️ LB1 야가 스몰렌스크 — 짐승의 도시',
    desc: 'AP 20 · 추천 Lv.72 · 여진화약 최고 드랍률 성지!',
    difficulty: 'AP 20 · 추천 Lv.72',
    rewardText: '🧨 여진화약 ×3 · 🪙 9,880 QP',
    drops: [['여진화약', 3]],
    rewards: { sq: 1, embers: 5, qp: 9880, fp: 900, mcExp: 18888 },
    waves: [
      [{ name: '야가 A', cls: 'Saber', attr: '지(地)', hp: 16923, atk: 1050, maxCharge: 3, emoji: '🐺' }, { name: '야가 B', cls: 'Assassin', attr: '지(地)', hp: 16732, atk: 1050, maxCharge: 3, emoji: '🐺' }],
      [{ name: '야가 A', cls: 'Saber', attr: '지(地)', hp: 25886, atk: 1250, maxCharge: 3, emoji: '🐺' }, { name: '야가 B', cls: 'Saber', attr: '지(地)', hp: 26456, atk: 1280, maxCharge: 3, emoji: '🐺' }],
      [{ name: '야가 A', cls: 'Saber', attr: '지(地)', hp: 160815, atk: 2450, maxCharge: 3, emoji: '🐺' }, { name: '야가 B', cls: 'Assassin', attr: '지(地)', hp: 45301, atk: 1500, maxCharge: 3, emoji: '🐺' }]
    ]
  },
  {
    id: 'fq_lb1_moscow', category: 'free_p2a', chapter: '2부 1장 아나스타샤',
    name: '🗺️ LB1 야가 모스크바 — 잠자는 도시',
    desc: 'AP 21 · 추천 Lv.78 · 영원결빙 최고 파밍 성지!',
    difficulty: 'AP 21 · 추천 Lv.78',
    rewardText: '❄️ 영원결빙 ×3 · 🪙 10,660 QP',
    drops: [['영원결빙', 3]],
    rewards: { sq: 1, embers: 5, qp: 10660, fp: 950, mcExp: 22488 },
    waves: [
      [{ name: '살육엽병 A', cls: 'Assassin', attr: '지(地)', hp: 25227, atk: 1200, maxCharge: 3, emoji: '❄️' }, { name: '살육엽병 C', cls: 'Assassin', attr: '지(地)', hp: 28871, atk: 1300, maxCharge: 3, emoji: '❄️' }],
      [{ name: '살육엽병 A', cls: 'Assassin', attr: '지(地)', hp: 31331, atk: 1380, maxCharge: 3, emoji: '❄️' }, { name: '살육엽병 C', cls: 'Assassin', attr: '지(地)', hp: 32245, atk: 1400, maxCharge: 3, emoji: '❄️' }],
      [{ name: '살육엽병 A', cls: 'Assassin', attr: '지(地)', hp: 168434, atk: 2500, maxCharge: 3, emoji: '❄️' }, { name: '살육엽병 B', cls: 'Assassin', attr: '지(地)', hp: 50274, atk: 1600, maxCharge: 3, emoji: '❄️' }]
    ]
  },
  // ---- LB2 괴터데머룽 ----
  {
    id: 'fq_lb2_giant', category: 'free_p2a', chapter: '2부 2장 괴터데머룽',
    name: '🗺️ LB2 거인의 화원 — 불꽃과 얼음의 틈새',
    desc: 'AP 20 · 추천 Lv.72 · 거인의 반지 집중 파밍!',
    difficulty: 'AP 20 · 추천 Lv.72',
    rewardText: '💍 거인의 반지 ×3 · 🪙 9,880 QP',
    drops: [['거인의 반지', 3]],
    rewards: { sq: 1, embers: 5, qp: 9880, fp: 900, mcExp: 18888 },
    waves: [
      [{ name: '서리 거인 A', cls: 'Berserker', attr: '천(天)', hp: 21819, atk: 1200, maxCharge: 4, emoji: '🧊' }, { name: '서리 거인 B', cls: 'Berserker', attr: '천(天)', hp: 24771, atk: 1250, maxCharge: 4, emoji: '🧊' }],
      [{ name: '산 거인', cls: 'Berserker', attr: '천(天)', hp: 33774, atk: 1450, maxCharge: 4, emoji: '🏔️' }, { name: '서리 거인', cls: 'Berserker', attr: '천(天)', hp: 31821, atk: 1400, maxCharge: 4, emoji: '🧊' }],
      [{ name: '산 거인 A', cls: 'Berserker', attr: '천(天)', hp: 152001, atk: 2450, maxCharge: 4, emoji: '🏔️' }, { name: '산 거인 B', cls: 'Berserker', attr: '천(天)', hp: 53401, atk: 1650, maxCharge: 4, emoji: '🏔️' }]
    ]
  },
  {
    id: 'fq_lb2_castle', category: 'free_p2a', chapter: '2부 2장 괴터데머룽',
    name: '🗺️ LB2 눈과 얼음의 성 — 얼음의 가교',
    desc: 'AP 21 · 추천 Lv.76 · 오로라강 최고 파밍 성지!',
    difficulty: 'AP 21 · 추천 Lv.76',
    rewardText: '🔷 오로라강 ×3 · 🪙 10,400 QP',
    drops: [['오로라강', 3]],
    rewards: { sq: 1, embers: 5, qp: 10400, fp: 950, mcExp: 21256 },
    waves: [
      [{ name: '발키리 A', cls: 'Rider', attr: '천(天)', hp: 9884, atk: 900, maxCharge: 4, emoji: '🪽' }, { name: '발키리 B', cls: 'Rider', attr: '천(天)', hp: 10889, atk: 920, maxCharge: 4, emoji: '🪽' }],
      [{ name: '발키리 A', cls: 'Rider', attr: '천(天)', hp: 30279, atk: 1350, maxCharge: 4, emoji: '🪽' }, { name: '발키리 C', cls: 'Rider', attr: '천(天)', hp: 33264, atk: 1400, maxCharge: 4, emoji: '🪽' }],
      [{ name: '발키리 C', cls: 'Rider', attr: '천(天)', hp: 180432, atk: 2550, maxCharge: 4, emoji: '🪽' }, { name: '발키리 B', cls: 'Rider', attr: '천(天)', hp: 49586, atk: 1600, maxCharge: 4, emoji: '🪽' }]
    ]
  },
  // ---- LB3 인지통합진국 신 ----
  {
    id: 'fq_lb3_prison', category: 'free_p2a', chapter: '2부 3장 신',
    name: '🗺️ LB3 수용소 — 청천백일',
    desc: 'AP 21 · 추천 Lv.76 · 효광노심 & 한고령 파밍 성지!',
    difficulty: 'AP 21 · 추천 Lv.76',
    rewardText: '⚛️ 효광노심 ×2 · 🛎️ 한고령 ×2 · 🪙 10,400 QP',
    drops: [['효광노심', 2], ['한고령', 2]],
    rewards: { sq: 1, embers: 5, qp: 10400, fp: 950, mcExp: 21256 },
    waves: [
      [{ name: '근위병 A', cls: 'Assassin', attr: '인(人)', hp: 15136, atk: 1000, maxCharge: 3, emoji: '🗡️' }, { name: '근위병 B', cls: 'Assassin', attr: '인(人)', hp: 16342, atk: 1050, maxCharge: 3, emoji: '🗡️' }],
      [{ name: '다다익선 호', cls: 'Archer', attr: '인(人)', hp: 50502, atk: 1600, maxCharge: 3, emoji: '🤖' }, { name: '근위병 A', cls: 'Assassin', attr: '인(人)', hp: 20141, atk: 1150, maxCharge: 3, emoji: '🗡️' }],
      [{ name: '다다익선 호 A', cls: 'Archer', attr: '인(人)', hp: 178837, atk: 2550, maxCharge: 3, emoji: '🤖' }, { name: '다다익선 호 B', cls: 'Archer', attr: '인(人)', hp: 80684, atk: 1900, maxCharge: 3, emoji: '🤖' }]
    ]
  },
  {
    id: 'fq_lb3_palmun', category: 'free_p2a', chapter: '2부 3장 신',
    name: '🗺️ LB3 팔문동 — 지하단련장',
    desc: 'AP 21 · 추천 Lv.80 · 한고령 최고 파밍 성지!',
    difficulty: 'AP 21 · 추천 Lv.80',
    rewardText: '🛎️ 한고령 ×3 · 🪙 10,920 QP',
    drops: [['한고령', 3]],
    rewards: { sq: 1, embers: 5, qp: 10920, fp: 950, mcExp: 23752 },
    waves: [
      [{ name: '근위병 A', cls: 'Assassin', attr: '인(人)', hp: 17588, atk: 1080, maxCharge: 3, emoji: '🗡️' }, { name: '근위병 C', cls: 'Assassin', attr: '인(人)', hp: 20232, atk: 1150, maxCharge: 3, emoji: '🗡️' }],
      [{ name: '근위병 A', cls: 'Assassin', attr: '인(人)', hp: 25060, atk: 1250, maxCharge: 3, emoji: '🗡️' }, { name: '근위병 B', cls: 'Assassin', attr: '인(人)', hp: 26132, atk: 1280, maxCharge: 3, emoji: '🗡️' }],
      [{ name: '근위병 A', cls: 'Assassin', attr: '인(人)', hp: 183480, atk: 2600, maxCharge: 3, emoji: '🗡️' }, { name: '근위병 C', cls: 'Assassin', attr: '인(人)', hp: 47607, atk: 1550, maxCharge: 3, emoji: '🗡️' }]
    ]
  },
  // ---- LB4 유가 크셰트라 ----
  {
    id: 'fq_lb4_divar', category: 'free_p2a', chapter: '2부 4장 유가 크셰트라',
    name: '🗺️ LB4 디바르 — 벽을 둘러친 마을',
    desc: 'AP 21 · 추천 Lv.76 · 진리의 알 & 화진의 화살촉 최고 성지!',
    difficulty: 'AP 21 · 추천 Lv.76',
    rewardText: '🥚 진리의 알 ×2 · 🏹 화진의 화살촉 ×2 · 🪙 10,400 QP',
    drops: [['진리의 알', 2], ['재앙의 화살촉', 2]],
    rewards: { sq: 1, embers: 5, qp: 10400, fp: 950, mcExp: 21256 },
    waves: [
      [{ name: '칼리 A', cls: 'Berserker', attr: '지(地)', hp: 29820, atk: 1350, maxCharge: 4, emoji: '👹' }, { name: '칼리 C', cls: 'Berserker', attr: '지(地)', hp: 32058, atk: 1400, maxCharge: 4, emoji: '👹' }],
      [{ name: '칼리 A', cls: 'Berserker', attr: '지(地)', hp: 40201, atk: 1550, maxCharge: 4, emoji: '👹' }, { name: '칼리 C', cls: 'Berserker', attr: '지(地)', hp: 41067, atk: 1580, maxCharge: 4, emoji: '👹' }],
      [{ name: '마하나가', cls: 'Lancer', attr: '천(天)', hp: 175857, atk: 2600, maxCharge: 4, emoji: '🥚' }]
    ]
  },
  {
    id: 'fq_lb4_skyrock', category: 'free_p2a', chapter: '2부 4장 유가 크셰트라',
    name: '🗺️ LB4 신의 하늘 바위 흔적 — 악마의 세력권',
    desc: 'AP 21 · 추천 Lv.78 · 화진의 화살촉 최고 효율!',
    difficulty: 'AP 21 · 추천 Lv.78',
    rewardText: '🏹 화진의 화살촉 ×3 · 🪙 10,660 QP',
    drops: [['재앙의 화살촉', 3]],
    rewards: { sq: 1, embers: 5, qp: 10660, fp: 950, mcExp: 22488 },
    waves: [
      [{ name: '칼리 A', cls: 'Berserker', attr: '지(地)', hp: 24889, atk: 1250, maxCharge: 4, emoji: '👹' }, { name: '칼리 B', cls: 'Berserker', attr: '지(地)', hp: 24240, atk: 1220, maxCharge: 4, emoji: '👹' }],
      [{ name: '칼리 A', cls: 'Berserker', attr: '지(地)', hp: 34617, atk: 1450, maxCharge: 4, emoji: '👹' }, { name: '칼리 C', cls: 'Berserker', attr: '지(地)', hp: 35363, atk: 1480, maxCharge: 4, emoji: '👹' }],
      [{ name: '칼리 상가', cls: 'Berserker', attr: '지(地)', hp: 107374, atk: 2250, maxCharge: 4, emoji: '👹' }, { name: '칼리 A', cls: 'Berserker', attr: '지(地)', hp: 58118, atk: 1700, maxCharge: 4, emoji: '👹' }]
    ]
  },
  // ---- LB5 아틀란티스 ----
  {
    id: 'fq_lb5_nemesis', category: 'free_p2a', chapter: '2부 5장 아틀란티스',
    name: '🗺️ LB5 네메시스 섬 — 신벌의 거친 바다',
    desc: 'AP 21 · 추천 Lv.80 · 황성의 조각 & 광은의 관 최고 성지!',
    difficulty: 'AP 21 · 추천 Lv.80',
    rewardText: '🌠 황성의 조각 ×2 · 👑 광은의 관 ×2 · 🪙 10,920 QP',
    drops: [['황성의 조각', 2], ['광은의 관', 2]],
    rewards: { sq: 1, embers: 5, qp: 10920, fp: 950, mcExp: 23752 },
    waves: [
      [{ name: '아틀란티스 방위병 A', cls: 'Berserker', attr: '인(人)', hp: 31931, atk: 1350, maxCharge: 4, emoji: '🛡️' }, { name: '아틀란티스 방위병 B', cls: 'Berserker', attr: '인(人)', hp: 37720, atk: 1450, maxCharge: 4, emoji: '🛡️' }],
      [{ name: '아틀란티스 방위병 A', cls: 'Berserker', attr: '인(人)', hp: 41204, atk: 1550, maxCharge: 4, emoji: '🛡️' }, { name: '아틀란티스 방위병 C', cls: 'Berserker', attr: '인(人)', hp: 47765, atk: 1650, maxCharge: 4, emoji: '🛡️' }],
      [{ name: '케르베로스', cls: 'Rider', attr: '지(地)', hp: 111912, atk: 2350, maxCharge: 4, emoji: '🐺' }, { name: '아틀란티스 방위병', cls: 'Berserker', attr: '인(人)', hp: 54976, atk: 1700, maxCharge: 4, emoji: '🛡️' }]
    ]
  },
  {
    id: 'fq_lb5_thanatos', category: 'free_p2a', chapter: '2부 5장 아틀란티스',
    name: '🗺️ LB5 타나토스 섬 — 죽음의 제단',
    desc: 'AP 21 · 추천 Lv.80 · 광은의 관 최고 효율!',
    difficulty: 'AP 21 · 추천 Lv.80',
    rewardText: '👑 광은의 관 ×3 · 🪙 10,920 QP',
    drops: [['광은의 관', 3]],
    rewards: { sq: 1, embers: 5, qp: 10920, fp: 950, mcExp: 23752 },
    waves: [
      [{ name: '아틀란티스 방위병 A', cls: 'Assassin', attr: '인(人)', hp: 30104, atk: 1300, maxCharge: 3, emoji: '🛡️' }, { name: '아틀란티스 방위병 B', cls: 'Saber', attr: '인(人)', hp: 32078, atk: 1350, maxCharge: 4, emoji: '🛡️' }],
      [{ name: '아틀란티스 방위병 A', cls: 'Saber', attr: '인(人)', hp: 54964, atk: 1700, maxCharge: 4, emoji: '🛡️' }, { name: '아틀란티스 방위병 B', cls: 'Berserker', attr: '인(人)', hp: 42648, atk: 1550, maxCharge: 4, emoji: '🛡️' }],
      [{ name: '아틀란티스 방위병 C', cls: 'Saber', attr: '인(人)', hp: 60862, atk: 1850, maxCharge: 4, emoji: '🛡️' }, { name: '아틀란티스 방위병 B', cls: 'Assassin', attr: '인(人)', hp: 51840, atk: 1650, maxCharge: 3, emoji: '🛡️' }]
    ]
  }
];
