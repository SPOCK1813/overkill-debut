window.GAME_DATA = {

  version: "0.23",

  memberOrder: [
    "sarina",
    "miyu",
    "kilua",
    "raisa"
  ],

  members: {

    sarina: {
      name: "SARiNA",
      color: "#69e09a",
      rgb: "105,224,154",

      initial: {
        vocal: 78,
        dance: 48,
        mc: 62,
        bond: 74,
        energy: 72
      }
    },

    miyu: {
      name: "MiYU",
      color: "#72bdff",
      rgb: "114,189,255",

      initial: {
        vocal: 74,
        dance: 54,
        mc: 65,
        bond: 68,
        energy: 76
      }
    },

    kilua: {
      name: "KiLUA",
      color: "#ff7b88",
      rgb: "255,123,136",

      initial: {
        vocal: 52,
        dance: 84,
        mc: 55,
        bond: 40,
        energy: 80
      }
    },

    raisa: {
      name: "RAiSA",
      color: "#ffdc69",
      rgb: "255,220,105",

      initial: {
        vocal: 42,
        dance: 44,
        mc: 58,
        bond: 58,
        energy: 70
      }
    }
  },


  /* ==========================================
     CHARACTER IMAGES
  ========================================== */

  images: {

    sarina: {
      normal: "./sarina_normal.png",
      smile: "./sarina_smile.png",
      angry: "./sarina_angry.png",
      troubled: "./sarina_troubled.png",
      cry: "./sarina_cry.png"
    },

    miyu: {
      normal: "./miyu_normal.png",
      smile: "./miyu_smile.png",
      angry: "./miyu_angry.png",
      troubled: "./miyu_troubled.png",
      cry: "./miyu_cry.png"
    },

    kilua: {
      normal: "./kilua_normal.png",
      smile: "./kilua_smile.png",
      angry: "./kilua_angry.png",
      troubled: "./kilua_troubled.png",
      cry: "./kilua_cry.png"
    },

    raisa: {
      normal: "./raisa_normal.png",
      smile: "./raisa_smile.png",
      angry: "./raisa_angry.png",
      troubled: "./raisa_troubled.png",
      cry: "./raisa_cry.png"
    }
  },


  /* ==========================================
     BACKGROUNDS
  ========================================== */

  backgrounds: {
    manager: "./bg-manager.png",
    studio: "./bg-studio.png",
    lounge: "./bg-backstage.png",
    sns: "./bg-stream.png",
    city: "./bg-street.png",
    night: "./bg-street-night.png",
    live: "./bg-livehouse.png",
    outdoor: "./bg-outdoor.png"
  },


  /* ==========================================
     STATUS
  ========================================== */

  statLabels: {
    vocal: "歌唱",
    dance: "ダンス",
    mc: "MC",
    bond: "連携",
    energy: "体力"
  },

  ranks: [
    { min: 90, rank: "S" },
    { min: 75, rank: "A" },
    { min: 60, rank: "B" },
    { min: 45, rank: "C" },
    { min: 30, rank: "D" },
    { min: 0, rank: "E" }
  ],


  /* ==========================================
     LEVEL / EXP
  ========================================== */

  exp: {
    base: 100,
    growth: 35,
    pointPerLevel: 3
  },


  /* ==========================================
     SEASONS
  ========================================== */

  seasons: {
    total: 4,
    weeksPerSeason: 8,

    names: {
      1: "THE BEGINNING",
      2: "UNDERGROUND",
      3: "BREAK THROUGH",
      4: "LAST FOUR"
    }
  },


  /* ==========================================
     WEEK SYSTEM
  ========================================== */

  // 1週間に選べる活動回数
  weekActions: 3,

  // 1週間に使える育成ポイント
  weeklyTP: 100,


  /* ==========================================
     CONDITION
  ========================================== */

  condition: [

    {
      min: 80,
      key: "best",
      icon: "🔥",
      label: "絶好調"
    },

    {
      min: 60,
      key: "good",
      icon: "🟢",
      label: "好調"
    },

    {
      min: 40,
      key: "normal",
      icon: "🟡",
      label: "普通"
    },

    {
      min: 20,
      key: "bad",
      icon: "🟠",
      label: "不調"
    },

    {
      min: 0,
      key: "worst",
      icon: "🔴",
      label: "絶不調"
    }
  ],


  /* ==========================================
     TRAINING OUTCOME
  ========================================== */

  trainingOutcomes: {

    super: {
      label: "超大成功!!",
      icon: "🌟",
      statMultiplier: 1.75,
      expMultiplier: 1.45
    },

    great: {
      label: "大成功！",
      icon: "✨",
      statMultiplier: 1.40,
      expMultiplier: 1.25
    },

    success: {
      label: "成功！",
      icon: "👍",
      statMultiplier: 1.10,
      expMultiplier: 1.10
    },

    normal: {
      label: "普通",
      icon: "•",
      statMultiplier: 0.80,
      expMultiplier: 0.90
    },

    fail: {
      label: "失敗…",
      icon: "💦",
      statMultiplier: 0.20,
      expMultiplier: 0.55
    }
  },


  /*
    コンディション別の抽選確率。

    合計100。

    体力が高いほど
    大成功以上が出やすくなる。

    ただし絶不調でも
    超低確率で奇跡は起こる。
  */

  trainingProbabilities: {

    best: {
      super: 2,
      great: 35,
      success: 45,
      normal: 16,
      fail: 2
    },

    good: {
      super: 1,
      great: 20,
      success: 44,
      normal: 30,
      fail: 5
    },

    normal: {
      super: 1,
      great: 10,
      success: 34,
      normal: 45,
      fail: 10
    },

    bad: {
      super: 1,
      great: 5,
      success: 19,
      normal: 50,
      fail: 25
    },

    worst: {
      super: 1,
      great: 2,
      success: 7,
      normal: 40,
      fail: 50
    }
  },


  /* ==========================================
     TRAINING COMMANDS
  ========================================== */

  trainingCommands: [

    {
      id: "dance",
      icon: "💃",
      title: "ダンス",

      description:
        "振付・フォーメーションを磨く",

      tp: 35,

      primary: "dance",
      primaryGain: 4,

      energy: -7,
      cash: -3000,
      exp: 35
    },


    {
      id: "vocal",
      icon: "🎤",
      title: "ボーカル",

      description:
        "歌唱力と表現を鍛える",

      tp: 35,

      primary: "vocal",
      primaryGain: 4,

      energy: -6,
      cash: -3000,
      exp: 35
    },


    {
      id: "mc",
      icon: "🎙️",
      title: "MC練習",

      description:
        "話す力と4人の連携を磨く",

      tp: 25,

      primary: "mc",
      primaryGain: 4,

      bondGain: 2,

      energy: -4,
      cash: -1000,
      exp: 30
    },


    {
      id: "sns",
      icon: "📱",
      title: "SNS配信",

      description:
        "自宅から配信して認知を広げる",

      tp: 20,

      primary: "mc",
      primaryGain: 2,

      reach: 7,

      energy: -3,
      cash: -1000,
      exp: 25
    },


    {
      id: "flyer",
      icon: "📄",
      title: "チラシ配り",

      description:
        "街で直接名前を知ってもらう",

      tp: 20,

      reach: 11,

      energy: -6,
      cash: -3000,
      exp: 25
    },


    /*
      休養だけは特殊。

      ・TP消費なし
      ・成功判定なし
      ・体力を確実に回復
  */

    {
      id: "rest",
      icon: "💤",
      title: "休養",

      description:
        "体力を戻して次に備える",

      tp: 0,

      energy: 13,
      cash: 0,
      exp: 10
    }
  ],


  /* ==========================================
     WEEK 1 MISSION
  ========================================== */

  week1Mission: [

    {
      id: "dance",
      label: "ダンス平均 C以上",
      type: "average",
      stat: "dance",
      target: 45
    },

    {
      id: "bond",
      label: "連携平均 C以上",
      type: "average",
      stat: "bond",
      target: 45
    },

    {
      id: "energy",
      label: "全員の体力40以上",
      type: "minimum",
      stat: "energy",
      target: 40
    }
  ]

};
