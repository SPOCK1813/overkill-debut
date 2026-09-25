window.GAME_CONFIG = {
  members: {
    sarina: { name: "SARiNA", color: "#69e09a", rgb: "105,224,154" },
    miyu:   { name: "MiYU",   color: "#72bdff", rgb: "114,189,255" },
    kilua:  { name: "KiLUA",  color: "#ff7b88", rgb: "255,123,136" },
    raisa:  { name: "RAiSA",  color: "#ffdc69", rgb: "255,220,105" }
  },

  charImages: {
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

  prologue: [
    "あなたは今日から、\n4人組アイドルグループ\n『O-VER-KiLL』のマネージャー。",
    "デビューまで残り4週間。\nまだ4人は、ひとつのグループとは言いきれない。",
    "歌、ダンス、連携、体力。\n限られた時間の中で、何を優先するか。",
    "その選択が、\n4人の未来を少しずつ変えていく。"
  ],

  story: {
    m1: {
      chapter: "WEEK 1｜マネージャー就任",
      bg: "office",
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
      bg: "office",
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
      text:
`なんか急に
グループっぽくなってきたね。`,
      reaction: "✨",
      next: "s3"
    },

    s3: {
      chapter: "WEEK 1｜初レッスン",
      bg: "studio",
      member: "raisa",
      expression: "troubled",
      speaker: "RAiSA",
      text:
`私、
ちゃんとついていけるかな……`,
      reaction: "💧",
      next: "s4"
    },

    s4: {
      chapter: "WEEK 1｜初レッスン",
      bg: "studio",
      member: "kilua",
      expression: "normal",
      speaker: "KiLUA",
      text:
`じゃあ、最初から通そう。
5、6、7、8！`,
      next: "s5"
    },

    s5: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "sarina",
      expression: "troubled",
      speaker: "SARiNA",
      text:
`待って、待って！
今どこ入った！？`,
      reaction: "💦",
      next: "s6"
    },

    s6: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "miyu",
      expression: "troubled",
      speaker: "MiYU",
      text:
`KiLUA、速いって！
そこ、まだ教わってない。`,
      reaction: "💦",
      next: "s7"
    },

    s7: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "kilua",
      expression: "angry",
      speaker: "KiLUA",
      text:
`でも、この速さで入れないと
本番に間に合わないよ？`,
      next: "s8"
    },

    s8: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "sarina",
      expression: "angry",
      speaker: "SARiNA",
      text:
`できる人の感覚で
進められても困る。`,
      reaction: "💢",
      next: "s9"
    },

    s9: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "miyu",
      expression: "angry",
      speaker: "MiYU",
      text:
`KiLUAは踊れる。
でも教えるのはまた別じゃん。`,
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
        { text: "KiLUAに教え方を変えてもらう", next: "teach1", result: "teach" },
        { text: "8カウントずつ分けて確認する", next: "split1", result: "split" },
        { text: "KiLUAのペースで続ける", next: "push1", result: "push" },
        { text: "一度休憩して空気を戻す", next: "rest1", result: "restDance" }
      ]
    },

    teach1: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "kilua",
      expression: "troubled",
      speaker: "KiLUA",
      text:
`……教え方？
見れば分かると思ってた。`,
      next: "teach2"
    },

    teach2: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      speaker: "MANAGER",
      text:
`KiLUAには自然でも、
3人にはまだ自然じゃない。

ゆっくり言葉にして伝えよう。`,
      next: "teach3"
    },

    teach3: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "kilua",
      expression: "normal",
      speaker: "KiLUA",
      text:
`……分かった。
ここは足じゃなくて、先に肩。`,
      next: "teach4"
    },

    teach4: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      text:
`あ、それなら分かる！
最初からそう言ってほしかった。`,
      reaction: "✨",
      resultId: "teachResult",
      next: "after1"
    },

    split1: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      speaker: "MANAGER",
      text:
