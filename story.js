const PROLOGUE_LINES = [
`豊洲公園。

まだ何者でもない4人が、
初めて同じステージに立った。`,

`その4週間前――

あなたは、
新しく結成された4人組
「O-VER-KiLL」の
マネージャーを任される。`,

`歌も、ダンスも、
性格も、バラバラ。

だけど、
この4人には
何かがある気がした。`,

`デビューライブまで、あと28日。

ここから、
4人とあなたの物語が始まる。`
];


const STORY = {

intro0:{
  chapter:"WEEK 1｜初顔合わせ",
  bg:"manager",
  speaker:"MANAGER",
  text:
`今日から、
4人組アイドル
「O-VER-KiLL」の
マネージャーを任された。

まずは初レッスン。
ここから全部が始まる。`,
  next:"s1"
},


s1:{
  chapter:"WEEK 1｜初レッスン",
  bg:"studio",
  member:"sarina",
  expression:"normal",
  speaker:"SARiNA",
  text:
`今日からちゃんと
4人で合わせるんだよね。`,
  next:"s2"
},


s2:{
  chapter:"WEEK 1｜初レッスン",
  bg:"studio",
  member:"miyu",
  expression:"smile",
  speaker:"MiYU",
  text:
`なんか急に
グループっぽくなってきた笑`,
  reaction:"✨",
  next:"s3"
},


s3:{
  chapter:"WEEK 1｜初レッスン",
  bg:"studio",
  member:"raisa",
  expression:"troubled",
  speaker:"RAiSA",
  text:
`私、
ついていけるかな……`,
  reaction:"💧",
  next:"s4"
},


s4:{
  chapter:"WEEK 1｜初レッスン",
  bg:"studio",
  member:"kilua",
  expression:"normal",
  speaker:"KiLUA",
  text:
`大丈夫。

じゃあ最初から通そう。`,
  next:"s5"
},


s5:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"smile",
  speaker:"KiLUA",
  text:
`5、6、7、8！`,
  next:"s6"
},


s6:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"sarina",
  expression:"troubled",
  speaker:"SARiNA",
  text:
`……待って待って！`,
  reaction:"💦",
  next:"s7"
},


s7:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"miyu",
  expression:"troubled",
  speaker:"MiYU",
  text:
`そこ、もう一回！

KiLUA速いって笑`,
  next:"s8"
},


s8:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"normal",
  speaker:"KiLUA",
  text:
`でもこれくらいで入らないと、
次間に合わないよ？`,
  next:"s9"
},


s9:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"sarina",
  expression:"angry",
  speaker:"SARiNA",
  text:
`いや待って。

まだ分かってないから。`,
  reaction:"💢",
  next:"s10"
},


s10:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"angry",
  speaker:"KiLUA",
  text:
`でも何回も止めてたら
終わらなくない？`,
  next:"s11"
},


s11:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"miyu",
  expression:"angry",
  speaker:"MiYU",
  text:
`KiLUAはできるけど、
私たちはまだ
教わってないじゃん。`,
  next:"s12"
},


s12:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"troubled",
  speaker:"KiLUA",
  text:
`……見たら分かると思った。`,
  next:"decision1"
},


decision1:{
  chapter:"DANCE LESSON",
  bg:"studio",
  speaker:"MANAGER",
  text:
`スタジオの空気が
少し張りつめてきた。

マネージャーとして、
どう動く？`,
  choices:[
    {
      text:"教え方を変えてもらう",
      action:"teach",
      next:"teach1"
    },
    {
      text:"8カウントずつ確認",
      action:"split",
      next:"split1"
    },
    {
      text:"そのまま続ける",
      action:"push",
      next:"push1"
    },
    {
      text:"一度休憩する",
      action:"restDance",
      next:"rest1"
    }
  ]
},


teach1:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"troubled",
  speaker:"KiLUA",
  text:
`……教え方？`,
  next:"teach2"
},


teach2:{
  chapter:"DANCE LESSON",
  bg:"studio",
  speaker:"MANAGER",
  text:
`KiLUAには自然でも、
3人にはまだ自然じゃない。

一回ゆっくり説明しよう。`,
  next:"teach3"
},


teach3:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"normal",
  speaker:"KiLUA",
  text:
`……分かった。

ここ。
足からじゃなくて、
先に肩。`,
  next:"teach4"
},


teach4:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"miyu",
  expression:"smile",
  speaker:"MiYU",
  text:
`あっ！

今ので分かった！`,
  reaction:"✨",
  next:"teach5"
},


teach5:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"sarina",
  expression:"smile",
  speaker:"SARiNA",
  text:
`最初からそれ言ってよ笑`,
  next:"teach6"
},


