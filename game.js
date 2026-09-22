const $ =
  id =>
    document.getElementById(id);


const STORAGE_KEY =
  "overkill_manager_story_v6";


const CHAR_IMAGES = {

  sarina:{
    normal:"./sarina_normal.png",
    smile:"./sarina_smile.png",
    angry:"./sarina_angry.png",
    troubled:"./sarina_troubled.png"
  },

  miyu:{
    normal:"./miyu_normal.png",
    smile:"./miyu_smile.png",
    angry:"./miyu_angry.png",
    troubled:"./miyu_troubled.png"
  },

  kilua:{
    normal:"./kilua_normal.png",
    smile:"./kilua_smile.png",
    angry:"./kilua_angry.png",
    troubled:"./kilua_troubled.png"
  },

  raisa:{
    normal:"./raisa_normal.png",
    smile:"./raisa_smile.png",
    angry:"./raisa_angry.png",
    troubled:"./raisa_troubled.png"
  }

};


const MEMBERS = {

  sarina:{
    name:"SARiNA",
    color:"#69e09a",
    rgb:"105,224,154"
  },

  miyu:{
    name:"MiYU",
    color:"#72bdff",
    rgb:"114,189,255"
  },

  kilua:{
    name:"KiLUA",
    color:"#ff7b88",
    rgb:"255,123,136"
  },

  raisa:{
    name:"RAiSA",
    color:"#ffdc69",
    rgb:"255,220,105"
  }

};


function initialMembers(){

  return {

    sarina:{
      vocal:78,
      dance:48,
      bond:74,
      energy:72
    },

    miyu:{
      vocal:74,
      dance:54,
      bond:68,
      energy:76
    },

    kilua:{
      vocal:52,
      dance:84,
      bond:40,
      energy:80
    },

    raisa:{
      vocal:42,
      dance:44,
      bond:58,
      energy:70
    }

  };

}


function freshState(){

  return {

    node:"intro0",

    reach:10,

    cash:220000,

    members:
      initialMembers(),

    startSnapshot:{
      reach:10,
      members:
        initialMembers()
    },

    flags:{},

    hasStarted:false,

    tutorialSeen:false,

    prologueSeen:false,

    weekFinished:false

  };

}


function loadState(){

  try{

    return (
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        )
      )
      ||
      freshState()
    );

  }

  catch{

    return freshState();

  }

}


let state =
  loadState();


function save(){

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}


function clamp(value){

  return Math.max(
    0,
    Math.min(
      100,
      value
    )
  );

}


function metricLabel(metric){

  return {

    vocal:"歌唱",
    dance:"ダンス",
    bond:"連携",
    energy:"体力",
    reach:"認知"

  }[metric];

}


/* =========================
   SCREEN
========================= */

function showScreen(name){

  [
    "loading",
    "title",
    "prologue",
    "game"
  ]
  .forEach(
    id =>
      $(id)
      .classList
      .remove("active")
  );


  $(name)
    .classList
    .add("active");

}


/* =========================
   LOADING
========================= */

const loadingMembers = [

  [
    "./sarina_smile.png",
    "4人の予定を確認中…"
  ],

  [
    "./miyu_smile.png",
    "SNSのネタを考え中…"
  ],

  [
    "./kilua_smile.png",
    "ダンススタジオ準備中…"
  ],

  [
    "./raisa_smile.png",
    "チラシを印刷中…"
  ]

];


let loadingValue = 0;
let loadingMember = 0;


function startLoading(){

  const timer =
    setInterval(
      ()=>{

        loadingValue =
          Math.min(
            100,
            loadingValue + 6
          );


        $("loadBar")
          .style.width =
          loadingValue + "%";


        $("loadPct")
          .textContent =
          loadingValue + "%";


        const nextMember =
          Math.min(
            3,
            Math.floor(
              loadingValue / 25
            )
          );


        if(
          nextMember
          !==
          loadingMember
        ){

          loadingMember =
            nextMember;


          $("loadChar").src =
            loadingMembers[
              loadingMember
            ][0];


          $("loadMsg")
            .textContent =
            loadingMembers[
              loadingMember
            ][1];

        }


        if(
          loadingValue >= 100
        ){

          clearInterval(timer);


          setTimeout(
            ()=>{
              showScreen(
                "title"
              );
            },
            350
          );

        }

      },
      100
    );

}


