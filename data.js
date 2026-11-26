// ============================================================
// FGO 가챠 시뮬레이터 - 서번트 / 개념예장 / 배너 데이터베이스
// ============================================================

const CLASS_INFO = {
  Saber:      { name: '세이버',     en: 'SABER',      color: '#4da6ff', accent: '#c9e6ff' },
  Archer:     { name: '아처',       en: 'ARCHER',     color: '#ff6b6b', accent: '#ffd2d2' },
  Lancer:     { name: '랜서',       en: 'LANCER',     color: '#45d1ff', accent: '#ccf3ff' },
  Rider:      { name: '라이더',     en: 'RIDER',      color: '#ff9f43', accent: '#ffe1c2' },
  Caster:     { name: '캐스터',     en: 'CASTER',     color: '#b47cff', accent: '#e7d6ff' },
  Assassin:   { name: '어새신',     en: 'ASSASSIN',   color: '#63768d', accent: '#cfd9e6' },
  Berserker:  { name: '버서커',     en: 'BERSERKER',  color: '#e84393', accent: '#ffc2df' },
  Ruler:      { name: '룰러',       en: 'RULER',      color: '#f5d76e', accent: '#fff6d1' },
  Avenger:    { name: '어벤저',     en: 'AVENGER',    color: '#9b59b6', accent: '#e8c5ff' },
  AlterEgo:   { name: '얼터에고',   en: 'ALTER EGO',  color: '#fd79a8', accent: '#ffd6e6' },
  Foreigner:  { name: '포리너',     en: 'FOREIGNER',  color: '#00cec9', accent: '#c7fffe' },
  Pretender:  { name: '프리텐더',   en: 'PRETENDER',  color: '#7d8cff', accent: '#dbe0ff' },
  MoonCancer: { name: '문캔서',     en: 'MOONCANCER', color: '#ffeaa7', accent: '#fff9e6' },
  Shielder:   { name: '실더',       en: 'SHIELDER',   color: '#a29bfe', accent: '#e2dfff' },
  Beast:      { name: '비스트',     en: 'BEAST',      color: '#ff385c', accent: '#ffc2d1' },
  UnBeast:    { name: '언비스트',   en: 'UNBEAST',    color: '#ff6ec7', accent: '#ffd6f0' },
  BeastI:     { name: '비스트Ⅰ',    en: 'BEAST I',    color: '#ff385c', accent: '#ffc2d1' },
  BeastII:    { name: '비스트Ⅱ',    en: 'BEAST II',   color: '#ff6b9d', accent: '#ffd6e6' },
  BeastIIIR:  { name: '비스트Ⅲ/R',  en: 'BEAST III/R',color: '#e056fd', accent: '#f5ccff' }
};

const POOL_LABELS = {
  starter:   '기본 캐릭터',
  permanent: '상시 가챠',
  limited:   '한정 가챠',
  story:     '스토리 해금',
  fp:        '프렌드 가챠',
  welfare:   '이벤트 배포',
  npc:       '미실장 (프로필 한정)'
};

