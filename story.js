/* =========================================================
   O-VER-KiLL | MANAGER'S STORY
   story.js
   v0.22
========================================================= */

window.GAME_STORY = {

  /* =======================================================
     PROLOGUE
     ※ game.js側で4人のミニキャラを表示
  ======================================================= */

  prologue: [

    `これは、
まだ何者でもない4人の物語。`,

    `歌。

ダンス。

MC。

連携。

そして体力。

全部を完璧にするには、
時間が足りない。`,

    `それでも4人は、
ステージに立とうとしている。`,

    `デビューライブまで、
残された時間はわずか。

場所は――豊洲公園。`,

    `そして今日。

あなたは、
4人組アイドルグループ

『O-VER-KiLL』

のマネージャーになる。`

  ],


  /* =======================================================
     WEEK DATA
  ======================================================= */

  weeks: {

    1: {
      title: "4人でやるって、難しい。",
      start: "w1_01",
      trainingIntro: "w1_training_01",
      afterTraining: "w1_after_training",
      ending: "w1_end_01"
    },

    2: {
      title: "誰にも知られていない。",
      start: "w2_01"
    }

  },


  /* =======================================================
     STORY NODES
  ======================================================= */

  nodes: {


    /* =====================================================
       WEEK 1
       MANAGER
    ===================================================== */

    w1_01: {
      chapter: "WEEK 1｜マネージャー就任",
      bg: "manager",
      speaker: "MANAGER",
      text:
`今日からあなたは、
O-VER-KiLLのマネージャー。

まだ実績も、
知名度も、
ファンもほとんどない。

まずは4人に会いに行こう。`,
      next: "w1_02"
    },


    /* =====================================================
       STUDIO
    ===================================================== */

    w1_02: {
      chapter: "WEEK 1｜初顔合わせ",
      bg: "studio",
      member: "sarina",
      expression: "smile",
      speaker: "SARiNA",
      text:
`今日から
マネージャーなんだよね？

よろしく。`,
      next: "w1_03"
    },

    w1_03: {
      chapter: "WEEK 1｜初顔合わせ",
      bg: "studio",
      member: "miyu",
      expression: "smile",
      reaction: "✨",
      speaker: "MiYU",
      text:
`おおー。

マネージャーだ。

よろしくね！`,
      next: "w1_04"
    },

    w1_04: {
      chapter: "WEEK 1｜初顔合わせ",
      bg: "studio",
      member: "raisa",
      expression: "troubled",
      speaker: "RAiSA",
      text:
`よろしくお願いします……！

なんか、
ちょっと緊張するね。`,
      next: "w1_05"
    },

    w1_05: {
      chapter: "WEEK 1｜初顔合わせ",
      bg: "studio",
      member: "kilua",
      expression: "normal",
      speaker: "KiLUA",
      text:
`よろしく。

……で、

今日は踊る？`,
      next: "w1_06"
    },

    w1_06: {
      chapter: "WEEK 1｜初顔合わせ",
      bg: "studio",
      speaker: "MANAGER",
      text:
`もちろん。

デビューライブは
豊洲公園。

そこまでに、
4人のステージを作る。`,
      next: "w1_07"
    },


    /* =====================================================
       FIRST DANCE LESSON
    ===================================================== */

    w1_07: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "sarina",
      expression: "normal",
      speaker: "SARiNA",
      text:
`じゃあ……

まず一回、
合わせてみようか。`,
      next: "w1_08"
    },

    w1_08: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "miyu",
      expression: "troubled",
      speaker: "MiYU",
      text:
`先に言っとくけど……

ダンス、
そんな得意じゃないからね？`,
      next: "w1_09"
    },

    w1_09: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "raisa",
      expression: "troubled",
      reaction: "💧",
      speaker: "RAiSA",
      text:
`私も……。

置いていかれたら
どうしよう。`,
      next: "w1_10"
    },

    w1_10: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "kilua",
      expression: "smile",
      reaction: "🔥",
      speaker: "KiLUA",
      text:
