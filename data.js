window.GAME_DATA = {

  version: "0.20",

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

  exp: {
    base: 100,
    growth: 35,
    pointPerLevel: 3
  },

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

  weekActions: 3,

  trainingCommands: [

    {
      id: "dance",
      icon: "💃",
      title: "ダンス",
      description: "振付・フォーメーションを磨く",
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
      description: "歌唱力と表現を鍛える",
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
      description: "話す力と4人の連携を磨く",
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
      description: "自宅から配信して認知を広げる",
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
      description: "街で直接名前を知ってもらう",
      reach: 11,
      energy: -6,
      cash: -3000,
      exp: 25
    },

    {
      id: "rest",
      icon: "💤",
      title: "休養",
      description: "体力を戻して次に備える",
      energy: 13,
      cash: 0,
      exp: 10
    }
  ],

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