/* =========================
   TITLE
========================= */

$("startBtn").onclick =
()=>{

  state =
    freshState();


  state.hasStarted =
    true;


  save();

  startPrologue();

};


$("contBtn").onclick =
()=>{

  if(
    state.prologueSeen
  ){

    showScreen(
      "game"
    );

    renderStory();

  }

  else{

    startPrologue();

  }

};


/* =========================
   PROLOGUE
========================= */

let prologueIndex = 0;

let prologueTyping =
  false;

let prologueFullText =
  "";

let prologueTimer =
  null;


function startPrologue(){

  prologueIndex = 0;

  showScreen(
    "prologue"
  );

  typePrologue(
    PROLOGUE_LINES[0]
  );

}


function typePrologue(text){

  clearInterval(
    prologueTimer
  );


  prologueTyping =
    true;


  prologueFullText =
    text;


  $("proText")
    .textContent =
    "";


  let index = 0;


  prologueTimer =
    setInterval(
      ()=>{

        index++;


        $("proText")
          .textContent =
          text.slice(
            0,
            index
          );


        if(
          index >=
          text.length
        ){

          clearInterval(
            prologueTimer
          );


          prologueTyping =
            false;

        }

      },
      36
    );

}


$("prologue").onclick =
()=>{

  if(
    prologueTyping
  ){

    clearInterval(
      prologueTimer
    );


    $("proText")
      .textContent =
      prologueFullText;


    prologueTyping =
      false;


    return;

  }


  prologueIndex++;


  if(
    prologueIndex
    >=
    PROLOGUE_LINES.length
  ){

    state.prologueSeen =
      true;


    save();


    showScreen(
      "game"
    );


    renderStory();


    return;

  }


  typePrologue(
    PROLOGUE_LINES[
      prologueIndex
    ]
  );

};


/* =========================
   STORY RENDER
========================= */

const env =
  $("env");

const character =
  $("char");

const aura =
  $("aura");

const managerMark =
  $("managerMark");

const reaction =
  $("reaction");

const speaker =
  $("speaker");

const text =
  $("text");

const dialogue =
  $("dialogue");

const nextMark =
  $("nextMark");

const tapGuide =
  $("tapGuide");


function setScene(node){

  $("chapter")
    .textContent =
    node.chapter
    ||
    "WEEK 1";


  env.className =
    "environment "
    +
    (
      node.bg
      ||
      "manager"
    );


  character
    .classList
    .remove("show");


  aura
    .classList
    .remove("show");


  managerMark
    .classList
    .remove("show");


  reaction
    .classList
    .remove("show");


  reaction.textContent =
    "";


  if(
    node.member
  ){

    const member =
      MEMBERS[
        node.member
      ];


    const expression =
      node.expression
      ||
      "normal";


    character.src =
      CHAR_IMAGES[
        node.member
      ][expression];


    aura.style
      .setProperty(
        "--char-rgb",
        member.rgb
      );


    requestAnimationFrame(
      ()=>{

        character
          .classList
          .add("show");


        aura
          .classList
          .add("show");

      }
    );

  }

  else{

    managerMark
      .classList
      .add("show");

  }


  if(
    node.reaction
  ){

    reaction.textContent =
      node.reaction;


    requestAnimationFrame(
      ()=>{

        reaction
          .classList
          .add("show");

      }
    );

  }


  speaker.textContent =
    node.speaker
    ||
    "MANAGER";

}


/* =========================
   TYPEWRITER
========================= */

let typing =
  false;

let fullText =
  "";

let typingTimer =
  null;