`大丈夫。

まず通してみよ。

5、6、7、8――`,
      next: "w1_11"
    },

    w1_11: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "sarina",
      expression: "troubled",
      reaction: "💦",
      speaker: "SARiNA",
      text:
`待って待って！

そこ、
もう一回いい？`,
      next: "w1_12"
    },

    w1_12: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "kilua",
      expression: "normal",
      speaker: "KiLUA",
      text:
`ここで右。

次のカウントで左。

そのまま次。`,
      next: "w1_13"
    },

    w1_13: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "miyu",
      expression: "troubled",
      speaker: "MiYU",
      text:
`ごめん。

「そのまま次」が
分かんない。`,
      next: "w1_14"
    },

    w1_14: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "raisa",
      expression: "troubled",
      reaction: "💦",
      speaker: "RAiSA",
      text:
`私も……。

途中から
分からなくなっちゃった。`,
      next: "w1_15"
    },

    w1_15: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "kilua",
      expression: "angry",
      reaction: "💢",
      speaker: "KiLUA",
      text:
`でも、

ここで止まってたら
本番に間に合わないよ。`,
      next: "w1_16"
    },

    w1_16: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "sarina",
      expression: "angry",
      reaction: "💢",
      speaker: "SARiNA",
      text:
`分かってる。

でも、
分からないまま進んでも
揃わないでしょ。`,
      next: "w1_17"
    },

    w1_17: {
      chapter: "WEEK 1｜最初のレッスン",
      bg: "studio",
      member: "miyu",
      expression: "angry",
      speaker: "MiYU",
      text:
`踊れるのと、

人に教えるのって
違うからね。`,
      next: "w1_decision"
    },


    /* =====================================================
       FIRST MANAGER DECISION
    ===================================================== */

    w1_decision: {
      chapter: "WEEK 1｜最初の判断",
      bg: "studio",
      member: "kilua",
      expression: "angry",
      reaction: "💢",
      speaker: "MANAGER",
      text:
`4人の空気が張りつめる。

マネージャーとして、
どう動く？`,

      choices: [

        {
          title: "KiLUAに“教える側”を任せる",
          hint: "KiLUAの連携・MC成長",
          result: "teach",
          next: "w1_teach"
        },

        {
          title: "8カウントずつ4人で確認する",
          hint: "ダンス・連携を安定成長",
          result: "split",
          next: "w1_split"
        },

        {
          title: "本番速度で最後まで通す",
          hint: "ダンス大幅成長 / 高負荷",
          result: "push",
          next: "w1_push"
        },

        {
          title: "一度休憩して話す",
          hint: "連携・MC重視",
          result: "talk",
          next: "w1_talk"
        }

      ]
    },


    /* =====================================================
       DECISION : TEACH
    ===================================================== */

    w1_teach: {
      chapter: "WEEK 1｜教える",
      bg: "studio",
      member: "kilua",
      expression: "troubled",
      speaker: "KiLUA",
      text:
`……教える側？

私が？`,
      next: "w1_teach2"
    },

    w1_teach2: {
      chapter: "WEEK 1｜教える",
      bg: "studio",
      member: "sarina",
      expression: "smile",
      speaker: "SARiNA",
      text:
`うん。

KiLUAが分かってることを
私たちにも分かるように
教えてみて。`,
      next: "w1_after_decision"
    },


    /* =====================================================
       DECISION : SPLIT
    ===================================================== */

    w1_split: {
      chapter: "WEEK 1｜8カウントずつ",
      bg: "studio",
      member: "raisa",
      expression: "smile",
      reaction: "✨",
      speaker: "RAiSA",
      text:
`あ。

これなら
分かるかも！`,
      next: "w1_split2"
    },

    w1_split2: {
      chapter: "WEEK 1｜8カウントずつ",
      bg: "studio",
      member: "kilua",
      expression: "normal",
      speaker: "KiLUA",
      text:
`……なるほど。

この方が
揃うの早いか。`,
      next: "w1_after_decision"
    },


    /* =====================================================
       DECISION : PUSH
    ===================================================== */

    w1_push: {
      chapter: "WEEK 1｜通し練習",
      bg: "studio",
      member: "kilua",
      expression: "smile",
      reaction: "🔥",
      speaker: "KiLUA",
      text:
`OK。

じゃあ本番と同じ速さで
最後までいくよ！`,
      next: "w1_push2"
    },

    w1_push2: {
      chapter: "WEEK 1｜通し練習",
      bg: "studio",
      member: "raisa",
      expression: "cry",
      reaction: "💦",
      speaker: "RAiSA",
      text:
`はぁ……

はぁ……

ちょっと待って……！`,
      next: "w1_after_decision"
    },


    /* =====================================================
       DECISION : TALK
    ===================================================== */

    w1_talk: {
      chapter: "WEEK 1｜休憩",
      bg: "studio",
      member: "miyu",
      expression: "normal",
      speaker: "MiYU",
      text:
`一回、
何が分からないか整理しよ。`,
      next: "w1_talk2"
    },

    w1_talk2: {
      chapter: "WEEK 1｜休憩",
      bg: "studio",
      member: "kilua",
      expression: "troubled",
      speaker: "KiLUA",
      text:
`私、

自分が分かってるから
みんなも分かると思ってた。`,
      next: "w1_talk3"
    },

    w1_talk3: {
      chapter: "WEEK 1｜休憩",
      bg: "studio",
      member: "sarina",
      expression: "smile",
      speaker: "SARiNA",
      text:
`じゃあ、

ここから
4人で作ってけばいいよ。`,
      next: "w1_after_decision"
    },


    /* =====================================================
       AFTER DECISION
    ===================================================== */

    w1_after_decision: {
      chapter: "WEEK 1｜4人で合わせる",
      bg: "studio",
      member: "kilua",
      expression: "troubled",
      speaker: "KiLUA",
      text:
`……もう一回、

頭からやっていい？`,
      next: "w1_after_02"
    },

    w1_after_02: {
      chapter: "WEEK 1｜4人で合わせる",
      bg: "studio",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      text:
`今度は
さっきよりいけそう。`,
      next: "w1_after_03"
    },

    w1_after_03: {
      chapter: "WEEK 1｜4人で合わせる",
      bg: "studio",
      member: "raisa",
      expression: "smile",
      speaker: "RAiSA",
      text:
`私も！

もう一回やりたい。`,
      next: "w1_after_04"
    },

    w1_after_04: {
      chapter: "WEEK 1｜レッスン後",
      bg: "studio",
      member: "sarina",
      expression: "normal",
      speaker: "SARiNA",
      text:
`ステージの練習も大事だけど……

私たちのこと、

まだ誰も知らないんだよね。`,
      next: "w1_training_01"
    },


    /* =====================================================
       TRAINING INTRO

       ★説明文を削除。
       UIへ自然に移る。
    ===================================================== */

    w1_training_01: {
      chapter: "WEEK 1｜活動開始",
      bg: "manager",
      speaker: "MANAGER",
      text:
`今日の残り時間。

誰と、
何をする？`,
      next: "w1_training"
    },

    w1_training: {
      type: "training"
    },


    /* =====================================================
       AFTER TRAINING
    ===================================================== */

    w1_after_training: {
      chapter: "WEEK 1｜帰り道",
      bg: "night",
      member: "raisa",
      expression: "smile",
      speaker: "RAiSA",
      text:
`今日ね。

知らない人に
「頑張ってね」って
言ってもらえた。`,
      next: "w1_after_training2"
    },

    w1_after_training2: {
      chapter: "WEEK 1｜帰り道",
      bg: "night",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      text:
`え。

それもう
ファンじゃん。`,
      next: "w1_after_training3"
    },

    w1_after_training3: {
      chapter: "WEEK 1｜帰り道",
      bg: "night",
      member: "sarina",
      expression: "smile",
      speaker: "SARiNA",
      text:
`まだ1人でも、

その1人が
来てくれるなら大事だよ。`,
      next: "w1_after_training4"
    },

    w1_after_training4: {
      chapter: "WEEK 1｜帰り道",
      bg: "night",
      member: "kilua",
      expression: "smile",
      reaction: "🔥",
      speaker: "KiLUA",
      text:
`じゃあ、

その1人が
100人になるまでやろ。`,
      next: "w1_end_01"
    },


    /* =====================================================
       WEEK 1 END
    ===================================================== */

    w1_end_01: {
      chapter: "WEEK 1｜週末",
      bg: "manager",
      speaker: "MANAGER",
      text:
`O-VER-KiLLとしての
最初の1週間が終わる。

4人はまだ、
始まったばかりだ。`,
      next: "w1_end_02"
    },

    w1_end_02: {
      chapter: "WEEK 1｜週末",
      bg: "manager",
      member: "raisa",
      expression: "smile",
      speaker: "RAiSA",
      text:
`来週も、

もっとやりたい。`,
      next: "w1_end_03"
    },

    w1_end_03: {
      chapter: "WEEK 1｜週末",
      bg: "manager",
      member: "kilua",
      expression: "normal",
      speaker: "KiLUA",
      text:
`次は、

4人でもっと
揃えたい。`,
      next: "w1_end_04"
    },

    w1_end_04: {
      chapter: "WEEK 1｜週末",
      bg: "manager",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      text:
`その前にさ。

もうちょっと
知られないとね。`,
      next: "w1_end_05"
    },

    w1_end_05: {
      chapter: "WEEK 1｜週末",
      bg: "manager",
      member: "sarina",
      expression: "smile",
      reaction: "✨",
      speaker: "SARiNA",
      text:
`うん。

ここから
大きくなってみせよう。`,
      next: "w1_complete"
    },

    w1_complete: {
      type: "weekComplete"
    },


    /* =====================================================
       WEEK 2

       「誰にも知られていない」
       黒背景ではなく事務所→SNS背景へ
    ===================================================== */

    w2_01: {
      chapter: "WEEK 2｜月曜日",
      bg: "manager",
      speaker: "MANAGER",
      text:
`WEEK 2。

4人の空気は、
少しずつ変わってきた。

次に必要なのは――

O-VER-KiLLを
知ってもらうこと。`,
      next: "w2_02"
    },

    w2_02: {
      chapter: "WEEK 2｜SNS",
      bg: "sns",
      member: "miyu",
      expression: "troubled",
      speaker: "MiYU",
      text:
`投稿してるけど……

全然数字
伸びないね。`,
      next: "w2_03"
    },

    w2_03: {
      chapter: "WEEK 2｜SNS",
      bg: "sns",
      member: "raisa",
      expression: "troubled",
      speaker: "RAiSA",
      text:
`見てくれてる人、

ほとんど
私たちの知り合いかも……。`,
      next: "w2_04"
    },

    w2_04: {
      chapter: "WEEK 2｜SNS",
      bg: "sns",
      member: "kilua",
      expression: "normal",
      speaker: "KiLUA",
      text:
`待ってても
増えないんじゃない？`,
      next: "w2_05"
    },

    w2_05: {
      chapter: "WEEK 2｜SNS",
      bg: "sns",
      member: "sarina",
      expression: "smile",
      reaction: "✨",
      speaker: "SARiNA",
      text:
`だったら、

こっちから
見つけてもらいに行こう。`,
      next: "w2_training_intro"
    },

    w2_training_intro: {
      chapter: "WEEK 2｜活動開始",
      bg: "manager",
      speaker: "MANAGER",
      text:
`今日は、
どう動く？`,
      next: "w2_training"
    },

    w2_training: {
      type: "training"
    }

  }

};
