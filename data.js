window.GAME_DATA = {

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


  ranks: [
    {
      min: 90,
      rank: "S"
    },
    {
      min: 75,
      rank: "A"
    },
    {
      min: 60,
      rank: "B"
    },
    {
      min: 45,
      rank: "C"
    },
    {
      min: 30,
      rank: "D"
    },
    {
      min: 0,
      rank: "E"
    }
  ],


  expTable: {
    base: 100,
    growth: 35,
    pointPerLevel: 3
  },


  commands: [

    {
      id: "dance",
      icon: "💃",
      name: "ダンス",
      desc: "ダンス↑ / 体力↓",
      bg: "studio",
      cash: -3000,
      exp: 35
    },

    {
      id: "vocal",
      icon: "🎤",
      name: "ボーカル",
      desc: "歌唱↑ / 体力↓",
      bg: "studio",
      cash: -3000,
      exp: 35
    },

    {
      id: "mc",
      icon: "🎙️",
      name: "MC練習",
      desc: "MC↑ / 連携↑",
      bg: "studio",
      cash: -1000,
      exp: 30
    },

    {
      id: "sns",
      icon: "📱",
      name: "SNS配信",
      desc: "認知↑ / MC↑",
      bg: "sns",
      cash: -1000,
      exp: 25
    },

    {
      id: "flyer",
      icon: "📄",
      name: "チラシ配り",
      desc: "認知↑↑ / 体力↓",
      bg: "city",
      cash: -3000,
      exp: 25
    },

    {
      id: "rest",
      icon: "💤",
      name: "休養",
      desc: "体力↑↑",
      bg: "lounge",
      cash: 0,
      exp: 10
    }

  ],


  seasons: {

    total: 4,
    weeksPerSeason: 8,

    titles: {
      1: "THE BEGINNING",
      2: "UNDERGROUND",
      3: "BREAK THROUGH",
      4: "LAST FOUR"
    }

  }

};
