// ============================================================
// FGO 가챠 시뮬레이터 - Atlas Academy 공식 게임 일러스트 URL 매핑
// Source: https://api.atlasacademy.io (KR GameData CDN)
// 자동 폴백: 오프라인이거나 이미지 로드 실패 시 프로시저럴 SVG 자동 표시
// ============================================================

const ATLAS_IMAGES = {
  "servants": {
    "sv_castoria": {
      "atlasId": 504500,
      "collectionNo": 284,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/504500/504500a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/504500/504500a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/504500/504500b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/504500/504500b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_5045000.png"
    },
    "sv_oberon": {
      "atlasId": 2800100,
      "collectionNo": 316,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/2800100/2800100a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/2800100/2800100a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/2800100/2800100b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/2800100/2800100b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_28001000.png"
    },
    "sv_morgan": {
      "atlasId": 704000,
      "collectionNo": 309,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/704000/704000a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/704000/704000a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/704000/704000b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/704000/704000b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_7040000.png"
    },
    "sv_gilgamesh": {
      "atlasId": 200200,
      "collectionNo": 12,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/200200/200200a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/200200/200200a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/200200/200200b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/200200/200200b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_2002000.png"
    },
    "sv_arcueid": {
      "atlasId": 2300500,
      "collectionNo": 351,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/2300500/2300500a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/2300500/2300500a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/2300500/2300500b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/2300500/2300500b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_23005000.png"
    },
    "sv_dantes": {
      "atlasId": 1100200,
      "collectionNo": 96,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/1100200/1100200a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/1100200/1100200a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/1100200/1100200b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/1100200/1100200b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_11002000.png"
    },
    "sv_koyanskaya": {
      "atlasId": 604200,
      "collectionNo": 314,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/604200/604200a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/604200/604200a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/604200/604200b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/604200/604200b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_6042000.png"
    },
    "sv_melusine": {
      "atlasId": 304800,
      "collectionNo": 312,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/304800/304800a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/304800/304800a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/304800/304800b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/304800/304800b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_3048000.png"
    },
    "sv_jalter": {
      "atlasId": 1100300,
      "collectionNo": 106,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/1100300/1100300a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/1100300/1100300a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/1100300/1100300b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/1100300/1100300b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_11003000.png"
    },
    "sv_muramasa": {
      "atlasId": 104900,
      "collectionNo": 302,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/104900/104900a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/104900/104900a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/104900/104900b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/104900/104900b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_1049000.png"
    },
    "sv_artoria": {
      "atlasId": 100100,
      "collectionNo": 2,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/100100/100100a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/100100/100100a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/100100/100100b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/100100/100100b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_1001000.png"
    },
    "sv_waver": {
      "atlasId": 501900,
      "collectionNo": 37,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/501900/501900a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/501900/501900a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/501900/501900b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/501900/501900b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_5019000.png"
    },
    "sv_enkidu": {
      "atlasId": 300800,
      "collectionNo": 143,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/300800/300800a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/300800/300800a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/300800/300800b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/300800/300800b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_3008000.png"
    },
    "sv_karna": {
      "atlasId": 300400,
      "collectionNo": 85,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/300400/300400a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/300400/300400a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/300400/300400b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/300400/300400b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_3004000.png"
    },
    "sv_jeanne": {
      "atlasId": 900100,
      "collectionNo": 59,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/900100/900100a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/900100/900100a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/900100/900100b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/900100/900100b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_9001000.png"
    },
    "sv_ozymandias": {
      "atlasId": 401200,
      "collectionNo": 118,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/401200/401200a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/401200/401200a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/401200/401200b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/401200/401200b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_4012000.png"
    },
    "sv_tamamo": {
      "atlasId": 500300,
      "collectionNo": 62,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/500300/500300a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/500300/500300a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/500300/500300b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/500300/500300b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_5003000.png"
    },
    "sv_jack": {
      "atlasId": 600500,
      "collectionNo": 75,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/600500/600500a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/600500/600500a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/600500/600500b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/600500/600500b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_6005000.png"
    },
    "sv_altrer": {
      "atlasId": 101800,
      "collectionNo": 8,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/101800/101800a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/101800/101800a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/101800/101800b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/101800/101800b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_1018000.png"
    },
    "sv_cu_alter": {
      "atlasId": 702000,
      "collectionNo": 98,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/702000/702000a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/702000/702000a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/702000/702000b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/702000/702000b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_7020000.png"
    },
    "sv_emiya": {
      "atlasId": 200100,
      "collectionNo": 11,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/200100/200100a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/200100/200100a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/200100/200100b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/200100/200100b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_2001000.png"
    },
    "sv_heracles": {
      "atlasId": 700100,
      "collectionNo": 47,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/700100/700100a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/700100/700100a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/700100/700100b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/700100/700100b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_7001000.png"
    },
    "sv_barghest": {
      "atlasId": 105000,
      "collectionNo": 310,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/105000/105000a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/105000/105000a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/105000/105000b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/105000/105000b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_1050000.png"
    },
    "sv_baobhan": {
      "atlasId": 204300,
      "collectionNo": 311,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/204300/204300a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/204300/204300a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/204300/204300b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/204300/204300b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_2043000.png"
    },
    "sv_percival": {
      "atlasId": 304700,
      "collectionNo": 313,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/304700/304700a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/304700/304700a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/304700/304700b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/304700/304700b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_3047000.png"
    },
    "sv_gil_caster": {
      "atlasId": 501800,
      "collectionNo": 145,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/501800/501800a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/501800/501800a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/501800/501800b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/501800/501800b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_5018000.png"
    },
    "sv_lancelot_z": {
      "atlasId": 700200,
      "collectionNo": 48,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/700200/700200a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/700200/700200a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/700200/700200b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/700200/700200b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_7002000.png"
    },
    "sv_helena": {
      "atlasId": 502300,
      "collectionNo": 100,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/502300/502300a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/502300/502300a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/502300/502300b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/502300/502300b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_5023000.png"
    },
    "sv_astolfo": {
      "atlasId": 400400,
      "collectionNo": 94,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/400400/400400a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/400400/400400a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/400400/400400b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/400400/400400b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_4004000.png"
    },
    "sv_nero": {
      "atlasId": 100500,
      "collectionNo": 5,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/100500/100500a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/100500/100500a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/100500/100500b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/100500/100500b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_1005000.png"
    },
    "sv_stheno": {
      "atlasId": 601000,
      "collectionNo": 41,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/601000/601000a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/601000/601000a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/601000/601000b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/601000/601000b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_6010000.png"
    },
    "sv_siegfried": {
      "atlasId": 100800,
      "collectionNo": 6,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/100800/100800a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/100800/100800a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/100800/100800b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/100800/100800b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_1008000.png"
    },
    "sv_tristan": {
      "atlasId": 200800,
      "collectionNo": 122,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/200800/200800a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/200800/200800a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/200800/200800b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/200800/200800b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_2008000.png"
    },
    "sv_cu": {
      "atlasId": 300100,
      "collectionNo": 17,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/300100/300100a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/300100/300100a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/300100/300100b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/300100/300100b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_3001000.png"
    },
    "sv_ushiwaka": {
      "atlasId": 401400,
      "collectionNo": 27,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/401400/401400a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/401400/401400a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/401400/401400b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/401400/401400b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_4014000.png"
    },
    "sv_xu_fu": {
      "atlasId": 1001400,
      "collectionNo": 352,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/1001400/1001400a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/1001400/1001400a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/1001400/1001400b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/1001400/1001400b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_10014000.png"
    },
    "sv_robin": {
      "atlasId": 200300,
      "collectionNo": 13,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/200300/200300a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/200300/200300a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/200300/200300b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/200300/200300b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_2003000.png"
    },
    "sv_medusa": {
      "atlasId": 400100,
      "collectionNo": 23,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/400100/400100a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/400100/400100a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/400100/400100b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/400100/400100b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_4001000.png"
    },
    "sv_bedivere": {
      "atlasId": 101200,
      "collectionNo": 126,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/101200/101200a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/101200/101200a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/101200/101200b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/101200/101200b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_1012000.png"
    },
    "sv_euryale": {
      "atlasId": 201200,
      "collectionNo": 15,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/201200/201200a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/201200/201200a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/201200/201200b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/201200/201200b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_2012000.png"
    },
    "sv_kiyohime": {
      "atlasId": 701300,
      "collectionNo": 56,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/701300/701300a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/701300/701300a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/701300/701300b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/701300/701300b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_7013000.png"
    },
    "sv_izok": {
      "atlasId": 603300,
      "collectionNo": 210,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/603300/603300a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/603300/603300a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/603300/603300b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/603300/603300b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_6033000.png"
    },
    "sv_salieri": {
      "atlasId": 1100600,
      "collectionNo": 204,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/1100600/1100600a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/1100600/1100600a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/1100600/1100600b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/1100600/1100600b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_11006000.png"
    },
    "sv_mandricardo": {
      "atlasId": 403900,
      "collectionNo": 273,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/403900/403900a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/403900/403900a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/403900/403900b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/403900/403900b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_4039000.png"
    },
    "sv_cu_caster": {
      "atlasId": 502100,
      "collectionNo": 38,
      "ascension": {
        "1": "https://static.atlasacademy.io/KR/CharaGraph/502100/502100a@1.png",
        "2": "https://static.atlasacademy.io/KR/CharaGraph/502100/502100a@2.png",
        "3": "https://static.atlasacademy.io/KR/CharaGraph/502100/502100b@1.png",
        "4": "https://static.atlasacademy.io/KR/CharaGraph/502100/502100b@2.png"
      },
      "face": "https://static.atlasacademy.io/KR/Faces/f_5021000.png"
    }
  },
  "ces": {
    "ce_kscope": {
      "atlasId": 9400340,
      "collectionNo": 34,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400340/9400340a.png"
    },
    "ce_black_grail": {
      "atlasId": 9400480,
      "collectionNo": 48,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400480/9400480a.png"
    },
    "ce_2030": {
      "atlasId": 9400650,
      "collectionNo": 67,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400650/9400650a.png"
    },
    "ce_prisma": {
      "atlasId": 9400400,
      "collectionNo": 40,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400400/9400400a.png"
    },
    "ce_formalcraft": {
      "atlasId": 9400310,
      "collectionNo": 31,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400310/9400310a.png"
    },
    "ce_limited_zero": {
      "atlasId": 9400330,
      "collectionNo": 33,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400330/9400330a.png"
    },
    "ce_imaginary_around": {
      "atlasId": 9400320,
      "collectionNo": 32,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400320/9400320a.png"
    },
    "ce_magical_sapphire": {
      "atlasId": 9402840,
      "collectionNo": 705,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9402840/9402840a.png"
    },
    "ce_imaginary_element": {
      "atlasId": 9400280,
      "collectionNo": 28,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400280/9400280a.png"
    },
    "ce_necromancy": {
      "atlasId": 9400710,
      "collectionNo": 73,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400710/9400710a.png"
    },
    "ce_projection": {
      "atlasId": 9400230,
      "collectionNo": 23,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400230/9400230a.png"
    },
    "ce_verdant": {
      "atlasId": 9400250,
      "collectionNo": 25,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400250/9400250a.png"
    },
    "ce_iron_willed": {
      "atlasId": 9400210,
      "collectionNo": 21,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400210/9400210a.png"
    },
    "ce_be_elegant": {
      "atlasId": 9400270,
      "collectionNo": 27,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400270/9400270a.png"
    },
    "ce_knights_dignity": {
      "atlasId": 9400640,
      "collectionNo": 66,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400640/9400640a.png"
    },
    "ce_golden_millennium": {
      "atlasId": 9400960,
      "collectionNo": 98,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400960/9400960a.png"
    },
    "ce_mapo_tofu": {
      "atlasId": 9401610,
      "collectionNo": 246,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9401610/9401610a.png"
    },
    "ce_black_keys_red": {
      "atlasId": 9400150,
      "collectionNo": 15,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400150/9400150a.png"
    },
    "ce_black_keys_blue": {
      "atlasId": 9400130,
      "collectionNo": 13,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400130/9400130a.png"
    },
    "ce_black_keys_green": {
      "atlasId": 9400140,
      "collectionNo": 14,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400140/9400140a.png"
    },
    "ce_dragon_meridian": {
      "atlasId": 9400180,
      "collectionNo": 18,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400180/9400180a.png"
    },
    "ce_azoth": {
      "atlasId": 9400110,
      "collectionNo": 11,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400110/9400110a.png"
    },
    "ce_ryuudou": {
      "atlasId": 9400860,
      "collectionNo": 89,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400860/9400860a.png"
    },
    "ce_clock_tower": {
      "atlasId": 9400700,
      "collectionNo": 72,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400700/9400700a.png"
    },
    "ce_leyline_jewel": {
      "atlasId": 9400870,
      "collectionNo": 90,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400870/9400870a.png"
    },
    "ce_gandr": {
      "atlasId": 9400240,
      "collectionNo": 24,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400240/9400240a.png"
    },
    "ce_heavens_feel": {
      "atlasId": 9400350,
      "collectionNo": 35,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400350/9400350a.png"
    },
    "ce_rin_pendant": {
      "atlasId": 9400160,
      "collectionNo": 16,
      "card": "https://static.atlasacademy.io/KR/CharaGraph/9400160/9400160a.png"
    },
    "ce_fp1_tujaeng": { "atlasId": 9403040, "collectionNo": 777, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403040/9403040a.png" },
    "ce_fp1_yeonswae": { "atlasId": 9403050, "collectionNo": 778, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403050/9403050a.png" },
    "ce_fp1_danjeol": { "atlasId": 9403060, "collectionNo": 779, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403060/9403060a.png" },
    "ce_fp1_gakseong": { "atlasId": 9403070, "collectionNo": 780, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403070/9403070a.png" },
    "ce_fp1_gia": { "atlasId": 9403080, "collectionNo": 781, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403080/9403080a.png" },
    "ce_fp2_jaae": { "atlasId": 9403090, "collectionNo": 782, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403090/9403090a.png" },
    "ce_fp2_beonyeong": { "atlasId": 9403100, "collectionNo": 783, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403100/9403100a.png" },
    "ce_fp2_giman": { "atlasId": 9403110, "collectionNo": 784, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403110/9403110a.png" },
    "ce_fp2_dongjo": { "atlasId": 9403120, "collectionNo": 785, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403120/9403120a.png" },
    "ce_fp2_amdam": { "atlasId": 9403130, "collectionNo": 786, "card": "https://static.atlasacademy.io/KR/CharaGraph/9403130/9403130a.png" }
  }
};