function typeLine(line){

  clearInterval(
    typingTimer
  );


  typing =
    true;


  fullText =
    line;


  text.innerHTML =
    "";


  nextMark
    .style.display =
    "none";


  let index = 0;


  typingTimer =
    setInterval(
      ()=>{

        index++;


        text.textContent =
          line.slice(
            0,
            index
          );


        if(
          index >=
          line.length
        ){

          clearInterval(
            typingTimer
          );


          typing =
            false;


          nextMark
            .style.display =
            "block";

        }

      },
      24
    );

}


/* =========================
   MAIN RENDER
========================= */

function renderStory(){

  if(
    state.node
    ===
    "weekComplete"
  ){

    renderWeekEnd();

    return;

  }


  const node =
    STORY[
      state.node
    ];


  if(
    !node
  ){

    console.error(
      "Story node not found:",
      state.node
    );

    return;

  }


  setScene(
    node
  );


  dialogue.onclick =
    null;


  if(
    node.choices
  ){

    typing =
      false;


    nextMark
      .style.display =
      "none";


    const choiceHtml =
      node.choices
      .map(
        (choice,index)=>
          `
          <button
            class="choice"
            data-choice="${index}"
          >
            ${choice.text}
          </button>
          `
      )
      .join("");


    text.innerHTML =
      `
      <div class="choiceIntro">
        ${node.text.replace(/\n/g,"<br>")}
      </div>

      <div class="choices">
        ${choiceHtml}
      </div>
      `;


    return;

  }


  typeLine(
    node.text
  );


  if(
    !state.tutorialSeen
  ){

    tapGuide
      .classList
      .add("show");

  }


  dialogue.onclick =
    advanceStory;

}


/* =========================
   ADVANCE
========================= */

function advanceStory(){

  if(
    !state.tutorialSeen
  ){

    state.tutorialSeen =
      true;


    tapGuide
      .classList
      .remove("show");


    save();

  }


  if(
    typing
  ){

    clearInterval(
      typingTimer
    );


    text.textContent =
      fullText;


    typing =
      false;


    nextMark
      .style.display =
      "block";


    return;

  }


  const node =
    STORY[
      state.node
    ];


  if(
    node.result
  ){

    const result =
      runResult(
        node.result
      );


    showResult(
      result,
      node.next
    );


    return;

  }


  if(
    node.next
  ){

    state.node =
      node.next;


    save();


    renderStory();

  }

}


/* =========================
   CHOICES
========================= */

text.addEventListener(
  "click",
  event=>{

    const button =
      event.target.closest(
        "[data-choice]"
      );


    if(
      !button
    ){

      return;

    }


    event.stopPropagation();


    const node =
      STORY[
        state.node
      ];


    const choice =
      node.choices[
        Number(
          button.dataset.choice
        )
      ];


    state.flags[
      choice.action
    ] =
      true;


    state.node =
      choice.next;


    save();


    renderStory();

  }
);


/* =========================
   STATUS UPDATE
========================= */

function updateMember(
  member,
  metric,
  delta
){

  const before =
    state.members[
      member
    ][metric];


  state.members[
    member
  ][metric] =
    clamp(
      before
      +
      delta
    );


  return {

    name:
      MEMBERS[
        member
      ].name,

    metric,

    before,

    after:
      state.members[
        member
      ][metric],

    delta

  };

}


function updateReach(
  delta
){

  const before =
    state.reach;


  state.reach =
    clamp(
      before
      +
      delta
    );


  return {

    name:"GROUP",

    metric:"reach",

    before,

    after:
      state.reach,

    delta

  };

}


/* =========================
   RESULT CALCULATION
========================= */