teach6:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"troubled",
  speaker:"KiLUA",
  text:
`教えるの……

むず。`,
  result:"teach",
  next:"after1"
},


split1:{
  chapter:"DANCE LESSON",
  bg:"studio",
  speaker:"MANAGER",
  text:
`誰が悪いかじゃなくて、
8カウントずつ確認しよう。`,
  next:"split2"
},


split2:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"miyu",
  expression:"smile",
  speaker:"MiYU",
  text:
`あ、これなら分かる！`,
  next:"split3"
},


split3:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"raisa",
  expression:"smile",
  speaker:"RAiSA",
  text:
`助かる……！`,
  reaction:"✨",
  next:"split4"
},


split4:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"normal",
  speaker:"KiLUA",
  text:
`じゃあここまで。

まず8カウント。`,
  result:"split",
  next:"after1"
},


push1:{
  chapter:"DANCE LESSON",
  bg:"studio",
  speaker:"MANAGER",
  text:
`今日はKiLUAのペースでいこう。

まず本番速度を知る。`,
  next:"push2"
},


push2:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"smile",
  speaker:"KiLUA",
  text:
`OK。

じゃあ止めないよ。`,
  next:"push3"
},


push3:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"sarina",
  expression:"troubled",
  speaker:"SARiNA",
  text:
`キッツ……！`,
  reaction:"💦",
  next:"push4"
},


push4:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"raisa",
  expression:"troubled",
  speaker:"RAiSA",
  text:
`無理無理無理！`,
  reaction:"💦",
  next:"push5"
},


push5:{
  chapter:"DANCE LESSON",
  bg:"studio",
  member:"kilua",
  expression:"normal",
  speaker:"KiLUA",
  text:
`……でも、
さっきより揃ってる。`,
  result:"push",
  next:"after1"
},


rest1:{
  chapter:"BREAK",
  bg:"lounge",
  speaker:"MANAGER",
  text:
`5分休憩。`,
  next:"rest2"
},


rest2:{
  chapter:"BREAK",
  bg:"lounge",
  member:"kilua",
  speaker:"KiLUA",
  text:
`まだできるけど。`,
  next:"rest3"
},


rest3:{
  chapter:"BREAK",
  bg:"lounge",
  member:"sarina",
  expression:"angry",
  speaker:"SARiNA",
  text:
`できるできないじゃなくて、
今ちょっと空気悪い。`,
  next:"rest4"
},


rest4:{
  chapter:"BREAK",
  bg:"lounge",
  member:"miyu",
  expression:"smile",
  speaker:"MiYU",
  text:
`KiLUAさ。

教えるの初めて？`,
  next:"rest5"
},


rest5:{
  chapter:"BREAK",
  bg:"lounge",
  member:"kilua",
  speaker:"KiLUA",
  text:
`うん。`,
  next:"rest6"
},


rest6:{
  chapter:"BREAK",
  bg:"lounge",
  member:"miyu",
  expression:"smile",
  speaker:"MiYU",
  text:
`だったら
最初から言ってよ笑`,
  reaction:"😂",
  result:"rest",
  next:"after1"
},


after1:{
  chapter:"練習後",
  bg:"lounge",
  member:"miyu",
  expression:"troubled",
  speaker:"MiYU",
  text:
`……疲れた。`,
  next:"after2"
},


after2:{
  chapter:"練習後",
  bg:"lounge",
  member:"raisa",
  expression:"troubled",
  speaker:"RAiSA",
  text:
`足ない。`,
  next:"after3"
},


after3:{
  chapter:"練習後",
  bg:"lounge",
  member:"kilua",
  speaker:"KiLUA",
  text:
`まだできる。`,
  next:"after4"
},


after4:{
  chapter:"練習後",
  bg:"lounge",
  member:"sarina",
  expression:"smile",
  speaker:"SARiNA",
  text:
`KiLUAだけ
体力おかしいでしょ笑`,
  reaction:"😂",
  next:"after5"
},


after5:{
  chapter:"練習後",
  bg:"lounge",
  member:"sarina",
  speaker:"SARiNA",
  text:
`でもさ。

ダンスだけやってても、
誰にも知られてないよね。`,
  next:"decision2"
},


decision2:{
  chapter:"練習後",
  bg:"lounge",
  speaker:"MANAGER",
  text:
`まだ少し時間はある。

マネージャーとして、
次に何を優先する？`,
  choices:[
    {
      text:"SNS用の動画を撮る",
      action:"sns",
      next:"sns1"
    },
    {
      text:"チラシを配りに行く",
      action:"flyer",
      next:"flyer1"
    },
    {
      text:"ボーカルも合わせる",
      action:"vocal",
      next:"vocal1"
    },
    {
      text:"今日はここで終わる",
      action:"recovery",
      next:"recovery1"
    }
  ]
},