// 서번트 데이터베이스 (5성 한정/상시, 4성, 3성)
// limited: true면 픽업 배너에서만 등장(스토리/상시 제외), false면 상시(픽뚫 가능)
const SERVANTS = [
  // ================= 5★ SERVANTS =================
  {
    id: 'sv_castoria',
    name: '아르토리아 캐스터',
    nickname: '캐밥',
    title: '예언의 아이',
    rarity: 5,
    cls: 'Caster',
    limited: true,
    npType: 'Arts',
    npName: '어라운드 칼리번',
    npSub: '너의 별을 모으는 검',
    atk: 10546, hp: 14553,
    art: { bg1: '#1a2f6b', bg2: '#5698ff', hair: '#f7df86', eye: '#3cd070', outfit: '#21409a', accent: '#ffe680', weapon: 'staff', motif: 'stars' },
    summonQuote: '서번트 캐스터. 아르토리아라고 합니다. 아, 아직 초짜라서 이것저것 서툴겠지만… 잘 부탁드려요, 마스터!',
    lines: [
      '마스터, 오늘도 성정석 파밍 가시나요? 아츠 시스템이라면 저한테 맡겨주세요!',
      '아발론의 바람이 느껴지네요. 가끔은 이렇게 쉬어가는 것도 좋아요.',
      '성배? 혹시… 저한테 주시려는 건가요?! 에헤헤, 기대하고 있을게요!',
      '가챠 돌리실 건가요? 제가 옆에서 행운의 마술을 걸어드릴게요! 금테 나와라, 얍!',
      '당신과 함께 걸어온 길이라면, 어떤 이문대라도 두렵지 않아요. 앞으로도 곁에 있을게요.'
    ]
  },
  {
    id: 'sv_oberon',
    name: '오베론',
    nickname: '보티건',
    title: '요정왕 / 심연의 벌레',
    rarity: 5,
    cls: 'Pretender',
    limited: true,
    npType: 'Buster',
    npName: '라이 라이크 보티건',
    npSub: '꿈의 끝에서 잠드는 용',
    atk: 11810, hp: 13245,
    art: { bg1: '#121536', bg2: '#3f5299', hair: '#d7e2ff', eye: '#6ee2ff', outfit: '#222845', accent: '#9bb5ff', weapon: 'wings', motif: 'moth' },
    summonQuote: '안녕! 요정왕 오베론이야. ……뭐, 거짓말 투성이인 나라도 쓸모가 있다면 얼마든지 이용해 줘.',
    lines: [
      '어이, 마스터. 내 3스킬 쓰고 나서 영구 수면 걸렸다고 투정 부리지 마라?',
      '가챠에서 나 뽑으려고 트럭 몇 대나 박았어? 하하, 농담이야. ……진짜 몇 트럭이야?',
      '블랑카도 여기 분위기가 마음에 드는 모양이야. 뭐, 나쁘진 않네.',
      '폭사했어? 괜찮아, 이 세상 모든 건 어차피 한여름 밤의 꿈 같은 거니까.',
      '…흥. 거짓말밖에 못하는 내 곁에 끝까지 남아있다니, 너도 참 지독한 녀석이야.'
    ]
  },
  {
    id: 'sv_morgan',
    name: '모르간',
    nickname: '브리튼의 여왕',
    title: '이문대의 여왕',
    rarity: 5,
    cls: 'Berserker',
    limited: true,
    npType: 'Buster',
    npName: '로드리스 카멜롯',
    npSub: '이미 닿을 수 없는 이상향',
    atk: 12174, hp: 12775,
    art: { bg1: '#1c1230', bg2: '#4d6fa8', hair: '#e8eef5', eye: '#80e5ff', outfit: '#1b2238', accent: '#a8d8ff', weapon: 'spear', motif: 'crown' },
    summonQuote: '버서커, 모르간. 브리튼의 여왕으로서 그대의 소환에 응했노라. 자, 나의 반려여. 내게 걸맞은 왕좌를 준비하도록.',
    lines: [
      '나의 반려여, 쓸데없는 가챠에 성정석을 낭비하지 말거라. ……내 보구 레벨을 올리는 것이라면 허락하마.',
      '바게스트와 바반 시는 잘 지내고 있는가? 칼데아라는 곳도 제법 쓸만하군.',
      '성배를 바치겠다면 기꺼이 받도록 하지. 여왕에게는 당연한 공물이니.',
      '픽뚫이 났다고? 흥, 감히 여왕의 부름을 가로막다니 불경하기 짝이 없군.',
      '…잠시 내 옆에 앉거라. 칼데아의 밤은 제법 고요하구나. 나쁘지 않은 시간이다.'
    ]
  },
  {
    id: 'sv_gilgamesh',
    name: '길가메시',
    nickname: '금삐까',
    title: '바빌론의 영웅왕',
    rarity: 5,
    cls: 'Archer',
    limited: true,
    npType: 'Buster',
    npName: '에누마 엘리시',
    npSub: '천지괴리 개벽의 별',
    atk: 12280, hp: 13097,
    art: { bg1: '#3b1515', bg2: '#d49b2a', hair: '#ffdf4d', eye: '#ff2e2e', outfit: '#c9971c', accent: '#ff4d4d', weapon: 'ea', motif: 'gate' },
    summonQuote: '후하하하하! 감히 이 왕을 불러내다니, 제법 배짱이 두둑한 잡종이로구나. 기뻐하라, 승리는 이미 네 손에 쥐어졌으니!',
    lines: [
      '어이 잡종, 내 보물고에 있는 성정석을 탐내는 눈빛은 뭐냐? 천장 칠 각오는 되어 있겠지?',
      '후하하! 마파두부만 줄줄이 나오는 꼴이 아주 걸작이로구나!',
      '에아를 뽑아 들 가치도 없는 잡졸들은 치워라. 나는 최고의 무대만 원한다.',
      '오호, 제법 정성을 다해 육성했구나. 포상으로 나의 미소를 허락하마.',
      '잡종 치고는 꽤 오래 살아남았군. 좋다, 너의 여정의 끝을 이 왕이 직접 지켜봐 주지.'
    ]
  },
  {
    id: 'sv_arcueid',
    name: '아키타입: 어스',
    nickname: '알퀘이드',
    title: '진조의 공주',
    rarity: 5,
    cls: 'MoonCancer',
    limited: true,
    npType: 'Buster',
    npName: '공상구현화',
    npSub: '천년성 브륜스터드',
    atk: 11432, hp: 15102,
    art: { bg1: '#1a123b', bg2: '#f0d878', hair: '#fff0a6', eye: '#ff3b5c', outfit: '#f4f6ff', accent: '#ff5277', weapon: 'moon', motif: 'moon' },
    summonQuote: '진조의 공주, 아키타입: 어스. 당신이 나를 부른 마스터? 후후, 모처럼의 바깥 세상이니까 재밌게 놀아보자!',
    lines: [
      '와아, 칼데아에는 재밌는 게 엄청 많네! 저기, 그 반짝이는 돌(성정석)은 먹는 거야?',
      '보구 레벨이 높을수록 천년성이 더 커진다던데… 에헤헤, 기대할게!',
      '밤하늘의 달이 유난히 예쁘네. 이럴 땐 기분이 최고야!',
      '폭사했다고 울상 짓지 마! 다음 11연차에는 분명 무지개 회전이 뜰 거야!',
      '당신과 보내는 시간은 천 년의 잠보다 훨씬 즐거워. 고마워, 마스터!'
    ]
  },
  {
    id: 'sv_dantes',
    name: '암굴왕 에드몽 당테스',
    nickname: '암굴왕',
    title: '복수의 화신',
    rarity: 5,
    cls: 'Avenger',
    limited: true,
    npType: 'Quick',
    npName: '앙페르 샤토 디프',
    npSub: '호랑이여, 찬란히 타올라라',
    atk: 12641, hp: 12177,
    art: { bg1: '#0e0b1a', bg2: '#3f2057', hair: '#d2cfc2', eye: '#70ff8d', outfit: '#1a1c24', accent: '#56ff87', weapon: 'flame', motif: 'chains' },
    summonQuote: '후하하하하! 절망의 끝에서 나를 불렀는가, 공범자여! 기다려라, 그리고 희망을 가져라!',
    lines: [
      '크하하하! 300연차 노5성? 그래, 그 절망이야말로 어벤저에게 어울리는 양식이지!',
      '커피 한 잔 마시며 진정해라. ……아, 카드를 긁는 손은 멈추지 않았군.',
      '기다려라, 그리고 희망을 가져라. 그것이 가챠를 대하는 유일한 지혜다.',
      '어둠 속에서 내가 네 등을 지켜주마. 공범자여, 주저 없이 나아가라.',
      '복수의 불꽃이 사그라든 뒤에도, 네 곁에 남을 이유는 충분하더군.'
    ]
  },
  {
    id: 'sv_koyanskaya',
    name: '빛의 코얀스카야',
    nickname: '빛코얀',
    title: 'NFF 서비스 대표',
    rarity: 5,
    cls: 'Assassin',
    limited: true,
    npType: 'Buster',
    npName: '이즈 투라 세븐 드라이브',
    npSub: '영장중포·통구스카',
    atk: 11761, hp: 13266,
    art: { bg1: '#2e0e22', bg2: '#c94b7d', hair: '#ffd9eb', eye: '#ffd000', outfit: '#2b1929', accent: '#ff6699', weapon: 'rifle', motif: 'tails' },
    summonQuote: '어머나, NFF 서비스를 이용해 주셔서 감사합니다~♪ 빛의 코얀스카야, 고객님의 성정석을 완벽히 서포트해 드릴게요♥',
    lines: [
      '고객님~ 버스터 시스템 돌리시려면 저 하나쯤은 필수인 거 아시죠? 호호호!',
      '성정석 대출 상담은 언제든 환영이에요. 이자는… 아주 조금만 받을게요♥',
      '무지개 회전은 짜릿하죠? 방금 고객님 심장 소리 여기까지 들렸답니다~',
      '후훗, 좋은 무기는 좋은 고객에게 바쳐야 제맛이죠.',
      '비즈니스 관계로 시작했지만… 글쎄요, 당신은 꽤 특별한 VIP네요.'
    ]
  },
  {
    id: 'sv_melusine',
    name: '멜뤼진',
    nickname: '요슬롯',
    title: '요정기사 랜슬롯',
    rarity: 5,
    cls: 'Lancer',
    limited: true,
    npType: 'Arts',
    npName: '이노센스 아론다이트',
    npSub: '무구한 호수의 빛',
    atk: 12116, hp: 13537,
    art: { bg1: '#102447', bg2: '#42b8e0', hair: '#e8f1ff', eye: '#42d4ff', outfit: '#eef5ff', accent: '#ff5c8a', weapon: 'spear', motif: 'dragon' },
    summonQuote: '요정기사 랜슬롯, 진명 멜뤼진. 최강의 용이 당신의 부름에 답했어. ……응, 너는 내 연인이 될 자격이 충분해.',
    lines: [
      '아츠 단일이든 버스터 대군이든 나한테 맡겨. 최강의 기사니까!',
      '마스터, 다른 서번트만 너무 쳐다보지 마. 내가 제일 강하고 예쁘잖아?',
      '하늘을 나는 기분은 최고야. 나중에 너도 태워줄게.',
      '성배? 응, 당연히 나한테 줄 거지? 기뻐!',
      '미래시로 봤어. 너와 나는 아주 오래오래 함께일 거야.'
    ]
  },
  {
    id: 'sv_jalter',
    name: '잔 다르크 [얼터]',
    nickname: '흑잔',
    title: '용의 마녀',
    rarity: 5,
    cls: 'Avenger',
    limited: true,
    npType: 'Buster',
    npName: '라 그롱드망 뒤 엔',
    npSub: '울부짖어라, 나의 분노여',
    atk: 13244, hp: 11761,
    art: { bg1: '#260a14', bg2: '#8a1c34', hair: '#e3e4ec', eye: '#ffcf40', outfit: '#1d1624', accent: '#ff385c', weapon: 'flag', motif: 'flames' },
    summonQuote: '어벤저, 잔 다르크. ……뭘 그렇게 뚫어져라 쳐다봐? 나를 불러낸 건 너잖아. 후회해도 늦었어!',
    lines: [
      '흥, 나 말고 다른 5성 노리다가 나온 건 아니겠지? 그랬다간 태워버릴 테니까!',
      '만화 원고 마감도 바쁜데 자꾸 부르지 마… 아, 성배 주는 거면 잠깐 봐줄게.',
      '마파두부 나왔다고 징징대지 마. 꼴사납잖아!',
      '…딱히 너를 위해 싸우는 건 아니거든. 착각하지 마.',
      '바보… 끝까지 날 믿고 맡기다니, 어쩔 수 없잖아. 네가 이길 때까지 내가 전부 불태워 줄게.'
    ]
  },
  {
    id: 'sv_muramasa',
    name: '센지 무라마사',
    nickname: '무라마사',
    title: '도공의 의지',
    rarity: 5,
    cls: 'Saber',
    limited: true,
    npType: 'Arts',
    npName: '츠무카리 무라마사',
    npSub: '무원검제',
    atk: 12116, hp: 13659,
    art: { bg1: '#2e110d', bg2: '#c94b28', hair: '#e66e3c', eye: '#ffa336', outfit: '#8c221d', accent: '#ffae42', weapon: 'katana', motif: 'swords' },
    summonQuote: '서번트 세이버, 센지 무라마사다. 이래 봬도 도공이라네. 검이 필요하다면 언제든 말하게나, 애송이!',
    lines: [
      '허허, 이 몸을 뽑으려고 꽤나 고생한 모양이군. 어디, 밥이라도 든든히 먹어두게.',
      '강철을 두드리는 소리는 언제 들어도 마음이 편하구먼.',
      '칼을 벼리는 일이나 가챠를 돌리는 일이나, 결국 마음을 비워야 좋은 게 나오는 법이지.',
      '할아버지라고 부르지 마라! ……뭐, 겉모습이 젊으니 어쩔 수 없나.',
      '자네는 좋은 눈을 가졌어. 내가 벼린 최고의 한 자루, 자네에게 맡기겠네.'
    ]
  },
  // ================= 5★ 상시 (PERMANENT - 픽뚫 가능!) =================
  {
    id: 'sv_artoria',
    name: '아르토리아 펜드래건',
    nickname: '청밥',
    title: '기사왕',
    rarity: 5,
    cls: 'Saber',
    limited: false,
    npType: 'Buster',
    npName: '엑스칼리버',
    npSub: '약속된 승리의 검',
    atk: 11221, hp: 15150,
    art: { bg1: '#0f2757', bg2: '#2c6bd6', hair: '#f5d76e', eye: '#2ecc71', outfit: '#1c4294', accent: '#ffd700', weapon: 'sword', motif: 'light' },
    summonQuote: '묻겠습니다. 당신이 저의 마스터인가요? 서번트 세이버, 소환에 응해 찾아왔습니다.',
    lines: [
      '마스터, 식사 시간입니다! 오늘 메뉴는 무엇인가요?',
      '금테 세이버가 떴을 때 설마 픽뚫이라고 실망하신 건 아니겠죠? …조금 상처받았습니다.',
      '약속된 승리의 검이 당신과 함께합니다. 두려워하지 마세요.',
      '성배를 향한 길은 멀고도 험하지만, 당신과 함께라면 반드시 닿을 수 있습니다.',
      '당신은 훌륭한 마스터입니다. 제 검과 명예를 영원히 당신께 바치겠습니다.'
    ]
  },
  {
    id: 'sv_waver',
    name: '제갈공명 [엘멜로이 2세]',
    nickname: '공명',
    title: '과로의 대명사',
    rarity: 5,
    cls: 'Caster',
    limited: false,
    npType: 'Arts',
    npName: '석병팔진',
    npSub: '돌아오지 못하는 진',
    atk: 10598, hp: 14259,
    art: { bg1: '#1c242b', bg2: '#4d6658', hair: '#2b2b33', eye: '#708c84', outfit: '#3b1c24', accent: '#d9b566', weapon: 'fan', motif: 'tactics' },
    summonQuote: '서번트 캐스터, 제갈공명이다. ……하아, 또 주회 파티에 끌려갈 운명이로군. 일단 게임기부터 치우지 마라.',
    lines: [
      '캐스터 금테라고 캐밥인 줄 알았나? 유감이군, 나다. 그래도 NP 50% 차지는 쓸만할 텐데?',
      '잠깐, 인연 레벨이 벌써 10에 가까워졌잖아! 내 휴가는 어디 간 거지?!',
      '확률 계산을 해보자. 1%를 330번 실패할 확률은… 아, 계산하지 않는 편이 정신건강에 좋겠군.',
      '피곤해… 하지만 네가 포기하지 않는 한 나도 전략을 짜주지.',
      '쓸만한 제자이자, 믿음직한 마스터로군. 뭐, 앞으로도 잘 부탁한다.'
    ]
  },
  {
    id: 'sv_enkidu',
    name: '엘키두',
    nickname: '엘키두',
    title: '하늘의 쐐기',
    rarity: 5,
    cls: 'Lancer',
    limited: false,
    npType: 'Buster',
    npName: '에누마 엘리시',
    npSub: '인류여, 신을 묶어두자',
    atk: 10780, hp: 15300,
    art: { bg1: '#14302a', bg2: '#469e7a', hair: '#7de0a8', eye: '#59c990', outfit: '#f0eee4', accent: '#75e6a8', weapon: 'chains', motif: 'nature' },
    summonQuote: '불렀어? 내 이름은 엘키두. 당신의 부름에 응해 깨어났어. 편하게 도구처럼 써줘.',
    lines: [
      '칼데아의 정원은 평화롭네. 가끔 저쪽에서 황금빛 갑옷이 시끄럽게 굴지만.',
      '랜서 픽업에서 내가 나왔다고? 미안해, 그래도 신성 특공만큼은 확실해!',
      '바람이 참 좋네. 마스터, 잠시 쉬다 갈래?',
      '성배의 마력이 흐르는 게 느껴져. 소중히 쓸게.',
      '나는 병기지만, 당신과 함께 있을 때는 마음이 따뜻해져.'
    ]
  },
  {
    id: 'sv_karna',
    name: '카르나',
    nickname: '카르나',
    title: '시혜의 영웅',
    rarity: 5,
    cls: 'Lancer',
    limited: false,
    npType: 'Buster',
    npName: '바사비 샤크티',
    npSub: '태양이여, 죽음에 순종하라',
    atk: 11976, hp: 13632,
    art: { bg1: '#2e1612', bg2: '#e05c34', hair: '#f2f4f8', eye: '#61d0ff', outfit: '#c92a2a', accent: '#ffd43b', weapon: 'spear', motif: 'sun' },
    summonQuote: '서번트 랜서. 진명은 카르나. ……그대가 나의 마스터인가. 부탁한다, 나를 올바르게 사용해 주길.',
    lines: [
      '가챠에서 원하는 결과가 나오지 않았다고 낙담할 필요 없다. 진정한 영웅은 눈으로 죽이는 법.',
      '태양의 빛이 그대를 비출 것이다. 걱정하지 마라.',
      '나의 창은 단 한 번, 신마저 꿰뚫기 위해 존재한다.',
      '감사의 말을 전하는 게 서툴지만… 그대의 노고는 알고 있다.',
      '그대와 함께한 싸움은 내게 큰 영광이었다. 마스터.'
    ]
  },
  {
    id: 'sv_jeanne',
    name: '잔 다르크',
    nickname: '잔느',
    title: '구국의 성녀',
    rarity: 5,
    cls: 'Ruler',
    limited: false,
    npType: 'Arts',
    npName: '뤼미노지테 에테르넬',
    npSub: '나의 신은 여기에 있나니',
    atk: 9593, hp: 16500,
    art: { bg1: '#1f2347', bg2: '#7a87d6', hair: '#f7df86', eye: '#a68cff', outfit: '#28264a', accent: '#f5d76e', weapon: 'flag', motif: 'halo' },
    summonQuote: '서번트 룰러, 잔 다르크. 당신을 만나 뵙게 되어 정말 기쁩니다!',
    lines: [
      '마스터, 무리한 과금은 안 돼요! 주님께서도 절제를 기뻐하실 겁니다.',
      '내구 파티가 필요하시다면 언제든 불러주세요. 제가 모두를 지켜드릴게요.',
      '얼터 쪽 저도 사실은 아주 착한 아이랍니다. 사이좋게 지내주세요.',
      '당신의 소환에 축복이 깃들기를 기도하겠습니다.',
      '언제나 당신의 곁에서 깃발을 높이 들겠습니다, 마스터.'
    ]
  },
  {
    id: 'sv_ozymandias',
    name: '오지만디아스',
    nickname: '오지만',
    title: '태양왕',
    rarity: 5,
    cls: 'Rider',
    limited: false,
    npType: 'Buster',
    npName: '라메세움 텐티리스',
    npSub: '광휘의 대복합신전',
    atk: 11971, hp: 12830,
    art: { bg1: '#3b240b', bg2: '#e6a822', hair: '#3d2817', eye: '#ffae00', outfit: '#1c2a4a', accent: '#ffd700', weapon: 'staff', motif: 'sun' },
    summonQuote: '여의 이름은 오지만디아스! 만왕의 왕이니라! 전능한 신들이여, 여의 위업을 보라, 그리고 절망하라! 후하하하하!',
    lines: [
      '후하하하! 태양왕의 강림을 축하하라! 픽뚫이라니, 감히 축복을 착각하지 마라!',
      '강화 성공률 업? 후후, 여의 앞에서는 확률 따위 굴복할 뿐!',
      '여의 신전에서 성대한 연회를 열어주마. 성정석은… 알아서 구해오거라.',
      '흠, 제법 안목이 있구나. 여의 보구 레벨을 높이는 것은 현명한 선택이다.',
      '그대는 태양의 은총을 받을 자격이 충분하다. 영원히 여와 함께 걷자꾸나!'
    ]
  },
  {
    id: 'sv_tamamo',
    name: '타마모노마에',
    nickname: '타마모',
    title: '현모양처 여우',
    rarity: 5,
    cls: 'Caster',
    limited: false,
    npType: 'Arts',
    npName: '수천일광 천조팔야진석',
    npSub: '미즈텐닛코우 아마테라스',
    atk: 10546, hp: 14259,
    art: { bg1: '#381529', bg2: '#d96ba0', hair: '#ffb3c6', eye: '#f5c542', outfit: '#1b3b75', accent: '#ff70a6', weapon: 'mirror', motif: 'sakura' },
    summonQuote: '부름에 응해 찾아왔사옵니다! 당신의 현모양처, 캐스터 타마모노마에랍니다~♪ 미콩!',
    lines: [
      '캐스터 금테라서 놀라셨나요? 미콩♪ 저도 아츠 서포터의 원조라고요!',
      '주인님~ 오늘 저녁은 따뜻한 유부우동 어떠신가요?',
      '후훗, 다른 여우(코얀스카야)한테 한눈팔면 안 돼요?',
      '스킬 쿨타임 감소가 필요할 땐 언제든 불러주세요!',
      '주인님과 함께라면 천 년도 눈 깜짝할 사이랍니다♥'
    ]
  },
  {
    id: 'sv_jack',
    name: '잭 더 리퍼',
    nickname: '잭',
    title: '안개의 살인귀',
    rarity: 5,
    cls: 'Assassin',
    limited: false,
    npType: 'Quick',
    npName: '마리아 더 리퍼',
    npSub: '해체성모',
    atk: 11557, hp: 12696,
    art: { bg1: '#181d26', bg2: '#46586e', hair: '#d7dce5', eye: '#f0c850', outfit: '#21252e', accent: '#ff5277', weapon: 'daggers', motif: 'mist' },
    summonQuote: '어새신, 잭 더 리퍼야. 잘 부탁해, 엄마!',
    lines: [
      '엄마, 스타 많이 벌어올게! 퀵 카드 눌러줘!',
      '추워… 하지만 엄마 옆에 있으면 따뜻해.',
      '폭사해서 슬퍼? 우리가 나쁜 가챠 기계 해체해 줄까?',
      '와아, 성배다! 반짝반짝 예쁘네!',
      '엄마, 계속 우리랑 같이 있어 줘. 절대 떠나지 마!'
    ]
  },
  {
    id: 'sv_altrer',
    name: '알테라',
    nickname: '알테라',
    title: '파괴의 대왕',
    rarity: 5,
    cls: 'Saber',
    limited: false,
    npType: 'Buster',
    npName: '포톤 레이',
    npSub: '군신의 검',
    atk: 12343, hp: 13907,
    art: { bg1: '#231636', bg2: '#7a448c', hair: '#f0e6f5', eye: '#ff5c8a', outfit: '#f4eef7', accent: '#5ef2ff', weapon: 'sword', motif: 'rainbow' },
    summonQuote: '내 이름은 알테라. 훈족의 왕이자 군신의 검을 쥔 자. ……가챠는, 나쁜 문명.',
    lines: [
      '확률 1%… 나쁜 문명. 파괴한다.',
      '무지개 빛 군신의 검이 반짝이고 있다. 좋은 징조다.',
      '마스터, 성정석은 소중히 다뤄라. 좋은 문명이다.',
      '나를 키워줘서 고맙다. 힘이 넘쳐흐른다.',
      '너와 함께하는 칼데아는… 아주 좋은 문명이다.'
    ]
  },
  {
    id: 'sv_cu_alter',
    name: '쿠 훌린 [얼터]',
    nickname: '쿠얼터',
    title: '광왕',
    rarity: 5,
    cls: 'Berserker',
    limited: false,
    storyLocked: true,
    npType: 'Buster',
    npName: '쿠르이드 코인헨',
    npSub: '갈아엎는 사아의 괴수',
    atk: 12805, hp: 12210,
    art: { bg1: '#210b14', bg2: '#75192e', hair: '#2e3b6e', eye: '#ff2e4c', outfit: '#1c1824', accent: '#ff3b5c', weapon: 'spear', motif: 'thorns' },
    summonQuote: '버서커, 쿠 훌린이다. 명령만 내려라. 내 앞을 막는 놈은 전부 갈아버리지.',
    lines: [
      '고난이도 퀘스트? 후방에 나 하나만 세워둬. 다 끝내줄 테니.',
      '쓸데없는 수다는 사양한다. ……뭐, 가챠 결과는 꽤 흥미롭군.',
      '피와 철의 냄새가 나는 전장이 내 자리다.',
      '성배를 준다고? 흥, 썩 나쁘지 않은 선택이군.',
      '너는 내가 인정한 유일한 마스터다. 등 뒤는 맡겨둬.'
    ]
  },

  // ================= 4★ SERVANTS =================
  {
    id: 'sv_emiya',
    name: '에미야',
    nickname: '홍차',
    title: '이름 없는 영령',
    rarity: 4,
    cls: 'Archer',
    limited: false,
    npType: 'Buster',
    npName: '언리미티드 블레이드 웍스',
    npSub: '무한의 검제',
    atk: 9398, hp: 11521,
    art: { bg1: '#2b1316', bg2: '#8a2b2b', hair: '#edf2f7', eye: '#a0aec0', outfit: '#a61c24', accent: '#ff7043', weapon: 'twinblades', motif: 'gears' },
    summonQuote: '부름에 응해 찾아왔다. 서번트 아처. 내가 필요한 건가? 좋아, 계약하지.',
    lines: [
      '가챠에 너무 목숨 걸지 마라. 배고프면 식당으로 와, 밥은 차려줄 테니.',
      '금테 아처가 떠서 영웅왕인 줄 알았나? 유감이군, 주방장이다.',
      'I am the bone of my sword… 아니, 주방 칼 말하는 거 아니다.',
      '성배? 그런 건 필요 없지만, 네 성의는 감사히 받지.',
      '꽤 멀리까지 왔군. 앞으로도 네 뒤는 내가 엄호해 주지.'
    ]
  },
  {
    id: 'sv_heracles',
    name: '헤라클레스',
    nickname: '헤클',
    title: '그리스의 대영웅',
    rarity: 4,
    cls: 'Berserker',
    limited: false,
    npType: 'Buster',
    npName: '나인 라이브즈',
    npSub: '쏘아 죽이는 백 머리',
    atk: 10655, hp: 10327,
    art: { bg1: '#261815', bg2: '#7a452b', hair: '#2e2420', eye: '#ff5252', outfit: '#523428', accent: '#ff924c', weapon: 'axe', motif: 'roar' },
    summonQuote: '■■■■■―――――!! (대지를 울리는 포효와 함께 최강의 광전사가 강림했다!)',
    lines: [
      '■■■■!! (인연 예장 \'눈의 성\'만 있으면 무적이라는 듯 주먹을 쥔다!)',
      '■■■…! (폭사한 마스터의 어깨를 묵직하게 두드려 준다.)',
      '■■■■■!! (든든한 미소와 함께 도끼검을 고쳐 쥔다!)',
      '■■■! (성배를 소중히 받아들고 하늘을 향해 포효한다!)',
      '■■… (말은 통하지 않아도, 당신을 끝까지 지키겠다는 의지가 전해진다.)'
    ]
  },
  {
    id: 'sv_barghest',
    name: '바게스트',
    nickname: '요웨인',
    title: '요정기사 가웨인',
    rarity: 4,
    cls: 'Saber',
    limited: false,
    storyLocked: true,
    npType: 'Buster',
    npName: '블랙 독 갈라틴',
    npSub: '포식하는 날의 뿔',
    atk: 9419, hp: 12800,
    art: { bg1: '#2e1518', bg2: '#b03c2c', hair: '#f7d560', eye: '#ff5252', outfit: '#2c2530', accent: '#ff8a3d', weapon: 'greatsword', motif: 'flames' },
    summonQuote: '요정기사 가웨인, 진명 바게스트. 기사로서 당신의 곁을 지키겠습니다, 마스터!',
    lines: [
      '단기전도 장기전도 맡겨주십시오! 제 검은 결코 꺾이지 않습니다.',
      '요리 실력에도 자신이 있습니다. 폭사하셨다면 든든한 스테이크를 대접해 드리죠!',
      '모르간 폐하께 부끄럽지 않은 기사가 되겠습니다.',
      '아, 저에게 성배를…? 몸 둘 바를 모르겠습니다!',
      '당신은 제가 지켜야 할 소중한 주군입니다.'
    ]
  },
  {
    id: 'sv_baobhan',
    name: '바반 시',
    nickname: '요트리스탄',
    title: '요정기사 트리스탄',
    rarity: 4,
    cls: 'Archer',
    limited: false,
    storyLocked: true,
    npType: 'Quick',
    npName: '페치 페일 노트',
    npSub: '환상·혈극의 춤',
    atk: 9661, hp: 11220,
    art: { bg1: '#260b1d', bg2: '#991f4d', hair: '#ff477e', eye: '#ffd166', outfit: '#1f1421', accent: '#ff3366', weapon: 'bow', motif: 'roses' },
    summonQuote: '하? 내가 요정기사 트리스탄, 바반 시야. 엄마(모르간) 명령이니까 도와주는 거지, 착각하지 마!',
    lines: [
      '키히힛! 성정석 다 날린 얼굴 좀 봐! 완전 꼴사납네~!',
      '구두 수집하는 게 취미야. 마스터도 예쁜 구두 선물해 줄 거지?',
      '엄마도 같이 뽑아줬지? 그렇지 않으면 가만 안 둘 거야!',
      '어머, 성배? 나한테 주는 거야? 헤헤… 꽤 센스 있잖아.',
      '…흥. 너, 의외로 상냥하네. 조금은 인정해 줄게.'
    ]
  },
  {
    id: 'sv_percival',
    name: '퍼시벌',
    nickname: '퍼시벌',
    title: '성창의 원탁 기사',
    rarity: 4,
    cls: 'Lancer',
    limited: false,
    npType: 'Arts',
    npName: '롱기누스 카운트 제로',
    npSub: '빛나는 성창의 일격',
    atk: 8741, hp: 12960,
    art: { bg1: '#162847', bg2: '#5587c9', hair: '#593d2b', eye: '#4da6ff', outfit: '#d7e2f2', accent: '#f5d76e', weapon: 'spear', motif: 'light' },
    summonQuote: '원탁의 기사 퍼시벌, 성창 롱기누스와 함께 참전했습니다! 마스터, 식사는 챙기셨습니까?',
    lines: [
      '캐밥과 함께라면 아츠 시스템으로 전장을 휩쓸 수 있습니다!',
      '폭사해서 기운이 없으시군요. 따뜻한 스튜를 끓여드리겠습니다!',
      '동료들을 지키는 것이 기사의 본분입니다.',
      '저에게 성배를 맡겨주시다니, 영광입니다!',
      '언제든 제 등 뒤로 숨으십시오, 마스터.'
    ]
  },
  {
    id: 'sv_gil_caster',
    name: '길가메시 [캐스터]',
    nickname: '현왕',
    title: '우루크의 현왕',
    rarity: 4,
    cls: 'Caster',
    limited: false,
    npType: 'Arts',
    npName: '멜람무 딩기르',
    npSub: '왕의 호포',
    atk: 8460, hp: 12005,
    art: { bg1: '#1a2744', bg2: '#b88628', hair: '#ffdf4d', eye: '#ff3b3b', outfit: '#1d3c78', accent: '#f5c542', weapon: 'tablet', motif: 'stars' },
    summonQuote: '후하하하! 우루크의 현왕, 캐스터 길가메시다. 과로사 직전이지만 네 부름에 특별히 응해주마!',
    lines: [
      '어이 잡종! 점토판 결재가 산더미다. 가챠 돌릴 시간에 일손이나 거들어라!',
      '아츠 파티의 화력이 부족하다고? 왕의 호포를 쏴주마!',
      '천리안으로 보니… 훗, 다음 11연차에는 좋은 게 뜰지도 모르겠군.',
      '과로할 정도로 굴려먹다니… 뭐, 왕의 아량으로 용서해주마.',
      '우루크의 백성처럼, 너도 훌륭히 싸워냈구나.'
    ]
  },
  {
    id: 'sv_lancelot_z',
    name: '랜슬롯 [버서커]',
    nickname: '버슬롯',
    title: '칠흑의 기사',
    rarity: 4,
    cls: 'Berserker',
    limited: false,
    npType: 'Quick',
    npName: '나이트 오브 오너',
    npSub: '기사는 맨손으로 죽지 않는다',
    atk: 10477, hp: 10327,
    art: { bg1: '#120e1f', bg2: '#5a2a6b', hair: '#2e2b40', eye: '#ff2e4c', outfit: '#181624', accent: '#c92a49', weapon: 'minigun', motif: 'mist' },
    summonQuote: 'Aaaarthurrrrr!! (검붉은 안개 속에서 광기의 기사가 전투기 기관포를 겨누며 강림했다!)',
    lines: [
      'Grrrrr… Aaarthur!! (젤릿치를 쥐여주면 좋아할 것 같다.)',
      '…Gaaah!! (크리티컬 스타를 양손 가득 모아왔다!)',
      'Aaarthur…! (청밥을 보더니 갑자기 흥분한다.)',
      'Grrrr!! (성배를 받자 검붉은 오라가 더욱 강해졌다!)',
      '…Aarthur. (광기 너머로 마스터를 향한 충성심이 느껴진다.)'
    ]
  },
  {
    id: 'sv_helena',
    name: '헬레나 블라바츠키',
    nickname: '헬레나',
    title: '신지학의 대모',
    rarity: 4,
    cls: 'Caster',
    limited: false,
    npType: 'Arts',
    npName: '사나트 쿠마라',
    npSub: '금성신·화염의 전차',
    atk: 8629, hp: 11882,
    art: { bg1: '#1b1d4a', bg2: '#7a5cbf', hair: '#e8e8ff', eye: '#70ff8d', outfit: '#3b245c', accent: '#ffe066', weapon: 'book', motif: 'stars' },
    summonQuote: '호호호, 헬레나 블라바츠키야. 마하트마의 인도로 여기까지 왔단다!',
    lines: [
      '마하트마가 속삭이고 있어… 이번 가챠는 대길이야!',
      '아군 전체 NP 20% 차지! 초반 주회에는 내가 최고지!',
      'UFO는 로망이란다, 마스터.',
      '성배라니, 정말 신비로운 아티팩트네!',
      '너에게서 아주 강한 마하트마의 빛이 느껴져.'
    ]
  },
  {
    id: 'sv_astolfo',
    name: '아스톨포',
    nickname: '아스톨포',
    title: '샤를마뉴 12용사',
    rarity: 4,
    cls: 'Rider',
    limited: false,
    npType: 'Quick',
    npName: '히포그리프',
    npSub: '이 세상에 존재하지 않는 환마',
    atk: 8937, hp: 11172,
    art: { bg1: '#2e1633', bg2: '#e87ab8', hair: '#ff9ec9', eye: '#c44dff', outfit: '#211c2b', accent: '#ff70b8', weapon: 'spear', motif: 'stars' },
    summonQuote: '야호~! 서번트 라이더, 아스톨포 등장! 세세한 건 신경 쓰지 말고 재밌게 가자고, 마스터!',
    lines: [
      '에헤헤, 폭사했어? 괜찮아 괜찮아! 잊어버리고 한 번 더 돌리자!',
      '히포그리프 타고 하늘 산책 갈래?',
      '이성은 달에 두고 왔지만, 마스터를 응원하는 마음은 여기 있어!',
      '와아, 성배 고마워! 반짝반짝하네!',
      '마스터랑 같이 있으면 매일매일이 모험 같아서 최고야!'
    ]
  },
  {
    id: 'sv_nero',
    name: '네로 클라우디우스',
    nickname: '네로',
    title: '장미의 황제',
    rarity: 4,
    cls: 'Saber',
    limited: false,
    storyLocked: true,
    npType: 'Arts',
    npName: '라우스 세인트 클라우디우스',
    npSub: '초대받는 황금극장',
    atk: 9449, hp: 11753,
    art: { bg1: '#3b1018', bg2: '#d93644', hair: '#f7df6e', eye: '#3cd070', outfit: '#c91c2b', accent: '#ffd700', weapon: 'sword', motif: 'roses' },
    summonQuote: '우무! 짐이 바로 로마의 제5대 황제 네로 클라우디우스다! 소환에 응해 주었으니 마음껏 찬양하거라!',
    lines: [
      '우무! 황제의 노래를 듣고 싶다고? 좋아, 황금극장을 열어주마!',
      '장미빛 운명이 그대를 기다리고 있노라!',
      '세 번이나 부활하는 짐의 불굴의 정신을 본받도록!',
      '오오, 성배를 바치다니 훌륭한 로마 시민이로구나!',
      '그대는 짐의 최고로 사랑스러운 주자(奏者)다!'
    ]
  },
  {
    id: 'sv_stheno',
    name: '스테노',
    nickname: '레어프리즘 여신',
    title: '고르곤 세 자매 장녀',
    rarity: 4,
    cls: 'Assassin',
    limited: false,
    npType: 'Buster',
    npName: '스마일 오브 더 스테노',
    npSub: '여신의 미소',
    atk: 8985, hp: 11518,
    art: { bg1: '#23163b', bg2: '#a06cd5', hair: '#cfa6ff', eye: '#d980ff', outfit: '#f4eefc', accent: '#ffd700', weapon: 'orb', motif: 'roses' },
    summonQuote: '어머, 어새신 스테노랍니다. ……후훗, 왜 그렇게 절망적인 표정을 지으시는 걸까요? 설마 레어프리즘 취급하시는 건 아니겠죠?',
    lines: [
      '금테 어새신이라 빛코얀인 줄 아셨나요? 어머, 아쉽네요~ 후훗.',
      '저를 영기 변환(매각)하실 생각이라면 각오하시는 게 좋을 거예요?',
      '신성 서번트 버프만큼은 제가 최고랍니다.',
      '어머, 정말로 저한테 성배를 주신 거예요? 의외로 진심이시네요.',
      '후훗, 끝까지 저를 아껴주시니 특별히 축복을 내려드릴게요.'
    ]
  },
  {
    id: 'sv_siegfried',
    name: '지크프리트',
    nickname: '스마나이',
    title: '용살자',
    rarity: 4,
    cls: 'Saber',
    limited: false,
    npType: 'Buster',
    npName: '발뭉',
    npSub: '환상대검·천마실추',
    atk: 8181, hp: 14165,
    art: { bg1: '#132638', bg2: '#4d82a8', hair: '#d7dce5', eye: '#59b2ff', outfit: '#d2dae6', accent: '#4da6ff', weapon: 'greatsword', motif: 'dragon' },
    summonQuote: '서번트 세이버, 지크프리트다. ……픽업 대상이 아니라서, 정말 미안하다(스마나이).',
    lines: [
      '또 내가 나와서 미안하다… 하지만 용이 상대라면 누구에게도 지지 않는다!',
      '마스터, 가챠 결과가 안 좋더라도 너무 자책하지 마라.',
      '발뭉의 일격으로 적을 베어주지.',
      '내게 성배를? 황송하군… 기대에 반드시 보답하겠다.',
      '너와 함께 싸울 수 있어서 진심으로 기쁘다.'
    ]
  },
  {
    id: 'sv_tristan',
    name: '트리스탄',
    nickname: '트리스탄',
    title: '비애의 기사',
    rarity: 4,
    cls: 'Archer',
    limited: false,
    storyLocked: true,
    npType: 'Quick',
    npName: '페일 노트',
    npSub: '통곡하는 환상의 활',
    atk: 9735, hp: 11637,
    art: { bg1: '#2b121c', bg2: '#9c2d4a', hair: '#d9364e', eye: '#ff8a8a', outfit: '#ebeef5', accent: '#e03e52', weapon: 'harp', motif: 'notes' },
    summonQuote: '원탁의 기사 트리스탄. 아아… 성정석이 사라지는 소리가 들립니다. 정말 슬프군요…',
    lines: [
      '아아, 슬픕니다… 마스터의 통장이 텅 비어가는 소리가 들립니다.',
      '눈을 감고 있지만, 사실 저는 다 보고 있답니다.',
      '하프 선율로 아군을 지켜드리죠. 회피 부여는 제 특기입니다.',
      '성배를 주시다니… 기쁨에 눈물이 흐르는군요.',
      '당신의 곁이라면 더 이상 슬픈 노래만 부르지 않아도 되겠군요.'
    ]
  },

  // ================= 3★ SERVANTS =================
  {
    id: 'sv_cu',
    name: '쿠 훌린',
    nickname: '창밥/형님',
    title: '얼스터의 빛의 황자',
    rarity: 3,
    cls: 'Lancer',
    limited: false,
    npType: 'Quick',
    npName: '게 볼그',
    npSub: '꿰뚫는 사극의 창',
    atk: 7239, hp: 9593,
    art: { bg1: '#0e2347', bg2: '#2d68c4', hair: '#2e5cb8', eye: '#ff4757', outfit: '#1b3e82', accent: '#ff3b5c', weapon: 'spear', motif: 'lightning' },
    summonQuote: '어이, 랜서 클래스로 소환됐다. 쿠 훌린이야! 뭐, 금테는 아니지만 나 하나 있으면 웬만해선 안 죽는다고!',
    lines: [
      '야, 3성이라고 무시하지 마라! 화살막이의 가호로 끝까지 살아남는 건 나라고!',
      '오늘 낚시 갈 건데 같이 갈래? 가챠 운도 낚시처럼 기다려야 해.',
      '어이구, 또 폭사했냐? 자, 힘내라고 마스터!',
      '오, 3성한테 성배를 박아주다니 안목이 대단한데?!',
      '형님만 믿어! 네가 쓰러질 때까지 내가 최전선에서 버텨줄게.'
    ]
  },
  {
    id: 'sv_ushiwaka',
    name: '우시와카마루',
    nickname: '우시와카',
    title: '천재 병법가',
    rarity: 3,
    cls: 'Rider',
    limited: false,
    npType: 'Quick',
    npName: '단노우라·팔척뛰기',
    npSub: '단노우라 핫소우토비',
    atk: 7076, hp: 9028,
    art: { bg1: '#1a1830', bg2: '#5c4b8a', hair: '#1d1d26', eye: '#a67cff', outfit: '#2e2442', accent: '#ff5277', weapon: 'katana', motif: 'sakura' },
    summonQuote: '주군! 우시와카마루, 부름에 응해 달려왔습니다! 적장의 목을 베어올 테니 칭찬해 주십시오!',
    lines: [
      '주군! 저를 쓰다듬어 주십시오! 쓰다듬어 주시면 뭐든 할 수 있습니다!',
      '단일 퀵 보구 화력만큼은 5성 부럽지 않습니다!',
      '폭사하셨다고요? 그렇다면 가챠 기계의 목을… 아, 안 되나요?',
      '주군께서 주신 성배! 평생의 보물로 삼겠습니다!',
      '주군을 위해서라면 목숨도 아깝지 않습니다!'
    ]
  },
  {
    id: 'sv_xu_fu',
    name: '서복',
    nickname: '서복',
    title: '불로불사의 방술사',
    rarity: 3,
    cls: 'AlterEgo',
    limited: false,
    npType: 'Arts',
    npName: '불로불사 선약·진',
    npSub: '우미인 찬가',
    atk: 6996, hp: 10200,
    art: { bg1: '#2e1526', bg2: '#a64d79', hair: '#3b242e', eye: '#ff70a6', outfit: '#a62639', accent: '#f5d76e', weapon: 'charm', motif: 'stars' },
    summonQuote: '얼터에고, 서복이야~ 3성인데 성능은 5성급 아츠 서포터라고! 뭐, 우미인 님이 제일 최고지만~',
    lines: [
      '우미인 님 인형 만들기 바쁜데 불렀어? 뭐, 아츠 버프랑 NP 30% 정도는 줄게~',
      '3성 서번트 중에서 내가 제일 알짜배기인 거 알지?',
      '가챠 폭사했다고? 불로불사의 약이라도 한 잔 마시고 힘내!',
      '에엑?! 나한테 성배를?! 우미인 님 다음으로 좋아해 줄게!',
      '의외로 마스터도 착하네. 앞으로도 편하게 불러줘~'
    ]
  },
  {
    id: 'sv_robin',
    name: '로빈 후드',
    nickname: '로빈',
    title: '숲의 의적',
    rarity: 3,
    cls: 'Archer',
    limited: false,
    npType: 'Arts',
    npName: '유 바우',
    npSub: '기도의 활',
    atk: 6715, hp: 10187,
    art: { bg1: '#10291c', bg2: '#357a4a', hair: '#7a5230', eye: '#52c468', outfit: '#215732', accent: '#c9e680', weapon: 'bow', motif: 'nature' },
    summonQuote: '어이쿠, 서번트 아처 로빈 후드요. 뭐, 은테라서 미안하지만 독 특공 화력 하나는 끝내준다고.',
    lines: [
      '야, 나한테 너무 많은 걸 기대하지 마. 난 그냥 평범한 숲지기니까.',
      '독 걸고 유 바우 한 방이면 보스도 한 방에 간다고!',
      '가챠는 적당히 해둬, 마스터. 지갑이 울고 있잖아.',
      '허어, 내게 성배라니… 이거 참 거절하기 어렵게 만드네.',
      '뭐, 너랑 일하는 건 꽤 즐거웠어. 앞으로도 잘 부탁해.'
    ]
  },
  {
    id: 'sv_medusa',
    name: '메두사',
    nickname: '라이더',
    title: '안대의 괴물',
    rarity: 3,
    cls: 'Rider',
    limited: false,
    npType: 'Quick',
    npName: '벨레로폰',
    npSub: '기영의 고삐',
    atk: 7200, hp: 8937,
    art: { bg1: '#1d122e', bg2: '#6b3b8c', hair: '#9b59b6', eye: '#ff5277', outfit: '#211c2b', accent: '#d980ff', weapon: 'chains', motif: 'mist' },
    summonQuote: '서번트 라이더, 메두사입니다. ……제 키가 조금 크더라도 신경 쓰지 말아 주세요.',
    lines: [
      '조용히 독서를 즐기고 싶군요. 아, 종화 던전이라면 바로 출격하겠습니다.',
      '언니(스테노)가 또 장난을 치셨나요? 대신 사과드리겠습니다.',
      '벨레로폰으로 깔끔하게 쓸어드리죠.',
      '저 같은 자에게 성배를… 감사합니다, 마스터.',
      '당신과 함께라면 괴물로서의 과거도 조금은 잊을 수 있습니다.'
    ]
  },
  {
    id: 'sv_bedivere',
    name: '베디비어',
    nickname: '베디',
    title: '은빛 팔의 기사',
    rarity: 3,
    cls: 'Saber',
    limited: false,
    storyLocked: true,
    npType: 'Buster',
    npName: '스위치 온·아가트람',
    npSub: '검을 잡으라, 은빛의 팔',
    atk: 7627, hp: 9595,
    art: { bg1: '#14233b', bg2: '#5a8cc4', hair: '#dce6f2', eye: '#8088ff', outfit: '#2e4a7d', accent: '#b8d8ff', weapon: 'sword', motif: 'light' },
    summonQuote: '원탁의 기사 베디비어입니다! 은빛 팔이 부서지는 한이 있더라도 마스터를 지켜내겠습니다!',
    lines: [
      '스토리 한정인데 보구 5레벨 찍어주실 건가요?! 감사합니다!',
      '아르토리아 왕께서도 건강해 보이셔서 다행입니다.',
      '성정석을 너무 무리해서 쓰지 마시길… 제가 곁에서 돕겠습니다.',
      '성배를 하사하시다니! 기사의 맹세를 걸고 보답하겠습니다!',
      '당신과 함께한 여정은 제 생애 최고의 자랑입니다.'
    ]
  },
  {
    id: 'sv_euryale',
    name: '에우리알레',
    nickname: '에우리',
    title: '고르곤 세 자매 차녀',
    rarity: 3,
    cls: 'Archer',
    limited: false,
    npType: 'Arts',
    npName: '아이 오브 더 에우리알레',
    npSub: '여신의 시선',
    atk: 7032, hp: 9506,
    art: { bg1: '#291438', bg2: '#b366cc', hair: '#d9a6ff', eye: '#ff80bf', outfit: '#f4eefc', accent: '#ff99cc', weapon: 'bow', motif: 'roses' },
    summonQuote: '후훗, 여신 에우리알레야. 남성 보스 상대라면 나한테 맡겨둬!',
    lines: [
      '가웨인? 남성이라면 누구든 내 화살 한 방에 꼼짝 못 해!',
      '스테노 언니랑 헷갈리지 마. 나는 아처라고!',
      '폭사해서 우울해? 그럼 내 귀여운 얼굴 보고 기운 내!',
      '어머, 성배? 당연히 나한테 바쳐야지!',
      '인간 치고는 꽤 마음에 들어. 특별히 곁에 있어 줄게.'
    ]
  },
  {
    id: 'sv_kiyohime',
    name: '키요히메',
    nickname: '키요히',
    title: '사랑의 화신',
    rarity: 3,
    cls: 'Berserker',
    limited: false,
    npType: 'Buster',
    npName: '전신화생삼매',
    npSub: '텐신카쇼우잔마이',
    atk: 6644, hp: 9166,
    art: { bg1: '#152b30', bg2: '#3db3a8', hair: '#80e5db', eye: '#ffd000', outfit: '#1c4d54', accent: '#ff5252', weapon: 'fan', motif: 'flames' },
    summonQuote: '서번트 버서커, 키요히메랍니다! 마스터… 혹시 다른 여자 서번트 뽑으려고 가챠 돌리신 건 아니죠? 거짓말은 안 돼요♥',
    lines: [
      '마스터~ 저 말고 다른 5성 노리신 거 아니죠? 종이 울리기 전에 솔직히 말하세요♥',
      '후훗, 3성이라서 자주 찾아뵐 수 있어 기뻐요!',
      '거짓말쟁이는 용서 못 해요. 폭사하셔도 제 곁에 계시면 돼요!',
      '성배?! 저와의 결혼 선물인가요?! 기뻐요!!',
      '마스터, 영원히 함께 불타올라요♥'
    ]
  },
  {
    id: 'sv_izok',
    name: '오카다 이조',
    nickname: '이조',
    title: '인참 이조',
    rarity: 3,
    cls: 'Assassin',
    limited: true,
    npType: 'Arts',
    npName: '시말검',
    npSub: '시마츠켄',
    atk: 6879, hp: 8844,
    art: { bg1: '#1a1d24', bg2: '#4d5d73', hair: '#2e3440', eye: '#ff6b6b', outfit: '#2b3242', accent: '#e03e52', weapon: 'katana', motif: 'swords' },
    summonQuote: '와시가 어새신 오카다 이조다! 뭐? 3성이라고? 인간형 상대라면 와시 검이 천하제일이다!',
    lines: [
      '크하하! 술이나 한 잔 가져와라, 마스터! 폭사한 거 잊게 해주마!',
      '료마 녀석 안 보이냐? 보이면 바로 말해라!',
      '와시는 천재 검객이라고! 보구 5레벨 만들어 둬라!',
      '오오! 와시한테 성배를?! 역시 보는 눈이 있구만!',
      '뭐… 네 곁에 있으면 술맛이 꽤 괜찮더군.'
    ]
  },
  {
    id: 'sv_salieri',
    name: '안토니오 살리에리',
    nickname: '살리에리',
    title: '회색의 남자',
    rarity: 3,
    cls: 'Avenger',
    limited: false,
    storyLocked: true,
    npType: 'Arts',
    npName: '디오 산티시모 미제리코르디아 데 미',
    npSub: '지극히 거룩하신 신이여, 나를 불쌍히 여기소서',
    atk: 8125, hp: 7745,
    art: { bg1: '#12121a', bg2: '#4a4e69', hair: '#cbd5e1', eye: '#ff4757', outfit: '#181822', accent: '#94a3b8', weapon: 'notes', motif: 'notes' },
    summonQuote: '어벤저, 안토니오 살리에리… 아마데우스… 아니, 마스터여. 나의 저주받은 선율이 필요하다면 연주하리다.',
    lines: [
      '은테 어벤저 카드가 뒤집혔을 때의 전율… 나쁘지 않군.',
      '폭사의 레퀴엠을 연주해 드릴까요… 아, 싫으시다면 그만두죠.',
      '아츠 시스템에서 3성 어벤저의 저력을 보여드리겠습니다.',
      '성배를… 이런 내게 맡긴단 말인가. 고맙다.',
      '네 지휘 아래에서는, 나의 음악도 조금은 구원받는 기분이 드는군.'
    ]
  },
  {
    id: 'sv_mandricardo',
    name: '만드리카르도',
    nickname: '마이프렌드',
    title: '타타르의 왕',
    rarity: 3,
    cls: 'Rider',
    limited: false,
    npType: 'Arts',
    npName: '세르망 드 뒤랑달',
    npSub: '불멸의 검의 맹세',
    atk: 7138, hp: 9240,
    art: { bg1: '#1c2433', bg2: '#527099', hair: '#4a3b32', eye: '#70a1ff', outfit: '#2e384d', accent: '#ff9f43', weapon: 'sword', motif: 'stars' },
    summonQuote: '라이더, 만드리카르도입니다… 아, 3성이라 죄송해요. 금테 기대하셨죠… 저라도 괜찮으시면 잘 부탁드려요!',
    lines: [
      '저, 정말 저를 마이룸에 세워두셔도 되는 건가요?! 부담스럽지만… 기뻐요!',
      '폭사하셨나요…? 저도 운이 없는 편이라 그 기분 잘 알아요, 마이 프렌드.',
      '아츠 단일 라이더가 필요할 땐 불러주세요. 목검이라도 최선을 다할게요!',
      '에에엑?! 성배를 저한테요?! 잠깐, 진정하자 나!',
      '마스터… 아니, 마이 프렌드. 당신 덕분에 여기 있어도 좋다는 생각이 들어요.'
    ]
  },
  {
    id: 'sv_cu_caster',
    name: '쿠 훌린 [캐스터]',
    nickname: '캐훌린',
    title: '룬의 대마술사',
    rarity: 3,
    cls: 'Caster',
    limited: false,
    storyLocked: true,
    npType: 'Buster',
    npName: '위커맨',
    npSub: '불타오르는 불꽃의 우리',
    atk: 6580, hp: 9604,
    art: { bg1: '#1e1c33', bg2: '#4d60a8', hair: '#2e5cb8', eye: '#ff5252', outfit: '#242b47', accent: '#ff924c', weapon: 'staff', motif: 'flames' },
    summonQuote: '여어, 이번엔 캐스터로 왔다! 쿠 훌린이야. 빛코얀이랑 같이 쓰면 5성 못지않은 버스터 주회 요원이라고!',
    lines: [
      '캐스터 클래스라도 근접전은 지지 않는다고!',
      '오딘의 룬으로 행운을 빌어줄게. 다음 11연차 가보자고!',
      '위커맨으로 싹 태워버리면 속이 다 시원하지.',
      '성배? 오, 화력이 확 올라가겠는데!',
      '랜서든 캐스터든, 네가 부르면 언제든 달려와 줄게.'
    ]
  }
];