function runResult(
  type
){

  let changes = [];

  let title =
    "RESULT";

  let headline =
    "";


  if(
    type === "teach"
  ){

    title =
      "LESSON RESULT";


    headline =
      "教えることも、練習。";


    changes = [

      updateMember(
        "kilua",
        "dance",
        3
      ),

      updateMember(
        "kilua",
        "bond",
        6
      ),

      updateMember(
        "sarina",
        "dance",
        5
      ),

      updateMember(
        "miyu",
        "dance",
        5
      ),

      updateMember(
        "raisa",
        "dance",
        4
      ),

      updateMember(
        "sarina",
        "energy",
        -7
      ),

      updateMember(
        "miyu",
        "energy",
        -7
      ),

      updateMember(
        "kilua",
        "energy",
        -7
      ),

      updateMember(
        "raisa",
        "energy",
        -7
      )

    ];

  }


  if(
    type === "split"
  ){

    title =
      "LESSON RESULT";


    headline =
      "少しずつなら、4人で揃えられる。";


    [
      "sarina",
      "miyu",
      "kilua",
      "raisa"
    ]
    .forEach(
      id=>{

        changes.push(
          updateMember(
            id,
            "dance",
            4
          )
        );


        changes.push(
          updateMember(
            id,
            "bond",
            3
          )
        );


        changes.push(
          updateMember(
            id,
            "energy",
            -7
          )
        );

      }
    );

  }


  if(
    type === "push"
  ){

    title =
      "LESSON RESULT";


    headline =
      "伸びた。でも少し無理をした。";


    changes = [

      updateMember(
        "sarina",
        "dance",
        7
      ),

      updateMember(
        "miyu",
        "dance",
        7
      ),

      updateMember(
        "kilua",
        "dance",
        4
      ),

      updateMember(
        "raisa",
        "dance",
        5
      ),

      updateMember(
        "sarina",
        "energy",
        -12
      ),

      updateMember(
        "miyu",
        "energy",
        -12
      ),

      updateMember(
        "kilua",
        "energy",
        -8
      ),

      updateMember(
        "raisa",
        "energy",
        -13
      )

    ];

  }


  if(
    type === "rest"
  ){

    title =
      "LESSON RESULT";


    headline =
      "止まったから見えたこともある。";


    [
      "sarina",
      "miyu",
      "kilua",
      "raisa"
    ]
    .forEach(
      id=>{

        changes.push(
          updateMember(
            id,
            "bond",
            4
          )
        );


        changes.push(
          updateMember(
            id,
            "energy",
            -3
          )
        );

      }
    );

  }


  if(
    type === "sns"
  ){

    title =
      "SNS RESULT";


    headline =
      "知らない誰かに届いた。";


    changes = [

      updateReach(
        8
      ),

      updateMember(
        "miyu",
        "bond",
        2
      ),

      updateMember(
        "sarina",
        "energy",
        -3
      ),

      updateMember(
        "miyu",
        "energy",
        -3
      ),

      updateMember(
        "kilua",
        "energy",
        -3
      ),

      updateMember(
        "raisa",
        "energy",
        -3
      )

    ];

  }


  if(
    type === "flyer"
  ){

    title =
      "FLYER RESULT";


    headline =
      "一枚ずつ、知ってもらう。";


    changes = [

      updateReach(
        12
      ),

      updateMember(
        "sarina",
        "energy",
        -7
      ),

      updateMember(
        "miyu",
        "energy",
        -7
      ),

      updateMember(
        "kilua",
        "energy",
        -7
      ),

      updateMember(
        "raisa",
        "energy",
        -7
      )

    ];

  }


  if(
    type === "vocal"
  ){

    title =
      "VOCAL RESULT";


    headline =
      "認知は増えない。でも歌は良くなる。";


    changes = [

      updateMember(
        "sarina",
        "vocal",
        5
      ),

      updateMember(
        "miyu",
        "vocal",
        5
      ),

      updateMember(
        "kilua",
        "vocal",
        4
      ),

      updateMember(
        "raisa",
        "vocal",
        4
      ),

      updateMember(
        "sarina",
        "energy",
        -6
      ),

      updateMember(
        "miyu",
        "energy",
        -6
      ),

      updateMember(
        "kilua",
        "energy",
        -6
      ),

      updateMember(
        "raisa",
        "energy",
        -6
      )

    ];

  }


  if(
    type === "recovery"
  ){

    title =
      "RECOVERY";


    headline =
      "休むことも、仕事。";


    changes =
      [
        "sarina",
        "miyu",
        "kilua",
        "raisa"
      ]
      .map(
        id =>
          updateMember(
            id,
            "energy",
            8
          )
      );

  }


  save();


  return {

    title,
    headline,
    changes

  };

}


