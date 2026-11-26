// ============================================================
// CHALDEA SUMMON SIMULATOR — 원작 FGO 배틀 시스템 완벽 고증 엔진 (battle.js)
// - 6인 편성 (본인 5명 + 프렌드 서포트 1명) · 전열 3명 + 후열 3명 자동 증원
// - 버스터(1.5/1.8/2.1, NP 0)/아츠(1.0)/퀵(0.8) · 체인 7종(마이티·브레이브·퀵+20스타)
// - 보구 오버차지(100% 단위 절사 · 보구 체인 OC+100%/+200% · 보구 자체 퍼스트 미적용)
// - 정확한 클래스 스타 집중도(라200/아150/세어룰실100/랜90/캐50/버10) · 크리×오버킬 곱연산
// - 영주 3획(매일 0시 전회복 · 영기수복/보구해방/전멸 영기복원+성정석 부활) · 전투 자동저장 이어하기
// ============================================================

window.FgoBattle = (() => {
  const ACTIVE_BATTLE_KEY = 'fgo_gacha_active_battle_v1';

  // ================= 원작 FGO 16×16 클래스 상성표 + 공격측 보정치 + 5×5 히든 속성 =================
  const CLASS_ATK_MOD = {
    Saber: 1.00,
    Archer: 0.95,
    Lancer: 1.05,
    Rider: 1.00,
    Caster: 0.90,
    Assassin: 0.90,
    Berserker: 1.10,
    Shielder: 1.00,
    BeastII: 1.00,
    Ruler: 1.10,
    Avenger: 1.10,
    MoonCancer: 1.00,
    AlterEgo: 1.00,
    Pretender: 1.00,
    Foreigner: 1.00,
    Beast: 1.00,
    UnBeast: 1.00,
    BeastI: 1.00,
    BeastIIIR: 1.00
  };

  // CLASS_AFFINITY[공격군][피격군] (표에 없는 조합은 기본 1.0x 무상성)
  const CLASS_AFFINITY = {
    Saber:      { Archer: 0.5, Lancer: 2.0, Berserker: 2.0, Ruler: 0.5 },
    Archer:     { Saber: 2.0, Lancer: 0.5, Berserker: 2.0, Ruler: 0.5 },
    Lancer:     { Saber: 0.5, Archer: 2.0, Berserker: 2.0, Ruler: 0.5 },
    Rider:      { Caster: 2.0, Assassin: 0.5, Berserker: 2.0, Ruler: 0.5, BeastI: 2.0 },
    Caster:     { Rider: 0.5, Assassin: 2.0, Berserker: 2.0, Ruler: 0.5, BeastI: 2.0 },
    Assassin:   { Rider: 2.0, Caster: 0.5, Berserker: 2.0, Ruler: 0.5, BeastI: 2.0 },
    Berserker:  {
      Saber: 1.5, Archer: 1.5, Lancer: 1.5, Rider: 1.5, Caster: 1.5, Assassin: 1.5,
      Berserker: 1.5, Ruler: 1.5, Avenger: 1.5, MoonCancer: 1.5, AlterEgo: 1.5,
      Pretender: 1.5, Foreigner: 0.5, BeastI: 1.5
    },
    Shielder:   {},
    BeastII:    {},
    Ruler:      { Berserker: 2.0, Avenger: 0.5, MoonCancer: 2.0 },
    Avenger:    { Berserker: 2.0, Ruler: 2.0, MoonCancer: 0.5 },
    MoonCancer: { Berserker: 2.0, Ruler: 0.5, Avenger: 2.0, BeastIIIR: 1.2 },
    AlterEgo:   {
      Saber: 0.5, Archer: 0.5, Lancer: 0.5, Rider: 1.5, Caster: 1.5, Assassin: 1.5,
      Berserker: 2.0, Pretender: 0.5, Foreigner: 2.0, BeastIIIR: 1.2
    },
    Pretender:  {
      Saber: 1.5, Archer: 1.5, Lancer: 1.5, Rider: 0.5, Caster: 0.5, Assassin: 0.5,
      Berserker: 2.0, AlterEgo: 2.0, Foreigner: 0.5
    },
    Foreigner:  { Berserker: 2.0, AlterEgo: 0.5, Pretender: 2.0, Foreigner: 2.0 },
    Beast:      { Saber: 1.5, Archer: 1.5, Lancer: 1.5, Rider: 1.5, Caster: 1.5, Assassin: 1.5, Berserker: 1.5, Ruler: 0.5, Avenger: 0.5, MoonCancer: 0.5, AlterEgo: 0.5, Pretender: 0.5, Foreigner: 0.5 },
    UnBeast:    { Saber: 1.5, Archer: 1.5, Lancer: 1.5, Rider: 1.5, Caster: 1.5, Assassin: 1.5, Berserker: 1.5, Ruler: 0.5, Avenger: 0.5, MoonCancer: 0.5, AlterEgo: 0.5, Pretender: 0.5, Foreigner: 0.5 },
    BeastI:     { Saber: 2.0, Archer: 2.0, Lancer: 2.0, Berserker: 2.0, Avenger: 0.5 },
    BeastIIIR:  {}
  };

  // 5×5 히든 속성 상성 (인간→하늘→땅→인간 1.1x/0.9x, 별↔짐승 1.1x)
  const ATTR_AFFINITY = {
    '인(人)': { '천(天)': 1.1, '지(地)': 0.9 },
    '천(天)': { '인(人)': 0.9, '지(地)': 1.1 },
    '지(地)': { '인(人)': 1.1, '천(天)': 0.9 },
    '성(星)': { '수(獸)': 1.1 },
    '수(獸)': { '성(星)': 1.1 }
  };

  function getClassAtkMod(cls) {
    return CLASS_ATK_MOD[cls] ?? 1.0;
  }

  function getClassMultiplier(atkCls, defCls) {
    const row = CLASS_AFFINITY[atkCls];
    if (!row) return 1.0;
    return row[defCls] ?? 1.0;
  }

  function getAttrMultiplier(atkAttr, defAttr) {
    if (!atkAttr || !defAttr) return 1.0;
    const row = ATTR_AFFINITY[atkAttr];
    return (row && row[defAttr]) || 1.0;
  }

  function getCombinedDamageMod(atkCls, defCls, atkAttr, defAttr) {
    return getClassAtkMod(atkCls) * getClassMultiplier(atkCls, defCls) * getAttrMultiplier(atkAttr, defAttr);
  }

  // 원작 FGO 클래스별 기본 스타 집중도 (Star Weight)
  const STAR_WEIGHT = {
    Rider: 200,
    Archer: 150,
    Foreigner: 150,
    Assassin: 100,
    Saber: 100,
    Ruler: 100,
    Shielder: 100,
    AlterEgo: 100,
    Pretender: 100,
    Lancer: 90,
    Caster: 50,
    MoonCancer: 50,
    Avenger: 30,
    Berserker: 10,
    Beast: 150,
    UnBeast: 150
  };

  // 적 클래스별 피격 시 아군 NP 획득률 보정 (원작 FGO 시스템 3연사 핵심 계수!)
  const ENEMY_NP_MOD = {
    Rider: 1.1,
    Caster: 1.2,
    MoonCancer: 1.2,
    Assassin: 0.9,
    Berserker: 0.8
  };
  function getEnemyNpMod(enemyCls) {
    return ENEMY_NP_MOD[enemyCls] ?? 1.0;
  }

  // 서번트별 공식 5장 커맨드 덱 (Atlas Academy KR 공식 데이터 우선 사용!)
  function getServantDeckTypes(sv) {
    if (Array.isArray(sv.cards) && sv.cards.length === 5) return sv.cards;
    if (sv.cls === 'Berserker') return ['Buster', 'Buster', 'Buster', 'Arts', 'Quick'];
    if (sv.cls === 'Caster') return ['Arts', 'Arts', 'Arts', 'Buster', 'Quick'];
    if (sv.cls === 'Assassin') return ['Quick', 'Quick', 'Quick', 'Arts', 'Buster'];
    if (sv.npType === 'Buster') return ['Buster', 'Buster', 'Arts', 'Arts', 'Quick'];
    if (sv.npType === 'Arts') return ['Arts', 'Arts', 'Buster', 'Quick', 'Quick'];
    return ['Quick', 'Quick', 'Arts', 'Buster', 'Buster'];
  }

  // 보구 레벨별 최대 NP 게이지 (보1=100%, 보2~4=200%, 보5=300% — 원작 고증)
  function getMaxNp(npLevel) {
    if (npLevel >= 5) return 300;
    if (npLevel >= 2) return 200;
    return 100;
  }

  const SUPPORT_NPS = new Set(['sv_castoria', 'sv_waver', 'sv_jeanne', 'sv_tamamo', 'sv_xu_fu', 'sv_stheno']);
  const SINGLE_NPS  = new Set(['sv_melusine', 'sv_enkidu', 'sv_ozymandias', 'sv_jack', 'sv_cu_alter', 'sv_heracles', 'sv_baobhan', 'sv_tristan', 'sv_cu', 'sv_ushiwaka', 'sv_robin', 'sv_bedivere', 'sv_euryale', 'sv_izok', 'sv_mandricardo']);

  function getNpCategory(sv) {
    if (sv.npCat) return sv.npCat;
    if (SUPPORT_NPS.has(sv.id)) return 'support';
    if (SINGLE_NPS.has(sv.id)) return 'single';
    return 'aoe';
  }

  // 서번트 3스킬 생성 (저장 복원 가능하도록 데이터+핸들러 분리)
  function getSkillDefs(sv) {
    const names = (sv.skills && sv.skills.length >= 3) ? sv.skills : ['카리스마 A', '마력방출 A', '심안(진) B'];
    if (sv.id === 'sv_castoria') {
      return [
        { key: 'castoria_1', name: names[0], cd: 5, icon: '⚔️', desc: '아군 전체 공격력 +20%(3T) & NP +30%' },
        { key: 'castoria_2', name: names[1], cd: 5, icon: '💎', desc: '아군 전체 NP +20% & NP 획득량 +30%(3T)' },
        { key: 'castoria_3', name: names[2], cd: 6, icon: '🔵', desc: '아군 전체 Arts +50%(3T) & 무적(1T)' }
      ];
    }
    if (sv.id === 'sv_oberon') {
      return [
        { key: 'oberon_1', name: names[0], cd: 5, icon: '🦋', desc: '아군 전체 보구 위력 +30%(3T) & NP +20%' },
        { key: 'oberon_2', name: names[1], cd: 5, icon: '💎', desc: '아군 전체 NP +50% & 크리스타 +20' },
        { key: 'oberon_3', name: names[2], cd: 6, icon: '🔥', desc: '아군 전체 Buster +50% & 보구 위력 2배 부스트(1T)!' }
      ];
    }
    if (sv.id === 'sv_koyanskaya') {
      return [
        { key: 'koyan_1', name: names[0], cd: 6, icon: '💎', desc: '아군 전체 NP +50% & 스킬 쿨타임 -2턴' },
        { key: 'koyan_2', name: names[1], cd: 5, icon: '⭐', desc: '아군 전체 공격력 +25%(3T) & 크리스타 +20' },
        { key: 'koyan_3', name: names[2], cd: 5, icon: '🔴', desc: '아군 전체 Buster +50%(3T) & 크리티컬 위력 +50%' }
      ];
    }
    if (sv.id === 'sv_waver') {
      return [
        { key: 'waver_1', name: names[0], cd: 5, icon: '💎', desc: '아군 전체 크리 위력 +40% & NP +30%' },
        { key: 'waver_2', name: names[1], cd: 5, icon: '🛡️', desc: '아군 전체 방어력 +30%(3T) & NP +10%' },
        { key: 'waver_3', name: names[2], cd: 5, icon: '⚔️', desc: '아군 전체 공격력 +30%(3T) & NP +10%' }
      ];
    }
    const cardIcon = sv.npType === 'Buster' ? '🔴' : (sv.npType === 'Arts' ? '🔵' : '🟢');
    const npCharge = sv.id === 'sv_arcueid' ? 100 : (sv.rarity === 5 ? 50 : (sv.rarity === 4 ? 30 : 25));
    return [
      { key: 'gen_1', name: names[0], cd: 5, icon: '⚔️', desc: `아군 전체 공격력 +20%(3T) & 자신 ${sv.npType} +30%(3T)` },
      { key: 'gen_2', name: names[1], cd: 5, icon: '💎', desc: `자신 NP +${npCharge}% & 크리티컬 스타 +15` },
      { key: 'gen_3', name: names[2], cd: 6, icon: cardIcon, desc: '자신 회피/무적(1T) & 보구 위력 +30%(3T) & HP +2500' }
    ];
  }

  function applyServantSkill(b, caster, key, name) {
    const alive = getActiveMembers(b);
    const sv = SERVANT_MAP[caster.id];
    const addNp = (m, amt) => { m.np = Math.min(getMaxNp(m.npLevel), m.np + amt); };

    switch (key) {
      case 'castoria_1':
        alive.forEach(m => { m.buffs.atk += 0.2; m.buffs.atkT = 3; addNp(m, 30); });
        return `${sv.name} [${name}]! 아군 전체 공업 +20% & NP +30%!`;
      case 'castoria_2':
        alive.forEach(m => { addNp(m, 20); m.buffs.npGain += 0.3; m.buffs.npGainT = 3; });
        return `${sv.name} [${name}]! 아군 전체 NP +20% & NP 획득량 UP!`;
      case 'castoria_3':
        alive.forEach(m => { m.buffs.arts += 0.5; m.buffs.cardT = 3; m.buffs.invul = Math.max(m.buffs.invul, 1); });
        return `${sv.name} [${name}]! 아군 전체 Arts +50% & 무적(1T)!`;
      case 'oberon_1':
        alive.forEach(m => { m.buffs.npDmg += 0.3; m.buffs.npDmgT = 3; addNp(m, 20); });
        return `${sv.name} [${name}]! 아군 전체 보구 위력 +30% & NP +20%!`;
      case 'oberon_2':
        alive.forEach(m => addNp(m, 50));
        b.stars = Math.min(99, b.stars + 20);
        return `${sv.name} [${name}]! 아군 전체 NP +50% & 스타 +20!`;
      case 'oberon_3':
        alive.forEach(m => { m.buffs.buster += 0.5; m.buffs.cardT = 3; m.buffs.npBoost = 2.0; });
        return `${sv.name} [${name}]! 아군 전체 Buster +50% & 보구 위력 2배 부스트!!`;
      case 'koyan_1':
        alive.forEach(m => { addNp(m, 50); m.skills.forEach(sk => { if (sk.curCd > 0) sk.curCd = Math.max(0, sk.curCd - 2); }); });
        return `${sv.name} [${name}]! 아군 전체 NP +50% & 쿨타임 -2턴!`;
      case 'koyan_2':
        alive.forEach(m => { m.buffs.atk += 0.25; m.buffs.atkT = 3; });
        b.stars = Math.min(99, b.stars + 20);
        return `${sv.name} [${name}]! 아군 공격력 +25% & 스타 +20!`;
      case 'koyan_3':
        alive.forEach(m => { m.buffs.buster += 0.5; m.buffs.cardT = 3; m.buffs.crit += 0.5; m.buffs.critT = 3; });
        return `${sv.name} [${name}]! 아군 전체 Buster +50% & 크리 위력 +50%!`;
      case 'waver_1':
        alive.forEach(m => { m.buffs.crit += 0.4; m.buffs.critT = 3; addNp(m, 30); });
        return `${sv.name} [${name}]! 아군 전체 크리 +40% & NP +30%!`;
      case 'waver_2':
        alive.forEach(m => { m.buffs.def += 0.3; m.buffs.defT = 3; addNp(m, 10); });
        return `${sv.name} [${name}]! 아군 전체 방어 +30% & NP +10%!`;
      case 'waver_3':
        alive.forEach(m => { m.buffs.atk += 0.3; m.buffs.atkT = 3; addNp(m, 10); });
        return `${sv.name} [${name}]! 아군 전체 공격 +30% & NP +10%!`;
      case 'gen_1': {
        const mc = sv.npType.toLowerCase();
        alive.forEach(m => { m.buffs.atk += 0.2; m.buffs.atkT = 3; });
        caster.buffs[mc] += 0.3; caster.buffs.cardT = 3;
        return `${sv.name} [${name}]! 아군 공업 +20% & 자신 ${sv.npType} +30%!`;
      }
      case 'gen_2': {
        const amt = sv.id === 'sv_arcueid' ? 100 : (sv.rarity === 5 ? 50 : (sv.rarity === 4 ? 30 : 25));
        addNp(caster, amt);
        b.stars = Math.min(99, b.stars + 15);
        return `${sv.name} [${name}]! NP +${amt}% & 스타 +15!`;
      }
      default:
        caster.buffs.invul = Math.max(caster.buffs.invul, 1);
        caster.buffs.npDmg += 0.3; caster.buffs.npDmgT = 3;
        caster.hp = Math.min(caster.maxHp, caster.hp + 2500);
        return `${sv.name} [${name}]! 무적(1T) & 보구 위력 +30% & HP 회복!`;
    }
  }

  function applyMasterSkill(b, idx) {
    const alive = getActiveMembers(b);
    if (idx === 0) {
      alive.forEach(m => { m.buffs.atk += 0.3; m.buffs.atkT = Math.max(m.buffs.atkT, 1); });
      return '마스터 스킬 [전체 강화]! 전열 공격력 +30% (1T)!';
    }
    if (idx === 1) {
      alive.forEach(m => { m.hp = Math.min(m.maxHp, m.hp + 3500); m.buffs.invul = Math.max(m.buffs.invul, 1); });
      return '마스터 스킬 [긴급 회피]! 전열 HP +3500 & 회피(1T)!';
    }
    const t = b.enemies[b.targetIdx];
    if (t && t.hp > 0) t.stunned = true;
    b.stars = Math.min(99, b.stars + 15);
    return `마스터 스킬 [간드]! ${t ? t.name : '적'} 스턴(1T) & 크리스타 +15!`;
  }

  function getCePassive(ceId) {
    if (!ceId) return { startNp: 0, npDmg: 0, buster: 0, arts: 0, quick: 0, starsPerTurn: 0, npPerTurn: 0, crit: 0, hpDrain: 0, label: '미장착' };
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

  // ================= 퀘스트 7종 (종화·QP·특이점·바빌로니아·비스트Ⅰ·비스트Ⅲ/R·EX 챌린지) =================
  const QUESTS = [
    {
      id: 'q_embers',
      name: '🔥 칼데아 게이트 — 종화 수집 (초급)',
      desc: '3웨이브 주회 던전! 경험치 손은 모두 [하늘(天)] 속성 → 인간(人) 속성 서번트가 1.1배 유리!',
      difficulty: '초급 · 추천 Lv.30',
      rewardText: '💎 성정석 +3 · 🔥 종화 +15 · 🪙 QP +500,000',
      rewards: { sq: 3, embers: 15, qp: 500000 },
      waves: [
        [
          { name: '불꽃의 팔', cls: 'Saber', attr: '천(天)', hp: 14500, atk: 1200, maxCharge: 4, emoji: '🔥' },
          { name: '창의 팔', cls: 'Lancer', attr: '천(天)', hp: 15500, atk: 1250, maxCharge: 4, emoji: '⚡' },
          { name: '활의 팔', cls: 'Archer', attr: '천(天)', hp: 14000, atk: 1200, maxCharge: 3, emoji: '🏹' }
        ],
        [
          { name: '황금의 팔', cls: 'Rider', attr: '천(天)', hp: 22000, atk: 1500, maxCharge: 4, emoji: '✨' },
          { name: '황금의 팔', cls: 'Caster', attr: '천(天)', hp: 23500, atk: 1500, maxCharge: 4, emoji: '🔮' },
          { name: '황금의 팔', cls: 'Assassin', attr: '천(天)', hp: 21500, atk: 1500, maxCharge: 3, emoji: '🗡️' }
        ],
        [
          { name: '초월의 팔', cls: 'Berserker', attr: '천(天)', hp: 36000, atk: 1900, maxCharge: 4, emoji: '💀' },
          { name: '예지의 대팔', cls: 'Saber', attr: '천(天)', hp: 52000, atk: 2100, maxCharge: 4, emoji: '👑', isBoss: true },
          { name: '초월의 팔', cls: 'Lancer', attr: '천(天)', hp: 34000, atk: 1900, maxCharge: 4, emoji: '💀' }
        ]
      ]
    },
    {
      id: 'q_qp',
      name: '💰 보물고의 문 — QP 대수집 (중급)',
      desc: '캐스터 [하늘(天)] 문 대거 출현! 라이더(2.0x · 스타집중 200)와 얼터에고(1.5x)로 주회하세요.',
      difficulty: '중급 · 추천 Lv.50',
      rewardText: '💎 성정석 +5 · 🪙 QP +2,000,000 · 🟢 마프 +20',
      rewards: { sq: 5, qp: 2000000, mp: 20 },
      waves: [
        [
          { name: '청동의 문', cls: 'Caster', attr: '천(天)', hp: 24000, atk: 1500, maxCharge: 5, emoji: '🚪' },
          { name: '백은의 문', cls: 'Caster', attr: '천(天)', hp: 28000, atk: 1600, maxCharge: 5, emoji: '🏛️' },
          { name: '청동의 문', cls: 'Caster', attr: '천(天)', hp: 24000, atk: 1500, maxCharge: 5, emoji: '🚪' }
        ],
        [
          { name: '황금의 문', cls: 'Caster', attr: '천(天)', hp: 42000, atk: 1850, maxCharge: 5, emoji: '💰' },
          { name: '황금의 문', cls: 'Caster', attr: '천(天)', hp: 45000, atk: 1850, maxCharge: 5, emoji: '💰' },
          { name: '황금의 문', cls: 'Caster', attr: '천(天)', hp: 42000, atk: 1850, maxCharge: 5, emoji: '💰' }
        ],
        [
          { name: '황금의 문', cls: 'Caster', attr: '천(天)', hp: 48000, atk: 2000, maxCharge: 5, emoji: '💰' },
          { name: '여왕의 보물고', cls: 'Caster', attr: '천(天)', hp: 96000, atk: 2400, maxCharge: 4, emoji: '👑', isBoss: true },
          { name: '황금의 문', cls: 'Caster', attr: '천(天)', hp: 48000, atk: 2000, maxCharge: 5, emoji: '💰' }
        ]
      ]
    },
    {
      id: 'q_salter',
      name: '⚔️ 특이점 F — 흑화 세이버 결전 (상급)',
      desc: '세이버 [인간(人)] 보스전! 아처(2.0x)·프리텐더(1.5x)와 땅(地) 속성 상성으로 제압하세요.',
      difficulty: '상급 · 추천 Lv.70',
      rewardText: '💎 성정석 +10 · 🔥 종화 +25 · 🟢 마프 +35',
      rewards: { sq: 10, embers: 25, mp: 35 },
      waves: [
        [
          { name: '스켈레톤 검사', cls: 'Saber', attr: '지(地)', hp: 38000, atk: 1900, maxCharge: 4, emoji: '☠️' },
          { name: '섀도우 랜서', cls: 'Lancer', attr: '지(地)', hp: 46000, atk: 2100, maxCharge: 4, emoji: '👤' },
          { name: '스켈레톤 검사', cls: 'Saber', attr: '지(地)', hp: 38000, atk: 1900, maxCharge: 4, emoji: '☠️' }
        ],
        [
          { name: '흑화 기사왕 [얼터]', cls: 'Saber', attr: '인(人)', hp: 145000, breakBars: [175000], atk: 3200, maxCharge: 4, emoji: '🖤', isBoss: true, npName: '엑스칼리버 모르간' }
        ]
      ]
    },
    {
      id: 'q_babylonia',
      name: '🐉 바빌로니아 — 티아마트 유체 격퇴전 (고난이도)',
      desc: '비스트Ⅱ [짐승(獸)] 완전 무상성 보스! 별(星) 속성 서번트가 히든 상성 1.1배 유리합니다.',
      difficulty: '고난이도 · 추천 Lv.85',
      rewardText: '💎 성정석 +20 · 🟡 레프 +1 · 🔥 종화 +35',
      rewards: { sq: 20, rp: 1, embers: 35 },
      waves: [
        [
          { name: '라흐무', cls: 'Lancer', attr: '지(地)', hp: 62000, atk: 2400, maxCharge: 4, emoji: '👾' },
          { name: '라흐무', cls: 'Archer', attr: '지(地)', hp: 62000, atk: 2400, maxCharge: 3, emoji: '👾' },
          { name: '라흐무', cls: 'Assassin', attr: '지(地)', hp: 58000, atk: 2400, maxCharge: 3, emoji: '👾' }
        ],
        [
          { name: '벨 라흐무', cls: 'Berserker', attr: '지(地)', hp: 105000, atk: 2800, maxCharge: 4, emoji: '😈' },
          { name: '비스트Ⅱ 티아마트', cls: 'BeastII', attr: '수(獸)', hp: 170000, breakBars: [200000], atk: 3400, maxCharge: 4, emoji: '🐉', isBoss: true, npName: '네가 제네시스' }
        ]
      ]
    },
    {
      id: 'q_goetia',
      name: '🔥 관위시간신전 — 마신왕 게티아 (비스트Ⅰ)',
      desc: '3술사(라·캐·어)에게 2.0x 약점, 3기사에게 2.0x 반격, 어벤저에게 0.5x 반감! 별(星) 속성 1.1x!',
      difficulty: '비스트Ⅰ · 추천 Lv.90',
      rewardText: '💎 성정석 +25 · 🟡 레프 +2 · 🔥 종화 +40',
      rewards: { sq: 25, rp: 2, embers: 40 },
      waves: [
        [
          { name: '마신주 플라우로스', cls: 'Caster', attr: '천(天)', hp: 85000, atk: 2600, maxCharge: 4, emoji: '👁️' },
          { name: '마신왕 게티아', cls: 'BeastI', attr: '수(獸)', hp: 200000, breakBars: [240000], atk: 3600, maxCharge: 4, emoji: '🔥', isBoss: true, npName: '아르스 알마델 살로모니스' }
        ]
      ]
    },
    {
      id: 'q_kiara',
      name: '🌸 SE.RA.PH — 마성보살 키아라 (비스트Ⅲ/R)',
      desc: '얼터에고·문캔서에게 1.2x 약점, 나머지 전 클래스 무상성! 별(星) 속성 아키타입:어스가 빛납니다.',
      difficulty: '비스트Ⅲ/R · 추천 Lv.90',
      rewardText: '💎 성정석 +25 · 🎫 호부 +1 · 🟡 레프 +1',
      rewards: { sq: 25, tickets: 1, rp: 1 },
      waves: [
        [
          { name: '마성보살 셋쇼인 키아라', cls: 'BeastIIIR', attr: '수(獸)', hp: 215000, breakBars: [255000], atk: 3500, maxCharge: 4, emoji: '🌸', isBoss: true, npName: '아미타 아미달라 · 헤븐즈 홀' }
        ]
      ]
    },
    {
      id: 'q_challenge',
      name: '👑 이문대 챌린지 — 거신 케르눈노스 (EX)',
      desc: '6인 총력전! 버서커 [땅(地)] 2중 브레이크 최종 보스. 포리너·하늘(天) 속성과 영주를 총동원하세요!',
      difficulty: 'EX 챌린지 · 추천 Lv.90+',
      rewardText: '💎 성정석 +30 · 🎫 호부 +1 · 🟡 레프 +2',
      rewards: { sq: 30, tickets: 1, rp: 2 },
      waves: [
        [
          { name: '재액의 거신 케르눈노스', cls: 'Berserker', attr: '지(地)', hp: 220000, breakBars: [260000, 310000], atk: 3900, maxCharge: 4, emoji: '👁️', isBoss: true, npName: '칼라미티 커스' }
        ]
      ]
    }
  ];

  // 프렌드 서포트 목록 (6인 중 1명 프렌드 슬롯 전용)
  const SUPPORT_FRIENDS = [
    { id: 'sv_castoria', level: 90, npLevel: 2, ceId: 'ce_2030', isSupport: true },
    { id: 'sv_oberon', level: 90, npLevel: 2, ceId: 'ce_kscope', isSupport: true },
    { id: 'sv_gilgamesh', level: 90, npLevel: 3, ceId: 'ce_black_grail', isSupport: true },
    { id: 'sv_koyanskaya', level: 90, npLevel: 2, ceId: 'ce_2030', isSupport: true },
    { id: 'sv_morgan', level: 90, npLevel: 3, ceId: 'ce_kscope', isSupport: true },
    { id: 'sv_arcueid', level: 90, npLevel: 2, ceId: 'ce_black_grail', isSupport: true }
  ];

  // ================= 배틀 상태 (6인 파티: 전열 0~2 / 후열 3~5, 5번은 프렌드) =================
  let selectedQuestId = QUESTS[0].id;
  let partySlots = [null, null, null, null, null, null]; // 길이 6 (0~4 본인 5명, 5 프렌드 1명)
  let battle = null;
  let busy = false;
  let openPopup = null; // 'master' | 'spells' | 'menu' | null

  function getBridge() { return window.ChaldeaBridge; }

  // 현재 전열(activeSlots: 길이 3, 멤버 인덱스 또는 null) 생존 멤버 반환
  function getActiveMembers(b) {
    return b.activeSlots.map(i => (i !== null ? b.roster[i] : null)).filter(m => m && m.hp > 0);
  }

  function getSubMembers(b) {
    return b.subQueue.map(i => b.roster[i]).filter(m => m && m.hp > 0);
  }

  // 전투 상태 자동 저장 (앱/브라우저 종료 후 이어하기 지원!)
  function saveActiveBattle() {
    try {
      if (!battle || battle.phase === 'ended') {
        localStorage.removeItem(ACTIVE_BATTLE_KEY);
      } else {
        localStorage.setItem(ACTIVE_BATTLE_KEY, JSON.stringify(battle));
      }
    } catch (_) {}
  }

  function clearSavedBattle() {
    try { localStorage.removeItem(ACTIVE_BATTLE_KEY); } catch (_) {}
  }

  function loadSavedBattle() {
    try {
      const raw = localStorage.getItem(ACTIVE_BATTLE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.questId || !Array.isArray(parsed.roster)) return null;
      return parsed;
    } catch (_) { return null; }
  }

  // 기본 6인 파티 편성 (본인 보유 상위 5명 + 프렌드 1명; 부족한 본인 칸은 칼데아 대여 서번트로 채움)
  function ensureDefaultParty() {
    const st = getBridge()?.getState();
    if (!st) return;
    const ownedIds = Object.keys(st.servants).sort((a, b) =>
      (SERVANT_MAP[b].rarity - SERVANT_MAP[a].rarity) || (st.servants[b].level - st.servants[a].level)
    );
    const ownedCes = Object.keys(st.ces).sort((a, b) => CE_MAP[b].rarity - CE_MAP[a].rarity);
    const fallbackPool = ['sv_cu', 'sv_ushiwaka', 'sv_emiya', 'sv_heracles', 'sv_xu_fu'];

    for (let i = 0; i < 6; i++) {
      if (i === 5) {
        // 6번 슬롯(인덱스 5)은 프렌드 서포트 슬롯 (단, 전열에 두고 싶으면 위치 스왑 가능!)
        if (!partySlots[i]) {
          const sf = SUPPORT_FRIENDS[0];
          partySlots[i] = { id: sf.id, ceId: sf.ceId, isSupport: true };
        }
        continue;
      }
      if (partySlots[i] && (partySlots[i].isSupport || partySlots[i].isRental || st.servants[partySlots[i].id])) continue;
      if (ownedIds[i]) {
        partySlots[i] = { id: ownedIds[i], ceId: ownedCes[i] || null, isSupport: false, isRental: false };
      } else {
        const fid = fallbackPool[i % fallbackPool.length];
        partySlots[i] = { id: fid, ceId: ownedCes[i] || null, isSupport: false, isRental: true };
      }
    }
  }

  // ================= 로비 렌더링 (퀘스트 + 6인 파티 편성) =================
  function renderLobby() {
    ensureDefaultParty();
    document.getElementById('battle-lobby').classList.remove('hidden');
    document.getElementById('battle-arena').classList.add('hidden');

    // 퀘스트 목록
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

    // 6인 파티 슬롯 (전열 1~3 / 후열 4~5 + 프렌드 6)
    const st = getBridge().getState();
    const ownedSvIds = Object.keys(st.servants).sort((a, b) => SERVANT_MAP[b].rarity - SERVANT_MAP[a].rarity);
    const ownedCeIds = Object.keys(st.ces).sort((a, b) => CE_MAP[b].rarity - CE_MAP[a].rarity);

    const slotsEl = document.getElementById('battle-party-slots');
    slotsEl.innerHTML = '';
    partySlots.forEach((slot, idx) => {
      const sv = SERVANT_MAP[slot.id];
      const isFriendSlot = idx === 5;
      const own = (slot.isSupport || slot.isRental)
        ? { level: slot.isSupport ? 90 : 50, npLevel: slot.isSupport ? 2 : 1, viewAsc: slot.isSupport ? 4 : 1 }
        : st.servants[slot.id];
      const faceUrl = ArtRenderer.getFaceUrl(slot.id);
      const cePassive = getCePassive(slot.ceId);
      const deckTypes = getServantDeckTypes(sv);
      const lineTag = idx < 3 ? `전열 ${idx + 1}` : (isFriendSlot ? '프렌드 (후열 증원)' : `후열 ${idx - 2}`);

      let svOptions = '';
      if (isFriendSlot) {
        svOptions = SUPPORT_FRIENDS.map(sf =>
          `<option value="sup:${sf.id}" ${slot.id === sf.id ? 'selected' : ''}>🤝 ★5 ${SERVANT_MAP[sf.id].name} (Lv.90 · 보${sf.npLevel})</option>`
        ).join('');
      } else {
        svOptions = [
          ...ownedSvIds.map(id => `<option value="own:${id}" ${!slot.isRental && slot.id === id ? 'selected' : ''}>★${SERVANT_MAP[id].rarity} ${SERVANT_MAP[id].name} (Lv.${st.servants[id].level} · 보${st.servants[id].npLevel})</option>`),
          ...(slot.isRental ? [`<option value="rent:${slot.id}" selected>[칼데아 대여] ★${sv.rarity} ${sv.name} (Lv.50)</option>`] : [])
        ].join('');
      }

      const ceOptions = [
        `<option value="">(개념예장 미장착)</option>`,
        ...ownedCeIds.map(id => `<option value="${id}" ${slot.ceId === id ? 'selected' : ''}>★${CE_MAP[id].rarity} ${CE_MAP[id].name} (${getCePassive(id).label})</option>`),
        ...(isFriendSlot && slot.ceId && !ownedCeIds.includes(slot.ceId)
          ? [`<option value="${slot.ceId}" selected>[프렌드] ★${CE_MAP[slot.ceId].rarity} ${CE_MAP[slot.ceId].name}</option>`]
          : [])
      ].join('');

      const div = document.createElement('div');
      div.className = `party-slot-card ${idx < 3 ? 'frontline-slot' : 'backline-slot'} ${isFriendSlot ? 'friend-slot' : ''}`;
      div.innerHTML = `
        <div class="party-slot-top">
          ${faceUrl ? `<img src="${faceUrl}" class="party-slot-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div style="flex:1;min-width:0">
            <div class="party-slot-badge">${lineTag} · ${CLASS_INFO[sv.cls]?.name}</div>
            <div class="party-slot-name">${'★'.repeat(sv.rarity)} ${sv.name}</div>
            <div class="party-slot-meta">Lv.${own.level} · 보${own.npLevel} · ${sv.attribute || '인(人)'} · 보정 ${getClassAtkMod(sv.cls).toFixed(2)}</div>
          </div>
        </div>
        <div class="party-deck-dots">
          ${deckTypes.map(t => `<span class="deck-dot ${t}">${t[0]}</span>`).join('')}
          <span class="deck-np-dot ${sv.npType}">보구:${sv.npType[0]}</span>
        </div>
        <select class="filter-select party-sv-sel" data-idx="${idx}">${svOptions}</select>
        <select class="filter-select party-ce-sel" data-idx="${idx}" ${isFriendSlot ? 'disabled title="프렌드 서포트 개념예장 고정"' : ''}>${ceOptions}</select>
      `;
      slotsEl.appendChild(div);
    });

    slotsEl.querySelectorAll('.party-sv-sel').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.idx);
        const [kind, id] = e.target.value.split(':');
        if (kind === 'sup') {
          const sf = SUPPORT_FRIENDS.find(s => s.id === id) || SUPPORT_FRIENDS[0];
          partySlots[idx] = { id: sf.id, ceId: sf.ceId, isSupport: true, isRental: false };
        } else if (kind === 'own') {
          const dupIdx = partySlots.findIndex((p, i) => i !== idx && i < 5 && !p.isRental && p.id === id);
          if (dupIdx !== -1) {
            const tmp = partySlots[dupIdx];
            partySlots[dupIdx] = partySlots[idx];
            partySlots[idx] = tmp;
          } else {
            partySlots[idx] = { id, ceId: partySlots[idx].ceId, isSupport: false, isRental: false };
          }
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

  // ================= 전투 시작 (6인 로스터: 전열 0,1,2 + 후열 큐 3,4,5) =================
  function startBattle() {
    ensureDefaultParty();
    const st = getBridge().getState();
    const quest = QUESTS.find(q => q.id === selectedQuestId) || QUESTS[0];

    const roster = partySlots.map((slot, idx) => {
      const sv = SERVANT_MAP[slot.id];
      const own = (slot.isSupport || slot.isRental)
        ? { level: slot.isSupport ? 90 : 50, npLevel: slot.isSupport ? 2 : 1, viewAsc: slot.isSupport ? 4 : 1 }
        : st.servants[slot.id];
      const baseMaxLv = sv.rarity === 5 ? 90 : (sv.rarity === 4 ? 80 : (sv.rarity === 3 ? 70 : (sv.rarity === 1 ? 60 : 65)));
      const scale = 0.65 + (own.level / baseMaxLv) * 0.45;
      const maxHp = Math.round(sv.hp * scale);
      const atk = Math.round(sv.atk * scale);
      const ce = getCePassive(slot.ceId);
      const maxNp = getMaxNp(own.npLevel);

      const skLevels = (slot.isSupport) ? [10, 10, 10] : ((own.skillLevels && own.skillLevels.length === 3) ? own.skillLevels : [1, 1, 1]);
      return {
        rosterIdx: idx,
        id: sv.id,
        isSupport: !!slot.isSupport,
        isRental: !!slot.isRental,
        level: own.level,
        npLevel: own.npLevel,
        viewAsc: own.viewAsc || 1,
        ceId: slot.ceId,
        maxHp,
        hp: maxHp,
        atk,
        np: Math.min(maxNp, ce.startNp),
        skills: getSkillDefs(sv).map((s, si) => {
          const slv = skLevels[si] || 1;
          const cdReduce = slv >= 10 ? 2 : (slv >= 6 ? 1 : 0);
          return { ...s, level: slv, cd: Math.max(3, s.cd - cdReduce), curCd: 0 };
        }),
        buffs: { atk: 0, atkT: 0, def: 0, defT: 0, buster: 0, arts: 0, quick: 0, cardT: 0, npDmg: 0, npDmgT: 0, npGain: 0, npGainT: 0, crit: 0, critT: 0, invul: 0, npBoost: 1 }
      };
    });

    battle = {
      questId: quest.id,
      waveIdx: 0,
      turn: 1,
      stars: 0,
      roster,
      activeSlots: [0, 1, 2],   // 현재 전열 3칸 (rosterIdx)
      subQueue: [3, 4, 5],      // 후열 대기 3명 (전열 사망 시 순서대로 증원!)
      masterSkills: [
        { name: '전체 강화', cd: 6, curCd: 0, icon: '🔥', desc: '전열 아군 전체 공격력 +30% (1턴)' },
        { name: '긴급 회피', cd: 7, curCd: 0, icon: '🛡️', desc: '전열 아군 전체 HP +3500 & 회피(1턴)' },
        { name: '간드 (스턴)', cd: 8, curCd: 0, icon: '⚡', desc: '타겟 적 1턴 스턴 & 크리스타 +15' }
      ],
      enemies: [],
      targetIdx: 0,
      deck: [],
      hand: [],
      selectedCards: [],
      phase: 'command', // 'command' | 'cards' | 'animating' | 'wipeout' | 'ended'
      logs: []
    };
    busy = false;
    openPopup = null;

    spawnWave(0);
    buildNewDeck();
    drawTurnHand();
    addLog(`⚔️ [${quest.name}] 6인 파티 출격! (전열 3 + 후열 3 · WAVE 1/${quest.waves.length})`);
    saveActiveBattle();

    document.getElementById('battle-lobby').classList.add('hidden');
    document.getElementById('battle-arena').classList.remove('hidden');
    SoundEngine.summonStart();
    renderArena();
  }

  function getQuest() {
    return QUESTS.find(q => q.id === battle.questId) || QUESTS[0];
  }

  function spawnWave(wIdx) {
    battle.waveIdx = wIdx;
    const q = getQuest();
    battle.enemies = q.waves[wIdx].map((e, i) => ({
      idx: i,
      name: e.name,
      cls: e.cls,
      attr: e.attr || '인(人)',
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

  // 전열 3명의 15장 덱 생성 & 셔플
  function buildNewDeck() {
    const cards = [];
    battle.activeSlots.forEach(rIdx => {
      if (rIdx === null) return;
      const m = battle.roster[rIdx];
      if (!m || m.hp <= 0) return;
      const sv = SERVANT_MAP[m.id];
      getServantDeckTypes(sv).forEach(type => {
        cards.push({ rosterIdx: rIdx, svId: m.id, type });
      });
    });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    battle.deck = cards;
  }

  // 매 턴 5장 드로우 + 원작 FGO 클래스별 스타 집중도 분배 (라200>아150>세어룰실100>랜90>캐50>버10)
  function drawTurnHand() {
    if (battle.deck.length < 5) buildNewDeck();
    const drawCount = Math.min(5, battle.deck.length);
    const hand = battle.deck.splice(0, drawCount);
    const starAlloc = Array(hand.length).fill(0);
    let pool = Math.floor(battle.stars);

    // 원작 FGO 고증: 스타 50개 이상 시 집중도/랜덤 무관 전 커맨드 카드 100% 고정!
    if (pool >= 50) {
      for (let i = 0; i < hand.length; i++) starAlloc[i] = 10;
    } else {
      const weights = hand.map(c => {
        const sv = SERVANT_MAP[c.svId];
        // 원작 난수 보정 (+0~50 랜덤 슬롯 가중치) 포함
        return (STAR_WEIGHT[sv.cls] || 100) + Math.floor(Math.random() * 50);
      });

      while (pool > 0) {
        const avail = weights.map((w, i) => (starAlloc[i] < 10 ? w : 0));
        const sum = avail.reduce((a, b) => a + b, 0);
        if (sum <= 0) break;
        let r = Math.random() * sum;
        for (let i = 0; i < hand.length; i++) {
          r -= avail[i];
          if (r <= 0) { starAlloc[i]++; break; }
        }
        pool--;
      }
    }
    battle.stars = 0;
    battle.hand = hand.map((c, i) => ({ ...c, handIdx: i, critPct: starAlloc[i] * 10 }));
    battle.selectedCards = [];
  }

  // 전열 빈자리에 후열 대기 서번트 자동 증원 (원작 고증!)
  function reinforceFromBackline() {
    let reinforced = false;
    for (let s = 0; s < 3; s++) {
      const rIdx = battle.activeSlots[s];
      if (rIdx === null || battle.roster[rIdx].hp <= 0) {
        if (battle.subQueue.length > 0) {
          const nextRIdx = battle.subQueue.shift();
          battle.activeSlots[s] = nextRIdx;
          const newcomer = battle.roster[nextRIdx];
          const sv = SERVANT_MAP[newcomer.id];
          addLog(`🔄 후열 증원! [${sv.name}]${newcomer.isSupport ? '(프렌드)' : ''} 전열 투입!`);
          reinforced = true;
        } else {
          battle.activeSlots[s] = null;
        }
      }
    }
    if (reinforced) {
      buildNewDeck(); // 멤버 교체 시 덱 재구성!
    }
    return reinforced;
  }

  function addLog(msg) {
    if (!battle) return;
    battle.logs.unshift(msg);
    if (battle.logs.length > 20) battle.logs.pop();
  }

  // ================= 원작 FGO 체인 7종 판정 =================
  function analyzeChain(cards) {
    if (cards.length < 3) return { colorChain: null, mighty: false, brave: false, badges: [], title: '' };
    const types = cards.map(c => c.type);
    const sameColor = types[0] === types[1] && types[1] === types[2];
    const colorChain = sameColor ? types[0] : null;
    const mighty = !sameColor && types.includes('Buster') && types.includes('Arts') && types.includes('Quick');
    const brave = cards[0].rosterIdx === cards[1].rosterIdx && cards[1].rosterIdx === cards[2].rosterIdx;

    const badges = [];
    if (colorChain === 'Buster') badges.push({ cls: 'ch-buster', text: brave ? '🔴 버스터 브레이브 체인 (공+20% & EXTRA 3.5×)' : '🔴 버스터 체인 (해당 턴 공격력 +20%)' });
    if (colorChain === 'Arts') badges.push({ cls: 'ch-arts', text: brave ? '🔵 아츠 브레이브 체인 (NP+20% & EXTRA 3.5×)' : '🔵 아츠 체인 (참가 서번트 NP +20%)' });
    if (colorChain === 'Quick') badges.push({ cls: 'ch-quick', text: brave ? '🟢 퀵 브레이브 체인 (스타+20 & EXTRA 3.5×)' : '🟢 퀵 체인 (크리티컬 스타 +20)' });
    if (mighty) badges.push({ cls: 'ch-mighty', text: brave ? '🌈 마이티 브레이브 체인 (3색 퍼스트 + 크리+20% + EXTRA!)' : '🌈 마이티 체인 (3색 퍼스트 보너스 + 크리 +20%!)' });
    if (brave && !colorChain && !mighty) badges.push({ cls: 'ch-brave', text: '⚡ 브레이브 체인 (4타 EXTRA ATTACK 발동!)' });

    // 보구 체인(2개 이상 보구) 표시
    const npCount = cards.filter(c => c.kind === 'np').length;
    if (npCount >= 2) {
      badges.push({ cls: 'ch-brave', text: `✨ 보구 체인! 오버차지 최대 ${npCount * 100}%+` });
    }
    return { colorChain, mighty, brave, badges };
  }

  // ================= 전장 UI 렌더링 =================
  function renderArena() {
    if (!battle) return;
    const q = getQuest();
    const spells = getBridge().getCommandSpells();

    document.getElementById('ba-quest-name').textContent = q.name;
    document.getElementById('ba-wave').textContent = `WAVE ${battle.waveIdx + 1} / ${q.waves.length}`;
    document.getElementById('ba-turn').textContent = `TURN ${battle.turn}`;
    document.getElementById('ba-stars').textContent = `★ ${Math.floor(battle.stars)}`;

    // 우측 상단 영주 3획 표시
    const spellBtn = document.getElementById('btn-ba-spells');
    if (spellBtn) {
      spellBtn.innerHTML = `<span class="cs-pips">${'✦'.repeat(spells)}${'✧'.repeat(3 - spells)}</span> 영주 ${spells}/3`;
    }

    // 후열 대기 멤버(SUB) 뱃지 표시
    const subEl = document.getElementById('ba-sub-bar');
    if (subEl) {
      const subs = getSubMembers(battle);
      subEl.innerHTML = subs.length
        ? `<span class="sub-label">후열 대기 (${subs.length}):</span>` + subs.map(m => {
            const sv = SERVANT_MAP[m.id];
            const face = ArtRenderer.getFaceUrl(m.id);
            return `<span class="sub-chip">${face ? `<img src="${face}" class="sub-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}${sv.nickname || sv.name}${m.isSupport ? '🤝' : ''}</span>`;
          }).join('')
        : `<span class="sub-label">후열 대기 없음 (전원 출전 완료)</span>`;
    }

    // 1) 적 전장 (카드 선택 중에도 타겟 클릭 변경 가능 — 원작 최신 패치 고증!)
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
          <span class="enemy-cls-badge">${CLASS_INFO[en.cls]?.name || en.cls} · ${en.attr || '인(人)'}</span>
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
      if (!dead && !busy) {
        card.addEventListener('click', () => {
          SoundEngine.click();
          battle.targetIdx = idx;
          renderArena();
        });
      }
      enemiesEl.appendChild(card);
    });

    // 2) 아군 전열 3칸 렌더링
    const partyEl = document.getElementById('ba-party');
    partyEl.innerHTML = '';
    battle.activeSlots.forEach((rIdx, slotPos) => {
      if (rIdx === null) {
        const empty = document.createElement('div');
        empty.className = 'ally-unit dead';
        empty.innerHTML = '<div style="text-align:center;padding:34px 8px;font-size:12px;color:#64748b">전투 불능<br>(증원 없음)</div>';
        partyEl.appendChild(empty);
        return;
      }
      const m = battle.roster[rIdx];
      const sv = SERVANT_MAP[m.id];
      const dead = m.hp <= 0;
      const maxNp = getMaxNp(m.npLevel);
      const hpPct = Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100));
      const npPct = Math.min(100, m.np);
      const ocStage = Math.floor(m.np / 100);
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
      unit.id = `ally-unit-${rIdx}`;
      unit.innerHTML = `
        <div class="ally-top">
          ${faceUrl ? `<img src="${faceUrl}" class="ally-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div style="flex:1;min-width:0">
            <div class="ally-name">${sv.nickname || sv.name}${m.isSupport ? '🤝' : ''} <small>(${CLASS_INFO[sv.cls]?.name})</small></div>
            <div class="hp-bar-track"><div class="hp-bar-fill ally-hp" style="width:${hpPct}%"></div></div>
            <div class="ally-stat-line">HP ${Math.max(0, m.hp).toLocaleString()} / ${m.maxHp.toLocaleString()}</div>
            <div class="np-bar-track"><div class="np-bar-fill ${m.np >= 100 ? 'full' : ''}" style="width:${npPct}%"></div></div>
            <div class="ally-stat-line">NP <strong style="color:${m.np >= 100 ? '#ffe666' : '#70e0ff'}">${Math.floor(m.np)}%</strong>/${maxNp}% ${ocStage >= 2 ? `<span style="color:#ff9ef5">OC${ocStage * 100}%</span>` : ''}</div>
          </div>
        </div>
        <div class="ally-buffs">${activeBuffs.map(t => `<span class="buff-pill">${t}</span>`).join('')}</div>
        <div class="ally-skills">
          ${m.skills.map((sk, sIdx) => `
            <button class="skill-btn ${sk.curCd > 0 ? 'cooldown' : ''}" data-ridx="${rIdx}" data-sidx="${sIdx}" ${dead || sk.curCd > 0 || battle.phase !== 'command' || busy ? 'disabled' : ''} title="${sk.name}: ${sk.desc}">
              <span class="sk-ico">${sk.icon}</span>
              <span class="sk-nm">${sk.curCd > 0 ? `${sk.curCd}T` : sk.name.slice(0, 6)}</span>
            </button>
          `).join('')}
        </div>
        <div class="dmg-float-layer" id="ally-dmg-${rIdx}"></div>
      `;
      partyEl.appendChild(unit);
    });

    partyEl.querySelectorAll('.skill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (busy || battle.phase !== 'command') return;
        const m = battle.roster[Number(btn.dataset.ridx)];
        const sk = m.skills[Number(btn.dataset.sidx)];
        if (!m || !sk || sk.curCd > 0 || m.hp <= 0) return;
        sk.curCd = sk.cd;
        const msg = applyServantSkill(battle, m, sk.key, sk.name);
        SoundEngine.levelUp();
        addLog(`✨ ${msg}`);
        getBridge().toast(msg);
        saveActiveBattle();
        renderArena();
      });
    });

    // 3) 우측 상단 드롭다운 팝업 (마스터 스킬 / 영주 / 메뉴)
    renderTopPopups();

    // 4) 하단 ATTACK 영역 vs B/A/Q 카드 선택 팬
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

  function renderTopPopups() {
    const popupEl = document.getElementById('ba-top-popup');
    if (!popupEl) return;
    if (!openPopup || !battle || battle.phase !== 'command' || busy) {
      popupEl.classList.add('hidden');
      popupEl.innerHTML = '';
      return;
    }

    popupEl.classList.remove('hidden');
    if (openPopup === 'master') {
      popupEl.innerHTML = `
        <div class="ba-pop-title">🧤 마스터 스킬 (칼데아 전투복)</div>
        <div class="ba-pop-grid">
          ${battle.masterSkills.map((sk, i) => `
            <button class="upgrade-btn" data-ms="${i}" ${sk.curCd > 0 ? 'disabled' : ''}>
              ${sk.icon} ${sk.name}${sk.curCd > 0 ? ` (${sk.curCd}T)` : ''}<br>
              <small style="color:#9cb2d9;font-weight:400">${sk.desc}</small>
            </button>
          `).join('')}
        </div>
      `;
      popupEl.querySelectorAll('[data-ms]').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = Number(btn.dataset.ms);
          const sk = battle.masterSkills[i];
          if (!sk || sk.curCd > 0) return;
          sk.curCd = sk.cd;
          const msg = applyMasterSkill(battle, i);
          openPopup = null;
          SoundEngine.levelUp();
          addLog(`🧤 ${msg}`);
          getBridge().toast(msg);
          saveActiveBattle();
          renderArena();
        });
      });
    } else if (openPopup === 'spells') {
      const spells = getBridge().getCommandSpells();
      const activeList = getActiveMembers(battle);
      popupEl.innerHTML = `
        <div class="ba-pop-title">✦ 영주 커맨드 (보유 ${spells} / 3획 · 매일 0시 3획 자동 회복)</div>
        <div class="cs-actions-wrap">
          ${activeList.map(m => {
            const sv = SERVANT_MAP[m.id];
            return `
              <div class="cs-member-row">
                <strong>${sv.nickname || sv.name}</strong>
                <div style="display:flex;gap:6px">
                  <button class="small-outline-btn" data-cs-heal="${m.rosterIdx}" ${spells < 1 ? 'disabled' : ''}>💚 영기수복 (HP 100% · 1획)</button>
                  <button class="small-gold-btn" data-cs-np="${m.rosterIdx}" ${spells < 1 ? 'disabled' : ''}>⚡ 보구해방 (NP +100% · 1획)</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      popupEl.querySelectorAll('[data-cs-heal]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!getBridge().consumeCommandSpells(1)) { getBridge().toast('영주가 부족합니다!'); return; }
          const m = battle.roster[Number(btn.dataset.csHeal)];
          m.hp = m.maxHp;
          openPopup = null;
          SoundEngine.reveal(4, true);
          addLog(`✦ 영주 [영기수복]! ${SERVANT_MAP[m.id].name} HP 100% 완전 회복!`);
          getBridge().toast(`✦ 영주 1획 소모! ${SERVANT_MAP[m.id].name} HP 완전 회복!`);
          saveActiveBattle();
          renderArena();
        });
      });
      popupEl.querySelectorAll('[data-cs-np]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!getBridge().consumeCommandSpells(1)) { getBridge().toast('영주가 부족합니다!'); return; }
          const m = battle.roster[Number(btn.dataset.csNp)];
          m.np = Math.min(getMaxNp(m.npLevel), m.np + 100);
          openPopup = null;
          SoundEngine.reveal(5, true);
          addLog(`✦ 영주 [보구해방]! ${SERVANT_MAP[m.id].name} NP +100% 충전!`);
          getBridge().toast(`✦ 영주 1획 소모! ${SERVANT_MAP[m.id].name} 보구해방 (NP +100%)!`);
          saveActiveBattle();
          renderArena();
        });
      });
    } else if (openPopup === 'menu') {
      popupEl.innerHTML = `
        <div class="ba-pop-title">☰ 배틀 메뉴</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="small-outline-btn" id="btn-pop-close">전투 계속하기</button>
          <button class="small-outline-btn" id="btn-pop-affinity">📊 상성표 보기</button>
          <button class="small-outline-btn danger" id="btn-pop-flee">🏃 도주하기 (보상 없음)</button>
        </div>
      `;
      document.getElementById('btn-pop-close').addEventListener('click', () => { openPopup = null; renderArena(); });
      document.getElementById('btn-pop-affinity').addEventListener('click', () => { openPopup = null; renderArena(); openAffinityModal(); });
      document.getElementById('btn-pop-flee').addEventListener('click', () => {
        if (!confirm('전투에서 도주하시겠습니까? (경험치와 보상을 얻을 수 없습니다)')) return;
        openPopup = null;
        battle = null;
        busy = false;
        clearSavedBattle();
        renderLobby();
      });
    }
  }

  // 커맨드 카드 선택 화면 (보구 3칸 + B/A/Q 5장 팬)
  function renderCommandCards() {
    const target = battle.enemies[battle.targetIdx];
    const npRow = document.getElementById('ba-np-cards');
    const cmdRow = document.getElementById('ba-cmd-cards');
    const chainBar = document.getElementById('ba-chain-preview');

    // 보구 카드 (현재 전열 3명)
    npRow.innerHTML = '';
    battle.activeSlots.forEach(rIdx => {
      if (rIdx === null) return;
      const m = battle.roster[rIdx];
      const sv = SERVANT_MAP[m.id];
      const ready = m.hp > 0 && m.np >= 100;
      const selIdx = battle.selectedCards.findIndex(c => c.kind === 'np' && c.rosterIdx === rIdx);
      const faceUrl = ArtRenderer.getFaceUrl(m.id);
      const catLabel = getNpCategory(sv) === 'support' ? '보조' : (getNpCategory(sv) === 'single' ? '단일' : '대군');
      const ocNow = Math.max(1, Math.floor(m.np / 100)) * 100;

      const btn = document.createElement('button');
      btn.className = `np-cmd-card ${sv.npType} ${ready ? 'ready' : 'locked'} ${selIdx !== -1 ? 'selected' : ''}`;
      btn.disabled = !ready;
      btn.innerHTML = `
        ${selIdx !== -1 ? `<span class="cmd-order-badge">${selIdx + 1}st</span>` : ''}
        <div class="np-cmd-top">
          ${faceUrl ? `<img src="${faceUrl}" class="np-cmd-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div>
            <div class="np-cmd-type">${sv.npType.toUpperCase()} 보구 · ${catLabel}</div>
            <div class="np-cmd-name">${sv.npName}</div>
          </div>
        </div>
        <div class="np-cmd-sub">${ready ? `NP ${Math.floor(m.np)}% (OC ${ocNow}% 발동!)` : `NP ${Math.floor(m.np)}% / 100%`}</div>
      `;
      if (ready) {
        btn.addEventListener('click', () => toggleSelectCard({ kind: 'np', rosterIdx: rIdx, type: sv.npType, critPct: 0 }));
      }
      npRow.appendChild(btn);
    });

    // 5장 커맨드 카드 (B/A/Q)
    cmdRow.innerHTML = '';
    battle.hand.forEach(card => {
      const m = battle.roster[card.rosterIdx];
      const sv = SERVANT_MAP[m.id];
      const selIdx = battle.selectedCards.findIndex(c => c.kind === 'cmd' && c.handIdx === card.handIdx);
      const mult = target ? getClassMultiplier(sv.cls, target.cls) : 1.0;
      const attrMult = target ? getAttrMultiplier(sv.attribute, target.attr) : 1.0;
      const affTag = mult > 1
        ? `<span class="aff-weak">WEAK ${mult}×</span>`
        : (mult < 1 ? `<span class="aff-resist">RESIST ${mult}×</span>` : '');
      const attrTag = attrMult > 1
        ? `<span class="aff-attr-up" title="히든 속성 유리 (${sv.attribute} → ${target.attr} 1.1x)">속성↑</span>`
        : (attrMult < 1 ? `<span class="aff-attr-dn" title="히든 속성 불리 (${sv.attribute} → ${target.attr} 0.9x)">속성↓</span>` : '');
      const faceUrl = ArtRenderer.getFaceUrl(m.id);
      const koType = card.type === 'Buster' ? '버스터' : (card.type === 'Arts' ? '아츠' : '퀵');

      // 첫 카드가 Quick이거나 마이티 체인이면 표시 크리율 +20% 미리보기!
      const firstIsQuick = battle.selectedCards.length > 0 && battle.selectedCards[0].type === 'Quick';
      const displayCrit = Math.min(100, card.critPct + (firstIsQuick ? 20 : 0));

      const btn = document.createElement('button');
      btn.className = `cmd-card ${card.type} ${selIdx !== -1 ? 'selected' : ''}`;
      btn.innerHTML = `
        ${selIdx !== -1 ? `<span class="cmd-order-badge">${selIdx + 1}</span>` : ''}
        <div class="cmd-card-top">
          ${affTag}${attrTag}
          ${displayCrit > 0 ? `<span class="cmd-crit-badge">★${displayCrit}%</span>` : ''}
        </div>
        <div class="cmd-face-wrap">
          ${faceUrl ? `<img src="${faceUrl}" class="cmd-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : `<div class="cmd-face-fallback">${sv.name[0]}</div>`}
        </div>
        <div class="cmd-sv-name">${sv.nickname || sv.name}</div>
        <div class="cmd-type-ribbon">${card.type.toUpperCase()}<span>${koType}</span></div>
      `;
      btn.addEventListener('click', () => toggleSelectCard({ kind: 'cmd', handIdx: card.handIdx, rosterIdx: card.rosterIdx, type: card.type, critPct: card.critPct }));
      cmdRow.appendChild(btn);
    });

    const chain = analyzeChain(battle.selectedCards);
    if (battle.selectedCards.length < 3) {
      chainBar.innerHTML = `<span class="chain-hint">카드 3장 선택 (${battle.selectedCards.length}/3) · 위 적을 클릭해 타겟 변경 가능!</span>`;
    } else if (chain.badges.length) {
      chainBar.innerHTML = chain.badges.map(b => `<span class="chain-badge ${b.cls}">${b.text}</span>`).join('');
    } else {
      chainBar.innerHTML = `<span class="chain-hint">3장 선택 완료! 공격 개시!</span>`;
    }
  }

  function toggleSelectCard(cardObj) {
    if (busy || battle.phase !== 'cards') return;
    const existIdx = battle.selectedCards.findIndex(c =>
      c.kind === cardObj.kind && (c.kind === 'np' ? c.rosterIdx === cardObj.rosterIdx : c.handIdx === cardObj.handIdx)
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

    if (battle.selectedCards.length === 3) {
      busy = true;
      setTimeout(() => executeTurnSequence(), 360);
    }
  }

  // ================= 턴 전투 시퀀스 (오버킬 · 크리×오버킬 곱연산 · 보구 OC · 후열 증원) =================
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

  // 대미지 적용 + 오버킬 여부 반환 (막타로 적을 죽이거나 이미 죽은 적을 추가 타격!)
  function damageEnemy(enemy, dmg, tagClass = '') {
    if (!enemy) return false;
    const alreadyDead = enemy.hp <= 0;
    const finalDmg = Math.max(100, Math.round(dmg));
    const willKill = !alreadyDead && (enemy.hp - finalDmg <= 0);
    const isOverkill = alreadyDead || willKill;

    if (!alreadyDead) {
      enemy.hp -= finalDmg;
    }
    showFloatDmg(`enemy-dmg-${enemy.idx}`, `${finalDmg.toLocaleString()}${isOverkill ? ' OVERKILL!' : ''}`, isOverkill ? 'dmg-crit' : tagClass);

    const unitEl = document.getElementById(`enemy-unit-${enemy.idx}`);
    if (unitEl) {
      unitEl.classList.remove('hit-shake');
      void unitEl.offsetWidth;
      unitEl.classList.add('hit-shake');
    }

    // 브레이크 게이지 해방
    if (!alreadyDead && enemy.hp <= 0 && enemy.breakBars.length > 0) {
      const nextHp = enemy.breakBars.shift();
      enemy.maxHp = nextHp;
      enemy.hp = nextHp;
      enemy.charge = Math.min(enemy.maxCharge, enemy.charge + 1);
      addLog(`💥 ${enemy.name} 브레이크!! 새 HP ${nextHp.toLocaleString()} 해방!`);
      showFloatDmg(`enemy-dmg-${enemy.idx}`, `BREAK!!`, 'dmg-break');
      SoundEngine.sparkPromotion();
    } else if (!alreadyDead && enemy.hp <= 0) {
      enemy.hp = 0;
      addLog(`💀 ${enemy.name} 격파! (OVERKILL)`);
    }
    return isOverkill;
  }

  async function playNpCutin(member, ocStage) {
    const sv = SERVANT_MAP[member.id];
    const overlay = document.getElementById('np-cutin-overlay');
    const imgUrl = ArtRenderer.getCardArtUrl(sv, true, member.viewAsc || 4);
    overlay.className = `np-cutin-overlay ${sv.npType}`;
    overlay.innerHTML = `
      <div class="np-cutin-inner">
        ${imgUrl ? `<img src="${imgUrl}" class="np-cutin-img" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
        <div class="np-cutin-text">
          <div class="np-cutin-ruby">${sv.npSub || 'NOBLE PHANTASM'} · OVERCHARGE ${ocStage * 100}%</div>
          <div class="np-cutin-name">${sv.npName}</div>
          <div class="np-cutin-sv">${sv.name} · 보구 Lv.${member.npLevel} (${sv.npType})</div>
        </div>
      </div>
    `;
    SoundEngine.reveal(5, true);
    await sleep(1050);
    overlay.className = 'np-cutin-overlay hidden';
  }

  async function executeTurnSequence() {
    battle.phase = 'animating';
    openPopup = null;
    renderArena();

    const cards = [...battle.selectedCards];
    const chain = analyzeChain(cards);
    const firstType = cards[0].type; // 보구-평타-평타 시 보구색도 첫 수 보너스로 후속 평타에 적용!

    // 체인 즉발 보너스 (아츠 체인 NP+20% / 퀵 체인 스타+20 / 버스터 체인 공+20%)
    if (chain.colorChain === 'Arts') {
      const participants = new Set(cards.map(c => c.rosterIdx));
      participants.forEach(rIdx => {
        const m = battle.roster[rIdx];
        if (m && m.hp > 0) m.np = Math.min(getMaxNp(m.npLevel), m.np + 20);
      });
      addLog('🔵 아츠 체인! 참가 서번트 NP +20%!');
    } else if (chain.colorChain === 'Quick') {
      battle.stars = Math.min(99, battle.stars + 20);
      addLog('🟢 퀵 체인! 크리티컬 스타 +20 획득!');
    } else if (chain.colorChain === 'Buster') {
      addLog('🔴 버스터 체인! 해당 턴 공격력 +20% 보너스!');
    } else if (chain.mighty) {
      addLog('🌈 마이티 체인! 3색 퍼스트 보너스 + 크리 확률 +20% 전원 적용!');
    }

    let npChainCount = 0; // 같은 턴 연속 보구 발동 카운터 (오버차지 +100% / +200%!)
    let currentTarget = pickAliveTarget();

    for (let step = 0; step < cards.length; step++) {
      const c = cards[step];
      const m = battle.roster[c.rosterIdx];
      if (!m || m.hp <= 0) continue;
      const sv = SERVANT_MAP[m.id];
      const ce = getCePassive(m.ceId);
      const maxNp = getMaxNp(m.npLevel);

      // 같은 서번트가 이미 죽은 적을 이어서 때리면 오버킬 유지, 다른 서번트거나 첫 타겟이 없으면 살아있는 적 자동 타겟!
      const prevSameServant = step > 0 && cards[step - 1].rosterIdx === c.rosterIdx;
      if (!currentTarget || (!prevSameServant && currentTarget.hp <= 0)) {
        currentTarget = pickAliveTarget();
      }
      if (!currentTarget && getNpCategory(sv) !== 'support') break;

      const allyEl = document.getElementById(`ally-unit-${m.rosterIdx}`);
      if (allyEl) allyEl.classList.add('attacking');

      if (c.kind === 'np') {
        // 원작 고증: 105%~199%는 무조건 100%(OC 1단계)! 보구 체인 시 2번째 +100%, 3번째 +200% (최대 5단계)
        const baseOcStage = Math.max(1, Math.floor(m.np / 100));
        const ocStage = Math.min(5, baseOcStage + npChainCount);
        npChainCount++;
        const ocMult = 1 + (ocStage - 1) * 0.25; // OC 100%=1.0, 200%=1.25, 300%=1.5, 400%=1.75, 500%=2.0
        m.np = 0;

        await playNpCutin(m, ocStage);
        // 원작 고증: 보구 자체는 커맨드 순서/퍼스트/색상 체인 보너스를 받지 않음!
        const cat = getNpCategory(sv);
        const npLvMult = [0, 1.0, 1.25, 1.4, 1.5, 1.65][m.npLevel] || 1.0;
        const cardBuff = (c.type === 'Buster' ? m.buffs.buster + ce.buster : (c.type === 'Arts' ? m.buffs.arts + ce.arts : m.buffs.quick + ce.quick));
        const npDmgMult = (1 + m.buffs.npDmg + ce.npDmg) * m.buffs.npBoost;

        if (cat === 'support') {
          getActiveMembers(battle).forEach(ally => {
            ally.buffs.atk += 0.25 * ocMult; ally.buffs.atkT = 3;
            ally.buffs.invul = Math.max(ally.buffs.invul, 1);
            ally.hp = Math.min(ally.maxHp, ally.hp + Math.round(2500 * ocMult));
            if (m.id === 'sv_tamamo') ally.np = Math.min(getMaxNp(ally.npLevel), ally.np + 25 * ocStage);
          });
          addLog(`✨ ${sv.name} 보구 [${sv.npName}] (OC ${ocStage * 100}%)! 전열 대숙정방어/무적 + 공업 + 회복!`);
        } else if (cat === 'aoe') {
          const baseMult = c.type === 'Buster' ? 3.8 : (c.type === 'Arts' ? 3.3 : 3.5);
          battle.enemies.forEach(en => {
            if (en.hp <= 0) return;
            const clsMult = getClassMultiplier(sv.cls, en.cls);
            const totalAff = getCombinedDamageMod(sv.cls, en.cls, sv.attribute, en.attr);
            const dmg = m.atk * baseMult * npLvMult * (1 + m.buffs.atk) * (1 + cardBuff) * npDmgMult * totalAff * ocMult * (0.95 + Math.random() * 0.1);
            const ok = damageEnemy(en, dmg, clsMult > 1 ? 'dmg-weak' : 'dmg-np');
            const okNpMult = ok ? 1.5 : 1.0;
            const okStarMult = ok ? 1.3 : 1.0;
            const enNpMod = getEnemyNpMod(en.cls); // 적 클래스별 NP 보정(캐1.2/라1.1/어0.9/버0.8)
            if (c.type === 'Arts') m.np = Math.min(maxNp, m.np + Math.round(16 * (1 + cardBuff) * (1 + m.buffs.npGain) * okNpMult * enNpMod));
            if (c.type === 'Quick') {
              m.np = Math.min(maxNp, m.np + Math.round(9 * (1 + cardBuff) * okNpMult * enNpMod));
              battle.stars = Math.min(99, battle.stars + Math.round(8 * okStarMult));
            }
          });
          addLog(`💥 ${sv.name} 대군 보구 [${sv.npName}] (OC ${ocStage * 100}%) 작렬!`);
        } else if (currentTarget) {
          const baseMult = c.type === 'Buster' ? 6.2 : (c.type === 'Arts' ? 5.6 : 5.9);
          const clsMult = getClassMultiplier(sv.cls, currentTarget.cls);
          const totalAff = getCombinedDamageMod(sv.cls, currentTarget.cls, sv.attribute, currentTarget.attr);
          const dmg = m.atk * baseMult * npLvMult * (1 + m.buffs.atk) * (1 + cardBuff) * npDmgMult * totalAff * ocMult * (0.95 + Math.random() * 0.1);
          const ok = damageEnemy(currentTarget, dmg, clsMult > 1 ? 'dmg-weak' : 'dmg-np');
          const okNpMult = ok ? 1.5 : 1.0;
          const okStarMult = ok ? 1.3 : 1.0;
          const enNpMod = getEnemyNpMod(currentTarget.cls);
          if (c.type === 'Arts') m.np = Math.min(maxNp, m.np + Math.round(22 * (1 + cardBuff) * (1 + m.buffs.npGain) * okNpMult * enNpMod));
          if (c.type === 'Quick') battle.stars = Math.min(99, battle.stars + Math.round(14 * okStarMult));
          addLog(`💥 ${sv.name} 단일 보구 [${sv.npName}] (OC ${ocStage * 100}%) → ${currentTarget.name} ${Math.round(dmg).toLocaleString()}!`);
        }
        m.buffs.npBoost = 1;
      } else if (currentTarget) {
        // 원작 FGO 일반 커맨드 카드 계산:
        // - 기본 비율: Buster 1.5, Arts 1.0, Quick 0.8
        // - 순서 배율: 1st 1.0, 2nd 1.2, 3rd 1.4 (예: 버스터 1.5 / 1.8 / 2.1배!)
        // - 클래스 공격 보정치(0.90~1.10) × 클래스 상성(0.5~2.0) × 히든 속성 상성(0.9~1.1)
        const orderMult = [1.0, 1.2, 1.4][step];
        const typeDmgBase = c.type === 'Buster' ? 1.5 : (c.type === 'Arts' ? 1.0 : 0.8);
        const hasFirstBuster = (firstType === 'Buster' || chain.mighty);
        const hasFirstArts   = (firstType === 'Arts'   || chain.mighty);
        const hasFirstQuick  = (firstType === 'Quick'  || chain.mighty);

        const firstBusterAdd = hasFirstBuster ? 0.5 : 0;
        const busterChainMult = chain.colorChain === 'Buster' ? 1.2 : 1.0; // 버스터 체인 공 +20%!

        const cardBuff = (c.type === 'Buster' ? m.buffs.buster + ce.buster : (c.type === 'Arts' ? m.buffs.arts + ce.arts : m.buffs.quick + ce.quick));
        const clsMult = getClassMultiplier(sv.cls, currentTarget.cls);
        const totalAff = getCombinedDamageMod(sv.cls, currentTarget.cls, sv.attribute, currentTarget.attr);

        // 퀵 퍼스트 / 마이티 체인: 체인 내 카드 크리티컬 확률 +20%!
        const critChance = Math.min(100, c.critPct + (hasFirstQuick ? 20 : 0));
        const isCrit = Math.random() * 100 < critChance;
        const critDmgMult = isCrit ? (2.0 + m.buffs.crit + ce.crit) : 1.0;

        const dmg = m.atk * (typeDmgBase * orderMult * (1 + cardBuff) + firstBusterAdd) * (1 + m.buffs.atk) * busterChainMult * totalAff * critDmgMult * (0.92 + Math.random() * 0.16);
        const isOverkill = damageEnemy(currentTarget, dmg, isCrit ? 'dmg-crit' : (clsMult > 1 ? 'dmg-weak' : ''));

        // 크리티컬 × 오버킬 곱연산! (NP: ×2.0 ×1.5, 스타: ×1.2 ×1.3)
        const npCritMult = isCrit ? 2.0 : 1.0;
        const npOkMult   = isOverkill ? 1.5 : 1.0;
        const stCritMult = isCrit ? 1.2 : 1.0;
        const stOkMult   = isOverkill ? 1.3 : 1.0;

        const npBase = c.type === 'Arts' ? 13 : (c.type === 'Quick' ? 5 : 0); // 버스터 자체 NP = 0!
        const npFirstAdd = hasFirstArts ? 6 : 0;
        const enNpMod = getEnemyNpMod(currentTarget.cls);
        const npGain = Math.round((npBase * orderMult + npFirstAdd) * (1 + cardBuff * 0.5) * (1 + m.buffs.npGain) * npCritMult * npOkMult * enNpMod);

        const starBase = c.type === 'Quick' ? 11 : (c.type === 'Buster' ? 3 : 1);
        const starFirstAdd = hasFirstQuick ? 4 : 0;
        const starGain = Math.round((starBase * orderMult + starFirstAdd) * stCritMult * stOkMult);

        m.np = Math.min(maxNp, m.np + npGain);
        battle.stars = Math.min(99, battle.stars + starGain);

        SoundEngine.cardFlip();
        const tags = `${isCrit ? ' ★CRIT' : ''}${isOverkill ? ' 💥OK' : ''}`;
        addLog(`${c.type === 'Buster' ? '🔴' : (c.type === 'Arts' ? '🔵' : '🟢')} ${sv.nickname || sv.name} ${c.type}${tags} → ${Math.round(dmg).toLocaleString()} (NP+${npGain}%, ★+${starGain})`);
      }

      renderArena();
      await sleep(500);
      if (allyEl) allyEl.classList.remove('attacking');
    }

    // 브레이브 체인 → 4타 EXTRA ATTACK!
    if (chain.brave) {
      const m = battle.roster[cards[0].rosterIdx];
      const sv = SERVANT_MAP[m.id];
      const target = currentTarget || pickAliveTarget();
      if (m && m.hp > 0 && target) {
        const extraMult = chain.colorChain ? 3.5 : 2.0; // 동일색 브레이브 시 3.5배!
        const totalAff = getCombinedDamageMod(sv.cls, target.cls, sv.attribute, target.attr);
        const dmg = m.atk * extraMult * (1 + m.buffs.atk) * totalAff;
        const isOverkill = damageEnemy(target, dmg, 'dmg-extra');
        const npGain = Math.round(12 * (isOverkill ? 1.5 : 1.0) * getEnemyNpMod(target.cls));
        const stGain = Math.round(6 * (isOverkill ? 1.3 : 1.0));
        m.np = Math.min(getMaxNp(m.npLevel), m.np + npGain);
        battle.stars = Math.min(99, battle.stars + stGain);
        SoundEngine.pillarBurst();
        addLog(`⚡ EXTRA ATTACK! ${sv.name} → ${Math.round(dmg).toLocaleString()} (NP+${npGain}%, ★+${stGain})`);
        renderArena();
        await sleep(520);
      }
    }

    // 적 전멸 체크 → 다음 웨이브 or 클리어!
    if (battle.enemies.every(e => e.hp <= 0)) {
      const q = getQuest();
      if (battle.waveIdx + 1 < q.waves.length) {
        addLog(`🌟 WAVE ${battle.waveIdx + 1} 클리어! 다음 웨이브 진입!`);
        SoundEngine.levelUp();
        await sleep(600);
        spawnWave(battle.waveIdx + 1);
        advanceTurnCounters();
        drawTurnHand();
        battle.phase = 'command';
        busy = false;
        saveActiveBattle();
        renderArena();
        return;
      } else {
        finishBattle(true);
        return;
      }
    }

    // 적 턴 반격 (상성 방어 시 피격 대미지 1/2!)
    await sleep(340);
    for (const en of battle.enemies) {
      if (en.hp <= 0) continue;
      if (en.stunned) {
        en.stunned = false;
        addLog(`⚡ ${en.name}은(는) 스턴으로 행동 불능!`);
        continue;
      }
      const aliveAllies = getActiveMembers(battle);
      if (aliveAllies.length === 0) break;

      en.charge++;
      if (en.charge >= en.maxCharge) {
        en.charge = 0;
        SoundEngine.error();
        addLog(`⚠️ ${en.name}의 보구 [${en.npName}] 발동!!`);
        aliveAllies.forEach(ally => {
          const sv = SERVANT_MAP[ally.id];
          if (ally.buffs.invul > 0) {
            showFloatDmg(`ally-dmg-${ally.rosterIdx}`, '무적 회피!', 'dmg-block');
          } else {
            const totalAff = getCombinedDamageMod(en.cls, sv.cls, en.attr, sv.attribute);
            const dmg = Math.round(en.atk * 1.9 * totalAff * Math.max(0.3, 1 - ally.buffs.def));
            ally.hp = Math.max(0, ally.hp - dmg);
            ally.np = Math.min(getMaxNp(ally.npLevel), ally.np + 14);
            showFloatDmg(`ally-dmg-${ally.rosterIdx}`, `-${dmg.toLocaleString()}`, 'dmg-enemy-hit');
          }
        });
      } else {
        const victim = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
        const sv = SERVANT_MAP[victim.id];
        if (victim.buffs.invul > 0) {
          showFloatDmg(`ally-dmg-${victim.rosterIdx}`, 'EVADE!', 'dmg-block');
        } else {
          const totalAff = getCombinedDamageMod(en.cls, sv.cls, en.attr, sv.attribute);
          const dmg = Math.round(en.atk * totalAff * Math.max(0.3, 1 - victim.buffs.def) * (0.9 + Math.random() * 0.2));
          victim.hp = Math.max(0, victim.hp - dmg);
          victim.np = Math.min(getMaxNp(victim.npLevel), victim.np + 8);
          showFloatDmg(`ally-dmg-${victim.rosterIdx}`, `-${dmg.toLocaleString()}`, 'dmg-enemy-hit');
        }
      }
      renderArena();
      await sleep(360);
    }

    // 전열 사망자 발생 시 후열 대기 멤버 자동 증원!
    reinforceFromBackline();

    // 6명 전원 전멸 체크 → 원작 FGO 영기복원(영주 3획 or 성정석 1개) 컨티뉴 모달!
    if (getActiveMembers(battle).length === 0) {
      battle.phase = 'wipeout';
      busy = false;
      saveActiveBattle();
      renderArena();
      openWipeoutContinueModal();
      return;
    }

    advanceTurnCounters();
    drawTurnHand();
    battle.phase = 'command';
    busy = false;
    saveActiveBattle();
    renderArena();
  }

  function advanceTurnCounters() {
    battle.turn++;
    battle.masterSkills.forEach(sk => { if (sk.curCd > 0) sk.curCd--; });
    getActiveMembers(battle).forEach(m => {
      const ce = getCePassive(m.ceId);
      const maxNp = getMaxNp(m.npLevel);
      m.skills.forEach(sk => { if (sk.curCd > 0) sk.curCd--; });
      if (ce.starsPerTurn) battle.stars = Math.min(99, battle.stars + ce.starsPerTurn);
      if (ce.npPerTurn) m.np = Math.min(maxNp, m.np + ce.npPerTurn);
      if (ce.hpDrain) m.hp = Math.max(1, m.hp - ce.hpDrain);

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

  // ================= 전멸 시 영기복원 (영주 3획 또는 성정석 1개) =================
  function reviveAllParty(viaSpell) {
    battle.roster.forEach(m => {
      m.hp = m.maxHp;
      m.np = Math.max(m.np, 100); // 전원 완전 부활 + NP 100%!
    });
    battle.activeSlots = [0, 1, 2];
    battle.subQueue = [3, 4, 5];
    battle.phase = 'command';
    buildNewDeck();
    drawTurnHand();
    SoundEngine.reveal(5, true);
    addLog(viaSpell ? '✦ 영주 3획 [영기복원]!! 6명 전원 완전 부활 + NP 100%!' : '💎 성정석 1개 [영기복원]!! 6명 전원 완전 부활 + NP 100%!');
    getBridge().toast('✨ 영기복원 완료! 파티 전원 부활 & NP 100% 충전!');
    document.getElementById('battle-continue-modal').classList.add('hidden');
    saveActiveBattle();
    renderArena();
  }

  function openWipeoutContinueModal() {
    const spells = getBridge().getCommandSpells();
    const sq = getBridge().getState().sq;
    const modal = document.getElementById('battle-continue-modal');
    const spellBtn = document.getElementById('btn-cont-spells');
    const sqBtn = document.getElementById('btn-cont-sq');
    const infoEl = document.getElementById('battle-continue-info');

    infoEl.textContent = `전열과 후열 6명이 모두 쓰러졌습니다. 영기복원을 사용하면 전원 HP 100% + NP 100% 상태로 전투를 계속할 수 있습니다! (보유 영주 ${spells}/3획 · 성정석 ${sq}개)`;
    spellBtn.disabled = spells < 3;
    spellBtn.textContent = spells >= 3 ? '✦ 영주 3획으로 영기복원 (무료)' : `✦ 영주 부족 (${spells}/3획 · 0시 회복)`;
    sqBtn.disabled = sq < 1;
    sqBtn.textContent = `💎 성정석 1개로 영기복원 (보유 ${sq})`;
    modal.classList.remove('hidden');
  }

  function finishBattle(victory) {
    battle.phase = 'ended';
    busy = false;
    clearSavedBattle();
    renderArena();

    const q = getQuest();
    const modal = document.getElementById('battle-result-modal');
    const titleEl = document.getElementById('battle-result-title');
    const bodyEl = document.getElementById('battle-result-body');

    if (victory) {
      SoundEngine.reveal(5, true);
      const ownedInParty = battle.roster.filter(m => !m.isSupport && !m.isRental).map(m => m.id);
      const fpBonus = q.rewards.fp || 2000;
      getBridge().grantBattleRewards({ ...q.rewards, fp: fpBonus }, ownedInParty);
      titleEl.textContent = '🏆 QUEST CLEAR!!';
      bodyEl.innerHTML = `
        <div class="br-quest">${q.name}</div>
        <div class="br-meta">${battle.turn}턴 만에 클리어 성공!</div>
        <div class="br-rewards-box">
          <div class="br-rw-title">✨ 획득 보상 (자동 지급 완료)</div>
          <div>${q.rewardText} · 🤝 FP +${fpBonus.toLocaleString()}</div>
          <div style="font-size:12px;color:#9cb2d9;margin-top:4px">출격한 보유 서번트 전원(전열+후열)의 인연 포인트가 상승했습니다!</div>
        </div>
      `;
    } else {
      SoundEngine.error();
      titleEl.textContent = '💀 DEFEAT — 전멸';
      bodyEl.innerHTML = `
        <div class="br-quest">${q.name}</div>
        <div class="br-meta">파티 6명이 모두 쓰러졌습니다. 마이룸에서 서번트를 육성하거나 상성 파티로 다시 도전해 보세요!</div>
      `;
    }
    modal.classList.remove('hidden');
  }

  // 앱 재실행 시 중단된 전투 이어하기 확인 (원작 FGO 고증!)
  function checkResumeSavedBattle() {
    const saved = loadSavedBattle();
    if (!saved) return;
    const q = QUESTS.find(x => x.id === saved.questId);
    const modal = document.getElementById('battle-resume-modal');
    const desc = document.getElementById('battle-resume-desc');
    if (!modal || !desc) return;
    desc.textContent = `이전 세션에서 중단된 전투 [${q ? q.name : saved.questId} · WAVE ${saved.waveIdx + 1} · TURN ${saved.turn}] 기록이 남아 있습니다. 이어서 진행하시겠습니까?`;
    modal.classList.remove('hidden');
  }

  // 상성표 모달 렌더링 (16×16 클래스 상성 + 공격 보정치 + 5×5 히든 속성)
  function openAffinityModal() {
    SoundEngine.click();
    const modal = document.getElementById('affinity-modal');
    const body = document.getElementById('affinity-modal-body');
    const clsOrder = ['Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker', 'Shielder', 'Ruler', 'Avenger', 'MoonCancer', 'AlterEgo', 'Pretender', 'Foreigner', 'BeastI', 'BeastIIIR'];
    const shortName = {
      Saber: '세', Archer: '아', Lancer: '랜', Rider: '라', Caster: '캐', Assassin: '어',
      Berserker: '버', Shielder: '실/Ⅱ', Ruler: '룰', Avenger: '어벤', MoonCancer: '문',
      AlterEgo: '얼', Pretender: '프', Foreigner: '포', BeastI: '비Ⅰ', BeastIIIR: '비Ⅲ'
    };

    const clsRows = clsOrder.map(atk => {
      const cells = clsOrder.map(def => {
        const m = getClassMultiplier(atk, def);
        let c = 'aff-cell';
        if (m >= 2.0) c += ' aff-c20';
        else if (m >= 1.5) c += ' aff-c15';
        else if (m > 1.0) c += ' aff-c12';
        else if (m < 1.0) c += ' aff-c05';
        return `<td class="${c}">${m.toFixed(1)}</td>`;
      }).join('');
      return `<tr><th>${shortName[atk]}</th><td class="aff-mod">${getClassAtkMod(atk).toFixed(2)}</td>${cells}</tr>`;
    }).join('');

    const attrs = ['인(人)', '천(天)', '지(地)', '성(星)', '수(獸)'];
    const attrRows = attrs.map(a1 => {
      const cells = attrs.map(a2 => {
        const m = getAttrMultiplier(a1, a2);
        const cls = m > 1 ? 'aff-cell aff-c20' : (m < 1 ? 'aff-cell aff-c05' : 'aff-cell');
        return `<td class="${cls}">${m.toFixed(1)}x</td>`;
      }).join('');
      return `<tr><th>${a1}</th>${cells}</tr>`;
    }).join('');

    body.innerHTML = `
      <h3 style="font-size:14px;margin-bottom:6px;color:#ffe680">⚔️ 클래스 상성표 & 공격측 보정치 (행: 공격군 → 열: 피격군)</h3>
      <div class="aff-table-wrap">
        <table class="aff-table">
          <thead><tr><th>공\\피</th><th>보정</th>${clsOrder.map(c => `<th>${shortName[c]}</th>`).join('')}</tr></thead>
          <tbody>${clsRows}</tbody>
        </table>
      </div>
      <h3 style="font-size:14px;margin:14px 0 6px;color:#ffe680">🌌 히든 속성 상성 (인간→하늘→땅→인간 · 별↔짐승)</h3>
      <table class="aff-table aff-attr-table">
        <thead><tr><th>공\\피</th>${attrs.map(a => `<th>${a}</th>`).join('')}</tr></thead>
        <tbody>${attrRows}</tbody>
      </table>
    `;
    modal.classList.remove('hidden');
  }

  // ================= 이벤트 바인딩 =================
  function bindEvents() {
    document.getElementById('btn-start-battle')?.addEventListener('click', startBattle);
    document.getElementById('btn-open-affinity')?.addEventListener('click', openAffinityModal);
    document.getElementById('btn-close-affinity')?.addEventListener('click', () => {
      document.getElementById('affinity-modal').classList.add('hidden');
    });
    document.getElementById('btn-ba-attack')?.addEventListener('click', () => {
      if (!battle || busy || battle.phase !== 'command') return;
      openPopup = null;
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

    // 우측 상단 3버튼: 마스터 Skill / 영주 / Menu
    document.getElementById('btn-ba-master-menu')?.addEventListener('click', () => {
      if (!battle || busy || battle.phase !== 'command') return;
      SoundEngine.click();
      openPopup = openPopup === 'master' ? null : 'master';
      renderTopPopups();
    });
    document.getElementById('btn-ba-spells')?.addEventListener('click', () => {
      if (!battle || busy || battle.phase !== 'command') return;
      SoundEngine.click();
      openPopup = openPopup === 'spells' ? null : 'spells';
      renderTopPopups();
    });
    document.getElementById('btn-ba-menu')?.addEventListener('click', () => {
      if (!battle || busy || battle.phase !== 'command') return;
      SoundEngine.click();
      openPopup = openPopup === 'menu' ? null : 'menu';
      renderTopPopups();
    });

    // 전멸 컨티뉴 모달
    document.getElementById('btn-cont-spells')?.addEventListener('click', () => {
      if (getBridge().consumeCommandSpells(3)) reviveAllParty(true);
    });
    document.getElementById('btn-cont-sq')?.addEventListener('click', () => {
      if (getBridge().spendSqForRevive()) reviveAllParty(false);
    });
    document.getElementById('btn-cont-giveup')?.addEventListener('click', () => {
      document.getElementById('battle-continue-modal').classList.add('hidden');
      finishBattle(false);
    });

    // 전투 이어하기 모달
    document.getElementById('btn-resume-yes')?.addEventListener('click', () => {
      const saved = loadSavedBattle();
      document.getElementById('battle-resume-modal').classList.add('hidden');
      if (!saved) return;
      battle = saved;
      busy = false;
      openPopup = null;
      getBridge().switchToBattleTab();
      document.getElementById('battle-lobby').classList.add('hidden');
      document.getElementById('battle-arena').classList.remove('hidden');
      renderArena();
      if (battle.phase === 'wipeout') openWipeoutContinueModal();
      getBridge().toast('⚔️ 중단된 전투를 이어서 진행합니다!');
    });
    document.getElementById('btn-resume-no')?.addEventListener('click', () => {
      document.getElementById('battle-resume-modal').classList.add('hidden');
      clearSavedBattle();
      getBridge().toast('중단된 전투를 포기하고 메인 화면으로 돌아왔습니다.');
    });

    // 결과 모달
    document.getElementById('btn-br-lobby')?.addEventListener('click', () => {
      document.getElementById('battle-result-modal').classList.add('hidden');
      battle = null;
      renderLobby();
    });
    document.getElementById('btn-br-retry')?.addEventListener('click', () => {
      document.getElementById('battle-result-modal').classList.add('hidden');
      startBattle();
    });

    // 실행 시 중단된 전투 여부 확인
    setTimeout(checkResumeSavedBattle, 250);
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