// 개념예장 데이터베이스 (5성, 4성, 3성 — 공식 FGO 한그오 등급·명칭 100% 일치)
const CRAFT_ESSENCES = [
  // ================= 5★ CE =================
  {
    id: 'ce_kscope',
    name: '컬라이더스코프',
    nickname: '젤릿치',
    rarity: 5,
    effect: '자신의 NP를 80% 차지한 상태로 배틀 개시 (풀돌 100%)',
    flavor: '평행세계를 넘나드는 제2마법의 대가. 주회 마스터들의 영원한 꿈.',
    art: { bg1: '#1b1038', bg2: '#7a2e9e', primary: '#f5d76e', secondary: '#ff4d6d', icon: 'prism' }
  },
  {
    id: 'ce_black_grail',
    name: '검은 성배',
    nickname: '흑성배',
    rarity: 5,
    effect: '자신의 보구 위력 60% 업(풀돌 80%) & 매 턴 HP 500 감소',
    flavor: '압도적인 파괴력을 대가로 영혼을 갉아먹는 저주받은 성배.',
    art: { bg1: '#1c0810', bg2: '#751028', primary: '#ff3b5c', secondary: '#240b14', icon: 'grail' }
  },
  {
    id: 'ce_2030',
    name: '2030년의 조각',
    nickname: '2030',
    rarity: 5,
    effect: '자신에게 매 턴 스타 8개 획득 상태 부여 (풀돌 10개)',
    flavor: '별빛이 쏟아지는 전뇌 공간의 조각. 크리티컬 파티의 필수품.',
    art: { bg1: '#0c2338', bg2: '#2d7fa8', primary: '#70f3ff', secondary: '#ffffff', icon: 'stars' }
  },
  {
    id: 'ce_prisma',
    name: '프리즈마 코스모스',
    nickname: '프리즈마',
    rarity: 5,
    effect: '자신에게 매 턴 NP 8% 획득 상태 부여',
    flavor: '무한한 마력이 흐르는 마법 소녀의 지팡이.',
    art: { bg1: '#30112b', bg2: '#d9538f', primary: '#ff9ec9', secondary: '#ffe680', icon: 'wand' }
  },
  {
    id: 'ce_formalcraft',
    name: '포멀 크래프트',
    nickname: '포멀',
    rarity: 5,
    effect: '자신의 Arts 카드 성능 25% 업 (풀돌 30%)',
    flavor: '정통 마술사의 자부심이 담긴 붉은 보석 마술.',
    art: { bg1: '#2e0e14', bg2: '#a62639', primary: '#ff5277', secondary: '#ffd700', icon: 'gem' }
  },
  {
    id: 'ce_limited_zero',
    name: '리미티드/제로오버',
    nickname: '리미제로',
    rarity: 5,
    effect: '자신의 Buster 카드 성능 25% 업 (풀돌 30%)',
    flavor: '강철의 의지를 투영하는 검사의 극치.',
    art: { bg1: '#33160c', bg2: '#c94b28', primary: '#ff924c', secondary: '#ffe066', icon: 'sword' }
  },
  {
    id: 'ce_imaginary_around',
    name: '이매지너리 어라운드',
    nickname: '이매지너리',
    rarity: 5,
    effect: '자신의 Quick 카드 성능 25% 업 (풀돌 30%)',
    flavor: '보랏빛 리본이 춤추는 허수 마술의 완성형.',
    art: { bg1: '#1d1033', bg2: '#6b3fa0', primary: '#d980ff', secondary: '#ffb3d9', icon: 'ribbon' }
  },
  {
    id: 'ce_heavens_feel',
    name: '헤븐스 필',
    nickname: '헤븐스필',
    rarity: 5,
    effect: '자신의 보구 위력 40% UP (풀돌 50%)',
    flavor: '성배의 그릇이 품은 제3마법의 기적.',
    art: { bg1: '#181438', bg2: '#5f4bb6', primary: '#fff0a6', secondary: '#a8dcff', icon: 'grail' }
  },

  // ================= 4★ CE =================
  {
    id: 'ce_magical_sapphire',
    name: '아발론 셀러브레이트',
    nickname: '아발론 예장',
    rarity: 4,
    effect: '자신의 NP 획득량 15% UP & 크리티컬 위력 15% UP',
    flavor: '아발론의 축복을 담은 공식 4성 기념 예장.',
    art: { bg1: '#102447', bg2: '#4d94ff', primary: '#ffe680', secondary: '#70f3ff', icon: 'crown' }
  },
  {
    id: 'ce_imaginary_element',
    name: '허수마술',
    nickname: '허수',
    rarity: 4,
    effect: '자신의 NP를 60% 차지한 상태로 배틀 개시 (풀돌 75%)',
    flavor: '젤릿치가 없는 마스터들의 든든한 희망.',
    art: { bg1: '#231438', bg2: '#7a44a8', primary: '#d9a6ff', secondary: '#ff70a6', icon: 'ribbon' }
  },
  {
    id: 'ce_necromancy',
    name: '사령마술',
    nickname: '사령마술',
    rarity: 4,
    effect: '자신에게 확률로 거츠 상태 부여 (확률 50%)',
    flavor: '운이 좋으면 10번 연속 부활하는 전설의 도박 예장.',
    art: { bg1: '#141e21', bg2: '#3b6b5c', primary: '#70ff8d', secondary: '#cbd5e1', icon: 'skull' }
  },
  {
    id: 'ce_projection',
    name: '투영마술',
    nickname: '투영',
    rarity: 4,
    effect: '자신의 Arts 카드 성능 15% 업',
    flavor: '머릿속의 이미지를 현실에 빚어내는 마술.',
    art: { bg1: '#10243d', bg2: '#3675b8', primary: '#70e0ff', secondary: '#ffffff', icon: 'sword' }
  },
  {
    id: 'ce_verdant',
    name: '신록의 파음',
    nickname: '신록파음',
    rarity: 4,
    effect: '자신의 Buster 카드 성능 15% 업',
    flavor: '바람을 가르는 선율처럼 가벼운 일격.',
    art: { bg1: '#102b22', bg2: '#2e8c68', primary: '#75f0b8', secondary: '#fff5b8', icon: 'wind' }
  },
  {
    id: 'ce_iron_willed',
    name: '강철의 단련',
    nickname: '강철단련',
    rarity: 4,
    effect: '자신의 방어력 15% 업',
    flavor: '어떤 폭사에도 흔들리지 않는 마스터의 멘탈처럼 단단하다.',
    art: { bg1: '#261a14', bg2: '#8c532e', primary: '#ffbe76', secondary: '#e2e8f0', icon: 'shield' }
  },
  {
    id: 'ce_be_elegant',
    name: '우아하라',
    nickname: '우아하라',
    rarity: 4,
    effect: '자신의 스타 발생률 25% 업',
    flavor: '언제나 품격을 잃지 않는 것이 마술사의 도리.',
    art: { bg1: '#2b1024', bg2: '#9c2d64', primary: '#ff9ec9', secondary: '#ffd700', icon: 'gem' }
  },
  {
    id: 'ce_knights_dignity',
    name: '기사의 긍지',
    nickname: '기사긍지',
    rarity: 4,
    effect: '크리티컬 위력 40% 업 & 방어력 20% 다운',
    flavor: '방어를 버리고 오직 일격에 모든 것을 건다.',
    art: { bg1: '#1e1b33', bg2: '#5a528c', primary: '#ffe066', secondary: '#ff6b6b', icon: 'sword' }
  },
  {
    id: 'ce_golden_millennium',
    name: '천년 황금수',
    nickname: '천년수',
    rarity: 4,
    effect: '매 턴 자신의 최대 HP 200 업',
    flavor: '천 년의 세월을 버텨낸 황금빛 고목.',
    art: { bg1: '#2b200e', bg2: '#a87d28', primary: '#ffe680', secondary: '#a8e670', icon: 'crown' }
  },
  {
    id: 'ce_gandr',
    name: '간드',
    nickname: '간드',
    rarity: 4,
    effect: '자신의 Quick 카드 성능 15% UP',
    flavor: '북유럽의 저주 마술. 공식 4성 Quick 성능 강화 예장.',
    art: { bg1: '#260d1f', bg2: '#7a2159', primary: '#ff66b3', secondary: '#240c1c', icon: 'skull' }
  },

  // ================= 3★ CE (전설의 밈 예장 포함!) =================
  {
    id: 'ce_mapo_tofu',
    name: '아주 매운 마파두부',
    nickname: '마파두부',
    rarity: 3,
    effect: '자신의 HP 회복량 10% 업 (정신적 데미지 +999%)',
    flavor: '「먹을 텐가?」 — 폭사할 때마다 어김없이 찾아오는 신부의 은총.',
    art: { bg1: '#3b0c0c', bg2: '#b82818', primary: '#ff5233', secondary: '#fff5e0', icon: 'tofu' }
  },
  {
    id: 'ce_black_keys_red',
    name: '적색 흑건',
    nickname: '적흑건',
    rarity: 3,
    effect: '자신의 Buster 카드 성능 8% 업',
    flavor: '성당교회 대행자의 기본 무장. 가챠 창고를 채우는 단골 손님.',
    art: { bg1: '#2e0e14', bg2: '#7a212b', primary: '#ff6b6b', secondary: '#cbd5e1', icon: 'keys' }
  },
  {
    id: 'ce_black_keys_blue',
    name: '청색 흑건',
    nickname: '청흑건',
    rarity: 3,
    effect: '자신의 Arts 카드 성능 8% 업',
    flavor: '차분한 푸른 빛을 띠는 흑건. 오늘도 11연차에 3개씩 나온다.',
    art: { bg1: '#0e1d36', bg2: '#28528a', primary: '#66b3ff', secondary: '#cbd5e1', icon: 'keys' }
  },
  {
    id: 'ce_black_keys_green',
    name: '녹색 흑건',
    nickname: '녹흑건',
    rarity: 3,
    effect: '자신의 Quick 카드 성능 8% 업',
    flavor: '민첩한 투척을 돕는 녹색 흑건. 마나프리즘의 재료로 사랑받는다.',
    art: { bg1: '#0e2b1d', bg2: '#26754d', primary: '#6bffa8', secondary: '#cbd5e1', icon: 'keys' }
  },
  {
    id: 'ce_dragon_meridian',
    name: '용맥',
    nickname: '용맥',
    rarity: 3,
    effect: '자신의 NP를 30% 차지한 상태로 개시 (풀돌 50%)',
    flavor: '3성 예장 중 유일하게 실전 투입되는 뉴비들의 영원한 친구.',
    art: { bg1: '#102930', bg2: '#2e808c', primary: '#70f3ff', secondary: '#ffe066', icon: 'prism' }
  },
  {
    id: 'ce_azoth',
    name: '아조트 검',
    nickname: '아조트',
    rarity: 3,
    effect: '자신의 방어력 3% 업',
    flavor: '마술사 가문의 성인식 기념 단검. 가챠에서 나오면 기분이 묘하다.',
    art: { bg1: '#1d1d2b', bg2: '#525275', primary: '#cbd5e1', secondary: '#ff5277', icon: 'sword' }
  },
  {
    id: 'ce_ryuudou',
    name: '류도지',
    nickname: '류도지',
    rarity: 3,
    effect: 'NP 30% 차지 & 보구 위력 15% 업',
    flavor: '후유키시 엔조산 꼭대기의 고즈넉한 사찰.',
    art: { bg1: '#1a232e', bg2: '#4d657a', primary: '#ffe066', secondary: '#94a3b8', icon: 'gate' }
  },
  {
    id: 'ce_clock_tower',
    name: '시계탑',
    nickname: '시계탑',
    rarity: 3,
    effect: '마스터 경험치 +50',
    flavor: '런던 지하에 위치한 마술협회의 총본산.',
    art: { bg1: '#211c29', bg2: '#635375', primary: '#f5d76e', secondary: '#e2e8f0', icon: 'clock' }
  },
  {
    id: 'ce_leyline_jewel',
    name: '마력계',
    nickname: '마력계',
    rarity: 3,
    effect: 'NP 획득량 10% 업',
    flavor: '마력의 흐름을 측정하는 고전 마술 예장.',
    art: { bg1: '#14262b', bg2: '#386e75', primary: '#80ffea', secondary: '#ffd700', icon: 'gem' }
  },
  {
    id: 'ce_rin_pendant',
    name: '린의 펜던트',
    nickname: '펜던트',
    rarity: 3,
    effect: '자신의 크리티컬 위력 15% UP',
    flavor: '토오사카 가문의 마력이 담긴 붉은 보석 펜던트.',
    art: { bg1: '#2e0e14', bg2: '#9c2233', primary: '#ff5c77', secondary: '#ffd700', icon: 'gem' }
  }
];