/* =========================
   RESULT UI
========================= */

function showResult(
  result,
  nextNode
){

  $("resultBox")
    .innerHTML =
    `
    <div class="resultTag">
      ${result.title}
    </div>

    <div class="resultTitle">
      ${result.headline}
    </div>

    <div class="resultRows">

      ${result.changes
        .map(
          change =>
            `
            <div class="resultRow">

              <span>
                ${change.name}
                ・
                ${metricLabel(
                  change.metric
                )}
              </span>

              <span>
                ${change.before}
                →
                ${change.after}
              </span>

              <span
                class="
                  delta
                  ${
                    change.delta < 0
                    ? "minus"
                    : ""
                  }
                "
              >

                ${
                  change.delta > 0
                  ? "+"
                  : ""
                }

                ${change.delta}

              </span>

            </div>
            `
        )
        .join("")
      }

    </div>

    <div class="resultHint">
      タップして続ける
    </div>
    `;


  $("result")
    .classList
    .add("show");


  $("result").onclick =
  ()=>{

    $("result")
      .classList
      .remove("show");


    state.node =
      nextNode;


    save();


    renderStory();

  };

}


/* =========================
   WEEK END
========================= */

function renderWeekEnd(){

  state.weekFinished =
    true;


  save();


  $("weekEnd")
    .innerHTML =
    `
    <div class="weekTag">
      WEEK 1 COMPLETE
    </div>

    <h2>
      4人でやるって、<br>
      難しい。
    </h2>

    <div class="weekText">
      まだバラバラ。<br>
      でも少しずつ、
      4人の形が見えてきた。
    </div>

    <div class="summary">

      <div class="sumRow">

        <span>
          認知
        </span>

        <strong>
          ${state.startSnapshot.reach}
          →
          ${state.reach}
        </strong>

      </div>

    </div>

    <div class="days">

      デビューまで

      <strong>
        あと21日
      </strong>

    </div>

    <button class="weekBtn">
      WEEK 2へ →
    </button>
    `;


  $("weekEnd")
    .classList
    .add("show");

}


/* =========================
   STATUS
========================= */

$("statusBtn").onclick =
()=>{

  const averageBond =
    Math.round(
      Object.keys(
        state.members
      )
      .reduce(
        (sum,id)=>
          sum
          +
          state.members[id].bond,
        0
      )
      /
      4
    );


  $("modalBox")
    .innerHTML =
    `
    <h2>
      O-VER-KiLL STATUS
    </h2>

    <div class="statusTop">

      認知：
      ${state.reach}

      <br>

      連携平均：
      ${averageBond}

      <br>

      活動資金：
      ¥${state.cash.toLocaleString(
        "ja-JP"
      )}

    </div>

    ${Object.keys(
      MEMBERS
    )
    .map(
      id => {

        const member =
          MEMBERS[id];


        const stats =
          state.members[id];


        return `
        <div class="member">

          <h3
            style="
              color:${member.color}
            "
          >
            ${member.name}
          </h3>

          <div class="vals">

            <div>
              🎤 歌唱
              ${stats.vocal}
            </div>

            <div>
              💃 ダンス
              ${stats.dance}
            </div>

            <div>
              🤝 連携
              ${stats.bond}
            </div>

            <div>
              ❤️ 体力
              ${stats.energy}
            </div>

          </div>

        </div>
        `;

      }
    )
    .join("")
    }

    <button
      class="close"
      data-close
    >
      閉じる
    </button>
    `;


  $("modal")
    .classList
    .add("show");

};


$("modal").onclick =
event=>{

  if(
    event.target.id === "modal"
    ||
    event.target.matches(
      "[data-close]"
    )
  ){

    $("modal")
      .classList
      .remove("show");

  }

};


/* =========================
   START
========================= */

startLoading();