`一気に通すんじゃなくて、
8カウントずつ揃えよう。

4人で一回ずつ確認していく。`,
      next: "split2"
    },

    split2: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "raisa",
      expression: "smile",
      speaker: "RAiSA",
      text:
`これなら、置いていかれない……！`,
      reaction: "✨",
      next: "split3"
    },

    split3: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "sarina",
      expression: "smile",
      speaker: "SARiNA",
      text:
`うん。
少しずつでも揃う方がいい。`,
      resultId: "splitResult",
      next: "after1"
    },

    push1: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      speaker: "MANAGER",
      text:
`今日は止めずに行こう。
まず本番速度を身体で覚える。`,
      next: "push2"
    },

    push2: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "kilua",
      expression: "smile",
      speaker: "KiLUA",
      text:
`OK。
じゃあ今度は止めない。`,
      next: "push3"
    },

    push3: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "raisa",
      expression: "cry",
      speaker: "RAiSA",
      text:
`速っ……！
待って、全然追いつかない……！`,
      reaction: "💦",
      next: "push4"
    },

    push4: {
      chapter: "WEEK 1｜ダンス合わせ",
      bg: "studio",
      member: "sarina",
      expression: "angry",
      speaker: "SARiNA",
      text:
`揃ってないのに通しても、
ただ崩れるだけじゃん。`,
      reaction: "💢",
      resultId: "pushResult",
      next: "after1"
    },

    rest1: {
      chapter: "WEEK 1｜休憩",
      bg: "lounge",
      speaker: "MANAGER",
      text:
`一旦5分休憩。
空気を立て直してから戻ろう。`,
      next: "rest2"
    },

    rest2: {
      chapter: "WEEK 1｜休憩",
      bg: "lounge",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      text:
`KiLUA、教えるの初めてでしょ？`,
      next: "rest3"
    },

    rest3: {
      chapter: "WEEK 1｜休憩",
      bg: "lounge",
      member: "kilua",
      expression: "troubled",
      speaker: "KiLUA",
      text:
`……うん。`,
      next: "rest4"
    },

    rest4: {
      chapter: "WEEK 1｜休憩",
      bg: "lounge",
      member: "sarina",
      expression: "smile",
      speaker: "SARiNA",
      text:
`じゃあ、そこからだね。
できるのと教えるのは違うし。`,
      resultId: "restResult",
      next: "after1"
    },

    after1: {
      chapter: "WEEK 1｜練習後",
      bg: "lounge",
      member: "miyu",
      expression: "troubled",
      speaker: "MiYU",
      text:
`……疲れた。
でもちょっとだけ形見えてきたかも。`,
      next: "after2"
    },

    after2: {
      chapter: "WEEK 1｜練習後",
      bg: "lounge",
      member: "sarina",
      expression: "normal",
      speaker: "SARiNA",
      text:
`ただ、レッスンだけじゃ
誰にも知られないんだよね。`,
      next: "after3"
    },

    after3: {
      chapter: "WEEK 1｜練習後",
      bg: "lounge",
      member: "raisa",
      expression: "troubled",
      speaker: "RAiSA",
      text:
`今のままだと、
認知も全然ないし……`,
      next: "decision2"
    },

    decision2: {
      chapter: "WEEK 1｜次の一手",
      bg: "lounge",
      speaker: "MANAGER",
      text:
`まだ少し時間はある。

マネージャーとして、
次に何を優先する？`,
      choices: [
        { text: "SNS用の動画を撮る", next: "sns1", result: "sns" },
        { text: "チラシを配りに行く", next: "flyer1", result: "flyer" },
        { text: "ボーカルを合わせる", next: "vocal1", result: "vocal" },
        { text: "今日は回復を優先する", next: "recover1", result: "recover" }
      ]
    },

    sns1: {
      chapter: "WEEK 1｜SNS撮影",
      bg: "sns",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      text:
`じゃあ動画撮ろう！
レッスン終わりの勢いで行ける。`,
      reaction: "📱",
      next: "sns2"
    },

    sns2: {
      chapter: "WEEK 1｜SNS撮影",
      bg: "sns",
      member: "raisa",
      expression: "troubled",
      speaker: "RAiSA",
      text:
`前髪やばいんだけど……`,
      reaction: "💦",
      next: "sns3"
    },

    sns3: {
      chapter: "WEEK 1｜SNS撮影",
      bg: "sns",
      member: "sarina",
      expression: "smile",
      speaker: "SARiNA",
      text:
`そういう生っぽさも武器でしょ。
よし、撮るよ！`,
      reaction: "📸",
      resultId: "snsResult",
      next: "end1"
    },

    flyer1: {
      chapter: "WEEK 1｜チラシ配布",
      bg: "city",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      text:
`お願いしまーす！
今度ライブあります！`,
      reaction: "📣",
      next: "flyer2"
    },

    flyer2: {
      chapter: "WEEK 1｜チラシ配布",
      bg: "city",
      member: "raisa",
      expression: "troubled",
      speaker: "RAiSA",
      text:
`こんなに無視されるんだ……`,
      reaction: "💧",
      next: "flyer3"
    },

    flyer3: {
      chapter: "WEEK 1｜チラシ配布",
      bg: "city",
      member: "sarina",
      expression: "normal",
      speaker: "SARiNA",
      text:
`知られてないなら、
知ってもらうまでやるだけ。`,
      resultId: "flyerResult",
      next: "end1"
    },

    vocal1: {
      chapter: "WEEK 1｜ボーカル合わせ",
      bg: "studio",
      member: "sarina",
      expression: "smile",
      speaker: "SARiNA",
      text:
`じゃあ歌を合わせよう。
ここは私とMiYUが引っ張る。`,
      reaction: "🎤",
      next: "vocal2"
    },

    vocal2: {
      chapter: "WEEK 1｜ボーカル合わせ",
      bg: "studio",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      text:
`やっと私の見せ場って感じ。`,
      next: "vocal3"
    },

    vocal3: {
      chapter: "WEEK 1｜ボーカル合わせ",
      bg: "studio",
      member: "kilua",
      expression: "troubled",
      speaker: "KiLUA",
      text:
`ダンスより、
歌の方がむずいかも。`,
      reaction: "💦",
      resultId: "vocalResult",
      next: "end1"
    },

    recover1: {
      chapter: "WEEK 1｜回復優先",
      bg: "lounge",
      member: "sarina",
      expression: "normal",
      speaker: "SARiNA",
      text:
`無理して潰れるのが一番困る。
今日は戻ろう。`,
      next: "recover2"
    },

    recover2: {
      chapter: "WEEK 1｜回復優先",
      bg: "lounge",
      member: "raisa",
      expression: "smile",
      speaker: "RAiSA",
      text:
`助かる……。
明日また頑張る。`,
      resultId: "recoverResult",
      next: "end1"
    },

    end1: {
      chapter: "WEEK 1｜夜",
      bg: "livehouse",
      speaker: "MANAGER",
      text:
`こうして、
最初の1週間が終わった。

まだバラバラだ。
でも、少しだけ前に進んだ。`,
      next: "end2"
    },

    end2: {
      chapter: "WEEK 1｜夜",
      bg: "livehouse",
      member: "miyu",
      expression: "smile",
      speaker: "MiYU",
      text:
`4人で見たい景色、
ちゃんとある気がしてきた。`,
      reaction: "✨",
      next: "end3"
    },

    end3: {
      chapter: "WEEK 1｜夜",
      bg: "livehouse",
      member: "kilua",
      expression: "normal",
      speaker: "KiLUA",
      text:
`……次はもっと
揃えられると思う。`,
      next: "end4"
    },

    end4: {
      chapter: "WEEK 1｜夜",
      bg: "livehouse",
      member: "sarina",
      expression: "smile",
      speaker: "SARiNA",
      text:
`じゃあ、
ここから大きくなってみせよう。`,
      next: "weekComplete"
    }
  }
};