// 픽업 배너 목록
const BANNERS = [
  {
    id: 'bn_castoria',
    title: '아발론 르 페이 픽업 소환',
    subtitle: '인권 1순위 아츠 서포터! 예언의 아이 강림',
    tag: '기간 한정',
    theme: ['#12275c', '#2d68d9', '#f5d76e'],
    pickup5: ['sv_castoria'],
    pickup4: ['sv_barghest', 'sv_baobhan'],
    pickupCE5: ['ce_heavens_feel'],
    isStory: false,
    quote: '「너의 별을 모으는 검 — 아발론의 별이 마스터를 비춥니다.」'
  },
  {
    id: 'bn_oberon',
    title: '요정국 브리튼 종막 픽업',
    subtitle: '보구 위력 2배 증폭! 요정왕 오베론 등장',
    tag: '기간 한정',
    theme: ['#101336', '#3d4ea8', '#8ce8ff'],
    pickup5: ['sv_oberon'],
    pickup4: ['sv_percival', 'sv_tristan'],
    pickupCE5: ['ce_2030'],
    isStory: false,
    quote: '「한여름 밤의 꿈, 그 마지막 페이지를 열어볼까?」'
  },
  {
    id: 'bn_morgan',
    title: '이문대의 여왕 모르간 픽업',
    subtitle: '브리튼의 절대 군주, 최강 버서커 대군 보구',
    tag: '기간 한정',
    theme: ['#1a0f2e', '#4c67a6', '#a8dcff'],
    pickup5: ['sv_morgan'],
    pickup4: ['sv_barghest', 'sv_baobhan'],
    pickupCE5: ['ce_black_grail'],
    isStory: false,
    quote: '「나의 반려여, 내게 걸맞은 성정석을 바치도록.」'
  },
  {
    id: 'bn_gilgamesh',
    title: '바빌론의 영웅왕 복각 픽업',
    subtitle: '서번트 특공의 절대 강자, 길가메시 강림',
    tag: '복각 픽업',
    theme: ['#3b1212', '#b87d1a', '#ffdf4d'],
    pickup5: ['sv_gilgamesh'],
    pickup4: ['sv_emiya', 'sv_gil_caster'],
    pickupCE5: ['ce_kscope'],
    isStory: false,
    quote: '「후하하하! 잡종이여, 천장 칠 각오는 되어 있느냐!」'
  },
  {
    id: 'bn_arcueid',
    title: '7주년 기념 아키타입: 어스 픽업',
    subtitle: '즉시 NP 100% 차지! 진조의 공주 알퀘이드',
    tag: '기념 한정',
    theme: ['#1a103b', '#9c7830', '#fff0a6'],
    pickup5: ['sv_arcueid'],
    pickup4: ['sv_nero', 'sv_helena'],
    pickupCE5: ['ce_heavens_feel'],
    isStory: false,
    quote: '「달이 참 예쁘네! 천년성으로 초대할게, 마스터!」'
  },
  {
    id: 'bn_koyanskaya',
    title: 'NFF 서비스 빛의 코얀스카야 픽업',
    subtitle: '버스터 시스템의 핵심! 최강 버스터 서포터',
    tag: '기간 한정',
    theme: ['#2e0c21', '#a62e62', '#ffb3d1'],
    pickup5: ['sv_koyanskaya'],
    pickup4: ['sv_heracles', 'sv_lancelot_z'],
    pickupCE5: ['ce_kscope'],
    isStory: false,
    quote: '「고객님의 성정석, 최고의 화력으로 보답해 드릴게요♥」'
  },
  {
    id: 'bn_melusine',
    title: '요정기사 멜뤼진 픽업 소환',
    subtitle: '단일·대군 전환 최강의 용! 멜뤼진 등장',
    tag: '기간 한정',
    theme: ['#0c2040', '#2a8ab8', '#70f3ff'],
    pickup5: ['sv_melusine'],
    pickup4: ['sv_percival', 'sv_siegfried'],
    pickupCE5: ['ce_black_grail'],
    isStory: false,
    quote: '「최강의 용이 당신의 부름에 답했어. 기대해도 좋아.」'
  },
  {
    id: 'bn_jalter_dantes',
    title: '어벤저 다크 플레임 픽업',
    subtitle: '용의 마녀 흑잔 & 암굴왕 더블 어벤저 픽업',
    tag: '스페셜',
    theme: ['#1e0814', '#6b1838', '#ff4769'],
    pickup5: ['sv_jalter', 'sv_dantes'],
    pickup4: ['sv_emiya', 'sv_astolfo'],
    pickupCE5: ['ce_2030'],
    isStory: false,
    quote: '「기다려라, 그리고 희망을 가져라 — 복수의 불꽃과 함께!」'
  },
  {
    id: 'bn_muramasa',
    title: '신년 기념 센지 무라마사 픽업',
    subtitle: '무원검제 아츠 대군 세이버, 무라마사 등장',
    tag: '기간 한정',
    theme: ['#2b0e0b', '#a83820', '#ffae42'],
    pickup5: ['sv_muramasa'],
    pickup4: ['sv_emiya', 'sv_siegfried'],
    pickup3: ['sv_izok'],
    pickupCE5: ['ce_limited_zero'],
    isStory: false,
    quote: '「일생일대의 한 자루, 지금 여기서 벼려주지!」'
  },
  {
    id: 'bn_custom',
    title: '커스텀 픽업 소환 (최애 저격)',
    subtitle: '전체 475기 중 원하는 ★5 & ★4 서번트를 직접 지정해 330연 천장으로 소환!',
    tag: '커스텀 픽업',
    theme: ['#2b1046', '#7b2cbf', '#ffd166'],
    pickup5: ['sv_no_444'],
    pickup4: ['sv_no_003'],
    pickupCE5: ['ce_kscope'],
    isStory: false,
    isCustom: true,
    quote: '「칼데아 소환식 커스텀 모드 — 당신이 원하는 영령의 좌를 직접 조준하십시오.」'
  },
  {
    id: 'bn_fp',
    title: '프렌드 포인트 소환 (★0~★3 · 앙리마유)',
    subtitle: '프렌드 포인트로 ★1~★3 영령·세이버 릴리·하베트롯·전설의 ★0 앙리마유 소환!',
    tag: '프렌드 가챠',
    theme: ['#122922', '#2d6a4f', '#95d5b2'],
    pickup5: ['sv_no_107'],
    pickup4: ['sv_no_004', 'sv_no_315'],
    pickupCE5: [],
    isStory: false,
    isFP: true,
    quote: '「인연이 이어주는 소환 — 극소 확률로 별이 없는 흑성배의 저주(★0)가 강림합니다.」'
  },
  {
    id: 'bn_story',
    title: '스토리 소환 (상시 · 스토리 해금)',
    subtitle: '쿠 훌린(얼터)·네로·베디비어·살리에리 등 스토리 해금 환상종 42기 전원 포함!',
    tag: '스토리 소환',
    theme: ['#101830', '#293d6b', '#a8c4ff'],
    pickup5: [],
    pickup4: [],
    pickupCE5: [],
    isStory: true,
    quote: '「경고: 스토리 소환에는 픽업도 천장도 없습니다. 진정한 용자만 도전하십시오.」'
  }
];

