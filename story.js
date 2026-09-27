window.GAME_STORY = {

  prologue: [

`あなたは今日から、
4人組アイドルグループ
『O-VER-KiLL』のマネージャー。`,

`デビューライブまで、
残された時間はわずか。

場所は豊洲公園。

まだ4人は、
ひとつのグループとは言えない。`,

`歌。

ダンス。

MC。

連携。

そして体力。

全部を伸ばす時間はない。`,

`誰を育てるか。

何を優先するか。

どんな4人にするか。

それを決めるのは、
マネージャーであるあなた。`

  ],


  weeks: {

    1: {

      title:
        "4人でやるって、難しい。",

      start:
        "w1_01",

      trainingIntro:
        "w1_training_01",

      afterTraining:
        "w1_after_training",

      ending:
        "w1_end_01"
    },

    2: {

      title:
        "誰にも知られていない。",

      start:
        "w2_01"
    }
  },


  nodes: {

    /* =========================
       WEEK 1
       INTRO
    ========================= */

    w1_01: {

      chapter:
        "WEEK 1｜マネージャー就任",

      bg:
        "manager",

      speaker:
        "MANAGER",

      text:
`今日からあなたは、
O-VER-KiLLのマネージャー。

まだ実績も、
知名度も、
ファンもほとんどない。

まずは4人に会いに行こう。`,

      next:
        "w1_02"
    },


    w1_02: {

      chapter:
        "WEEK 1｜初顔合わせ",

      bg:
        "manager",

      member:
        "sarina",

      expression:
        "normal",

      speaker:
        "SARiNA",

      text:
`今日から
マネージャーなんだよね？

よろしく。`,

      next:
        "w1_03"
    },


    w1_03: {

      chapter:
        "WEEK 1｜初顔合わせ",

      bg:
        "manager",

      member:
        "miyu",

      expression:
        "smile",

      speaker:
        "MiYU",

      reaction:
        "✨",

      text:
`よろしくー！

なんか本当に
始まるんだって感じするね。`,

      next:
        "w1_04"
    },


    w1_04: {

      chapter:
        "WEEK 1｜初顔合わせ",

      bg:
        "manager",

      member:
        "raisa",

      expression:
        "normal",

      speaker:
        "RAiSA",

      text:
`よろしくお願いします。

……ちょっと緊張する。`,

      next:
        "w1_05"
    },


    w1_05: {

      chapter:
        "WEEK 1｜初顔合わせ",

      bg:
        "manager",

      member:
        "kilua",

      expression:
        "normal",

      speaker:
        "KiLUA",

      text:
`よろしく。

それで、
今日はもう踊る？`,

      next:
        "w1_06"
    },


    w1_06: {

      chapter:
        "WEEK 1｜初顔合わせ",

      bg:
        "manager",

      speaker:
        "MANAGER",

      text:
`デビューライブは豊洲公園。

4人に残された時間は、
決して長くない。

最初の全体レッスンが始まる。`,

      next:
        "w1_07"
    },


    /* =========================
       FIRST LESSON
    ========================= */

    w1_07: {

      chapter:
        "WEEK 1｜初レッスン",

      bg:
        "studio",

      member:
        "sarina",

      expression:
        "normal",

      speaker:
        "SARiNA",

      text:
`まず一回、
4人で合わせてみよっか。`,

      next:
        "w1_08"
    },


    w1_08: {

      chapter:
        "WEEK 1｜初レッスン",

      bg:
        "studio",

      member:
        "miyu",

      expression:
        "smile",

      speaker:
        "MiYU",

      text:
`歌ならまだしも、

ダンスはちょっと
不安なんだけど。`,

      next:
        "w1_09"
    },


    w1_09: {

      chapter:
        "WEEK 1｜初レッスン",

      bg:
        "studio",

      member:
        "raisa",

      expression:
        "troubled",

      speaker:
        "RAiSA",

      reaction:
        "💧",

      text:
`私も……。

ちゃんと
ついていけるかな。`,

      next:
        "w1_10"
    },


    w1_10: {

      chapter:
        "WEEK 1｜初レッスン",

      bg:
        "studio",

      member:
        "kilua",

      expression:
        "smile",

      speaker:
        "KiLUA",

      text:
`大丈夫。

とりあえず
最初から通してみよう。

5、6、7、8！`,

      next:
        "w1_11"
    },


    w1_11: {

      chapter:
        "WEEK 1｜ダンス合わせ",

      bg:
        "studio",

      member:
        "sarina",

      expression:
        "troubled",

      speaker:
        "SARiNA",

      reaction:
        "💦",

      text:
`待って待って！

今どこ！？

もう一回！`,

      next:
        "w1_12"
    },


    w1_12: {

      chapter:
        "WEEK 1｜ダンス合わせ",

      bg:
        "studio",

      member:
        "kilua",

      expression:
        "normal",

      speaker:
        "KiLUA",

      text:
`ここから。

右、左、ターンして、
そのまま次。`,

      next:
        "w1_13"
    },


    w1_13: {

      chapter:
        "WEEK 1｜ダンス合わせ",

      bg:
        "studio",

      member:
        "miyu",

      expression:
        "troubled",

      speaker:
        "MiYU",

      text:
`いやいや、

「そのまま次」が
分かんないって！`,

      next:
        "w1_14"
    },


    w1_14: {

      chapter:
        "WEEK 1｜ダンス合わせ",

      bg:
        "studio",

      member:
        "raisa",

      expression:
        "troubled",

      speaker:
        "RAiSA",

      reaction:
        "💦",

      text:
`待って……。

私まだ、
最初のターンも
出来てない……。`,

      next:
        "w1_15"
    },


    w1_15: {

      chapter:
        "WEEK 1｜ダンス合わせ",

      bg:
        "studio",

      member:
        "kilua",

      expression:
        "angry",

      speaker:
        "KiLUA",

      reaction:
        "💢",

      text:
`でも、

この速さで入れないと
本番に間に合わないよ？`,

      next:
        "w1_16"
    },


    w1_16: {

      chapter:
        "WEEK 1｜ダンス合わせ",

      bg:
        "studio",

      member:
        "sarina",

      expression:
        "angry",

      speaker:
        "SARiNA",

      reaction:
        "💢",

      text:
`できる人の感覚で
進められても困る。

3人が分かってなかったら
意味ないじゃん。`,

      next:
        "w1_17"
    },


    w1_17: {

      chapter:
        "WEEK 1｜ダンス合わせ",

      bg:
        "studio",

      member:
        "miyu",

      expression:
        "angry",

      speaker:
        "MiYU",

      text:
`KiLUAは踊れるよ。

でもさ、

踊れるのと
教えられるのって
別じゃない？`,

      next:
        "w1_decision"
    },


    /* =========================
       MANAGER DECISION
    ========================= */

    w1_decision: {

      chapter:
        "WEEK 1｜最初の判断",

      bg:
        "studio",

      member:
        "kilua",

      expression:
        "angry",

      reaction:
        "💢",

      speaker:
        "MANAGER",

      text:
`4人の空気が張りつめる。

マネージャーとして、
どう動く？`,

      choices: [

        {
          title:
            "KiLUAに“教える側”を任せる",

          hint:
            "KiLUAの連携・MC成長",

          result:
            "teach",

          next:
            "w1_teach"
        },

        {
          title:
            "8カウントずつ4人で確認する",

          hint:
            "全員のダンス・連携を安定成長",

          result:
            "split",

          next:
            "w1_split"
        },

        {
          title:
            "本番速度で最後まで通す",

          hint:
            "ダンス大幅成長 / 体力・連携リスク",

          result:
            "push",

          next:
            "w1_push"
        },

        {
          title:
            "一度休憩して4人で話す",

          hint:
            "連携・MC重視",

          result:
            "talk",

          next:
            "w1_talk"
        }
      ]
    },


    /* =========================
       DECISION RESPONSES
    ========================= */

    w1_teach: {

      chapter:
        "WEEK 1｜教えるということ",

      bg:
        "studio",

      member:
        "kilua",

      expression:
        "troubled",

      speaker:
        "KiLUA",

      text:
`教える側……。

私、
人に教えたこと
ほとんどないんだけど。`,

      next:
        "w1_teach2"
    },


    w1_teach2: {

      chapter:
        "WEEK 1｜教えるということ",

      bg:
        "studio",

      member:
        "sarina",

      expression:
        "smile",

      speaker:
        "SARiNA",

      text:
`じゃあ、
今日から覚えればいいじゃん。

私たちも覚えるから。`,

      next:
        "w1_after_decision"
    },


    w1_split: {

      chapter:
        "WEEK 1｜8カウント",

      bg:
        "studio",

      member:
        "raisa",

      expression:
        "smile",

      speaker:
        "RAiSA",

      reaction:
        "✨",

      text:
`あ。

これなら分かる！

さっきより全然できる。`,

      next:
        "w1_split2"
    },


    w1_split2: {

      chapter:
        "WEEK 1｜8カウント",

      bg:
        "studio",

      member:
        "kilua",

      expression:
        "normal",

      speaker:
        "KiLUA",

      text:
`……なるほど。

私が速すぎたのか。`,

      next:
        "w1_after_decision"
    },


    w1_push: {

      chapter:
        "WEEK 1｜本番速度",

      bg:
        "studio",

      member:
        "kilua",

      expression:
        "smile",

      speaker:
        "KiLUA",

      reaction:
        "🔥",

      text:
`OK。

じゃあ止めないよ。

5、6、7、8！`,

      next:
        "w1_push2"
    },


    w1_push2: {

      chapter:
        "WEEK 1｜本番速度",

      bg:
        "studio",

      member:
        "raisa",

      expression:
        "cry",

      speaker:
        "RAiSA",

      reaction:
        "💦",

      text:
`速っ……！

足がもう
動かない……！`,

      next:
        "w1_after_decision"
    },


    w1_talk: {

      chapter:
        "WEEK 1｜休憩",

      bg:
        "lounge",

      member:
        "miyu",

      expression:
        "normal",

      speaker:
        "MiYU",

      text:
`KiLUAさ、

教えるの
初めてなんでしょ？`,

      next:
        "w1_talk2"
    },


    w1_talk2: {

      chapter:
        "WEEK 1｜休憩",

      bg:
        "lounge",

      member:
        "kilua",

      expression:
        "troubled",

      speaker:
        "KiLUA",

      text:
`……うん。

見れば分かるって
思ってた。`,

      next:
        "w1_talk3"
    },


    w1_talk3: {

      chapter:
        "WEEK 1｜休憩",

      bg:
        "lounge",

      member:
        "sarina",

      expression:
        "smile",

      speaker:
        "SARiNA",

      text:
`じゃあそこからだね。

4人とも
まだ初めてなんだから。`,

      next:
        "w1_after_decision"
    },


    /* =========================
       AFTER DECISION
    ========================= */

    w1_after_decision: {

      chapter:
        "WEEK 1｜レッスン後",

      bg:
        "lounge",

      member:
        "kilua",

      expression:
        "troubled",

      speaker:
        "KiLUA",

      text:
`ダンスだけ出来ても、

グループって
出来ないんだね。`,

      next:
        "w1_after_02"
    },


    w1_after_02: {

      chapter:
        "WEEK 1｜レッスン後",

      bg:
        "lounge",

      member:
        "miyu",

      expression:
        "smile",

      speaker:
        "MiYU",

      text:
`まあ、

まだ初日だし。

これからでしょ。`,

      next:
        "w1_after_03"
    },


    w1_after_03: {

      chapter:
        "WEEK 1｜レッスン後",

      bg:
        "lounge",

      member:
        "raisa",

      expression:
        "smile",

      speaker:
        "RAiSA",

      text:
`私ももっと
練習したい。

さっきよりは
ちょっと楽しくなってきた。`,

      next:
        "w1_after_04"
    },


    w1_after_04: {

      chapter:
        "WEEK 1｜レッスン後",

      bg:
        "lounge",

      member:
        "sarina",

      expression:
        "normal",

      speaker:
        "SARiNA",

      text:
`でも、

練習だけしてても
誰にも知られない。

活動も始めないとね。`,

      next:
        "w1_training_01"
    },


    /* =========================
       MANAGEMENT INTRO
    ========================= */

    w1_training_01: {

      chapter:
        "WEEK 1｜MANAGEMENT",

      bg:
        "manager",

      speaker:
        "MANAGER",

      text:
`ここからは、
マネージャーとして
1週間の活動を決める。

育成できるのは3回。

誰を重点的に育てるか。

何を優先するか。

全部を選ぶことはできない。`,

      next:
        "training"
    },


    training: {
      type:
        "training"
    },


    /* =========================
       MID WEEK EVENT
    ========================= */

    w1_after_training: {

      chapter:
        "WEEK 1｜夜",

      bg:
        "night",

      member:
        "raisa",

      expression:
        "normal",

      speaker:
        "RAiSA",

      text:
`今日さ、

知らない人に
「頑張ってね」って
言われたんだ。`,

      next:
        "w1_after_training2"
    },


    w1_after_training2: {

      chapter:
        "WEEK 1｜夜",

      bg:
        "night",

      member:
        "miyu",

      expression:
        "smile",

      speaker:
        "MiYU",

      reaction:
        "✨",

      text:
`え、
もうファンじゃん！

1人目じゃない？`,

      next:
        "w1_after_training3"
    },


    w1_after_training3: {

      chapter:
        "WEEK 1｜夜",

      bg:
        "night",

      member:
        "sarina",

      expression:
        "smile",

      speaker:
        "SARiNA",

      text:
`1人でも、

私たちを見てくれる人が
増えたなら大きいよ。`,

      next:
        "w1_after_training4"
    },


    w1_after_training4: {

      chapter:
        "WEEK 1｜夜",

      bg:
        "night",

      member:
        "kilua",

      expression:
        "normal",

      speaker:
        "KiLUA",

      text:
`じゃあ、

その1人が
100人になるまで
やればいい。`,

      next:
        "w1_end_01"
    },


    /* =========================
       WEEK1 ENDING
    ========================= */

    w1_end_01: {

      chapter:
        "WEEK 1｜週末",

      bg:
        "live",

      speaker:
        "MANAGER",

      text:
`最初の1週間が終わった。

歌も。

ダンスも。

4人の関係も。

まだ完成には遠い。`,

      next:
        "w1_end_02"
    },


    w1_end_02: {

      chapter:
        "WEEK 1｜週末",

      bg:
        "live",

      member:
        "raisa",

      expression:
        "smile",

      speaker:
        "RAiSA",

      text:
`最初は、

私には無理かもって
思ってたけど……。

もうちょっと
やってみたい。`,

      next:
        "w1_end_03"
    },


    w1_end_03: {

      chapter:
        "WEEK 1｜週末",

      bg:
        "live",

      member:
        "kilua",

      expression:
        "smile",

      speaker:
        "KiLUA",

      text:
`次は、

ちゃんと4人で
揃えたい。`,

      next:
        "w1_end_04"
    },


    w1_end_04: {

      chapter:
        "WEEK 1｜週末",

      bg:
        "live",

      member:
        "miyu",

      expression:
        "smile",

      speaker:
        "MiYU",

      text:
`その前にさ。

まずもっと
知ってもらわないとね。`,

      next:
        "w1_end_05"
    },


    w1_end_05: {

      chapter:
        "WEEK 1｜週末",

      bg:
        "live",

      member:
        "sarina",

      expression:
        "smile",

      speaker:
        "SARiNA",

      reaction:
        "✨",

      text:
`うん。

ここから
大きくなってみせよう。`,

      next:
        "weekComplete"
    },


    weekComplete: {
      type:
        "weekComplete"
    },


    /* =========================
       WEEK 2
    ========================= */

    w2_01: {

      chapter:
        "WEEK 2｜月曜日",

      bg:
        "manager",

      speaker:
        "MANAGER",

      text:
`WEEK 2。

少しだけ4人らしくなった
O-VER-KiLL。

しかし、
次の問題はもっと単純だった。

――誰にも知られていない。`,

      next:
        "w2_02"
    },


    w2_02: {

      chapter:
        "WEEK 2｜認知度",

      bg:
        "manager",

      member:
        "miyu",

      expression:
        "troubled",

      speaker:
        "MiYU",

      text:
`SNSの数字、

びっくりするくらい
増えないね……。`,

      next:
        "w2_03"
    },


    w2_03: {

      chapter:
        "WEEK 2｜認知度",

      bg:
        "manager",

      member:
        "sarina",

      expression:
        "normal",

      speaker:
        "SARiNA",

      text:
`待ってても
見つけてもらえない。

だったら、

こっちから
見つけてもらいに行こう。`,

      next:
        "w2_training"
    },


    w2_training: {
      type:
        "training"
    }

  }

};
