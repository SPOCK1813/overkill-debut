window.GAME_STORY = {

  prologue: [

`あなたは今日から、
4人組アイドルグループ
『O-VER-KiLL』のマネージャー。`,

`デビューまで残り4週間。

まだ4人は、
ひとつのグループとは
言いきれない。`,

`歌。

ダンス。

MC。

連携。

体力。

限られた時間の中で、
何を優先するか。`,

`あなたの選択によって、

同じ4人でも、
違うO-VER-KiLLが生まれる。`

  ],


  nodes: {

    m1: {
      chapter: "WEEK 1｜マネージャー就任",
      bg: "manager",
      speaker: "MANAGER",

      text:
`今日からあなたは、
O-VER-KiLLのマネージャー。

まずは4人の顔合わせと、
初めての全体レッスンへ向かう。`,

      next: "m2"
    },


    m2: {
      chapter: "WEEK 1｜初顔合わせ",
      bg: "manager",
      speaker: "MANAGER",

      text:
`デビューライブは4週間後。

場所は豊洲公園。

最初の目標は、
4人をひとつのチームにすることだ。`,

      next: "s1"
    },


    s1: {
      chapter: "WEEK 1｜初レッスン",
      bg: "studio",
      member: "sarina",
      expression: "normal",
      speaker: "SARiNA",

      text:
`今日からちゃんと
4人で合わせるんだよね。`,

      next: "s2"
    },


    s2: {
      chapter: "WEEK 1｜初レッスン",
      bg: "studio",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      reaction: "✨",

      text:
`なんか急に
グループっぽくなってきたね。`,

      next: "s3"
    },


    s3: {
      chapter: "WEEK 1｜初レッスン",
      bg: "studio",
      member: "raisa",
      expression: "troubled",
      speaker: "RAiSA",
      reaction: "💧",

      text:
`私、
ちゃんとついていけるかな……`,

      next: "s4"
    },


    s4: {
      chapter: "WEEK 1｜初レッスン",
      bg: "studio",
      member: "kilua",
      expression: "normal",
      speaker: "KiLUA",

      text:
`じゃあ、
最初から通そう。

5、6、7、8！`,

      next: "s5"
    },


    s5: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "sarina",
      expression: "troubled",
      speaker: "SARiNA",
      reaction: "💦",

      text:
`待って、待って！

今どこ入った！？`,

      next: "s6"
    },


    s6: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "miyu",
      expression: "troubled",
      speaker: "MiYU",
      reaction: "💦",

      text:
`KiLUA、速いって！

そこ、
まだ教わってない。`,

      next: "s7"
    },


    s7: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "kilua",
      expression: "angry",
      speaker: "KiLUA",
      reaction: "💢",

      text:
`でも、
この速さで入れないと

本番に間に合わないよ？`,

      next: "s8"
    },


    s8: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "sarina",
      expression: "angry",
      speaker: "SARiNA",
      reaction: "💢",

      text:
`できる人の感覚で
進められても困る。`,

      next: "s9"
    },


    s9: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "miyu",
      expression: "angry",
      speaker: "MiYU",
      reaction: "💢",

      text:
`KiLUAは踊れる。

でも教えるのは
また別じゃん。`,

      next: "decision1"
    },


    decision1: {
      chapter: "WEEK 1｜最初の判断",
      bg: "studio",
      speaker: "MANAGER",

      text:
`スタジオの空気が
少し張りつめてきた。

マネージャーとして、
ここで何を優先する？`,

      choices: [

        {
          text: "KiLUAに教え方を変えてもらう",
          result: "teach",
          next: "after1"
        },

        {
          text: "8カウントずつ分けて確認する",
          result: "split",
          next: "after1"
        },

        {
          text: "KiLUAのペースで続ける",
          result: "push",
          next: "after1"
        },

        {
          text: "一度休憩して空気を戻す",
          result: "break",
          next: "after1"
        }

      ]
    },


    after1: {
      chapter: "WEEK 1｜練習後",
      bg: "lounge",
      member: "kilua",
      expression: "troubled",
      speaker: "KiLUA",

      text:
`……教えるって、

思ってたより
難しいんだね。`,

      next: "after2"
    },


    after2: {
      chapter: "WEEK 1｜練習後",
      bg: "lounge",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",

      text:
`でもさ。

さっきよりは
ちゃんと4人になってない？`,

      next: "after3"
    },


    after3: {
      chapter: "WEEK 1｜練習後",
      bg: "lounge",
      member: "sarina",
      expression: "normal",
      speaker: "SARiNA",

      text:
`レッスンだけじゃなくて、

これからは
どうやって活動するかも
考えないとね。`,

      next: "trainingIntro"
    },


    trainingIntro: {
      chapter: "WEEK 1｜マネジメント",
      bg: "manager",
      speaker: "MANAGER",

      text:
`ここからは、
マネージャーとして
活動内容を決めていく。

限られた時間で、
何を伸ばすか。

誰をどう育てるか。

その判断が、
4人の未来を変えていく。`,

      next: "openTraining"
    },


    openTraining: {
      type: "training"
    }

  }

};