sns1:{
  chapter:"SNS作戦",
  bg:"sns",
  member:"miyu",
  expression:"smile",
  speaker:"MiYU",
  text:
`じゃあ動画撮ろうよ！`,
  reaction:"📱",
  next:"sns2"
},


sns2:{
  chapter:"SNS作戦",
  bg:"sns",
  member:"raisa",
  expression:"troubled",
  speaker:"RAiSA",
  text:
`私、
前髪死んでる……`,
  reaction:"💦",
  next:"sns3"
},


sns3:{
  chapter:"SNS作戦",
  bg:"sns",
  member:"sarina",
  expression:"smile",
  speaker:"SARiNA",
  text:
`撮るよー！`,
  reaction:"📸",
  next:"sns4"
},


sns4:{
  chapter:"SNS作戦",
  bg:"sns",
  member:"raisa",
  expression:"smile",
  speaker:"RAiSA",
  text:
`……増えてる！

ほんとに見てる人いる！`,
  reaction:"✨",
  result:"sns",
  next:"end1"
},


flyer1:{
  chapter:"FLYER MISSION",
  bg:"city",
  member:"miyu",
  expression:"smile",
  speaker:"MiYU",
  text:
`お願いしまーす！

今度ライブやります！`,
  reaction:"📣",
  next:"flyer2"
},


flyer2:{
  chapter:"FLYER MISSION",
  bg:"city",
  member:"raisa",
  expression:"troubled",
  speaker:"RAiSA",
  text:
`……え。

こんなに
無視される？`,
  reaction:"💧",
  next:"flyer3"
},


flyer3:{
  chapter:"FLYER MISSION",
  bg:"city",
  member:"sarina",
  speaker:"SARiNA",
  text:
`もっと声出そ。

知られてないなら、
知ってもらうしかない。`,
  next:"flyer4"
},


flyer4:{
  chapter:"FLYER MISSION",
  bg:"city",
  member:"raisa",
  expression:"smile",
  speaker:"RAiSA",
  text:
`今の一枚、
めっちゃ嬉しいんだけど。`,
  result:"flyer",
  next:"end1"
},


vocal1:{
  chapter:"VOCAL LESSON",
  bg:"studio",
  member:"sarina",
  expression:"smile",
  speaker:"SARiNA",
  text:
`じゃあ、
歌も合わせよう。`,
  reaction:"🎤",
  next:"vocal2"
},


vocal2:{
  chapter:"VOCAL LESSON",
  bg:"studio",
  member:"kilua",
  expression:"troubled",
  speaker:"KiLUA",
  text:
`ダンスより
歌の方がキツいんだけど。`,
  reaction:"💦",
  next:"vocal3"
},


vocal3:{
  chapter:"VOCAL LESSON",
  bg:"studio",
  member:"sarina",
  expression:"smile",
  speaker:"SARiNA",
  text:
`じゃあ、
ここから！`,
  result:"vocal",
  next:"end1"
},


recovery1:{
  chapter:"TODAY'S END",
  bg:"lounge",
  member:"miyu",
  speaker:"MiYU",
  text:
`今日はもう帰ろ。`,
  next:"recovery2"
},


recovery2:{
  chapter:"TODAY'S END",
  bg:"lounge",
  member:"sarina",
  speaker:"SARiNA",
  text:
`明日動けなくなったら
意味ないよ。`,
  next:"recovery3"
},


recovery3:{
  chapter:"TODAY'S END",
  bg:"lounge",
  member:"kilua",
  speaker:"KiLUA",
  text:
`……分かった。`,
  result:"recovery",
  next:"end1"
},


end1:{
  chapter:"WEEK 1｜夜",
  bg:"lounge",
  member:"raisa",
  expression:"troubled",
  speaker:"RAiSA",
  text:
`1週間長かった……`,
  next:"end2"
},


end2:{
  chapter:"WEEK 1｜夜",
  bg:"lounge",
  member:"miyu",
  expression:"smile",
  speaker:"MiYU",
  text:
`まだ1週目なんだけど笑`,
  reaction:"😂",
  next:"end3"
},


end3:{
  chapter:"WEEK 1｜夜",
  bg:"lounge",
  member:"sarina",
  expression:"smile",
  speaker:"SARiNA",
  text:
`まだ4人とも
全然違うけど。

それを合わせてくのが、
グループなのかもね。`,
  next:"end4"
},


end4:{
  chapter:"WEEK 1｜夜",
  bg:"lounge",
  member:"kilua",
  speaker:"KiLUA",
  text:
`……たぶん。`,
  next:"weekComplete"
}

};