// ================= FGO 전체 마테리얼 서번트(No.001~487) 통합 하이드레이션 =================
(() => {
  if (typeof SERVANT_CATALOG_COMPACT === 'undefined' || !Array.isArray(SERVANT_CATALOG_COMPACT)) return;

  const legacyById = Object.fromEntries(SERVANTS.map(s => [s.id, s]));
  const cardFull = { Q: 'Quick', A: 'Arts', B: 'Buster' };

  function makeFallbackArt(cls, seed) {
    const info = CLASS_INFO[cls] || CLASS_INFO.Saber;
    const h = (seed * 47) % 360;
    return {
      bg1: '#0e172e',
      bg2: info.color || `hsl(${h}, 55%, 38%)`,
      hair: `hsl(${(h + 140) % 360}, 65%, 78%)`,
      eye: info.accent || '#70e0ff',
      outfit: '#1c2541',
      accent: info.color || '#ffe680',
      weapon: 'sword',
      motif: 'stars'
    };
  }

  const expanded = SERVANT_CATALOG_COMPACT.map(c => {
    const legacy = legacyById[c.id];
    const cards = c.cards.split('').map(ch => cardFull[ch] || 'Arts');
    const npType = cardFull[c.npT] || 'Buster';
    const clsKr = CLASS_INFO[c.cls]?.name || c.cls;
    const baseObj = legacy ? { ...legacy } : {
      id: c.id,
      name: c.name,
      nickname: c.name.length > 10 ? c.name.slice(0, 9) : c.name,
      title: c.note || POOL_LABELS[c.pool] || clsKr,
      rarity: c.r,
      cls: c.cls,
      npType,
      npName: c.npN || '보구',
      npSub: c.npS || '',
      atk: c.atk,
      hp: c.hp,
      art: makeFallbackArt(c.cls, c.no),
      summonQuote: `서번트 ${clsKr}, ${c.name}. 소환에 응해 칼데아에 찾아왔습니다. 잘 부탁드립니다, 마스터!`,
      lines: [
        `마스터, 오늘도 인리 수복을 위해 출격할 준비가 되어 있습니다.`,
        `칼데아에는 정말 많은 영령들이 모여 있군요. 흥미롭습니다.`,
        `보구 [${c.npN || '보구'}]의 진가는 전장에서 보여드리겠습니다.`,
        `인연이 깊어질수록 당신을 향한 신뢰도 커져갑니다, 마스터.`
      ]
    };

    baseObj.collectionNo = c.no;
    baseObj.atlasId = c.aid;
    baseObj.region = c.reg;
    baseObj.rarity = c.r;
    baseObj.cls = c.cls;
    baseObj.pool = c.pool;
    baseObj.fp = !!c.fp;
    baseObj.poolNote = c.note || POOL_LABELS[c.pool] || '';
    baseObj.limited = (c.pool === 'limited');
    baseObj.storyLocked = (c.pool === 'story');
    baseObj.atk = c.atk;
    baseObj.hp = c.hp;
    baseObj.attribute = c.attr;
    baseObj.cards = cards;
    baseObj.npType = npType;
    baseObj.npCat = c.npC;
    if (!legacy) {
      baseObj.npName = c.npN || baseObj.npName;
      baseObj.npSub = c.npS || '';
      baseObj.skills = c.sk;
    } else if (!baseObj.skills && c.sk) {
      baseObj.skills = c.sk;
    }
    if (c.asc) baseObj.customAsc = c.asc;
    if (c.face) baseObj.customFace = c.face;
    return baseObj;
  });

  // 공식 마테리얼 ID No. 순(001 → 487)으로 SERVANTS 교체!
  SERVANTS.length = 0;
  expanded.sort((a, b) => a.collectionNo - b.collectionNo).forEach(s => SERVANTS.push(s));
})();

const NPC_PROFILES = (typeof NPC_PROFILE_CATALOG !== 'undefined' && Array.isArray(NPC_PROFILE_CATALOG))
  ? NPC_PROFILE_CATALOG
  : [];

// 빠른 조회용 맵
const SERVANT_MAP = Object.fromEntries(SERVANTS.map(s => [s.id, s]));
const CE_MAP = Object.fromEntries(CRAFT_ESSENCES.map(c => [c.id, c]));
const BANNER_MAP = Object.fromEntries(BANNERS.map(b => [b.id, b]));
