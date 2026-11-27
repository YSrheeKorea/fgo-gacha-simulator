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
    Saber: { Archer: 0.5, Lancer: 2.0, Berserker: 2.0, Ruler: 0.5 },
    Archer: { Saber: 2.0, Lancer: 0.5, Berserker: 2.0, Ruler: 0.5 },
    Lancer: { Saber: 0.5, Archer: 2.0, Berserker: 2.0, Ruler: 0.5 },
    Rider: { Caster: 2.0, Assassin: 0.5, Berserker: 2.0, Ruler: 0.5, BeastI: 2.0 },
    Caster: { Rider: 0.5, Assassin: 2.0, Berserker: 2.0, Ruler: 0.5, BeastI: 2.0 },
    Assassin: { Rider: 2.0, Caster: 0.5, Berserker: 2.0, Ruler: 0.5, BeastI: 2.0 },
    Berserker: {
      Saber: 1.5, Archer: 1.5, Lancer: 1.5, Rider: 1.5, Caster: 1.5, Assassin: 1.5,
      Berserker: 1.5, Ruler: 1.5, Avenger: 1.5, MoonCancer: 1.5, AlterEgo: 1.5,
      Pretender: 1.5, Foreigner: 0.5, BeastI: 1.5
    },
    Shielder: {},
    BeastII: {},
    Ruler: { Berserker: 2.0, Avenger: 0.5, MoonCancer: 2.0 },
    Avenger: { Berserker: 2.0, Ruler: 2.0, MoonCancer: 0.5 },
    MoonCancer: { Berserker: 2.0, Ruler: 0.5, Avenger: 2.0, BeastIIIR: 1.2 },
    AlterEgo: {
      Saber: 0.5, Archer: 0.5, Lancer: 0.5, Rider: 1.5, Caster: 1.5, Assassin: 1.5,
      Berserker: 2.0, Pretender: 0.5, Foreigner: 2.0, BeastIIIR: 1.2
    },
    Pretender: {
      Saber: 1.5, Archer: 1.5, Lancer: 1.5, Rider: 0.5, Caster: 0.5, Assassin: 0.5,
      Berserker: 2.0, AlterEgo: 2.0, Foreigner: 0.5
    },
    Foreigner: { Berserker: 2.0, AlterEgo: 0.5, Pretender: 2.0, Foreigner: 2.0 },
    Beast: { Saber: 1.5, Archer: 1.5, Lancer: 1.5, Rider: 1.5, Caster: 1.5, Assassin: 1.5, Berserker: 1.5, Ruler: 0.5, Avenger: 0.5, MoonCancer: 0.5, AlterEgo: 0.5, Pretender: 0.5, Foreigner: 0.5 },
    UnBeast: { Saber: 1.5, Archer: 1.5, Lancer: 1.5, Rider: 1.5, Caster: 1.5, Assassin: 1.5, Berserker: 1.5, Ruler: 0.5, Avenger: 0.5, MoonCancer: 0.5, AlterEgo: 0.5, Pretender: 0.5, Foreigner: 0.5 },
    BeastI: { Saber: 2.0, Archer: 2.0, Lancer: 2.0, Berserker: 2.0, Avenger: 0.5 },
    BeastIIIR: {}
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

  // 원작 FGO 히든 스테이터스·특성 특공 판정 (보구 특공 1.5x!)
  const STD_7_CLASSES = new Set(['Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker']);
  function getNpTraitBonus(sv, enemy) {
    const spList = sv.npSpecial || [];
    if (!spList.length || !enemy) return { mult: 1.0, matched: [] };
    const enTraits = enemy.traits || [];
    const enAlign = enemy.align || '';
    const enGen = enemy.gender || '';
    const matched = [];
    for (const sp of spList) {
      let hit = false;
      if (sp === '서번트') {
        hit = enTraits.includes('서번트') && !enTraits.includes('특별한 별');
      } else if (sp === '정규 7클래스') {
        hit = STD_7_CLASSES.has(enemy.cls);
      } else if (sp === '비스트') {
        hit = enemy.cls.startsWith('Beast') || enTraits.includes('비스트');
      } else if (sp === '천/지') {
        hit = enemy.attr === '천(天)' || enemy.attr === '지(地)';
      } else if (sp === '천(天)' || sp === '지(地)' || sp === '인(人)' || sp === '성(星)') {
        hit = enemy.attr === sp;
      } else if (sp === '남성' || sp === '여성') {
        hit = enGen === sp;
      } else if (sp === '질서' || sp === '혼돈' || sp === '선' || sp === '악') {
        hit = enAlign.includes(sp);
      } else if (sp === '세이버') {
        hit = enemy.cls === 'Saber';
      } else if (sp === '라이더') {
        hit = enemy.cls === 'Rider';
      } else {
        hit = enTraits.includes(sp);
      }
      if (hit) matched.push(sp);
    }
    return matched.length ? { mult: 1.5, matched } : { mult: 1.0, matched: [] };
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
  const SINGLE_NPS = new Set(['sv_melusine', 'sv_enkidu', 'sv_ozymandias', 'sv_jack', 'sv_cu_alter', 'sv_heracles', 'sv_baobhan', 'sv_tristan', 'sv_cu', 'sv_ushiwaka', 'sv_robin', 'sv_bedivere', 'sv_euryale', 'sv_izok', 'sv_mandricardo']);

  function getNpCategory(sv, member = null) {
    if (member && member.buffs && member.buffs.npCatOverride) return member.buffs.npCatOverride;
    if (sv.id === 'sv_melusine' && member) return (member.viewAsc >= 3) ? 'aoe' : 'single';
    if (sv.npCat) return sv.npCat;
    if (SUPPORT_NPS.has(sv.id)) return 'support';
    if (SINGLE_NPS.has(sv.id)) return 'single';
    return 'aoe';
  }

  function getEffectiveNpType(sv, member = null) {
    if (member && member.buffs && member.buffs.npTypeOverride) return member.buffs.npTypeOverride;
    if (sv.id === 'sv_melusine' && member) return (member.viewAsc >= 3) ? 'Buster' : 'Arts';
    return sv.npType || 'Buster';
  }

  // 서번트 3스킬 생성 (원작 고증 target: 'ally' 개인 지정 / 'all' 단체 지정 / 'self' 본인 지정 / 'enemy' 적 지정)
  function getSkillDefs(sv) {
    const names = (sv.skills && sv.skills.length >= 3) ? sv.skills : ['카리스마 A', '마력방출 A', '심안(진) B'];
    if (sv.id === 'sv_castoria') {
      return [
        { key: 'castoria_1', name: names[0], cd: 5, icon: '⚔️', target: 'all',  desc: '[단체] 아군 전체 공격력 +20%(3T) & NP +30%' },
        { key: 'castoria_2', name: names[1], cd: 5, icon: '💎', target: 'ally', desc: '[개인] 선택 아군 1명 NP +20% & 아군 전체 NP 획득량 +30%(3T)' },
        { key: 'castoria_3', name: names[2], cd: 6, icon: '🔵', target: 'ally', desc: '[개인] 선택 아군 1명 Arts +50%(3T) & 무적(1T)' }
      ];
    }
    if (sv.id === 'sv_oberon') {
      return [
        { key: 'oberon_1', name: names[0], cd: 5, icon: '🦋', target: 'all',  desc: '[단체] 아군 전체 보구 위력 +30%(3T) & NP +20%' },
        { key: 'oberon_2', name: names[1], cd: 5, icon: '💎', target: 'ally', desc: '[개인] 선택 아군 1명 NP +50% & 크리스타 +20' },
        { key: 'oberon_3', name: names[2], cd: 6, icon: '🔥', target: 'ally', desc: '[개인] 선택 아군 1명 Buster +50%(1T) & 보구 위력 2배 부스트(1T)!' }
      ];
    }
    if (sv.id === 'sv_koyanskaya') {
      return [
        { key: 'koyan_1', name: names[0], cd: 6, icon: '💎', target: 'ally', desc: '[개인] 선택 아군 1명 NP +50% & 스킬 쿨타임 -2턴' },
        { key: 'koyan_2', name: names[1], cd: 5, icon: '⭐', target: 'ally', desc: '[개인] 선택 아군 1명 공격력 +25%(3T) & 크리스타 +20' },
        { key: 'koyan_3', name: names[2], cd: 5, icon: '🔴', target: 'ally', desc: '[개인] 선택 아군 1명 Buster +50%(3T) & 크리티컬 위력 +50%(3T)' }
      ];
    }
    if (sv.id === 'sv_waver') {
      return [
        { key: 'waver_1', name: names[0], cd: 5, icon: '💎', target: 'ally', desc: '[개인] 선택 아군 1명 크리 위력 +40%(3T) & NP +30%' },
        { key: 'waver_2', name: names[1], cd: 5, icon: '🛡️', target: 'all',  desc: '[단체] 아군 전체 방어력 +30%(3T) & NP +10%' },
        { key: 'waver_3', name: names[2], cd: 5, icon: '⚔️', target: 'all',  desc: '[단체] 아군 전체 공격력 +30%(3T) & NP +10%' }
      ];
    }
    if (sv.id === 'sv_no_001') {
      return [
        { key: 'mash_1', name: names[0], cd: 5, icon: '🛡️', target: 'all',  desc: '[단체] 아군 전체 방어력 +20%(3T)' },
        { key: 'mash_2', name: names[1], cd: 6, icon: '✨', target: 'ally', desc: '[개인] 선택 아군 1명 무적(1T) & NP +20%' },
        { key: 'mash_3', name: names[2], cd: 6, icon: '💎', target: 'self', desc: '[본인] 자신 NP 획득량 +100%(1T) & HP +2000' }
      ];
    }
    if (sv.id === 'sv_tamamo') {
      return [
        { key: 'tamamo_1', name: names[0], cd: 5, icon: '⏬', target: 'enemy', desc: '[적] 타겟 적의 차지 -1칸 감소' },
        { key: 'tamamo_2', name: names[1], cd: 5, icon: '🛡️', target: 'self',  desc: '[본인] 자신 방어력 +30%(3T)' },
        { key: 'tamamo_3', name: names[2], cd: 5, icon: '🔵', target: 'ally',  desc: '[개인] 선택 아군 1명 Arts +50%(3T) & HP +2500' }
      ];
    }
    if (sv.id === 'sv_xu_fu') {
      return [
        { key: 'xufu_1', name: names[0], cd: 5, icon: '💚', target: 'self', desc: '[본인] 자신 HP +3000 & 약화 해제' },
        { key: 'xufu_2', name: names[1], cd: 5, icon: '🔵', target: 'all',  desc: '[단체] 아군 전체 Arts +20%(3T) & 크리티컬 위력 +20%(3T)' },
        { key: 'xufu_3', name: names[2], cd: 5, icon: '💎', target: 'ally', desc: '[개인] 선택 아군 1명 NP +30% & NP 획득량 +30%(3T)' }
      ];
    }
    if (sv.id === 'sv_emiya') {
      return [
        { key: 'emiya_1', name: names[0], cd: 6, icon: '💨', target: 'self', desc: '[본인] 자신 회피(1T) & 방어력 +18%(3T)' },
        { key: 'emiya_2', name: names[1], cd: 6, icon: '⭐', target: 'self', desc: '[본인] 자신 스타 발생률 +100%(3T) & 크리 위력 +100%(3T)' },
        { key: 'emiya_3', name: names[2], cd: 5, icon: '🔵', target: 'self', desc: '[본인] 자신 3색 성능 +50%(1T) & 보구 속성 Arts 변환(1T)!' }
      ];
    }
    if (sv.id === 'sv_no_016') { // ★1 아라쉬
      return [
        { key: 'arash_1', name: names[0], cd: 5, icon: '🛡️', target: 'self', desc: '[본인] 자신 방어력 +20%(3T) & 약체내성 UP' },
        { key: 'arash_2', name: names[1], cd: 5, icon: '⚔️', target: 'self', desc: '[본인] 자신 공격력 +20%(3T) & 보구 위력 +20%(1T)' },
        { key: 'arash_3', name: names[2], cd: 6, icon: '💎', target: 'self', desc: '[본인] 자신 NP +30% & HP +2000 (보구 스텔라: 초고배율 후 퇴장!)' }
      ];
    }
    if (sv.id === 'sv_no_394') { // ★5 프톨레마이오스 (대군↔대인 전환)
      return [
        { key: 'ptol_1', name: names[0], cd: 5, icon: '⚔️', target: 'all',  desc: '[단체] 아군 전체 공격력 +20%(3T) & 크리 위력 +30%(3T)' },
        { key: 'ptol_2', name: names[1], cd: 5, icon: '💎', target: 'self', desc: '[본인] 자신 NP +50% & Buster/Arts +30%(3T)' },
        { key: 'ptol_3', name: names[2], cd: 5, icon: '🔄', target: 'self', desc: '[본인] 보구 형태 전환 (대군 Buster ⇄ 단일 Arts) & 스타 +20!' }
      ];
    }
    if (sv.id === 'sv_no_391') { // ★4 UDK-바게스트 (대군↔대인 전환)
      return [
        { key: 'udk_1', name: names[0], cd: 5, icon: '⚔️', target: 'all',  desc: '[단체] 아군 전체 공격력 +20%(3T) & HP +1500' },
        { key: 'udk_2', name: names[1], cd: 5, icon: '💎', target: 'self', desc: '[본인] 자신 NP +30% & Arts +30%(3T)' },
        { key: 'udk_3', name: names[2], cd: 5, icon: '🔄', target: 'self', desc: '[본인] 보구 대상 전환 (대군 ⇄ 단일) & 보구 위력 +30%(1T)!' }
      ];
    }
    if (sv.id === 'sv_melusine') { // ★5 요정기사 랜슬롯(멜뤼진): 1~2차 단일 Arts → 3스킬 100%차지 + 대군 Buster 용 변신!
      return [
        { key: 'melu_1', name: names[0], cd: 5, icon: '⚔️', target: 'self', desc: '[본인] 자신 공격력 +40%(3T) & NP +30%' },
        { key: 'melu_2', name: names[1], cd: 5, icon: '⭐', target: 'self', desc: '[본인] 자신 스타집중 +500% & 스타 +15 획득' },
        { key: 'melu_3', name: names[2], cd: 6, icon: '🐉', target: 'self', desc: '[본인] 영기 3단계 용 변신(대군 Buster 보구 전환) & NP +100% & 보구 위력 +30%(3T)!' }
      ];
    }
    if (sv.id === 'sv_cu') { // ★3 쿠 훌린: 원작 불사신(전투속행 근성 + 화살막이 회피 3회!)
      return [
        { key: 'cu_1', name: names[0], cd: 7, icon: '❤️‍🔥', target: 'self', desc: '[본인] 자신 근성 부여 (HP 2,500 · 5턴)' },
        { key: 'cu_2', name: names[1], cd: 5, icon: '💨', target: 'self', desc: '[본인] 자신 회피 부여 (3회·3턴) & 방어력 +16%(3T)' },
        { key: 'cu_3', name: names[2], cd: 5, icon: '💚', target: 'self', desc: '[본인] 자신 약화 해제 & HP +2,500 회복' }
      ];
    }
    if (sv.id === 'sv_no_241') { // ★5 사마의(라이네스): 개인 50% 주유 서포터!
      return [
        { key: 'reines_1', name: names[0], cd: 5, icon: '🛡️', target: 'all',  desc: '[단체] 아군 전체 방어력 +20%(3T) & NP +10%' },
        { key: 'reines_2', name: names[1], cd: 5, icon: '⚔️', target: 'ally', desc: '[개인] 선택 아군 1명 공격력 +40%(3T) & NP +20%' },
        { key: 'reines_3', name: names[2], cd: 6, icon: '💎', target: 'ally', desc: '[개인] 선택 아군 1명 무적(2회·3T) & NP +20%' }
      ];
    }
    if (sv.id === 'sv_no_315') { // ★4 하베트롯: 자가 80% 차지 + 3스킬 선택 아군 버프 후 자폭 오첸!
      return [
        { key: 'habe_1', name: names[0], cd: 5, icon: '💚', target: 'all',  desc: '[단체] 아군 전체 HP +2,000 & 크리티컬 위력 +30%(3T)' },
        { key: 'habe_2', name: names[1], cd: 6, icon: '💎', target: 'self', desc: '[본인] 자신 NP +80% & Arts +30%(3T)!' },
        { key: 'habe_3', name: names[2], cd: 6, icon: '🌸', target: 'ally', desc: '[개인] 선택 아군 1명 근성(3,000)·회복·무적 부여 후 자신 퇴장(후열 증원!)' }
      ];
    }
    if (sv.id === 'sv_ozymandias') { // ★5 오지만디아스: 아군 전체 NP +20% + 황제특권!
      return [
        { key: 'ozy_1', name: names[0], cd: 5, icon: '⚔️', target: 'all',  desc: '[단체] 아군 전체 공격력 +20%(3T) & 크리 위력 +20%(3T)' },
        { key: 'ozy_2', name: names[1], cd: 5, icon: '👑', target: 'self', desc: '[본인] 황제특권! 공격 +40%(3T) & 방어 +40%(3T) & HP +3,000' },
        { key: 'ozy_3', name: names[2], cd: 6, icon: '☀️', target: 'all',  desc: '[단체] 아군 전체 NP +20% & 보구 위력 +20%(3T)!' }
      ];
    }
    if (sv.id === 'sv_no_397') { // ★5 타케다 하루노부(타케다 신겐): 개인 쿨타임 -1T + 50차지!
      return [
        { key: 'shingen_1', name: names[0], cd: 5, icon: '⚔️', target: 'all',  desc: '[단체] 아군 전체 공격력 +20%(3T) & Buster +20%(3T)' },
        { key: 'shingen_2', name: names[1], cd: 6, icon: '⏱️', target: 'ally', desc: '[개인] 선택 아군 1명 스킬 쿨타임 -1턴 & 회피(1회·3T)!' },
        { key: 'shingen_3', name: names[2], cd: 6, icon: '💎', target: 'self', desc: '[본인] 자신 NP +50% & 크리 위력 +50%(3T)' }
      ];
    }
    if (sv.id === 'sv_no_150') { // ★5 멀린: 몽환의 카리스마 + 전체 무적 + 영웅작성(B+50%·크리+100%)!
      return [
        { key: 'merlin_1', name: names[0], cd: 5, icon: '⚔️', target: 'all',  desc: '[단체] 아군 전체 공격력 +20%(3T) & NP +20%' },
        { key: 'merlin_2', name: names[1], cd: 7, icon: '🛡️', target: 'all',  desc: '[단체] 아군 전체 무적(1T) & 스타발생률 +50%(1T)' },
        { key: 'merlin_3', name: names[2], cd: 6, icon: '🔴', target: 'ally', desc: '[개인] 영웅작성 EX! 선택 아군 Buster +50%(3T) · 크리 +100%(1T) · 최대HP +3,000!' }
      ];
    }
    if (sv.id === 'sv_no_215') { // ★5 스카사하=스카디: 원초의 룬(Q+50%·크리+100%) + 개인 NP 50%!
      return [
        { key: 'skadi_1', name: names[0], cd: 6, icon: '🟢', target: 'ally', desc: '[개인] 선택 아군 1명 Quick +50%(3T) & 크리티컬 위력 +100%(3T)!' },
        { key: 'skadi_2', name: names[1], cd: 6, icon: '❄️', target: 'all',  desc: '[단체] 얼어붙는 눈보라! 아군 공격력 +30%(3T) & 적 크리 약화' },
        { key: 'skadi_3', name: names[2], cd: 6, icon: '💎', target: 'ally', desc: '[개인] 선택 아군 1명 NP +50% 충전!' }
      ];
    }
    if (sv.id === 'sv_no_258') { // ★2 진궁: 아군 사출 대군 아츠 시스템!
      return [
        { key: 'chengong_1', name: names[0], cd: 5, icon: '🛡️', target: 'ally', desc: '[개인] 선택 아군 1명 방어력 +30%(1T) & 스타발생 +30%' },
        { key: 'chengong_2', name: names[1], cd: 6, icon: '💎', target: 'all',  desc: '[단체] 아군 전체 방어력 +15%(3T) & NP +10%' },
        { key: 'chengong_3', name: names[2], cd: 6, icon: '🔴', target: 'ally', desc: '[개인] 선택 아군 1명 Buster +50%(1T) & 크리 +50%(1T)' }
      ];
    }
    if (sv.id === 'sv_no_385') { // ★5 구세주 토네리코: 아군 전체 NP +50% + 보구+30%!
      return [
        { key: 'tonelico_1', name: names[0], cd: 6, icon: '⚔️', target: 'all',  desc: '[단체] 아군 전체 공격력 +20%(3T) & NP +20%' },
        { key: 'tonelico_2', name: names[1], cd: 6, icon: '❤️‍🔥', target: 'all', desc: '[단체] 아군 전체 근성(2,000 · 3T) & HP +2,000' },
        { key: 'tonelico_3', name: names[2], cd: 7, icon: '💎', target: 'all',  desc: '[단체] 아군 전체 NP +50% & 보구 위력 +30%(3T)!' }
      ];
    }
    if (sv.id === 'sv_no_036') { // ★1 모차르트: 작은 별의 밤 스타 +50개 즉시 획득!
      return [
        { key: 'mozart_1', name: names[0], cd: 5, icon: '🔵', target: 'all',  desc: '[단체] 아군 전체 Arts +44%(1T)!' },
        { key: 'mozart_2', name: names[1], cd: 6, icon: '🎵', target: 'all',  desc: '[단체] 아군 전체 방어력 +20%(3T) & NP +10%' },
        { key: 'mozart_3', name: names[2], cd: 6, icon: '⭐', target: 'self', desc: '[본인] 작은 별의 밤 EX! 크리티컬 스타 +50개 즉시 획득(전 카드 100% 크리!!)' }
      ];
    }
    if (sv.id === 'sv_no_467') { // ★5 프랑수아/프란체스카 프렐라티: 보조 ⇄ 대군 영기 변환!
      return [
        { key: 'prelati_1', name: names[0], cd: 5, icon: '🔵', target: 'all',  desc: '[단체] 아군 전체 Arts +25%(3T) & NP +20%' },
        { key: 'prelati_2', name: names[1], cd: 6, icon: '💎', target: 'self', desc: '[본인] 자신 NP +50% & 회피(1회·3T)' },
        { key: 'prelati_3', name: names[2], cd: 5, icon: '🔄', target: 'self', desc: '[본인] 영기 변환! 보구 전환 (프랑수아 보조 ⇄ 프란체스카 대군 Arts)!' }
      ];
    }
    const cardIcon = sv.npType === 'Buster' ? '🔴' : (sv.npType === 'Arts' ? '🔵' : '🟢');
    const npCharge = sv.id === 'sv_arcueid' ? 100 : (sv.rarity === 5 ? 50 : (sv.rarity === 4 ? 30 : 25));
    const isSup = getNpCategory(sv) === 'support';
    return [
      { key: 'gen_1', name: names[0], cd: 5, icon: '⚔️', target: 'all', desc: `[단체] 아군 전체 공격력 +20%(3T) & 자신 ${sv.npType} +30%(3T)` },
      isSup
        ? { key: 'sup_2', name: names[1], cd: 5, icon: '💎', target: 'ally', desc: `[개인] 선택 아군 1명 NP +30% & 크리티컬 스타 +15` }
        : { key: 'gen_2', name: names[1], cd: 5, icon: '💎', target: 'self', desc: `[본인] 자신 NP +${npCharge}% & 크리티컬 스타 +15` },
      { key: 'gen_3', name: names[2], cd: 6, icon: cardIcon, target: 'self', desc: '[본인] 자신 무적(1T) & 보구 위력 +30%(3T) & HP +2500' }
    ];
  }

  function applyServantSkill(b, caster, key, name, targetRIdx = null) {
    const alive = getActiveMembers(b);
    const sv = SERVANT_MAP[caster.id];
    const target = (targetRIdx !== null && targetRIdx !== undefined && b.roster[targetRIdx] && b.roster[targetRIdx].hp > 0)
      ? b.roster[targetRIdx]
      : caster;
    const tgtSv = SERVANT_MAP[target.id];
    const tgtName = tgtSv?.nickname || tgtSv?.name || '';
    const addNp = (m, amt) => { m.np = Math.min(getMaxNp(m.npLevel), m.np + amt); };
    ensureMemberBuffs(caster);
    ensureMemberBuffs(target);

    switch (key) {
      case 'castoria_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.2; m.buffs.atkT = 3; addNp(m, 30); });
        return `${sv.name} [${name}]! 아군 전체 공업 +20% & NP +30%!`;
      case 'castoria_2':
        addNp(target, 20);
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.npGain += 0.3; m.buffs.npGainT = 3; });
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} NP +20% & 아군 전체 NP 획득량 +30%!`;
      case 'castoria_3':
        target.buffs.arts += 0.5; target.buffs.cardT = 3; target.buffs.invul = Math.max(target.buffs.invul, 1);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} Arts +50%(3T) & 무적(1T)!`;
      case 'oberon_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.npDmg += 0.3; m.buffs.npDmgT = 3; addNp(m, 20); });
        return `${sv.name} [${name}]! 아군 전체 보구 위력 +30% & NP +20%!`;
      case 'oberon_2':
        addNp(target, 50);
        b.stars = Math.min(99, b.stars + 20);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} NP +50% & 스타 +20!`;
      case 'oberon_3':
        target.buffs.buster += 0.5; target.buffs.cardT = Math.max(target.buffs.cardT, 1); target.buffs.npBoost = 2.0;
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} Buster +50% & 보구 위력 2배 부스트!!`;
      case 'koyan_1':
        addNp(target, 50);
        target.skills.forEach(sk => { if (sk.curCd > 0) sk.curCd = Math.max(0, sk.curCd - 2); });
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} NP +50% & 쿨타임 -2턴!`;
      case 'koyan_2':
        target.buffs.atk += 0.25; target.buffs.atkT = 3;
        b.stars = Math.min(99, b.stars + 20);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} 공격력 +25%(3T) & 스타 +20!`;
      case 'koyan_3':
        target.buffs.buster += 0.5; target.buffs.cardT = 3; target.buffs.crit += 0.5; target.buffs.critT = 3;
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} Buster +50% & 크리 위력 +50%!`;
      case 'waver_1':
        target.buffs.crit += 0.4; target.buffs.critT = 3; addNp(target, 30);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} 크리 +40% & NP +30%!`;
      case 'waver_2':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.def += 0.3; m.buffs.defT = 3; addNp(m, 10); });
        return `${sv.name} [${name}]! 아군 전체 방어 +30% & NP +10%!`;
      case 'waver_3':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.3; m.buffs.atkT = 3; addNp(m, 10); });
        return `${sv.name} [${name}]! 아군 전체 공격 +30% & NP +10%!`;
      case 'mash_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.def += 0.2; m.buffs.defT = 3; });
        return `${sv.name} [${name}]! 아군 전체 방어력 +20%(3T)!`;
      case 'mash_2':
        target.buffs.invul = Math.max(target.buffs.invul, 1); addNp(target, 20);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} 무적(1T) & NP +20%!`;
      case 'mash_3':
        caster.buffs.npGain += 1.0; caster.buffs.npGainT = 1; caster.hp = Math.min(caster.maxHp, caster.hp + 2000);
        return `${sv.name} [${name}]! 본인 NP 획득량 +100% & HP +2000!`;
      case 'tamamo_1': {
        const en = b.enemies[b.targetIdx] || pickAliveTarget();
        if (en && en.hp > 0) en.charge = Math.max(0, en.charge - 1);
        return `${sv.name} [${name}]! ${en ? en.name : '적'} 차지 -1칸 감소!`;
      }
      case 'tamamo_2':
        caster.buffs.def += 0.3; caster.buffs.defT = 3;
        return `${sv.name} [${name}]! 본인 방어력 +30%(3T)!`;
      case 'tamamo_3':
        target.buffs.arts += 0.5; target.buffs.cardT = 3; target.hp = Math.min(target.maxHp, target.hp + 2500);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} Arts +50%(3T) & HP +2500!`;
      case 'xufu_1':
        caster.hp = Math.min(caster.maxHp, caster.hp + 3000);
        return `${sv.name} [${name}]! 본인 HP +3000 & 약화 해제!`;
      case 'xufu_2':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.arts += 0.2; m.buffs.cardT = 3; m.buffs.crit += 0.2; m.buffs.critT = 3; });
        return `${sv.name} [${name}]! 아군 전체 Arts +20% & 크리 +20%!`;
      case 'xufu_3':
        addNp(target, 30); target.buffs.npGain += 0.3; target.buffs.npGainT = 3;
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} NP +30% & NP 획득량 +30%!`;
      case 'emiya_1':
        caster.buffs.evade = Math.max(caster.buffs.evade, 1); caster.buffs.def += 0.18; caster.buffs.defT = 3;
        return `${sv.name} [${name}]! 본인 회피(1T) & 방어력 +18%(3T)!`;
      case 'emiya_2':
        caster.buffs.starGen += 1.0; caster.buffs.crit += 1.0; caster.buffs.critT = 3;
        return `${sv.name} [${name}]! 본인 스타발생 +100% & 크리 위력 +100%(3T)!`;
      case 'emiya_3':
        caster.buffs.buster += 0.5; caster.buffs.arts += 0.5; caster.buffs.quick += 0.5; caster.buffs.cardT = Math.max(caster.buffs.cardT, 1);
        caster.buffs.npTypeOverride = 'Arts';
        return `${sv.name} [${name}]! 3색 +50% & 1턴 한정 보구 속성 [Arts] 변환!!`;
      case 'arash_1':
        caster.buffs.def += 0.2; caster.buffs.defT = 3;
        return `${sv.name} [${name}]! 본인 방어력 +20%(3T)!`;
      case 'arash_2':
        caster.buffs.atk += 0.2; caster.buffs.atkT = 3; caster.buffs.npDmg += 0.2; caster.buffs.npDmgT = Math.max(caster.buffs.npDmgT, 1);
        return `${sv.name} [${name}]! 본인 공격력 +20% & 보구 위력 +20%!`;
      case 'arash_3':
        addNp(caster, 30); caster.hp = Math.min(caster.maxHp, caster.hp + 2000);
        return `${sv.name} [${name}]! 본인 NP +30% & HP +2000!`;
      case 'ptol_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.2; m.buffs.atkT = 3; m.buffs.crit += 0.3; m.buffs.critT = 3; });
        return `${sv.name} [${name}]! 아군 전체 공업 +20% & 크리 +30%!`;
      case 'ptol_2':
        addNp(caster, 50); caster.buffs.buster += 0.3; caster.buffs.arts += 0.3; caster.buffs.cardT = 3;
        return `${sv.name} [${name}]! 본인 NP +50% & B/A +30%!`;
      case 'ptol_3': {
        const curCat = getNpCategory(sv, caster);
        const nextCat = curCat === 'aoe' ? 'single' : 'aoe';
        caster.buffs.npCatOverride = nextCat;
        caster.buffs.npTypeOverride = nextCat === 'single' ? 'Arts' : 'Buster';
        b.stars = Math.min(99, b.stars + 20);
        return `${sv.name} [${name}]! 보구 형태 [${nextCat === 'single' ? '단일 Arts' : '대군 Buster'}] 전환 & 스타 +20!`;
      }
      case 'udk_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.2; m.buffs.atkT = 3; m.hp = Math.min(m.maxHp, m.hp + 1500); });
        return `${sv.name} [${name}]! 아군 전체 공업 +20% & HP +1500!`;
      case 'udk_2':
        addNp(caster, 30); caster.buffs.arts += 0.3; caster.buffs.cardT = 3;
        return `${sv.name} [${name}]! 본인 NP +30% & Arts +30%!`;
      case 'udk_3': {
        const curCat = getNpCategory(sv, caster);
        const nextCat = curCat === 'aoe' ? 'single' : 'aoe';
        caster.buffs.npCatOverride = nextCat;
        caster.buffs.npDmg += 0.3; caster.buffs.npDmgT = Math.max(caster.buffs.npDmgT, 1);
        return `${sv.name} [${name}]! 보구 대상 [${nextCat === 'single' ? '단일' : '대군'}] 전환 & 보구 위력 +30%!`;
      }
      case 'melu_1':
        caster.buffs.atk += 0.4; caster.buffs.atkT = 3; addNp(caster, 30);
        return `${sv.name} [${name}]! 본인 공격력 +40%(3T) & NP +30%!`;
      case 'melu_2':
        caster.buffs.starWeight += 500; b.stars = Math.min(99, b.stars + 15);
        reallocateCurrentHandStars(b);
        return `${sv.name} [${name}]! 본인 스타집중 +500% & 스타 +15!`;
      case 'melu_3':
        if (caster.buffs.npCatOverride !== 'aoe' && caster.viewAsc < 3) {
          addNp(caster, 100);
          caster.viewAsc = 3;
          caster.buffs.npCatOverride = 'aoe';
          caster.buffs.npTypeOverride = 'Buster';
          caster.buffs.npDmg += 0.3; caster.buffs.npDmgT = 3;
          return `${sv.name} [${name}]! 🐉 영기 3단계 용 변신(대군 Buster 보구 전환) & NP +100%!!`;
        }
        caster.buffs.invul = Math.max(caster.buffs.invul, 1);
        caster.buffs.npDmg += 0.3; caster.buffs.npDmgT = 3;
        return `${sv.name} [${name}]! 무적(1T) & 보구 위력 +30%(3T)!`;
      case 'cu_1':
        caster.buffs.guts = Math.max(caster.buffs.guts, 2500); caster.buffs.gutsT = 5;
        return `${sv.name} [${name}]! 본인 근성(2,500 · 5턴) 부여!`;
      case 'cu_2':
        caster.buffs.evadeHits = Math.max(caster.buffs.evadeHits, 3); caster.buffs.evadeT = 3;
        caster.buffs.def += 0.16; caster.buffs.defT = 3;
        return `${sv.name} [${name}]! 화살막이 회피(3회·3턴) & 방어력 +16%!`;
      case 'cu_3':
        caster.hp = Math.min(caster.maxHp, caster.hp + 2500);
        return `${sv.name} [${name}]! 약화 해제 & HP +2,500 회복!`;
      case 'reines_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.def += 0.2; m.buffs.defT = 3; addNp(m, 10); });
        return `${sv.name} [${name}]! 아군 전체 방어 +20% & NP +10%!`;
      case 'reines_2':
        target.buffs.atk += 0.4; target.buffs.atkT = 3; addNp(target, 20);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} 공격 +40%(3T) & NP +20%!`;
      case 'reines_3':
        target.buffs.invulHits = Math.max(target.buffs.invulHits, 2); addNp(target, 20);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} 무적(2회) & NP +20%!`;
      case 'habe_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.hp = Math.min(m.maxHp, m.hp + 2000); m.buffs.crit += 0.3; m.buffs.critT = 3; });
        return `${sv.name} [${name}]! 아군 전체 HP +2,000 & 크리 +30%!`;
      case 'habe_2':
        addNp(caster, 80); caster.buffs.arts += 0.3; caster.buffs.cardT = 3;
        return `${sv.name} [${name}]! 본인 NP +80% & Arts +30%!`;
      case 'habe_3':
        target.buffs.guts = Math.max(target.buffs.guts, 3000); target.buffs.gutsT = 3;
        target.buffs.invul = Math.max(target.buffs.invul, 1);
        target.hp = Math.min(target.maxHp, target.hp + 3000);
        caster.hp = 0;
        reinforceFromBackline();
        return `${sv.name} [${name}] → ${tgtName}! 수호신부 버프 부여 후 하베트롯 퇴장 → 후열 증원!`;
      case 'ozy_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.2; m.buffs.atkT = 3; m.buffs.crit += 0.2; m.buffs.critT = 3; });
        return `${sv.name} [${name}]! 아군 전체 공+20% & 크리+20%!`;
      case 'ozy_2':
        caster.buffs.atk += 0.4; caster.buffs.atkT = 3; caster.buffs.def += 0.4; caster.buffs.defT = 3;
        caster.hp = Math.min(caster.maxHp, caster.hp + 3000);
        return `${sv.name} [${name}]! 황제특권 공+40% · 방+40% · HP+3,000!`;
      case 'ozy_3':
        alive.forEach(m => { ensureMemberBuffs(m); addNp(m, 20); m.buffs.npDmg += 0.2; m.buffs.npDmgT = 3; });
        return `${sv.name} [${name}]! 태양신의 가호 — 아군 전체 NP +20% & 보구 위력 +20%!`;
      case 'shingen_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.2; m.buffs.atkT = 3; m.buffs.buster += 0.2; m.buffs.cardT = 3; });
        return `${sv.name} [${name}]! 아군 전체 공+20% & Buster+20%!`;
      case 'shingen_2':
        target.skills.forEach(sk => { if (sk.curCd > 0) sk.curCd = Math.max(0, sk.curCd - 1); });
        target.buffs.evadeHits = Math.max(target.buffs.evadeHits, 1); target.buffs.evadeT = 3;
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} 스킬 쿨타임 -1턴 & 회피(1회·3T)!`;
      case 'shingen_3':
        addNp(caster, 50); caster.buffs.crit += 0.5; caster.buffs.critT = 3;
        return `${sv.name} [${name}]! 본인 NP +50% & 크리 +50%!`;
      case 'merlin_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.2; m.buffs.atkT = 3; addNp(m, 20); });
        return `${sv.name} [${name}]! 아군 전체 공+20%(3T) & NP +20%!`;
      case 'merlin_2':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.invul = Math.max(m.buffs.invul, 1); m.buffs.starGen += 0.5; });
        return `${sv.name} [${name}]! 아군 전체 무적(1T) & 스타발생 +50%!`;
      case 'merlin_3':
        target.buffs.buster += 0.5; target.buffs.cardT = 3;
        target.buffs.crit += 1.0; target.buffs.critT = Math.max(target.buffs.critT, 1);
        target.buffs.maxHpBonus += 3000; target.maxHp += 3000; target.hp += 3000;
        return `${sv.name} [${name}] → ${tgtName}! 영웅작성 B+50% · 크리+100% · 최대HP+3,000!!`;
      case 'skadi_1':
        target.buffs.quick += 0.5; target.buffs.cardT = 3;
        target.buffs.crit += 1.0; target.buffs.critT = 3;
        return `${sv.name} [${name}] → ${tgtName}! 원초의 룬 Q+50%(3T) & 크리+100%(3T)!!`;
      case 'skadi_2':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.3; m.buffs.atkT = 3; });
        return `${sv.name} [${name}]! 얼어붙는 눈보라 — 적 전체 방어 DOWN(아군 화력 +30%)!`;
      case 'skadi_3':
        addNp(target, 50);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} NP +50% 충전!`;
      case 'chengong_1':
        target.buffs.def += 0.3; target.buffs.defT = 1; target.buffs.starGen += 0.3;
        return `${sv.name} [${name}] → ${tgtName}! 방어+30%(1T)!`;
      case 'chengong_2':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.def += 0.15; m.buffs.defT = 3; addNp(m, 10); });
        return `${sv.name} [${name}]! 아군 전체 방어+15% & NP +10%!`;
      case 'chengong_3':
        target.buffs.buster += 0.5; target.buffs.cardT = Math.max(target.buffs.cardT, 1);
        target.buffs.crit += 0.5; target.buffs.critT = Math.max(target.buffs.critT, 1);
        return `${sv.name} [${name}] → ${tgtName}! B+50% & 크리+50%!`;
      case 'tonelico_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.2; m.buffs.atkT = 3; addNp(m, 20); });
        return `${sv.name} [${name}]! 아군 전체 공+20% & NP +20%!`;
      case 'tonelico_2':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.guts = Math.max(m.buffs.guts, 2000); m.buffs.gutsT = 3; m.hp = Math.min(m.maxHp, m.hp + 2000); });
        return `${sv.name} [${name}]! 아군 전체 근성(2,000·3T) & HP +2,000!`;
      case 'tonelico_3':
        alive.forEach(m => { ensureMemberBuffs(m); addNp(m, 50); m.buffs.npDmg += 0.3; m.buffs.npDmgT = 3; });
        return `${sv.name} [${name}]! 아군 전체 NP +50% & 보구 위력 +30%(3T)!!`;
      case 'mozart_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.arts += 0.44; m.buffs.cardT = Math.max(m.buffs.cardT, 1); });
        return `${sv.name} [${name}]! 아군 전체 Arts +44%(1T)!`;
      case 'mozart_2':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.def += 0.2; m.buffs.defT = 3; addNp(m, 10); });
        return `${sv.name} [${name}]! 아군 전체 방어+20% & NP +10%!`;
      case 'mozart_3':
        b.stars = Math.min(99, b.stars + 50);
        reallocateCurrentHandStars(b);
        return `${sv.name} [${name}]! ⭐ 작은 별의 밤 — 크리티컬 스타 +50개 즉시 획득 (전 카드 100% 크리)!!`;
      case 'prelati_1':
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.arts += 0.25; m.buffs.cardT = 3; addNp(m, 20); });
        return `${sv.name} [${name}]! 아군 전체 Arts+25% & NP +20%!`;
      case 'prelati_2':
        addNp(caster, 50); caster.buffs.evadeHits = Math.max(caster.buffs.evadeHits, 1); caster.buffs.evadeT = 3;
        return `${sv.name} [${name}]! 본인 NP +50% & 회피(1회·3T)!`;
      case 'prelati_3': {
        const curCat = getNpCategory(sv, caster);
        const nextCat = curCat === 'aoe' ? 'support' : 'aoe';
        caster.buffs.npCatOverride = nextCat;
        return `${sv.name} [${name}]! 영기 변환 — 보구 [${nextCat === 'aoe' ? '프란체스카 대군 Arts' : '프랑수아 보조'}] 전환!`;
      }
      case 'sup_2':
        addNp(target, 30);
        b.stars = Math.min(99, b.stars + 15);
        return `${sv.name} [${name}] → ${tgtName}! ${tgtName} NP +30% & 스타 +15!`;
      case 'gen_1': {
        const mc = sv.npType.toLowerCase();
        alive.forEach(m => { ensureMemberBuffs(m); m.buffs.atk += 0.2; m.buffs.atkT = 3; });
        caster.buffs[mc] += 0.3; caster.buffs.cardT = 3;
        return `${sv.name} [${name}]! 아군 공업 +20% & 본인 ${sv.npType} +30%!`;
      }
      case 'gen_2': {
        const amt = sv.id === 'sv_arcueid' ? 100 : (sv.rarity === 5 ? 50 : (sv.rarity === 4 ? 30 : 25));
        addNp(caster, amt);
        b.stars = Math.min(99, b.stars + 15);
        return `${sv.name} [${name}]! 본인 NP +${amt}% & 스타 +15!`;
      }
      default:
        caster.buffs.invul = Math.max(caster.buffs.invul, 1);
        caster.buffs.npDmg += 0.3; caster.buffs.npDmgT = 3;
        caster.hp = Math.min(caster.maxHp, caster.hp + 2500);
        return `${sv.name} [${name}]! 본인 무적(1T) & 보구 위력 +30% & HP +2500!`;
    }
  }

  // ================= 마술예장 28종 마스터 스킬 완전 실행 엔진 =================
  function ensureMemberBuffs(m) {
    if (!m.buffs) m.buffs = {};
    const defaults = {
      atk: 0, atkT: 0, def: 0, defT: 0,
      buster: 0, arts: 0, quick: 0, cardT: 0,
      npDmg: 0, npDmgT: 0, npGain: 0, npGainT: 0,
      crit: 0, critT: 0, invul: 0, invulHits: 0,
      evade: 0, evadeHits: 0, evadeT: 0,
      guts: 0, gutsT: 0, sureHit: 0, invulPierce: 0,
      extraUp: 0, ocUp: 0, starGen: 0,
      starWeight: 0, busterStarWeight: 0, artsStarWeight: 0,
      debuffImmune: 0, buffProtect: 0,
      regen: 0, regenT: 0, maxHpBonus: 0, npBoost: 1
    };
    Object.keys(defaults).forEach(k => {
      if (m.buffs[k] === undefined) m.buffs[k] = defaults[k];
    });
    return m.buffs;
  }

  function buildBattleMasterSkills(mcId, mcLv) {
    const mc = (typeof MYSTIC_CODE_MAP !== 'undefined' && MYSTIC_CODE_MAP[mcId])
      || (typeof MYSTIC_CODES !== 'undefined' && MYSTIC_CODES[0]);
    if (!mc) {
      return [
        { idx: 0, name: '전체 강화', cd: 12, curCd: 0, icon: '🔥', target: 'all', effects: { atk: [0.2, 0.3] }, desc: '아군 전체 공격력 +30% (1턴)' },
        { idx: 1, name: '간드', cd: 15, curCd: 0, icon: '⚡', target: 'enemy', effects: { stun: 1 }, desc: '타겟 적 스턴 (1턴)' },
        { idx: 2, name: '오더 체인지', cd: 15, curCd: 0, icon: '🔄', target: 'order_change', effects: { orderChange: 1 }, desc: '전열과 후열 멤버 1:1 교체' }
      ];
    }
    const lv = Math.max(1, Math.min(10, Number(mcLv) || 1));
    return mc.skills.map((sk, idx) => ({
      idx,
      name: sk.name,
      icon: sk.icon,
      target: sk.target,
      cd: getMcSkillCd(sk.cdBase, lv),
      curCd: 0,
      effects: sk.effects,
      desc: sk.descFn ? sk.descFn(lv) : ''
    }));
  }

  // 원작 FGO 고증 오더 체인지: 덱 리셋 없이 전열/후열 1:1 카드 스왑 & 버프 유지!
  function executeOrderChange(b, frontSlotPos, subQueueIdx) {
    const outRIdx = b.activeSlots[frontSlotPos];
    const inRIdx = b.subQueue[subQueueIdx];
    if (outRIdx === null || outRIdx === undefined || inRIdx === undefined) return null;

    const outM = b.roster[outRIdx];
    const inM = b.roster[inRIdx];
    if (!outM || !inM || inM.hp <= 0) return null;

    // 1) 슬롯 스왑 (나가는 서번트의 버프는 그대로 보존된 채 후열로 이동!)
    b.activeSlots[frontSlotPos] = inRIdx;
    b.subQueue[subQueueIdx] = outRIdx;

    // 2) 커맨드 덱 & 핸드 1:1 매핑 스왑 (원작 고증: 덱 리셋 없음! 카드 배열 차이만큼만 색 변경)
    const inDeckTypes = getServantDeckTypes(SERVANT_MAP[inM.id]);
    const swapCard = (c) => {
      if (c.rosterIdx !== outRIdx) return;
      const slotNo = typeof c.cardSlot === 'number' ? c.cardSlot : 0;
      c.rosterIdx = inRIdx;
      c.svId = inM.id;
      c.type = inDeckTypes[slotNo % 5] || inDeckTypes[0];
    };
    b.hand.forEach(swapCard);
    b.deck.forEach(swapCard);

    // 3) 현재 핸드의 스타 재분배 (총 스타 합계 보존)
    reallocateCurrentHandStars(b);

    const outSv = SERVANT_MAP[outM.id];
    const inSv = SERVANT_MAP[inM.id];
    return `🔄 오더 체인지! [${outSv.nickname || outSv.name}] ⇄ [${inSv.nickname || inSv.name}] 교체 완료! (버프 보존 · 덱 유지)`;
  }

  // 원작 FGO 고증 커맨드 셔플: 현재 턴 스타 합계 유지하며 전열 5장 재분배
  function executeCommandShuffle(b) {
    const preservedStars = b.hand.reduce((sum, c) => sum + Math.round((c.critPct || 0) / 10), 0);
    b.stars = Math.min(99, b.stars + preservedStars);
    buildNewDeck();
    drawTurnHand();
    return `🃏 커맨드 셔플! 현재 턴의 커맨드 카드 5장을 새롭게 재분배했습니다!`;
  }

  // 스타 집중도 버프 사용 직후 현재 핸드에 즉시 반영
  function reallocateCurrentHandStars(b) {
    if (!b || !b.hand || !b.hand.length) return;
    const totalStars = b.hand.reduce((sum, c) => sum + Math.round((c.critPct || 0) / 10), 0);
    if (totalStars <= 0) return;
    const starAlloc = allocateStarsToHand(b, b.hand, totalStars);
    b.hand.forEach((c, i) => { c.critPct = starAlloc[i] * 10; });
  }

  function applyMasterSkill(b, idx, targetRIdx = null, ocFrontPos = null, ocSubIdx = null) {
    const sk = b.masterSkills[idx];
    if (!sk) return '마스터 스킬 오류';
    const lv = b.mysticCodeLv || 1;
    const eff = sk.effects || {};
    const alive = getActiveMembers(b);
    const mcName = (typeof MYSTIC_CODE_MAP !== 'undefined' && MYSTIC_CODE_MAP[b.mysticCodeId]?.name) || '마술예장';

    if (sk.target === 'order_change') {
      const msg = executeOrderChange(b, ocFrontPos, ocSubIdx);
      return msg || '교체할 수 있는 후열 서번트가 없습니다!';
    }
    if (sk.target === 'shuffle') {
      return executeCommandShuffle(b);
    }

    const targets = sk.target === 'all'
      ? alive
      : (sk.target === 'ally'
        ? [(targetRIdx !== null && targetRIdx !== undefined && b.roster[targetRIdx] && b.roster[targetRIdx].hp > 0) ? b.roster[targetRIdx] : alive[0]].filter(Boolean)
        : []);

    const val = (pair, step = 0) => Array.isArray(pair) ? interpMcVal(pair[0], pair[1], lv, step) : pair;
    const addNp = (m, amt) => { m.np = Math.min(getMaxNp(m.npLevel), m.np + amt); };
    const notes = [];
    let needReallocStars = false;

    targets.forEach(m => {
      ensureMemberBuffs(m);
      if (eff.heal) {
        const h = val(eff.heal, 100);
        m.hp = Math.min(m.maxHp, m.hp + h);
      }
      if (eff.maxHpUp) {
        const mh = val(eff.maxHpUp, 100);
        m.buffs.maxHpBonus += mh;
        m.maxHp += mh;
        m.hp += mh;
      }
      if (eff.atk) { m.buffs.atk += val(eff.atk); m.buffs.atkT = Math.max(m.buffs.atkT, 1); }
      if (eff.buster) { m.buffs.buster += val(eff.buster); m.buffs.cardT = Math.max(m.buffs.cardT, 1); }
      if (eff.arts) { m.buffs.arts += val(eff.arts); m.buffs.cardT = Math.max(m.buffs.cardT, 1); }
      if (eff.quick) { m.buffs.quick += val(eff.quick); m.buffs.cardT = Math.max(m.buffs.cardT, 1); }
      if (eff.npDmg) { m.buffs.npDmg += val(eff.npDmg); m.buffs.npDmgT = Math.max(m.buffs.npDmgT, 1); }
      if (eff.npGain) { m.buffs.npGain += val(eff.npGain); m.buffs.npGainT = Math.max(m.buffs.npGainT, 1); }
      if (eff.crit) { m.buffs.crit += val(eff.crit); m.buffs.critT = Math.max(m.buffs.critT, 1); }
      if (eff.np) addNp(m, val(eff.np, 1));
      if (eff.evade) m.buffs.evade = Math.max(m.buffs.evade, 1);
      if (eff.evadeHits) { m.buffs.evadeHits = Math.max(m.buffs.evadeHits, eff.evadeHits); m.buffs.evadeT = Math.max(m.buffs.evadeT, eff.evadeT || 3); }
      if (eff.invul) m.buffs.invul = Math.max(m.buffs.invul, 1);
      if (eff.invulHits) m.buffs.invulHits = Math.max(m.buffs.invulHits, eff.invulHits);
      if (eff.guts) { m.buffs.guts = Math.max(m.buffs.guts, val(eff.guts, 100)); m.buffs.gutsT = Math.max(m.buffs.gutsT, 1); }
      if (eff.sureHit) m.buffs.sureHit = 1;
      if (eff.invulPierce) m.buffs.invulPierce = 1;
      if (eff.extraUp) m.buffs.extraUp += val(eff.extraUp);
      if (eff.ocUp) m.buffs.ocUp += eff.ocUp;
      if (eff.starGen) m.buffs.starGen += val(eff.starGen);
      if (eff.starWeight) { m.buffs.starWeight += val(eff.starWeight, 50); needReallocStars = true; }
      if (eff.busterStarWeight) { m.buffs.busterStarWeight += val(eff.busterStarWeight, 500); needReallocStars = true; }
      if (eff.artsStarWeight) { m.buffs.artsStarWeight += val(eff.artsStarWeight, 500); needReallocStars = true; }
      if (eff.debuffImmune) m.buffs.debuffImmune = Math.max(m.buffs.debuffImmune, 1);
      if (eff.buffProtect) m.buffs.buffProtect = Math.max(m.buffs.buffProtect, val(eff.buffProtect));
      if (eff.regen) { m.buffs.regen = Math.max(m.buffs.regen, val(eff.regen, 100)); m.buffs.regenT = Math.max(m.buffs.regenT, eff.regenT || 3); }
      if (eff.cdReduce) {
        m.skills.forEach(s => { if (s.curCd > 0) s.curCd = Math.max(0, s.curCd - eff.cdReduce); });
      }
    });

    if (eff.stars) {
      const stGain = Math.round(val(eff.stars, 1));
      b.stars = Math.min(99, b.stars + stGain);
      notes.push(`★+${stGain}`);
    }

    if (sk.target === 'enemy') {
      const t = b.enemies[b.targetIdx] || pickAliveTarget();
      if (t && t.hp > 0) {
        if (eff.stun) { t.stunned = true; notes.push(`${t.name} 스턴(1T)`); }
        if (eff.buffBlock) { t.buffBlock = (t.buffBlock || 0) + 1; notes.push(`${t.name} 강화 무효(1회)`); }
        if (eff.drainCharge) { t.charge = Math.max(0, t.charge - 1); notes.push(`${t.name} 차지 -1`); }
        if (eff.deathResistDown) { t.deathResistDown = val(eff.deathResistDown); notes.push(`${t.name} 즉사내성 DOWN`); }
      }
    }

    if (needReallocStars) reallocateCurrentHandStars(b);

    const tgtLabel = sk.target === 'ally' && targets[0]
      ? ` → ${SERVANT_MAP[targets[0].id]?.nickname || SERVANT_MAP[targets[0].id]?.name}`
      : (sk.target === 'all' ? ' (아군 전체)' : '');
    return `[${mcName} Lv.${lv}] ${sk.icon} ${sk.name}${tgtLabel}! ${sk.desc}${notes.length ? ` (${notes.join(', ')})` : ''}`;
  }

  function getCePassive(ceId, mlb = false) {
    if (!ceId) return { startNp: 0, npDmg: 0, buster: 0, arts: 0, quick: 0, starsPerTurn: 0, npPerTurn: 0, crit: 0, npGain: 0, atkUp: 0, hpDrain: 0, label: '미장착' };
    const map = {
      ce_kscope: mlb ? { startNp: 100, label: '✛ 개시 NP +100%' } : { startNp: 80, label: '개시 NP +80%' },
      ce_black_grail: mlb ? { npDmg: 0.8, hpDrain: 500, label: '✛ 보구 위력 +80%' } : { npDmg: 0.6, hpDrain: 500, label: '보구 위력 +60%' },
      ce_2030: mlb ? { starsPerTurn: 10, label: '✛ 매 턴 스타 +10' } : { starsPerTurn: 8, label: '매 턴 스타 +8' },
      ce_prisma: mlb ? { npPerTurn: 10, label: '✛ 매 턴 NP +10%' } : { npPerTurn: 8, label: '매 턴 NP +8%' },
      ce_formalcraft: mlb ? { arts: 0.30, label: '✛ Arts +30%' } : { arts: 0.25, label: 'Arts +25%' },
      ce_limited_zero: mlb ? { buster: 0.30, label: '✛ Buster +30%' } : { buster: 0.25, label: 'Buster +25%' },
      ce_imaginary_around: mlb ? { quick: 0.30, label: '✛ Quick +30%' } : { quick: 0.25, label: 'Quick +25%' },
      ce_heavens_feel: mlb ? { npDmg: 0.5, label: '✛ 보구 위력 +50%' } : { npDmg: 0.4, label: '보구 위력 +40%' },
      ce_imaginary_element: mlb ? { startNp: 75, label: '✛ 개시 NP +75%' } : { startNp: 60, label: '개시 NP +60%' },
      ce_dragon_meridian: mlb ? { startNp: 50, label: '✛ 개시 NP +50%' } : { startNp: 30, label: '개시 NP +30%' },
      ce_ryuudou: mlb ? { startNp: 50, npDmg: 0.20, label: '✛ NP+50% · 보구+20%' } : { startNp: 30, npDmg: 0.15, label: 'NP+30% · 보구+15%' },
      ce_projection: mlb ? { arts: 0.20, label: '✛ Arts +20%' } : { arts: 0.15, label: 'Arts +15%' },
      ce_verdant: mlb ? { buster: 0.20, label: '✛ Buster +20%' } : { buster: 0.15, label: 'Buster +15%' },
      ce_gandr: mlb ? { quick: 0.20, label: '✛ Quick +20%' } : { quick: 0.15, label: 'Quick +15%' },
      ce_knights_dignity: mlb ? { crit: 0.5, label: '✛ 크리 위력 +50%' } : { crit: 0.4, label: '크리 위력 +40%' },
      ce_magical_sapphire: mlb ? { crit: 0.25, startNp: 30, label: '✛ NP+30% · 크리+25%' } : { crit: 0.2, startNp: 20, label: 'NP+20% · 크리+20%' },
      ce_npc_support: { startNp: 50, npGain: 0.5, label: 'NPC: 개시 NP+50% · NP획득+50%' },
      ce_fp1_tujaeng: mlb ? { atkUp: 0.04, label: '✛ 공격력 +4% (코스트1)' } : { atkUp: 0.02, label: '공격력 +2% (코스트1)' },
      ce_fp2_beonyeong: { label: mlb ? '✛ 매 턴 HP+50 (코스트3)' : '매 턴 HP+30 (코스트3)' }
    };
    const base = map[ceId] || (CE_MAP[ceId]?.rarity <= 2
      ? { label: `코스트 ${getCeCost(CE_MAP[ceId])} 저코스트 예장` }
      : { startNp: mlb ? 20 : 10, label: mlb ? '✛ 개시 NP +20%' : '개시 NP +10%' });
    return { startNp: 0, npDmg: 0, buster: 0, arts: 0, quick: 0, starsPerTurn: 0, npPerTurn: 0, crit: 0, npGain: 0, atkUp: 0, hpDrain: 0, ...base };
  }

  function calcPartyCost(st) {
    let total = 0;
    partySlots.forEach((slot, idx) => {
      if (!slot || idx === 5 || slot.isSupport) return; // 프렌드 슬롯 코스트 0!
      const sv = SERVANT_MAP[slot.id];
      const own = slot.isRental ? null : st.servants[slot.id];
      total += getServantCost(sv, own);
      if (slot.ceId && CE_MAP[slot.ceId]) total += getCeCost(CE_MAP[slot.ceId]);
    });
    return total;
  }

  function optimizePartyCost() {
    const st = getBridge()?.getState();
    if (!st) return;
    // 코스트 초과 시 후열 예장 해제 → 마슈(코스트 0) 활용 안내
    for (let i = 4; i >= 0; i--) {
      if (calcPartyCost(st) <= MASTER_MAX_COST) break;
      if (partySlots[i] && partySlots[i].ceId && !CE_MAP[partySlots[i].ceId]?.npcOnly) {
        partySlots[i].ceId = null;
      }
    }
    if (calcPartyCost(st) > MASTER_MAX_COST && st.servants.sv_no_001 && !partySlots.some((p, i) => i < 5 && p?.id === 'sv_no_001')) {
      partySlots[4] = { id: 'sv_no_001', ceId: null, isSupport: false, isRental: false };
    }
    renderLobby();
    getBridge().toast(`⚖️ 파티 코스트 자동 최적화 완료! (${calcPartyCost(st)} / ${MASTER_MAX_COST})`);
  }

  // ================= 퀘스트 7종 (종화·QP·특이점·바빌로니아·비스트Ⅰ·비스트Ⅲ/R·EX 챌린지) =================
  const QUESTS = [
    {
      id: 'q_embers',
      name: '🔥 칼데아 게이트 — 종화 수집 (초급)',
      desc: '3웨이브 주회 던전! 경험치 손은 모두 [하늘(天)] 속성 → 인간(人) 속성 서번트가 1.1배 유리!',
      difficulty: '초급 · 추천 Lv.30',
      rewardText: '💎 성정석 +3 · 🔥 종화 +15 · 🪙 QP +500,000',
      rewards: { sq: 3, embers: 15, qp: 500000, mcExp: 180000 },
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
      rewards: { sq: 5, qp: 2000000, mp: 20, mcExp: 320000 },
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
      rewards: { sq: 10, embers: 25, mp: 35, mcExp: 550000 },
      waves: [
        [
          { name: '스켈레톤 검사', cls: 'Saber', attr: '지(地)', gender: '없음', align: '-/-', traits: ['마성'], hp: 38000, atk: 1900, maxCharge: 4, emoji: '☠️' },
          { name: '섀도우 랜서', cls: 'Lancer', attr: '지(地)', gender: '남성', align: '질서/중용', traits: ['서번트', '신성'], hp: 46000, atk: 2100, maxCharge: 4, emoji: '👤' },
          { name: '스켈레톤 검사', cls: 'Saber', attr: '지(地)', gender: '없음', align: '-/-', traits: ['마성'], hp: 38000, atk: 1900, maxCharge: 4, emoji: '☠️' }
        ],
        [
          { name: '흑화 기사왕 [얼터]', cls: 'Saber', attr: '인(人)', gender: '여성', align: '질서/악', traits: ['서번트', '용', '알트리아 얼굴', '아서', '왕'], hp: 145000, breakBars: [175000], atk: 3200, maxCharge: 4, emoji: '🖤', isBoss: true, npName: '엑스칼리버 모르간' }
        ]
      ]
    },
    {
      id: 'q_babylonia',
      name: '🐉 바빌로니아 — 티아마트 유체 격퇴전 (고난이도)',
      desc: '비스트Ⅱ [짐승(獸)] 완전 무상성 보스! 별(星) 속성·신성/인류의 위협/초거대 특공이 유리합니다.',
      difficulty: '고난이도 · 추천 Lv.85',
      rewardText: '💎 성정석 +20 · 🟡 레프 +1 · 🔥 종화 +35',
      rewards: { sq: 20, rp: 1, embers: 35, mcExp: 950000 },
      waves: [
        [
          { name: '라흐무', cls: 'Lancer', attr: '지(地)', gender: '없음', align: '혼돈/악', traits: ['마성', '신성'], hp: 62000, atk: 2400, maxCharge: 4, emoji: '👾' },
          { name: '라흐무', cls: 'Archer', attr: '지(地)', gender: '없음', align: '혼돈/악', traits: ['마성', '신성'], hp: 62000, atk: 2400, maxCharge: 3, emoji: '👾' },
          { name: '라흐무', cls: 'Assassin', attr: '지(地)', gender: '없음', align: '혼돈/악', traits: ['마성', '신성'], hp: 58000, atk: 2400, maxCharge: 3, emoji: '👾' }
        ],
        [
          { name: '벨 라흐무', cls: 'Berserker', attr: '지(地)', gender: '없음', align: '혼돈/악', traits: ['마성', '신성', '초거대'], hp: 105000, atk: 2800, maxCharge: 4, emoji: '😈' },
          { name: '비스트Ⅱ 티아마트', cls: 'BeastII', attr: '수(獸)', gender: '여성', align: '혼돈/악', traits: ['신성', '신령', '초거대', '인류의 위협', '비스트', '인간형 없음'], hp: 170000, breakBars: [200000], atk: 3400, maxCharge: 4, emoji: '🐉', isBoss: true, npName: '네가 제네시스' }
        ]
      ]
    },
    {
      id: 'q_goetia',
      name: '🔥 관위시간신전 — 마신왕 게티아 (비스트Ⅰ)',
      desc: '3술사(라·캐·어)에게 2.0x 약점, 3기사에게 2.0x 반격, 어벤저에게 0.5x 반감! 별(星) 속성·왕/비스트 특공!',
      difficulty: '비스트Ⅰ · 추천 Lv.90',
      rewardText: '💎 성정석 +25 · 🟡 레프 +2 · 🔥 종화 +40',
      rewards: { sq: 25, rp: 2, embers: 40, mcExp: 1400000 },
      waves: [
        [
          { name: '마신주 플라우로스', cls: 'Caster', attr: '천(天)', gender: '무성', align: '-/-', traits: ['마성', '초거대', '인류의 위협', '인간형 없음'], hp: 85000, atk: 2600, maxCharge: 4, emoji: '👁️' },
          { name: '마신왕 게티아', cls: 'BeastI', attr: '수(獸)', gender: '무성', align: '-/-', traits: ['왕', '인류의 위협', '비스트', '인간형 없음'], hp: 200000, breakBars: [240000], atk: 3600, maxCharge: 4, emoji: '🔥', isBoss: true, npName: '아르스 알마델 살로모니스' }
        ]
      ]
    },
    {
      id: 'q_kiara',
      name: '🌸 SE.RA.PH — 마성보살 키아라 (비스트Ⅲ/R)',
      desc: '얼터에고·문캔서에게 1.2x 약점! 여성·마성·초거대·비스트 특공 및 별(星) 속성이 빛납니다.',
      difficulty: '비스트Ⅲ/R · 추천 Lv.90',
      rewardText: '💎 성정석 +25 · 🎫 호부 +1 · 🟡 레프 +1',
      rewards: { sq: 25, tickets: 1, rp: 1, mcExp: 1600000 },
      waves: [
        [
          { name: '마성보살 셋쇼인 키아라', cls: 'BeastIIIR', attr: '수(獸)', gender: '여성', align: '혼돈/악', traits: ['마성', '초거대', '인류의 위협', '비스트'], hp: 215000, breakBars: [255000], atk: 3500, maxCharge: 4, emoji: '🌸', isBoss: true, npName: '아미타 아미달라 · 헤븐즈 홀' }
        ]
      ]
    },
    {
      id: 'q_challenge',
      name: '👑 이문대 챌린지 — 거신 케르눈노스 (EX)',
      desc: '6인 총력전! 버서커 [땅(地)] 신성·초거대·요정·인류의 위협 최종 보스. 특공 딜러와 영주를 총동원하세요!',
      difficulty: 'EX 챌린지 · 추천 Lv.90+',
      rewardText: '💎 성정석 +30 · 🎫 호부 +1 · 🟡 레프 +2',
      rewards: { sq: 30, tickets: 1, rp: 2, mcExp: 2200000 },
      waves: [
        [
          { name: '재액의 거신 케르눈노스', cls: 'Berserker', attr: '지(地)', gender: '무성', align: '혼돈/악', traits: ['신성', '초거대', '거인', '요정', '인류의 위협'], hp: 220000, breakBars: [260000, 310000], atk: 3900, maxCharge: 4, emoji: '👁️', isBoss: true, npName: '칼라미티 커스' }
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
  let openPopup = null; // 'master' | 'spells' | 'menu' | 'sv_target' | null
  let pendingMasterSkillIdx = null; // 마스터 단일 아군 타겟 또는 오더 체인지 선택 대기
  let pendingServantSkill = null;   // { casterRIdx, skillIdx } — 서번트 개인 지정(ally) 스킬 타겟 선택 대기!
  let ocSelectedFront = null;
  let ocSelectedSub = null;
  let mcModalFilter = 'all';
  let mcModalQuery = '';

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
    } catch (_) { }
  }

  function clearSavedBattle() {
    try { localStorage.removeItem(ACTIVE_BATTLE_KEY); } catch (_) { }
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
        partySlots[i] = { id: fid, ceId: 'ce_npc_support', isSupport: false, isRental: true };
      }
    }
  }

  // ================= 로비 마술예장 바 & 28종 선택·육성 모달 =================
  function renderLobbyMysticCodeBar() {
    const bar = document.getElementById('battle-mc-bar');
    if (!bar || typeof MYSTIC_CODE_MAP === 'undefined') return;
    const bridge = getBridge();
    const mcId = bridge.getActiveMysticCodeId();
    const mc = MYSTIC_CODE_MAP[mcId] || MYSTIC_CODES[0];
    const mcState = bridge.getMysticCodeState(mc.id) || { exp: 0, level: 1 };
    const curve = MYSTIC_CODE_EXP_CURVES[mc.expCurve] || MYSTIC_CODE_EXP_CURVES.event;
    const lv = getMcLevelFromExp(mc.expCurve, mcState.exp || 0);
    const maxExp = curve[curve.length - 1];
    const pct = lv >= 10 ? 100 : Math.min(100, Math.round(((mcState.exp - curve[lv - 1]) / Math.max(1, curve[lv] - curve[lv - 1])) * 100));
    const unlockedCount = MYSTIC_CODES.filter(x => bridge.getMysticCodeState(x.id)).length;

    bar.innerHTML = `
      <div class="mc-bar-left">
        <img src="${mc.icon}" class="mc-bar-icon" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">
        <div class="mc-bar-info">
          <div class="mc-bar-head">
            <span class="mc-bar-badge">🧤 장착 마술예장</span>
            <strong>${mc.name}</strong>
            <span class="mc-lv-pill">Lv.${lv} / 10</span>
            <span class="mc-cat-pill">${mc.category}</span>
          </div>
          <div class="mc-bar-exp-row">
            <div class="mc-exp-track"><div class="mc-exp-fill" style="width:${pct}%"></div></div>
            <span class="mc-exp-text">${lv >= 10 ? `MAX (${maxExp.toLocaleString()})` : `${(mcState.exp || 0).toLocaleString()} / ${curve[lv].toLocaleString()} (만렙 ${maxExp.toLocaleString()})`}</span>
          </div>
        </div>
      </div>
      <div class="mc-bar-skills">
        ${mc.skills.map(sk => `
          <div class="mc-skill-chip" title="${sk.descFn(lv)}">
            <span>${sk.icon} <strong>${sk.name}</strong> <small>(CD ${getMcSkillCd(sk.cdBase, lv)})</small></span>
            <div class="mc-skill-chip-desc">${sk.descFn(lv)}</div>
          </div>
        `).join('')}
      </div>
      <button class="small-outline-btn" id="btn-change-mc-inline">🧤 변경 (${unlockedCount}/28)</button>
    `;
    document.getElementById('btn-change-mc-inline')?.addEventListener('click', openMysticCodeModal);
  }

  function openMysticCodeModal() {
    SoundEngine.click();
    renderMysticCodeModal();
    document.getElementById('mystic-code-modal')?.classList.remove('hidden');
  }

  function renderMysticCodeModal() {
    const grid = document.getElementById('mc-modal-grid');
    if (!grid || typeof MYSTIC_CODES === 'undefined') return;
    const bridge = getBridge();
    const activeId = bridge.getActiveMysticCodeId();
    const q = mcModalQuery.trim().toLowerCase();

    const list = MYSTIC_CODES.filter(mc => {
      if (mcModalFilter === 'core' && !DEFAULT_UNLOCKED_MYSTIC_CODES.includes(mc.id)) return false;
      if (mcModalFilter === 'event' && DEFAULT_UNLOCKED_MYSTIC_CODES.includes(mc.id)) return false;
      if (mcModalFilter === 'oc' && !mc.skills.some(s => s.target === 'order_change')) return false;
      if (q) {
        const hay = `${mc.name} ${mc.desc} ${mc.obtain} ${mc.skills.map(s => s.name + ' ' + s.descFn(10)).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    grid.innerHTML = list.map(mc => {
      const st = bridge.getMysticCodeState(mc.id);
      const unlocked = !!st;
      const isEquipped = activeId === mc.id;
      const curve = MYSTIC_CODE_EXP_CURVES[mc.expCurve] || MYSTIC_CODE_EXP_CURVES.event;
      const maxExp = curve[curve.length - 1];
      const lv = unlocked ? getMcLevelFromExp(mc.expCurve, st.exp || 0) : 1;
      const pct = unlocked ? (lv >= 10 ? 100 : Math.min(100, Math.round(((st.exp - curve[lv - 1]) / Math.max(1, curve[lv] - curve[lv - 1])) * 100))) : 0;

      return `
        <div class="mc-card ${isEquipped ? 'equipped' : ''} ${!unlocked ? 'locked' : ''}">
          <div class="mc-card-top">
            <img src="${mc.icon}" class="mc-card-icon" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">
            <div style="flex:1;min-width:0">
              <div class="mc-card-meta">No.${String(mc.no).padStart(2, '0')} · ${mc.category} · 총 EXP ${maxExp.toLocaleString()}</div>
              <div class="mc-card-name">${mc.name} ${isEquipped ? '<span class="mc-eq-tag">장착 중</span>' : ''}</div>
              <div class="mc-card-obtain">${mc.obtain}</div>
            </div>
          </div>
          ${unlocked ? `
            <div class="mc-bar-exp-row" style="margin:4px 0 6px">
              <span class="mc-lv-pill">Lv.${lv}/10</span>
              <div class="mc-exp-track"><div class="mc-exp-fill" style="width:${pct}%"></div></div>
            </div>
          ` : ''}
          <div class="mc-card-skills">
            ${mc.skills.map(sk => `
              <div class="mc-card-sk-row">
                <span class="mc-sk-head">${sk.icon} <strong>${sk.name}</strong> <small>CD ${getMcSkillCd(sk.cdBase, lv)}</small></span>
                <span class="mc-sk-desc">${sk.descFn(lv)}</span>
              </div>
            `).join('')}
          </div>
          <div class="mc-card-actions">
            ${unlocked
              ? `<button class="${isEquipped ? 'small-outline-btn' : 'small-gold-btn'}" data-mc-equip="${mc.id}" ${isEquipped ? 'disabled' : ''}>${isEquipped ? '✅ 장착 중' : '🧤 장착하기'}</button>
                 ${lv < 10 ? `<button class="small-outline-btn" data-mc-train="${mc.id}" title="500,000 QP로 1레벨 훈련">⚡ +1Lv (50만 QP)</button>
                              <button class="small-outline-btn" data-mc-max="${mc.id}" title="남은 레벨 일괄 훈련">MAX</button>` : '<span class="mc-max-badge">🏆 Lv.10 MAX</span>'}`
              : `<button class="small-gold-btn" data-mc-unlock="${mc.id}">🔓 해금 (🟢 마프 20)</button>`}
          </div>
        </div>
      `;
    }).join('') || '<div class="empty-hint">검색 조건에 맞는 마술예장이 없습니다.</div>';

    grid.querySelectorAll('[data-mc-equip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.mcEquip;
        if (bridge.setActiveMysticCode(id)) {
          SoundEngine.levelUp();
          bridge.toast(`🧤 마술예장 [${MYSTIC_CODE_MAP[id].name}] 장착 완료!`);
          renderLobbyMysticCodeBar();
          renderMysticCodeModal();
        }
      });
    });
    grid.querySelectorAll('[data-mc-unlock]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.mcUnlock;
        const res = bridge.unlockMysticCode(id, false);
        if (!res.ok) {
          SoundEngine.error();
          bridge.toast('🟢 마나프리즘이 부족합니다! (필요: 20 · 상단 "28종 전체 무료 해금"도 사용 가능)');
          return;
        }
        bridge.setActiveMysticCode(id);
        SoundEngine.reveal(4, true);
        bridge.toast(`🔓 마술예장 [${MYSTIC_CODE_MAP[id].name}] 해금 및 장착 완료!`);
        renderLobbyMysticCodeBar();
        renderMysticCodeModal();
      });
    });
    grid.querySelectorAll('[data-mc-train]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.mcTrain;
        const res = bridge.trainMysticCodeLevel(id, false);
        if (!res.ok) {
          SoundEngine.error();
          bridge.toast(res.reason === 'qp' ? `🪙 QP가 부족합니다! (필요: ${res.need.toLocaleString()} QP)` : '이미 최고 레벨입니다!');
          return;
        }
        SoundEngine.levelUp();
        bridge.toast(`⚡ [${MYSTIC_CODE_MAP[id].name}] Lv.${res.level} 훈련 완료!`);
        renderLobbyMysticCodeBar();
        renderMysticCodeModal();
      });
    });
    grid.querySelectorAll('[data-mc-max]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.mcMax;
        const res = bridge.trainMysticCodeLevel(id, true);
        if (!res.ok) {
          SoundEngine.error();
          bridge.toast(res.reason === 'qp' ? `🪙 QP가 부족합니다! (필요: ${res.need.toLocaleString()} QP)` : '이미 최고 레벨입니다!');
          return;
        }
        SoundEngine.reveal(5, true);
        bridge.toast(`🏆 [${MYSTIC_CODE_MAP[id].name}] Lv.10 MAX 달성!!`);
        renderLobbyMysticCodeBar();
        renderMysticCodeModal();
      });
    });
  }

  // ================= 로비 렌더링 (퀘스트 + 6인 파티 편성) =================
  function renderLobby() {
    ensureDefaultParty();
    document.getElementById('battle-lobby').classList.remove('hidden');
    document.getElementById('battle-arena').classList.add('hidden');
    renderLobbyMysticCodeBar();

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

    // 파티 코스트 실시간 표시 (최대 115 · 마슈=0 · 프렌드=0)
    const totalCost = calcPartyCost(st);
    const overCost = totalCost > MASTER_MAX_COST;
    const costBar = document.getElementById('battle-cost-bar');
    if (costBar) {
      costBar.className = 'party-cost-bar' + (overCost ? ' over-cost' : '');
      costBar.innerHTML = `
        <span>⚖️ <strong>PARTY COST: ${totalCost} / ${MASTER_MAX_COST}</strong> ${overCost ? '⚠️ 코스트 초과! (저성 예장·마슈 코스트0 활용)' : '✅ 편성 가능 (마슈·프렌드 코스트 0)'}</span>
        ${overCost ? '<button class="small-outline-btn" id="btn-opt-cost" style="padding:4px 10px;font-size:11.5px">⚖️ 코스트 자동 조정</button>' : ''}
      `;
      document.getElementById('btn-opt-cost')?.addEventListener('click', optimizePartyCost);
    }

    const slotsEl = document.getElementById('battle-party-slots');
    slotsEl.innerHTML = '';
    partySlots.forEach((slot, idx) => {
      const sv = SERVANT_MAP[slot.id];
      const isFriendSlot = idx === 5;
      const own = (slot.isSupport || slot.isRental)
        ? { level: slot.isSupport ? 90 : 50, npLevel: slot.isSupport ? 2 : 1, viewAsc: slot.isSupport ? 4 : 1, ascension: slot.isSupport ? 4 : 1 }
        : st.servants[slot.id];
      const effR = getEffectiveRarity(sv, own);
      const faceUrl = ArtRenderer.getFaceUrl(slot.id);
      const ceOwn = slot.isSupport ? { copies: 5, level: 100 } : (slot.ceId ? st.ces[slot.ceId] : null);
      const ceMlb = slot.isSupport || isCeMlb(ceOwn);
      const ceObj = slot.ceId ? CE_MAP[slot.ceId] : null;
      const ceStats = getCeCurrentStats(ceObj, ceOwn);
      const slotCost = isFriendSlot ? 0 : (getServantCost(sv, own) + getCeCost(ceObj));
      const deckTypes = getServantDeckTypes(sv);
      const lineTag = idx < 3 ? `전열 ${idx + 1}` : (isFriendSlot ? '프렌드 (코스트 0)' : `후열 ${idx - 2}`);

      let svOptions = '';
      if (isFriendSlot) {
        svOptions = SUPPORT_FRIENDS.map(sf =>
          `<option value="sup:${sf.id}" ${slot.id === sf.id ? 'selected' : ''}>🤝 ★5 ${SERVANT_MAP[sf.id].name} (Lv.90 · 보${sf.npLevel})</option>`
        ).join('');
      } else {
        svOptions = [
          ...ownedSvIds.map(id => {
            const s = SERVANT_MAP[id];
            const o = st.servants[id];
            const er = getEffectiveRarity(s, o);
            const c = getServantCost(s, o);
            return `<option value="own:${id}" ${!slot.isRental && slot.id === id ? 'selected' : ''}>★${er} ${s.name} (Lv.${o.level} · 코스트${c})</option>`;
          }),
          ...(slot.isRental ? [`<option value="rent:${slot.id}" selected>[칼데아 대여] ★${sv.rarity} ${sv.name} (Lv.50)</option>`] : [])
        ].join('');
      }

      const ceOptions = [
        `<option value="">(개념예장 미장착 · 코스트 0)</option>`,
        ...ownedCeIds.map(id => {
          const c = CE_MAP[id];
          const co = st.ces[id];
          const m = isCeMlb(co);
          const cs = getCeCurrentStats(c, co);
          return `<option value="${id}" ${slot.ceId === id ? 'selected' : ''}>${m ? '✛' : ''}★${c.rarity} ${c.name} (코스트${getCeCost(c)} · Lv.${cs.level} · ${getCePassive(id, m).label})</option>`;
        }),
        ...((isFriendSlot || slot.isRental) && slot.ceId && !ownedCeIds.includes(slot.ceId)
          ? [`<option value="${slot.ceId}" selected>[${isFriendSlot ? '프렌드 풀돌' : 'NPC'}] ${CE_MAP[slot.ceId]?.name} (${getCePassive(slot.ceId, true).label})</option>`]
          : [])
      ].join('');

      const div = document.createElement('div');
      div.className = `party-slot-card ${idx < 3 ? 'frontline-slot' : 'backline-slot'} ${isFriendSlot ? 'friend-slot' : ''}`;
      div.innerHTML = `
        <div class="party-slot-top">
          ${faceUrl ? `<img src="${faceUrl}" class="party-slot-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div style="flex:1;min-width:0">
            <div class="party-slot-badge">${lineTag} · ${CLASS_INFO[sv.cls]?.name} · 코스트 ${slotCost}</div>
            <div class="party-slot-name">${effR === 0 ? '☆0' : '★'.repeat(effR)} ${sv.name}</div>
            <div class="party-slot-meta">Lv.${own.level} · 보${own.npLevel}${ceObj ? ` · 예장${ceMlb ? '✛' : ''} ATK+${ceStats.atk}/HP+${ceStats.hp}` : ''}</div>
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
      const effR = getEffectiveRarity(sv, own);
      const baseMaxLv = effR === 5 ? 90 : (effR === 4 ? 80 : (effR === 3 ? 70 : (effR === 1 ? 60 : 65)));
      const scale = 0.65 + (own.level / baseMaxLv) * 0.45;
      const ceOwn = slot.isSupport ? { copies: 5, level: 100 } : (slot.ceId ? st.ces[slot.ceId] : null);
      const ceMlb = slot.isSupport || isCeMlb(ceOwn);
      const ceStats = getCeCurrentStats(slot.ceId ? CE_MAP[slot.ceId] : null, ceOwn);
      const maxHp = Math.round(sv.hp * scale) + ceStats.hp;
      const atk = Math.round(sv.atk * scale) + ceStats.atk;
      const ce = getCePassive(slot.ceId, ceMlb);
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
        ceMlb,
        maxHp,
        hp: maxHp,
        atk,
        np: Math.min(maxNp, ce.startNp),
        skills: getSkillDefs(sv).map((s, si) => {
          const slv = skLevels[si] || 1;
          const cdReduce = slv >= 10 ? 2 : (slv >= 6 ? 1 : 0);
          return { ...s, level: slv, cd: Math.max(3, s.cd - cdReduce), curCd: 0 };
        }),
        buffs: ensureMemberBuffs({ buffs: {} })
      };
    });

    const activeMcId = getBridge().getActiveMysticCodeId();
    const mcObj = (typeof MYSTIC_CODE_MAP !== 'undefined' && MYSTIC_CODE_MAP[activeMcId]) || (typeof MYSTIC_CODES !== 'undefined' && MYSTIC_CODES[0]);
    const mcSt = getBridge().getMysticCodeState(activeMcId) || { exp: 0, level: 1 };
    const activeMcLv = mcObj ? getMcLevelFromExp(mcObj.expCurve, mcSt.exp || 0) : 1;

    battle = {
      questId: quest.id,
      mysticCodeId: mcObj ? mcObj.id : 'mc_chaldea',
      mysticCodeLv: activeMcLv,
      waveIdx: 0,
      turn: 1,
      stars: 0,
      roster,
      activeSlots: [0, 1, 2],   // 현재 전열 3칸 (rosterIdx)
      subQueue: [3, 4, 5],      // 후열 대기 3명 (전열 사망 시 순서대로 증원!)
      masterSkills: buildBattleMasterSkills(mcObj ? mcObj.id : 'mc_chaldea', activeMcLv),
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
    pendingMasterSkillIdx = null;
    pendingServantSkill = null;
    ocSelectedFront = null;
    ocSelectedSub = null;

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
      gender: e.gender || '없음',
      align: e.align || '-/-',
      traits: Array.isArray(e.traits) ? [...e.traits] : [],
      maxHp: e.hp,
      hp: e.hp,
      breakBars: [...(e.breakBars || [])],
      atk: e.atk,
      charge: 0,
      maxCharge: e.maxCharge || 4,
      emoji: e.emoji || '👾',
      isBoss: !!e.isBoss,
      npName: e.npName || '강력한 일격',
      stunned: false,
      buffBlock: 0,
      deathResistDown: 0
    }));
    battle.targetIdx = 0;
  }

  // 전열 3명의 15장 덱 생성 & 셔플 (cardSlot 0..4 보존 → 오더 체인지 1:1 매핑 고증!)
  function buildNewDeck() {
    const cards = [];
    battle.activeSlots.forEach(rIdx => {
      if (rIdx === null) return;
      const m = battle.roster[rIdx];
      if (!m || m.hp <= 0) return;
      const sv = SERVANT_MAP[m.id];
      getServantDeckTypes(sv).forEach((type, cardSlot) => {
        cards.push({ rosterIdx: rIdx, svId: m.id, type, cardSlot });
      });
    });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    battle.deck = cards;
  }

  function allocateStarsToHand(b, hand, totalStars) {
    const starAlloc = Array(hand.length).fill(0);
    let pool = Math.floor(totalStars);
    if (pool >= 50) {
      for (let i = 0; i < hand.length; i++) starAlloc[i] = 10;
      return starAlloc;
    }
    const weights = hand.map(c => {
      const sv = SERVANT_MAP[c.svId];
      const m = b.roster[c.rosterIdx];
      const bf = m ? ensureMemberBuffs(m) : {};
      let swPct = 100 + (bf.starWeight || 0);
      if (c.type === 'Buster' && bf.busterStarWeight) swPct += bf.busterStarWeight;
      if (c.type === 'Arts' && bf.artsStarWeight) swPct += bf.artsStarWeight;
      return Math.max(1, ((STAR_WEIGHT[sv.cls] || 100) * (swPct / 100)) + Math.floor(Math.random() * 50));
    });
    while (pool > 0) {
      const avail = weights.map((w, i) => (starAlloc[i] < 10 ? w : 0));
      const sum = avail.reduce((a, x) => a + x, 0);
      if (sum <= 0) break;
      let r = Math.random() * sum;
      for (let i = 0; i < hand.length; i++) {
        r -= avail[i];
        if (r <= 0) { starAlloc[i]++; break; }
      }
      pool--;
    }
    return starAlloc;
  }

  // 매 턴 5장 드로우 + 원작 FGO 클래스별 스타 집중도 분배 (라200>아150>세어룰실100>랜90>캐50>버10 + 마술예장 스타 집중 버프 반영!)
  function drawTurnHand() {
    if (battle.deck.length < 5) buildNewDeck();
    const drawCount = Math.min(5, battle.deck.length);
    const hand = battle.deck.splice(0, drawCount);
    const starAlloc = allocateStarsToHand(battle, hand, battle.stars);
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
        ${en.traits && en.traits.length ? `<div class="enemy-trait-line">${en.gender !== '없음' ? en.gender + ' · ' : ''}${en.align !== '-/-' ? en.align + ' · ' : ''}${en.traits.slice(0, 3).join(' · ')}</div>` : ''}
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

    // 아군 개인 지정 스킬(서번트 스킬 또는 마스터 스킬) 대상 선택 대기 중인지 확인
    const selectingAllyTarget =
      (pendingServantSkill !== null) ||
      (openPopup === 'master' && pendingMasterSkillIdx !== null && battle.masterSkills[pendingMasterSkillIdx]?.target === 'ally');

    const commitPendingAllyTarget = (targetRIdx) => {
      if (pendingServantSkill) {
        const caster = battle.roster[pendingServantSkill.casterRIdx];
        const sk = caster?.skills[pendingServantSkill.skillIdx];
        if (!caster || !sk || sk.curCd > 0) { pendingServantSkill = null; openPopup = null; renderArena(); return; }
        sk.curCd = sk.cd;
        const msg = applyServantSkill(battle, caster, sk.key, sk.name, targetRIdx);
        pendingServantSkill = null;
        openPopup = null;
        SoundEngine.levelUp();
        addLog(`✨ ${msg}`);
        getBridge().toast(msg);
        showFloatDmg(`ally-dmg-${targetRIdx}`, `✨ ${sk.name}!`, 'dmg-break');
        saveActiveBattle();
        renderArena();
        return;
      }
      if (openPopup === 'master' && pendingMasterSkillIdx !== null) {
        const i = pendingMasterSkillIdx;
        const sk = battle.masterSkills[i];
        if (!sk || sk.curCd > 0) { pendingMasterSkillIdx = null; openPopup = null; renderArena(); return; }
        sk.curCd = sk.cd;
        const msg = applyMasterSkill(battle, i, targetRIdx, null, null);
        pendingMasterSkillIdx = null;
        openPopup = null;
        SoundEngine.levelUp();
        addLog(`🧤 ${msg}`);
        getBridge().toast(msg);
        showFloatDmg(`ally-dmg-${targetRIdx}`, `🧤 ${sk.name}!`, 'dmg-break');
        saveActiveBattle();
        renderArena();
      }
    };

    const targetBadgeMap = { ally: '👤개인', all: '👥단체', self: '🙋본인', enemy: '🎯적' };

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

      ensureMemberBuffs(m);
      const activeBuffs = [];
      if (m.buffs.atk > 0) activeBuffs.push(`⚔️공+${Math.round(m.buffs.atk * 100)}%`);
      if (m.buffs.buster > 0) activeBuffs.push(`🔴B+${Math.round(m.buffs.buster * 100)}%`);
      if (m.buffs.arts > 0) activeBuffs.push(`🔵A+${Math.round(m.buffs.arts * 100)}%`);
      if (m.buffs.quick > 0) activeBuffs.push(`🟢Q+${Math.round(m.buffs.quick * 100)}%`);
      if (m.buffs.npDmg > 0) activeBuffs.push(`✨보구+${Math.round(m.buffs.npDmg * 100)}%`);
      if (m.buffs.crit > 0) activeBuffs.push(`★크리+${Math.round(m.buffs.crit * 100)}%`);
      if (m.buffs.npBoost > 1) activeBuffs.push(`🔥보구×2`);
      if (m.buffs.ocUp > 0) activeBuffs.push(`🌟OC+${m.buffs.ocUp}`);
      if (m.buffs.extraUp > 0) activeBuffs.push(`⚡EX+${Math.round(m.buffs.extraUp * 100)}%`);
      if (m.buffs.invul > 0 || m.buffs.invulHits > 0) activeBuffs.push(`🛡️무적${m.buffs.invulHits > 0 ? `(${m.buffs.invulHits}회)` : ''}`);
      if (m.buffs.evade > 0 || m.buffs.evadeHits > 0) activeBuffs.push(`💨회피${m.buffs.evadeHits > 0 ? `(${m.buffs.evadeHits}회)` : ''}`);
      if (m.buffs.guts > 0) activeBuffs.push(`❤️‍🔥근성(${m.buffs.guts.toLocaleString()})`);
      if (m.buffs.regen > 0 && m.buffs.regenT > 0) activeBuffs.push(`💚도트힐(${m.buffs.regenT}T)`);
      if (m.buffs.invulPierce > 0) activeBuffs.push(`🔱무적관통`);
      if (m.buffs.sureHit > 0) activeBuffs.push(`👁️필중`);
      if (m.buffs.debuffImmune > 0) activeBuffs.push(`🔰약화무효`);
      if (m.buffs.starWeight > 0 || m.buffs.busterStarWeight > 0 || m.buffs.artsStarWeight > 0) activeBuffs.push(`🎯스타집중`);

      const unit = document.createElement('div');
      unit.className = `ally-unit ${dead ? 'dead' : ''} ${m.np >= 100 ? 'np-ready' : ''} ${selectingAllyTarget && !dead ? 'target-selectable' : ''}`;
      unit.id = `ally-unit-${rIdx}`;
      unit.innerHTML = `
        ${selectingAllyTarget && !dead ? '<div class="ally-select-banner">🎯 클릭하여 적용!</div>' : ''}
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
          ${m.skills.map((sk, sIdx) => {
            const tTag = targetBadgeMap[sk.target || 'self'] || '';
            const isPend = pendingServantSkill && pendingServantSkill.casterRIdx === rIdx && pendingServantSkill.skillIdx === sIdx;
            return `
            <button class="skill-btn ${sk.curCd > 0 ? 'cooldown' : ''} ${isPend ? 'pending-target' : ''}" data-ridx="${rIdx}" data-sidx="${sIdx}" ${dead || sk.curCd > 0 || battle.phase !== 'command' || busy ? 'disabled' : ''} title="${sk.name}: ${sk.desc}">
              <span class="sk-ico">${sk.icon}</span>
              <span class="sk-nm">${sk.curCd > 0 ? `${sk.curCd}T` : sk.name.slice(0, 6)}</span>
              ${sk.curCd === 0 && tTag ? `<span class="sk-tgt-tag tgt-${sk.target || 'self'}">${tTag}</span>` : ''}
            </button>
          `;
          }).join('')}
        </div>
        <div class="dmg-float-layer" id="ally-dmg-${rIdx}"></div>
      `;
      if (selectingAllyTarget && !dead) {
        unit.addEventListener('click', (e) => {
          if (e.target.closest('.skill-btn')) return;
          commitPendingAllyTarget(rIdx);
        });
      }
      partyEl.appendChild(unit);
    });

    partyEl.querySelectorAll('.skill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (busy || battle.phase !== 'command') return;
        const rIdx = Number(btn.dataset.ridx);
        const sIdx = Number(btn.dataset.sidx);
        const m = battle.roster[rIdx];
        const sk = m.skills[sIdx];
        if (!m || !sk || sk.curCd > 0 || m.hp <= 0) return;

        // 원작 FGO 고증: 개인 지정('ally') 스킬은 대상 아군 1명 선택 모드로 진입!
        if (sk.target === 'ally') {
          SoundEngine.click();
          pendingMasterSkillIdx = null;
          if (pendingServantSkill && pendingServantSkill.casterRIdx === rIdx && pendingServantSkill.skillIdx === sIdx) {
            pendingServantSkill = null;
            openPopup = null;
          } else {
            pendingServantSkill = { casterRIdx: rIdx, skillIdx: sIdx };
            openPopup = 'sv_target';
          }
          renderArena();
          return;
        }

        // 단체('all') · 본인('self') · 적('enemy') 스킬은 즉시 발동!
        pendingServantSkill = null;
        pendingMasterSkillIdx = null;
        if (openPopup === 'sv_target') openPopup = null;
        sk.curCd = sk.cd;
        const msg = applyServantSkill(battle, m, sk.key, sk.name, m.rosterIdx);
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
    if (openPopup === 'sv_target' && pendingServantSkill) {
      const caster = battle.roster[pendingServantSkill.casterRIdx];
      const sk = caster?.skills[pendingServantSkill.skillIdx];
      const casterSv = caster ? SERVANT_MAP[caster.id] : null;
      const activeList = getActiveMembers(battle);
      if (!caster || !sk) { pendingServantSkill = null; openPopup = null; renderArena(); return; }
      popupEl.innerHTML = `
        <div class="ms-picker-box" style="margin-top:0">
          <div class="ms-picker-head">
            <span>${sk.icon} <strong>${casterSv?.nickname || casterSv?.name} — ${sk.name}</strong> (👤 개인 지정 · 아래 버튼 또는 전열 카드를 클릭하세요!)</span>
            <button class="small-outline-btn" id="btn-svt-cancel" style="padding:3px 9px;font-size:11px">취소</button>
          </div>
          <div style="font-size:12px;color:#cbd5e1;margin-bottom:8px">${sk.desc}</div>
          <div class="ms-ally-targets">
            ${activeList.map(m => {
              const sv = SERVANT_MAP[m.id];
              const face = ArtRenderer.getFaceUrl(m.id);
              return `
                <button class="ms-target-btn" data-sv-ally="${m.rosterIdx}">
                  ${face ? `<img src="${face}" class="ms-target-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
                  <div>
                    <strong>${sv.nickname || sv.name}${m.rosterIdx === caster.rosterIdx ? ' (본인)' : ''}</strong>
                    <div style="font-size:11px;color:#9cb2d9">HP ${m.hp.toLocaleString()}/${m.maxHp.toLocaleString()} · NP ${Math.floor(m.np)}%</div>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
      document.getElementById('btn-svt-cancel')?.addEventListener('click', () => {
        pendingServantSkill = null;
        openPopup = null;
        renderArena();
      });
      popupEl.querySelectorAll('[data-sv-ally]').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetRIdx = Number(btn.dataset.svAlly);
          sk.curCd = sk.cd;
          const msg = applyServantSkill(battle, caster, sk.key, sk.name, targetRIdx);
          pendingServantSkill = null;
          openPopup = null;
          SoundEngine.levelUp();
          addLog(`✨ ${msg}`);
          getBridge().toast(msg);
          showFloatDmg(`ally-dmg-${targetRIdx}`, `✨ ${sk.name}!`, 'dmg-break');
          saveActiveBattle();
          renderArena();
        });
      });
      return;
    }

    if (openPopup === 'master') {
      const mc = (typeof MYSTIC_CODE_MAP !== 'undefined' && MYSTIC_CODE_MAP[battle.mysticCodeId]) || null;
      const mcTitle = mc ? `${mc.name} (Lv.${battle.mysticCodeLv || 1})` : '마술예장';
      const pendingSk = pendingMasterSkillIdx !== null ? battle.masterSkills[pendingMasterSkillIdx] : null;

      let pickerHtml = '';
      if (pendingSk && pendingSk.target === 'ally') {
        const activeList = getActiveMembers(battle);
        pickerHtml = `
          <div class="ms-picker-box">
            <div class="ms-picker-head">
              <span>${pendingSk.icon} <strong>${pendingSk.name}</strong> — 적용할 아군 서번트를 선택하세요</span>
              <button class="small-outline-btn" id="btn-ms-cancel" style="padding:3px 9px;font-size:11px">취소</button>
            </div>
            <div class="ms-ally-targets">
              ${activeList.map(m => {
                const sv = SERVANT_MAP[m.id];
                const face = ArtRenderer.getFaceUrl(m.id);
                return `
                  <button class="ms-target-btn" data-ms-ally="${m.rosterIdx}">
                    ${face ? `<img src="${face}" class="ms-target-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
                    <div>
                      <strong>${sv.nickname || sv.name}</strong>
                      <div style="font-size:11px;color:#9cb2d9">HP ${m.hp.toLocaleString()}/${m.maxHp.toLocaleString()} · NP ${Math.floor(m.np)}%</div>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else if (pendingSk && pendingSk.target === 'order_change') {
        const aliveSubs = battle.subQueue.map((rIdx, qIdx) => ({ rIdx, qIdx, m: battle.roster[rIdx] })).filter(x => x.m && x.m.hp > 0);
        pickerHtml = `
          <div class="ms-picker-box">
            <div class="ms-picker-head">
              <span>🔄 <strong>오더 체인지</strong> — 전열 1명과 후열 서브 1명을 선택해 교체하세요</span>
              <button class="small-outline-btn" id="btn-ms-cancel" style="padding:3px 9px;font-size:11px">취소</button>
            </div>
            ${aliveSubs.length === 0 ? '<div class="empty-hint" style="padding:10px">교체할 수 있는 후열 대기 서번트가 없습니다.</div>' : `
              <div class="oc-picker-grid">
                <div>
                  <div class="oc-col-label">전열 (OUT)</div>
                  <div class="oc-col-list">
                    ${battle.activeSlots.map((rIdx, fPos) => {
                      if (rIdx === null) return '';
                      const m = battle.roster[rIdx];
                      if (!m || m.hp <= 0) return '';
                      const sv = SERVANT_MAP[m.id];
                      const face = ArtRenderer.getFaceUrl(m.id);
                      return `<button class="ms-target-btn ${ocSelectedFront === fPos ? 'selected' : ''}" data-oc-front="${fPos}">${face ? `<img src="${face}" class="ms-target-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<span>전열${fPos + 1} · ${sv.nickname || sv.name}</span></button>`;
                    }).join('')}
                  </div>
                </div>
                <div>
                  <div class="oc-col-label">후열 서브 (IN)</div>
                  <div class="oc-col-list">
                    ${aliveSubs.map(({ rIdx, qIdx, m }) => {
                      const sv = SERVANT_MAP[m.id];
                      const face = ArtRenderer.getFaceUrl(m.id);
                      return `<button class="ms-target-btn ${ocSelectedSub === qIdx ? 'selected' : ''}" data-oc-sub="${qIdx}">${face ? `<img src="${face}" class="ms-target-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<span>서브 · ${sv.nickname || sv.name}${m.isSupport ? '🤝' : ''}</span></button>`;
                    }).join('')}
                  </div>
                </div>
              </div>
              <div style="margin-top:8px;text-align:right">
                <button class="small-gold-btn" id="btn-oc-confirm" ${ocSelectedFront === null || ocSelectedSub === null ? 'disabled' : ''}>🔄 교체 실행!</button>
              </div>
            `}
          </div>
        `;
      }

      popupEl.innerHTML = `
        <div class="ba-pop-title" style="display:flex;align-items:center;gap:8px">
          ${mc?.icon ? `<img src="${mc.icon}" style="width:28px;height:28px;border-radius:6px;object-fit:cover" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : '🧤'}
          <span>마스터 스킬 — ${mcTitle}</span>
        </div>
        <div class="ba-pop-grid">
          ${battle.masterSkills.map((sk, i) => `
            <button class="upgrade-btn ${pendingMasterSkillIdx === i ? 'selected' : ''}" data-ms="${i}" ${sk.curCd > 0 ? 'disabled' : ''}>
              ${sk.icon} ${sk.name}${sk.curCd > 0 ? ` (${sk.curCd}T)` : ` (CD ${sk.cd})`}<br>
              <small style="color:#9cb2d9;font-weight:400">${sk.desc}</small>
            </button>
          `).join('')}
        </div>
        ${pickerHtml}
      `;

      const commitMasterSkill = (i, targetRIdx = null, ocF = null, ocS = null) => {
        const sk = battle.masterSkills[i];
        if (!sk || sk.curCd > 0) return;
        sk.curCd = sk.cd;
        const msg = applyMasterSkill(battle, i, targetRIdx, ocF, ocS);
        pendingMasterSkillIdx = null;
        ocSelectedFront = null;
        ocSelectedSub = null;
        openPopup = null;
        SoundEngine.levelUp();
        addLog(`🧤 ${msg}`);
        getBridge().toast(msg);
        saveActiveBattle();
        renderArena();
      };

      popupEl.querySelectorAll('[data-ms]').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = Number(btn.dataset.ms);
          const sk = battle.masterSkills[i];
          if (!sk || sk.curCd > 0) return;
          if (sk.target === 'ally' || sk.target === 'order_change') {
            SoundEngine.click();
            pendingServantSkill = null;
            pendingMasterSkillIdx = i;
            ocSelectedFront = null;
            ocSelectedSub = null;
            renderArena(); // 전열 서번트 카드도 바로 클릭 가능하도록 전체 전장 하이라이트 갱신!
            return;
          }
          commitMasterSkill(i);
        });
      });

      document.getElementById('btn-ms-cancel')?.addEventListener('click', () => {
        pendingMasterSkillIdx = null;
        ocSelectedFront = null;
        ocSelectedSub = null;
        renderArena();
      });
      popupEl.querySelectorAll('[data-ms-ally]').forEach(btn => {
        btn.addEventListener('click', () => commitMasterSkill(pendingMasterSkillIdx, Number(btn.dataset.msAlly)));
      });
      popupEl.querySelectorAll('[data-oc-front]').forEach(btn => {
        btn.addEventListener('click', () => { SoundEngine.click(); ocSelectedFront = Number(btn.dataset.ocFront); renderTopPopups(); });
      });
      popupEl.querySelectorAll('[data-oc-sub]').forEach(btn => {
        btn.addEventListener('click', () => { SoundEngine.click(); ocSelectedSub = Number(btn.dataset.ocSub); renderTopPopups(); });
      });
      document.getElementById('btn-oc-confirm')?.addEventListener('click', () => {
        if (ocSelectedFront === null || ocSelectedSub === null) return;
        commitMasterSkill(pendingMasterSkillIdx, null, ocSelectedFront, ocSelectedSub);
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
      const catLabel = getNpCategory(sv, m) === 'support' ? '보조' : (getNpCategory(sv, m) === 'single' ? '단일' : '대군');
      const effNpType = getEffectiveNpType(sv, m);
      const npUpTag = (typeof isNpUpgraded === 'function' && isNpUpgraded(sv)) ? ' 🗡️강화' : '';
      const ocNow = Math.max(1, Math.floor(m.np / 100)) * 100;

      const btn = document.createElement('button');
      btn.className = `np-cmd-card ${effNpType} ${ready ? 'ready' : 'locked'} ${selIdx !== -1 ? 'selected' : ''}`;
      btn.disabled = !ready;
      btn.innerHTML = `
        ${selIdx !== -1 ? `<span class="cmd-order-badge">${selIdx + 1}st</span>` : ''}
        <div class="np-cmd-top">
          ${faceUrl ? `<img src="${faceUrl}" class="np-cmd-face" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
          <div>
            <div class="np-cmd-type">${effNpType.toUpperCase()} 보구 · ${catLabel}${npUpTag}</div>
            <div class="np-cmd-name">${sv.npName}</div>
          </div>
        </div>
        <div class="np-cmd-sub">${ready ? `NP ${Math.floor(m.np)}% (OC ${ocNow}% 발동!)` : `NP ${Math.floor(m.np)}% / 100%`}</div>
      `;
      if (ready) {
        btn.addEventListener('click', () => toggleSelectCard({ kind: 'np', rosterIdx: rIdx, type: effNpType, critPct: 0 }));
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
      const ce = getCePassive(m.ceId, !!m.ceMlb);
      const ps = (typeof getServantPassives === 'function') ? getServantPassives(sv) : { q: 0, a: 0, b: 0, c: 0, sg: 0, ad: 0, nr: 0 };
      const npUpMult = (typeof isNpUpgraded === 'function' && isNpUpgraded(sv)) ? 1.25 : 1.0;
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
        ensureMemberBuffs(m);
        // 원작 고증: 105%~199%는 무조건 100%(OC 1단계)! 보구 체인(+1/+2) + 마술예장 심원성취(ocUp +1) 합산 최대 5단계
        const baseOcStage = Math.max(1, Math.floor(m.np / 100));
        const ocStage = Math.min(5, baseOcStage + npChainCount + (m.buffs.ocUp || 0));
        m.buffs.ocUp = 0;
        npChainCount++;
        const ocMult = 1 + (ocStage - 1) * 0.25; // OC 100%=1.0, 200%=1.25, 300%=1.5, 400%=1.75, 500%=2.0
        m.np = 0;

        await playNpCutin(m, ocStage);
        // 원작 고증: 보구 자체는 커맨드 순서/퍼스트/색상 체인 보너스를 받지 않음!
        const cat = getNpCategory(sv, m);
        const npLvMult = [0, 1.0, 1.25, 1.4, 1.5, 1.65][m.npLevel] || 1.0;
        const cardBuff = (c.type === 'Buster' ? m.buffs.buster + ce.buster + (ps.b || 0) : (c.type === 'Arts' ? m.buffs.arts + ce.arts + (ps.a || 0) : m.buffs.quick + ce.quick + (ps.q || 0)));
        const arashMult = (m.id === 'sv_no_016') ? 1.6 : (m.id === 'sv_no_258' ? 1.5 : 1.0); // ★1 아라쉬 스텔라 ×1.6 / ★2 진궁 기각일진 ×1.5!
        const npDmgMult = (1 + m.buffs.npDmg + ce.npDmg) * m.buffs.npBoost * npUpMult * arashMult;

        if (cat === 'support') {
          if (m.id === 'sv_no_272') {
            // ★5 초인 오리온 [아르테미스 아그노스]: 공격력+30% · 크리위력+100% · 약화무효 · 스타 +20!
            m.buffs.atk += 0.3 * ocMult; m.buffs.atkT = 3;
            m.buffs.crit += 1.0; m.buffs.critT = 3;
            m.buffs.debuffImmune = 1;
            battle.stars = Math.min(99, battle.stars + 20);
            addLog(`🏹 ${sv.name} 보구 [${sv.npName}] (OC ${ocStage * 100}%)! 본인 공업 & 크리 위력 +100% & 스타 +20!!`);
          } else if (m.id === 'sv_no_294') {
            // ★1 오다 노부카츠: 아군 전체 버스터+40% · 크리+50% · 스타+20 후 자신 즉사 → 후열 증원!
            getActiveMembers(battle).forEach(ally => {
              ensureMemberBuffs(ally);
              ally.buffs.buster += 0.4; ally.buffs.cardT = 3;
              ally.buffs.crit += 0.5; ally.buffs.critT = 3;
              ally.hp = Math.min(ally.maxHp, ally.hp + 2000);
            });
            battle.stars = Math.min(99, battle.stars + 20);
            m.hp = 0;
            addLog(`🌸 ${sv.name} 보구 [${sv.npName}]! 아군 전체 B+40%·크리+50%·스타+20 부여 후 퇴장!`);
            reinforceFromBackline();
          } else if (m.id === 'sv_no_021') {
            // ★2 레오니다스 1세 [테르모필라이 에노모타이아]: 아군 전체 방어+30% · 스타+25 · 본인 근성!
            getActiveMembers(battle).forEach(ally => { ensureMemberBuffs(ally); ally.buffs.def += 0.3; ally.buffs.defT = 3; });
            m.buffs.guts = Math.max(m.buffs.guts, 2000); m.buffs.gutsT = 3;
            battle.stars = Math.min(99, battle.stars + 25);
            addLog(`🛡️ ${sv.name} 보구 [${sv.npName}]! 아군 방어+30% · 스타+25 · 본인 근성 부여!`);
          } else if (m.id === 'sv_no_185') {
            // ★3 호조인 인슈운 [오보로 우라즈키 주일식]: 본인 공+50% · 크리+100% · 스타집중+500% · 회피 1회!
            m.buffs.atk += 0.5; m.buffs.atkT = 3;
            m.buffs.crit += 1.0; m.buffs.critT = 3;
            m.buffs.starWeight += 500;
            m.buffs.evadeHits = Math.max(m.buffs.evadeHits, 1); m.buffs.evadeT = 3;
            addLog(`🔱 ${sv.name} 보구 [${sv.npName}]! 본인 공+50% · 크리+100% · 회피(1회)!!`);
          } else if (m.id === 'sv_no_019') {
            // ★2 무사시보 벤케이 [오백나한 보타락도해]: 적 전체 스턴 + 차지 -1!
            battle.enemies.forEach(en => { if (en.hp > 0) { en.stunned = true; en.charge = Math.max(0, en.charge - 1); } });
            addLog(`⚡ ${sv.name} 보구 [${sv.npName}]! 적 전체 스턴(1T) & 차지 -1칸!`);
          } else if (m.id === 'sv_no_228') {
            // ★4 진양옥 [숭문지진]: 아군 전체 크리+40% · 방어+30% · HP+2500!
            getActiveMembers(battle).forEach(ally => {
              ensureMemberBuffs(ally);
              ally.buffs.crit += 0.4; ally.buffs.critT = 3;
              ally.buffs.def += 0.3; ally.buffs.defT = 3;
              ally.hp = Math.min(ally.maxHp, ally.hp + 2500);
            });
            addLog(`✨ ${sv.name} 보구 [${sv.npName}]! 아군 전체 크리+40% · 방어+30% · HP 회복!`);
          } else if (m.id === 'sv_no_241') {
            // ★5 사마의(라이네스) [혼원일진]: 아군 전체 방어+30% · NP획득+30% · 크리+30% · 적 방어 약화!
            getActiveMembers(battle).forEach(ally => {
              ensureMemberBuffs(ally);
              ally.buffs.def += 0.3; ally.buffs.defT = 3;
              ally.buffs.npGain += 0.3; ally.buffs.npGainT = 3;
              ally.buffs.atk += 0.25 * ocMult; ally.buffs.atkT = 3;
            });
            addLog(`📜 ${sv.name} 보구 [${sv.npName}] (OC ${ocStage * 100}%)! 아군 전체 공·방·NP획득 대폭 강화!`);
          } else if (m.id === 'sv_no_342' || m.id === 'sv_no_026') {
            // ★5 콘스탄티누스 11세 / ★3 부디카: 아군 전체 방어+40% · 무적(1T) · 아츠+20% · HP 회복!
            getActiveMembers(battle).forEach(ally => {
              ensureMemberBuffs(ally);
              ally.buffs.def += 0.4; ally.buffs.defT = 3;
              ally.buffs.arts += 0.2; ally.buffs.cardT = 3;
              ally.buffs.invul = Math.max(ally.buffs.invul, 1);
              ally.hp = Math.min(ally.maxHp, ally.hp + 2500);
            });
            addLog(`🏰 ${sv.name} 보구 [${sv.npName}]! 아군 전체 방어+40% · 무적(1T) · Arts+20% · 회복!`);
          } else if (m.id === 'sv_no_150') {
            // ★5 멀린 [가든 오브 아발론]: 아군 전체 도트힐(1500×3T) + NP+15% + 스타+15!
            getActiveMembers(battle).forEach(ally => {
              ensureMemberBuffs(ally);
              ally.buffs.regen = Math.max(ally.buffs.regen, 1500); ally.buffs.regenT = 3;
              ally.hp = Math.min(ally.maxHp, ally.hp + 1500);
              ally.np = Math.min(getMaxNp(ally.npLevel), ally.np + 15);
            });
            battle.stars = Math.min(99, battle.stars + Math.round(10 + ocStage * 5));
            addLog(`🌸 ${sv.name} 보구 [${sv.npName}] (OC ${ocStage * 100}%)! 아군 도트힐·NP+15%·스타 대량 획득!`);
          } else if (m.id === 'sv_no_215') {
            // ★5 스카디 [게이트 오브 스카이]: 아군 전체 회피(1회·3T) · 공+30% · 크리+50%!
            getActiveMembers(battle).forEach(ally => {
              ensureMemberBuffs(ally);
              ally.buffs.evadeHits = Math.max(ally.buffs.evadeHits, 1); ally.buffs.evadeT = 3;
              ally.buffs.atk += 0.3; ally.buffs.atkT = 3;
              ally.buffs.crit += 0.5; ally.buffs.critT = 3;
            });
            addLog(`❄️ ${sv.name} 보구 [${sv.npName}]! 아군 전체 회피(1회) · 공+30% · 크리+50%!`);
          } else if (m.id === 'sv_no_307') {
            // ★5 미스 크레인 [천의무봉·학의 보은]: 선두 아군 공+30%·보구+30%·NP+30% 부여 후 본인 후열 이동!
            const frontLead = getActiveMembers(battle).find(a => a.rosterIdx !== m.rosterIdx);
            if (frontLead) {
              ensureMemberBuffs(frontLead);
              frontLead.buffs.atk += 0.3; frontLead.buffs.atkT = 3;
              frontLead.buffs.npDmg += 0.3; frontLead.buffs.npDmgT = 3;
              frontLead.np = Math.min(getMaxNp(frontLead.npLevel), frontLead.np + 30);
            }
            const mySlot = battle.activeSlots.indexOf(m.rosterIdx);
            if (mySlot !== -1 && battle.subQueue.length > 0) {
              executeOrderChange(battle, mySlot, 0);
              addLog(`🕊️ ${sv.name} 보구 [${sv.npName}]! 선두 아군 초강화 후 본인 후열로 우아하게 퇴장!`);
            } else {
              addLog(`🕊️ ${sv.name} 보구 [${sv.npName}]! 선두 아군 공+30%·보구+30%·NP+30% 부여!`);
            }
          } else if (m.id === 'sv_no_033') {
            // ★2 안데르센: 아군 전체 공+40% · 방+40% · 도트힐(1000×3T) · 스타+15!
            getActiveMembers(battle).forEach(ally => {
              ensureMemberBuffs(ally);
              ally.buffs.atk += 0.4; ally.buffs.atkT = 3;
              ally.buffs.def += 0.4; ally.buffs.defT = 3;
              ally.buffs.regen = Math.max(ally.buffs.regen, 1000); ally.buffs.regenT = 3;
            });
            battle.stars = Math.min(99, battle.stars + 15);
            addLog(`📖 ${sv.name} 보구 [${sv.npName}]! 아군 공+40%·방+40%·도트힐·스타+15!`);
          } else {
            getActiveMembers(battle).forEach(ally => {
              ally.buffs.atk += 0.25 * ocMult; ally.buffs.atkT = 3;
              ally.buffs.invul = Math.max(ally.buffs.invul, 1);
              ally.hp = Math.min(ally.maxHp, ally.hp + Math.round(2500 * ocMult));
              if (m.id === 'sv_tamamo') ally.np = Math.min(getMaxNp(ally.npLevel), ally.np + 25 * ocStage);
            });
            addLog(`✨ ${sv.name} 보구 [${sv.npName}] (OC ${ocStage * 100}%)! 전열 대숙정방어/무적 + 공업 + 회복!`);
          }
        } else if (cat === 'aoe') {
          const baseMult = c.type === 'Buster' ? 3.8 : (c.type === 'Arts' ? 3.3 : 3.5);
          const spHits = [];
          battle.enemies.forEach(en => {
            if (en.hp <= 0) return;
            const clsMult = getClassMultiplier(sv.cls, en.cls);
            const totalAff = getCombinedDamageMod(sv.cls, en.cls, sv.attribute, en.attr);
            const traitBonus = getNpTraitBonus(sv, en);
            const dmg = m.atk * baseMult * npLvMult * (1 + m.buffs.atk) * (1 + cardBuff) * npDmgMult * totalAff * traitBonus.mult * ocMult * (0.95 + Math.random() * 0.1) + (ps.ad || 0);
            const ok = damageEnemy(en, dmg, (clsMult > 1 || traitBonus.mult > 1) ? 'dmg-weak' : 'dmg-np');
            if (traitBonus.mult > 1) {
              spHits.push(`${en.name}(${traitBonus.matched[0]})`);
              showFloatDmg(`enemy-dmg-${en.idx}`, `💥 특공 ${traitBonus.matched[0]}!`, 'dmg-break');
            }
            const okNpMult = ok ? 1.5 : 1.0;
            const okStarMult = ok ? 1.3 : 1.0;
            const enNpMod = getEnemyNpMod(en.cls); // 적 클래스별 NP 보정(캐1.2/라1.1/어0.9/버0.8)
            if (c.type === 'Arts') m.np = Math.min(maxNp, m.np + Math.round(16 * (1 + cardBuff) * (1 + m.buffs.npGain) * okNpMult * enNpMod));
            if (c.type === 'Quick') {
              m.np = Math.min(maxNp, m.np + Math.round(9 * (1 + cardBuff) * okNpMult * enNpMod));
              battle.stars = Math.min(99, battle.stars + Math.round(8 * (1 + (ps.sg || 0)) * okStarMult));
            }
          });
          addLog(`💥 ${sv.name} 대군 보구 [${sv.npName}]${npUpMult > 1 ? ' 🗡️강화' : ''} (OC ${ocStage * 100}%) 작렬!${spHits.length ? ` [💥특공 1.5×: ${spHits.join(', ')}]` : ''}`);
          if (m.id === 'sv_no_016') {
            // ★1 아라쉬 [스텔라]: 보구 후 즉사 (근성 있으면 부활, 없으면 후열 서번트 자동 증원!)
            if (m.buffs.guts > 0) {
              m.hp = Math.min(m.maxHp, m.buffs.guts);
              m.buffs.guts = 0; m.buffs.gutsT = 0;
              addLog(`❤️‍🔥 아라쉬 근성 발동! 스텔라 후 HP ${m.hp.toLocaleString()} 생환!`);
            } else {
              m.hp = 0;
              addLog(`💫 스텔라!! 아라쉬 산화 → 후열 서번트 자동 증원!`);
              reinforceFromBackline();
            }
          } else if (m.id === 'sv_no_258') {
            // ★2 진궁 [기각일진]: 본인 제외 전열 가장 왼쪽 아군 1명 즉사 사출 → 후열 서포터 자동 증원!
            const sacrifice = getActiveMembers(battle).find(a => a.rosterIdx !== m.rosterIdx);
            if (sacrifice) {
              const sacSv = SERVANT_MAP[sacrifice.id];
              if (sacrifice.buffs.guts > 0) {
                sacrifice.hp = Math.min(sacrifice.maxHp, sacrifice.buffs.guts);
                sacrifice.buffs.guts = 0; sacrifice.buffs.gutsT = 0;
                addLog(`❤️‍🔥 ${sacSv.name} 근성 발동! 진궁의 사출에서 생환!`);
              } else {
                sacrifice.hp = 0;
                addLog(`💥 진궁 [기각일진]!! ${sacSv.name}을(를) 화살로 사출 → 후열 서번트 자동 증원!!`);
                reinforceFromBackline();
              }
            }
          }
        } else if (currentTarget) {
          const baseMult = c.type === 'Buster' ? 6.2 : (c.type === 'Arts' ? 5.6 : 5.9);
          const clsMult = getClassMultiplier(sv.cls, currentTarget.cls);
          const totalAff = getCombinedDamageMod(sv.cls, currentTarget.cls, sv.attribute, currentTarget.attr);
          const traitBonus = getNpTraitBonus(sv, currentTarget);
          const dmg = m.atk * baseMult * npLvMult * (1 + m.buffs.atk) * (1 + cardBuff) * npDmgMult * totalAff * traitBonus.mult * ocMult * (0.95 + Math.random() * 0.1) + (ps.ad || 0);
          const ok = damageEnemy(currentTarget, dmg, (clsMult > 1 || traitBonus.mult > 1) ? 'dmg-weak' : 'dmg-np');
          if (traitBonus.mult > 1) {
            showFloatDmg(`enemy-dmg-${currentTarget.idx}`, `💥 특공 ${traitBonus.matched[0]}!`, 'dmg-break');
          }
          const okNpMult = ok ? 1.5 : 1.0;
          const okStarMult = ok ? 1.3 : 1.0;
          const enNpMod = getEnemyNpMod(currentTarget.cls);
          if (c.type === 'Arts') m.np = Math.min(maxNp, m.np + Math.round(22 * (1 + cardBuff) * (1 + m.buffs.npGain) * okNpMult * enNpMod));
          if (c.type === 'Quick') battle.stars = Math.min(99, battle.stars + Math.round(14 * (1 + (ps.sg || 0)) * okStarMult));
          addLog(`💥 ${sv.name} 단일 보구 [${sv.npName}]${npUpMult > 1 ? ' 🗡️강화' : ''} (OC ${ocStage * 100}%) → ${currentTarget.name} ${Math.round(dmg).toLocaleString()}!${traitBonus.mult > 1 ? ` [💥${traitBonus.matched.join('/')} 특공 1.5×!]` : ''}`);
        }
        m.buffs.npBoost = 1;
      } else if (currentTarget) {
        // 원작 FGO 일반 커맨드 카드 계산:
        // - 기본 비율: Buster 1.5, Arts 1.0, Quick 0.8
        // - 순서 배율: 1st 1.0, 2nd 1.2, 3rd 1.4 (예: 버스터 1.5 / 1.8 / 2.1배!)
        // - 클래스 패시브(기승 Q+ / 진지작성 A+ / 광화 B+ / 단독행동 크리+ / 신성 추가대미지 / 기척차단 스타+) 반영!
        const orderMult = [1.0, 1.2, 1.4][step];
        const typeDmgBase = c.type === 'Buster' ? 1.5 : (c.type === 'Arts' ? 1.0 : 0.8);
        const hasFirstBuster = (firstType === 'Buster' || chain.mighty);
        const hasFirstArts = (firstType === 'Arts' || chain.mighty);
        const hasFirstQuick = (firstType === 'Quick' || chain.mighty);

        const firstBusterAdd = hasFirstBuster ? 0.5 : 0;
        const busterChainMult = chain.colorChain === 'Buster' ? 1.2 : 1.0; // 버스터 체인 공 +20%!

        const cardBuff = (c.type === 'Buster' ? m.buffs.buster + ce.buster + (ps.b || 0) : (c.type === 'Arts' ? m.buffs.arts + ce.arts + (ps.a || 0) : m.buffs.quick + ce.quick + (ps.q || 0)));
        const clsMult = getClassMultiplier(sv.cls, currentTarget.cls);
        const totalAff = getCombinedDamageMod(sv.cls, currentTarget.cls, sv.attribute, currentTarget.attr);

        // 퀵 퍼스트 / 마이티 체인: 체인 내 카드 크리티컬 확률 +20%!
        const critChance = Math.min(100, c.critPct + (hasFirstQuick ? 20 : 0));
        const isCrit = Math.random() * 100 < critChance;
        const critDmgMult = isCrit ? (2.0 + m.buffs.crit + ce.crit + (ps.c || 0)) : 1.0;

        const dmg = m.atk * (typeDmgBase * orderMult * (1 + cardBuff) + firstBusterAdd) * (1 + m.buffs.atk) * busterChainMult * totalAff * critDmgMult * (0.92 + Math.random() * 0.16) + (ps.ad || 0);
        const isOverkill = damageEnemy(currentTarget, dmg, isCrit ? 'dmg-crit' : (clsMult > 1 ? 'dmg-weak' : ''));

        // 크리티컬 × 오버킬 곱연산! (NP: ×2.0 ×1.5, 스타: ×1.2 ×1.3)
        const npCritMult = isCrit ? 2.0 : 1.0;
        const npOkMult = isOverkill ? 1.5 : 1.0;
        const stCritMult = isCrit ? 1.2 : 1.0;
        const stOkMult = isOverkill ? 1.3 : 1.0;

        const npBase = c.type === 'Arts' ? 13 : (c.type === 'Quick' ? 5 : 0); // 버스터 자체 NP = 0!
        const npFirstAdd = hasFirstArts ? 6 : 0;
        const enNpMod = getEnemyNpMod(currentTarget.cls);
        const npGain = Math.round((npBase * orderMult + npFirstAdd) * (1 + cardBuff * 0.5) * (1 + m.buffs.npGain) * npCritMult * npOkMult * enNpMod);

        const starBase = c.type === 'Quick' ? 11 : (c.type === 'Buster' ? 3 : 1);
        const starFirstAdd = hasFirstQuick ? 4 : 0;
        const starGain = Math.round((starBase * orderMult + starFirstAdd) * (1 + (m.buffs.starGen || 0) + (ps.sg || 0)) * stCritMult * stOkMult);

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

    // 브레이브 체인 → 4타 EXTRA ATTACK! (클랜 칼라틴 엑스트라 인핸스먼트 반영!)
    if (chain.brave) {
      const m = battle.roster[cards[0].rosterIdx];
      const sv = SERVANT_MAP[m.id];
      const target = currentTarget || pickAliveTarget();
      if (m && m.hp > 0 && target) {
        ensureMemberBuffs(m);
        const extraMult = chain.colorChain ? 3.5 : 2.0; // 동일색 브레이브 시 3.5배!
        const extraCardBuff = 1 + (m.buffs.extraUp || 0);
        const totalAff = getCombinedDamageMod(sv.cls, target.cls, sv.attribute, target.attr);
        const dmg = m.atk * extraMult * extraCardBuff * (1 + m.buffs.atk) * totalAff;
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

      const dealDamageToAlly = (ally, rawDmg) => {
        ensureMemberBuffs(ally);
        if (ally.buffs.invul > 0) {
          showFloatDmg(`ally-dmg-${ally.rosterIdx}`, '무적!', 'dmg-block');
          return;
        }
        if (ally.buffs.invulHits > 0) {
          ally.buffs.invulHits--;
          showFloatDmg(`ally-dmg-${ally.rosterIdx}`, '무적!', 'dmg-block');
          return;
        }
        if (ally.buffs.evade > 0) {
          showFloatDmg(`ally-dmg-${ally.rosterIdx}`, 'EVADE!', 'dmg-block');
          return;
        }
        if (ally.buffs.evadeHits > 0) {
          ally.buffs.evadeHits--;
          showFloatDmg(`ally-dmg-${ally.rosterIdx}`, 'EVADE!', 'dmg-block');
          return;
        }
        ally.hp = Math.max(0, ally.hp - rawDmg);
        showFloatDmg(`ally-dmg-${ally.rosterIdx}`, `-${rawDmg.toLocaleString()}`, 'dmg-enemy-hit');
        if (ally.hp <= 0 && ally.buffs.guts > 0) {
          ally.hp = Math.min(ally.maxHp, ally.buffs.guts);
          ally.buffs.guts = 0;
          ally.buffs.gutsT = 0;
          const asv = SERVANT_MAP[ally.id];
          addLog(`❤️‍🔥 GUTS! ${asv.name} 근성 발동 → HP ${ally.hp.toLocaleString()} 부활!!`);
          showFloatDmg(`ally-dmg-${ally.rosterIdx}`, `GUTS! +${ally.hp.toLocaleString()}`, 'dmg-break');
          SoundEngine.sparkPromotion();
        }
      };

      en.charge++;
      if (en.charge >= en.maxCharge) {
        en.charge = 0;
        SoundEngine.error();
        addLog(`⚠️ ${en.name}의 보구 [${en.npName}] 발동!!`);
        aliveAllies.forEach(ally => {
          const sv = SERVANT_MAP[ally.id];
          const totalAff = getCombinedDamageMod(en.cls, sv.cls, en.attr, sv.attribute);
          const dmg = Math.round(en.atk * 1.9 * totalAff * Math.max(0.3, 1 - ally.buffs.def));
          const hadShield = ally.buffs.invul > 0 || ally.buffs.invulHits > 0 || ally.buffs.evade > 0 || ally.buffs.evadeHits > 0;
          dealDamageToAlly(ally, dmg);
          if (!hadShield && ally.hp > 0) ally.np = Math.min(getMaxNp(ally.npLevel), ally.np + 14);
        });
      } else {
        const victim = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
        const sv = SERVANT_MAP[victim.id];
        const totalAff = getCombinedDamageMod(en.cls, sv.cls, en.attr, sv.attribute);
        const dmg = Math.round(en.atk * totalAff * Math.max(0.3, 1 - victim.buffs.def) * (0.9 + Math.random() * 0.2));
        const hadShield = victim.buffs.invul > 0 || victim.buffs.invulHits > 0 || victim.buffs.evade > 0 || victim.buffs.evadeHits > 0;
        dealDamageToAlly(victim, dmg);
        if (!hadShield && victim.hp > 0) victim.np = Math.min(getMaxNp(victim.npLevel), victim.np + 8);
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
      ensureMemberBuffs(m);
      const ce = getCePassive(m.ceId, !!m.ceMlb);
      const ps = (typeof getServantPassives === 'function') ? getServantPassives(SERVANT_MAP[m.id]) : { nr: 0 };
      const maxNp = getMaxNp(m.npLevel);
      m.skills.forEach(sk => { if (sk.curCd > 0) sk.curCd--; });
      if (ce.starsPerTurn) battle.stars = Math.min(99, battle.stars + ce.starsPerTurn);
      if (ce.npPerTurn) m.np = Math.min(maxNp, m.np + ce.npPerTurn);
      if (ps.nr) m.np = Math.min(maxNp, m.np + ps.nr);
      if (ce.hpDrain) m.hp = Math.max(1, m.hp - ce.hpDrain);
      if (m.buffs.regen > 0 && m.buffs.regenT > 0) {
        m.hp = Math.min(m.maxHp, m.hp + m.buffs.regen);
        if (--m.buffs.regenT === 0) m.buffs.regen = 0;
      }
      if (m.buffs.maxHpBonus > 0) {
        m.maxHp = Math.max(1000, m.maxHp - m.buffs.maxHpBonus);
        m.hp = Math.min(m.maxHp, m.hp);
        m.buffs.maxHpBonus = 0;
      }

      m.buffs.invul = 0;
      m.buffs.invulHits = 0;
      m.buffs.evade = 0;
      if (m.buffs.evadeT > 0 && --m.buffs.evadeT === 0) m.buffs.evadeHits = 0;
      if (m.buffs.gutsT > 0 && --m.buffs.gutsT === 0) m.buffs.guts = 0;
      m.buffs.sureHit = 0;
      m.buffs.invulPierce = 0;
      m.buffs.extraUp = 0;
      m.buffs.ocUp = 0;
      m.buffs.starGen = 0;
      m.buffs.starWeight = 0;
      m.buffs.busterStarWeight = 0;
      m.buffs.artsStarWeight = 0;
      m.buffs.buffProtect = 0;
      m.buffs.npBoost = 1;
      if (m.id === 'sv_emiya') m.buffs.npTypeOverride = null; // 에미야 1턴 아츠 보구 종료 후 버스터 복귀
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
      const mcRes = getBridge().grantBattleRewards({ ...q.rewards, fp: fpBonus }, ownedInParty);
      titleEl.textContent = '🏆 QUEST CLEAR!!';
      bodyEl.innerHTML = `
        <div class="br-quest">${q.name}</div>
        <div class="br-meta">${battle.turn}턴 만에 클리어 성공!</div>
        <div class="br-rewards-box">
          <div class="br-rw-title">✨ 획득 보상 (자동 지급 완료)</div>
          <div>${q.rewardText} · 🤝 FP +${fpBonus.toLocaleString()}</div>
          ${mcRes ? `<div style="font-size:12.5px;color:#ffe680;margin-top:5px">🧤 마술예장 [${mcRes.mc.name}] EXP +${mcRes.gained.toLocaleString()} → Lv.${mcRes.newLv}${mcRes.newLv > mcRes.prevLv ? ' 🎉 LEVEL UP!!' : ''}</div>` : ''}
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
    document.getElementById('btn-open-mystic-codes')?.addEventListener('click', openMysticCodeModal);
    document.getElementById('btn-close-mc')?.addEventListener('click', () => {
      document.getElementById('mystic-code-modal')?.classList.add('hidden');
    });
    document.getElementById('mystic-code-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'mystic-code-modal') e.target.classList.add('hidden');
    });
    document.getElementById('mc-search')?.addEventListener('input', (e) => {
      mcModalQuery = e.target.value || '';
      renderMysticCodeModal();
    });
    document.querySelectorAll('#mc-cat-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.click();
        mcModalFilter = btn.dataset.cat;
        document.querySelectorAll('#mc-cat-filter .filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderMysticCodeModal();
      });
    });
    document.getElementById('btn-mc-unlock-all')?.addEventListener('click', () => {
      const added = getBridge().unlockAllMysticCodes();
      SoundEngine.reveal(5, true);
      getBridge().toast(added > 0 ? `✨ 마술예장 ${added}종 추가 해금! 총 28종 모두 사용 가능!` : '✅ 이미 마술예장 28종을 모두 보유 중입니다!');
      renderLobbyMysticCodeBar();
      renderMysticCodeModal();
    });
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
      pendingServantSkill = null;
      pendingMasterSkillIdx = null;
      openPopup = openPopup === 'master' ? null : 'master';
      renderArena();
    });
    document.getElementById('btn-ba-spells')?.addEventListener('click', () => {
      if (!battle || busy || battle.phase !== 'command') return;
      SoundEngine.click();
      pendingServantSkill = null;
      pendingMasterSkillIdx = null;
      openPopup = openPopup === 'spells' ? null : 'spells';
      renderArena();
    });
    document.getElementById('btn-ba-menu')?.addEventListener('click', () => {
      if (!battle || busy || battle.phase !== 'command') return;
      SoundEngine.click();
      pendingServantSkill = null;
      pendingMasterSkillIdx = null;
      openPopup = openPopup === 'menu' ? null : 'menu';
      renderArena();
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
      if (!battle.mysticCodeId || !battle.masterSkills?.[0]?.effects) {
        battle.mysticCodeId = battle.mysticCodeId || getBridge().getActiveMysticCodeId();
        battle.mysticCodeLv = battle.mysticCodeLv || 1;
        battle.masterSkills = buildBattleMasterSkills(battle.mysticCodeId, battle.mysticCodeLv);
      }
      battle.roster.forEach(m => {
        ensureMemberBuffs(m);
        const defs = getSkillDefs(SERVANT_MAP[m.id]);
        m.skills.forEach((sk, si) => {
          if (!sk.target && defs[si]) {
            sk.target = defs[si].target;
            sk.desc = defs[si].desc;
          }
        });
      });
      busy = false;
      openPopup = null;
      pendingMasterSkillIdx = null;
      pendingServantSkill = null;
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
