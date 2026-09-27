const CFG = window.GAME_CONFIG;

const MEMBERS = CFG.members;
const CHAR_IMAGES = CFG.charImages;
const PROLOGUE_LINES = CFG.prologue;
const STORY = CFG.story;

/*
  v6
  背景画像方式へ統一したので、
  古い途中データとの事故を避けるため保存キーを更新。
*/
const STORAGE_KEY = "overkill_manager_story_v6";

const $ = (id) => document.getElementById(id);


/* =========================
   ELEMENTS
========================= */

const screens = {
  loading: $("loading"),
  title: $("title"),
  prologue: $("prologue"),
  game: $("game")
};

const loadChar = $("loadChar");
const loadMsg = $("loadMsg");
const loadBar = $("loadBar");
const loadPct = $("loadPct");

const proText = $("proText");

const chapter = $("chapter");
const env = $("env");

const aura = $("aura");
const managerMark = $("managerMark");
const char = $("char");
const reaction = $("reaction");

const dialogue = $("dialogue");
const speaker = $("speaker");
const text = $("text");
const nextMark = $("nextMark");
const tapGuide = $("tapGuide");

const result = $("result");
const resultBox = $("resultBox");

const weekEnd = $("weekEnd");

const modal = $("modal");
const modalBox = $("modalBox");

const songAudio = $("songAudio");


/* =========================
   INITIAL DATA
========================= */

function initialMembers(){
  return {
    sarina: {
      vocal: 78,
      dance: 48,
      bond: 74,
      energy: 72
    },

    miyu: {
      vocal: 74,
      dance: 54,
      bond: 68,
      energy: 76
    },

    kilua: {
      vocal: 52,
      dance: 84,
      bond: 40,
      energy: 80
    },

    raisa: {
      vocal: 42,
      dance: 44,
      bond: 58,
      energy: 70
    }
  };
}


function clone(obj){
  return JSON.parse(JSON.stringify(obj));
}


function freshState(){

  const members = initialMembers();

  return {
    started: false,

    prologueSeen: false,
    tutorialSeen: false,

    node: "m1",

    week: 1,

    reach: 10,

    cash: 220000,

    members: members,

    snapshot: {
      reach: 10,
      cash: 220000,
      members: clone(members)
    }
  };
}


function loadState(){

  try{

    const saved = localStorage.getItem(STORAGE_KEY);

    if(!saved){
      return freshState();
    }

    const parsed = JSON.parse(saved);

    if(!parsed.node || !STORY[parsed.node]){
      return freshState();
    }

    return parsed;

  }catch(error){

    console.warn("SAVE LOAD ERROR", error);

    return freshState();
  }
}


let state = loadState();


function saveState(){

  try{

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

  }catch(error){

    console.warn("SAVE ERROR", error);
  }
}


function resetGame(){

  state = freshState();

  state.started = true;

  saveState();
}


/* =========================
   HELPERS
========================= */

function clamp(n){

  return Math.max(
    0,
    Math.min(999999, n)
  );
}


function avgBond(){

  const keys = Object.keys(state.members);

  const total = keys.reduce(
    (sum, key) => sum + state.members[key].bond,
    0
  );

  return Math.round(total / keys.length);
}


function metricLabel(metric){

  const labels = {
    vocal: "歌唱",
    dance: "ダンス",
    bond: "連携",
    energy: "体力",
    reach: "認知",
    cash: "活動資金"
  };

  return labels[metric] || metric;
}


function showScreen(name){

  Object.values(screens).forEach((screen) => {
    screen.classList.remove("active");
  });

  if(screens[name]){
    screens[name].classList.add("active");
  }
}


/* =========================
   MUSIC
========================= */

function tryPlaySong(){

  if(!songAudio){
    return;
  }

  songAudio.volume = 0.35;

  songAudio.play().catch(() => {
    /*
      iPhoneではユーザー操作以外から
      再生できない場合があるので無視。
    */
  });
}


/* =========================
   LOADING
========================= */

const loadingSet = [

  {
    img: "./sarina_smile.png",
    msg: "4人の予定を確認中…"
  },

  {
    img: "./miyu_smile.png",
    msg: "SNSのネタを整理中…"
  },

  {
    img: "./kilua_smile.png",
    msg: "レッスン場を準備中…"
  },

  {
    img: "./raisa_smile.png",
    msg: "ステージを確認中…"
  }
];


function startLoading(){

  let progress = 0;
  let currentCharacter = 0;

  const timer = setInterval(() => {

    progress += Math.floor(Math.random() * 7) + 3;

    if(progress > 100){
      progress = 100;
    }

    const nextCharacter = Math.min(
      loadingSet.length - 1,
      Math.floor(progress / 25)
    );

    if(nextCharacter !== currentCharacter){

      currentCharacter = nextCharacter;

      loadChar.src =
        loadingSet[currentCharacter].img;

      loadMsg.textContent =
        loadingSet[currentCharacter].msg;
    }

    loadBar.style.width =
      progress + "%";

    loadPct.textContent =
      progress + "%";


    if(progress >= 100){

      clearInterval(timer);

      setTimeout(() => {

        showScreen("title");

      }, 350);
    }

  }, 110);
}


/* =========================
   PROLOGUE
========================= */

let prologueIndex = 0;

let prologueTyping = false;

let prologueFullText = "";

let prologueTimer = null;


function startPrologue(){

  showScreen("prologue");

  prologueIndex = 0;

  typePrologue(
    PROLOGUE_LINES[0]
  );
}


function typePrologue(line){

  clearInterval(prologueTimer);

  prologueFullText = line;

  proText.textContent = "";

  prologueTyping = true;

  let index = 0;

  prologueTimer = setInterval(() => {

    index++;

    proText.textContent =
      line.slice(0, index);

    if(index >= line.length){

      clearInterval(prologueTimer);

      prologueTyping = false;
    }

  }, 42);
}


/* =========================
   TITLE BUTTONS
========================= */

$("startBtn").addEventListener(
  "click",
  () => {

    resetGame();

    tryPlaySong();

    startPrologue();
  }
);


$("contBtn").addEventListener(
  "click",
  () => {

    if(!state.started){

      state.started = true;

      saveState();

      tryPlaySong();

      startPrologue();

      return;
    }

    tryPlaySong();

    if(state.prologueSeen){

      showScreen("game");

      renderNode();

    }else{

      startPrologue();
    }
  }
);


/* =========================
   PROLOGUE CLICK
========================= */

screens.prologue.addEventListener(
  "click",
  () => {

    if(prologueTyping){

      clearInterval(prologueTimer);

      proText.textContent =
        prologueFullText;

      prologueTyping = false;

      return;
    }


    prologueIndex++;


    if(
      prologueIndex >=
      PROLOGUE_LINES.length
    ){

      state.prologueSeen = true;

      saveState();

      showScreen("game");

      renderNode();

      return;
    }


    typePrologue(
      PROLOGUE_LINES[prologueIndex]
    );
  }
);


/* =========================
   BACKGROUND
========================= */

function setBackground(bg){

  const backgrounds = [
    "manager",
    "studio",
    "lounge",
    "sns",
    "city",
    "live",
    "outdoor"
  ];


  const selected =
    backgrounds.includes(bg)
      ? bg
      : "manager";


  env.className =
    "environment " + selected;
}


/* =========================
   CHARACTER
========================= */

function hideCharacter(){

  char.classList.remove("show");

  char.style.display = "none";

  aura.style.display = "none";
}


function showManager(){

  hideCharacter();

  managerMark.style.display = "flex";
}


function setCharacter(
  memberId,
  expression = "normal"
){

  reaction.textContent = "";


  if(!memberId){

    showManager();

    return;
  }


  const member =
    MEMBERS[memberId];


  if(!member){

    showManager();

    return;
  }


  managerMark.style.display = "none";


  const memberImages =
    CHAR_IMAGES[memberId];


  const source =
    memberImages[expression] ||
    memberImages.normal;


  char.src = source;

  char.alt = member.name;

  char.style.display = "block";

  aura.style.display = "block";

  aura.style.setProperty(
    "--char-rgb",
    member.rgb
  );


  requestAnimationFrame(() => {

    char.classList.add("show");
  });
}


/* =========================
   REACTION
========================= */

function setReaction(symbol){

  reaction.textContent =
    symbol || "";

  reaction.style.display =
    symbol ? "block" : "none";
}


/* =========================
   TYPEWRITER
========================= */

let typing = false;

let fullText = "";

let typingTimer = null;


function stopTyping(){

  if(typingTimer){

    clearInterval(typingTimer);
  }

  typingTimer = null;
}


function typeDialogue(line){

  stopTyping();

  typing = true;

  fullText = line;

  text.textContent = "";

  nextMark.style.display =
    "none";

  dialogue.dataset.mode =
    "dialogue";


  let index = 0;


  typingTimer = setInterval(() => {

    index++;

    text.textContent =
      line.slice(0, index);


    if(index >= line.length){

      stopTyping();

      typing = false;

      nextMark.style.display =
        "block";
    }

  }, 22);
}


/* =========================
   CHOICES
========================= */

function renderChoices(node){

  stopTyping();

  typing = false;

  nextMark.style.display =
    "none";

  dialogue.dataset.mode =
    "choice";


  const lead =
    String(node.text || "")
      .split("\n")
      .join("<br>");


  const buttons =
    node.choices
      .map((choice, index) => {

        return `
          <button
            class="choiceBtn"
            data-choice="${index}"
          >
            ${choice.text}
          </button>
        `;

      })
      .join("");


  text.innerHTML = `
    <div class="choiceLead">
      ${lead}
    </div>

    <div class="choiceGrid">
      ${buttons}
    </div>
  `;
}


/* =========================
   RENDER STORY
========================= */

function renderNode(){

  if(state.node === "weekComplete"){

    renderWeekEnd();

    return;
  }


  const node =
    STORY[state.node];


  if(!node){

    console.warn(
      "STORY NODE NOT FOUND:",
      state.node
    );

    state.node = "m1";

    saveState();

    renderNode();

    return;
  }


  dialogue.scrollTop = 0;


  chapter.textContent =
    node.chapter ||
    `WEEK ${state.week}`;


  speaker.textContent =
    node.speaker ||
    "MANAGER";


  setBackground(
    node.bg
  );


  setCharacter(
    node.member,
    node.expression
  );


  setReaction(
    node.reaction
  );


  if(node.choices){

    renderChoices(node);

  }else{

    typeDialogue(
      node.text || ""
    );
  }


  if(!state.tutorialSeen){

    tapGuide.classList.add("show");

  }else{

    tapGuide.classList.remove("show");
  }
}


/* =========================
   DIALOGUE CLICK
========================= */

dialogue.addEventListener(
  "click",
  (event) => {

    if(!state.tutorialSeen){

      state.tutorialSeen = true;

      saveState();

      tapGuide.classList.remove("show");
    }


    const node =
      STORY[state.node];


    if(!node){
      return;
    }


    if(
      dialogue.dataset.mode ===
      "choice"
    ){

      const button =
        event.target.closest(
          "[data-choice]"
        );


      if(!button){
        return;
      }


      const index =
        Number(
          button.dataset.choice
        );


      const choice =
        node.choices[index];


      if(!choice){
        return;
      }


      state.node =
        choice.next;


      saveState();

      renderNode();

      return;
    }


    advanceDialogue();
  }
);


/* =========================
   ADVANCE
========================= */

function advanceDialogue(){

  const node =
    STORY[state.node];


  if(!node){
    return;
  }


  if(typing){

    stopTyping();

    text.textContent =
      fullText;

    typing = false;

    nextMark.style.display =
      "block";

    return;
  }


  if(node.resultId){

    const resultData =
      applyResult(
        node.resultId
      );

    showResult(
      resultData,
      node.next
    );

    return;
  }


  if(node.next){

    state.node =
      node.next;

    saveState();

    renderNode();
  }
}


/* =========================
   STAT CHANGES
========================= */

function changeMember(
  memberId,
  metric,
  delta
){

  const before =
    state.members[memberId][metric];


  const after =
    clamp(
      before + delta
    );


  state.members[memberId][metric] =
    after;


  return {
    name: MEMBERS[memberId].name,
    metric,
    before,
    after,
    delta
  };
}


function changeReach(delta){

  const before =
    state.reach;


  const after =
    clamp(
      before + delta
    );


  state.reach =
    after;


  return {
    name: "GROUP",
    metric: "reach",
    before,
    after,
    delta
  };
}


function changeCash(delta){

  const before =
    state.cash;


  const after =
    clamp(
      before + delta
    );


  state.cash =
    after;


  return {
    name: "GROUP",
    metric: "cash",
    before,
    after,
    delta
  };
}


/* =========================
   RESULTS
========================= */

function applyResult(id){

  const changes = [];

  let mini =
    "RESULT";

  let title =
    "";


  switch(id){


    case "teachResult":

      mini =
        "LESSON RESULT";

      title =
        "教えることも、練習。";


      changes.push(
        changeMember(
          "sarina",
          "dance",
          5
        ),

        changeMember(
          "miyu",
          "dance",
          5
        ),

        changeMember(
          "raisa",
          "dance",
          4
        ),

        changeMember(
          "kilua",
          "dance",
          3
        ),

        changeMember(
          "kilua",
          "bond",
          6
        )
      );


      [
        "sarina",
        "miyu",
        "kilua",
        "raisa"
      ].forEach((id) => {

        changes.push(
          changeMember(
            id,
            "energy",
            -7
          )
        );
      });

      break;


    case "splitResult":

      mini =
        "LESSON RESULT";

      title =
        "少しずつなら、4人で揃えられる。";


      [
        "sarina",
        "miyu",
        "kilua",
        "raisa"
      ].forEach((id) => {

        changes.push(
          changeMember(
            id,
            "dance",
            4
          )
        );

        changes.push(
          changeMember(
            id,
            "bond",
            3
          )
        );

        changes.push(
          changeMember(
            id,
            "energy",
            -6
          )
        );
      });

      break;


    case "pushResult":

      mini =
        "LESSON RESULT";

      title =
        "伸びた。でも、少し無理をした。";


      changes.push(

        changeMember(
          "sarina",
          "dance",
          6
        ),

        changeMember(
          "miyu",
          "dance",
          6
        ),

        changeMember(
          "kilua",
          "dance",
          4
        ),

        changeMember(
          "raisa",
          "dance",
          5
        ),

        changeMember(
          "sarina",
          "bond",
          -2
        ),

        changeMember(
          "miyu",
          "bond",
          -2
        ),

        changeMember(
          "raisa",
          "bond",
          -3
        ),

        changeMember(
          "sarina",
          "energy",
          -12
        ),

        changeMember(
          "miyu",
          "energy",
          -12
        ),

        changeMember(
          "kilua",
          "energy",
          -8
        ),

        changeMember(
          "raisa",
          "energy",
          -13
        )
      );

      break;


    case "restResult":

      mini =
        "LESSON RESULT";

      title =
        "空気を戻したから、前へ進めた。";


      [
        "sarina",
        "miyu",
        "kilua",
        "raisa"
      ].forEach((id) => {

        changes.push(
          changeMember(
            id,
            "bond",
            4
          )
        );

        changes.push(
          changeMember(
            id,
            "dance",
            2
          )
        );

        changes.push(
          changeMember(
            id,
            "energy",
            -3
          )
        );
      });

      break;


    case "snsResult":

      mini =
        "SNS RESULT";

      title =
        "はじめて、画面の向こうに届いた。";


      changes.push(
        changeReach(8),

        changeCash(-2000),

        changeMember(
          "miyu",
          "bond",
          2
        )
      );


      [
        "sarina",
        "miyu",
        "kilua",
        "raisa"
      ].forEach((id) => {

        changes.push(
          changeMember(
            id,
            "energy",
            -3
          )
        );
      });

      break;


    case "flyerResult":

      mini =
        "PROMOTION RESULT";

      title =
        "一枚ずつ、名前を知ってもらう。";


      changes.push(
        changeReach(12),

        changeCash(-5000)
      );


      [
        "sarina",
        "miyu",
        "kilua",
        "raisa"
      ].forEach((id) => {

        changes.push(
          changeMember(
            id,
            "energy",
            -7
          )
        );
      });

      break;


    case "vocalResult":

      mini =
        "VOCAL RESULT";

      title =
        "認知は増えない。でも歌は前に進む。";


      changes.push(

        changeMember(
          "sarina",
          "vocal",
          5
        ),

        changeMember(
          "miyu",
          "vocal",
          5
        ),

        changeMember(
          "kilua",
          "vocal",
          4
        ),

        changeMember(
          "raisa",
          "vocal",
          4
        ),

        changeCash(-3000)
      );


      [
        "sarina",
        "miyu",
        "kilua",
        "raisa"
      ].forEach((id) => {

        changes.push(
          changeMember(
            id,
            "energy",
            -6
          )
        );
      });

      break;


    case "recoverResult":

      mini =
        "RECOVERY";

      title =
        "休むことも、デビューまでの仕事。";


      [
        "sarina",
        "miyu",
        "kilua",
        "raisa"
      ].forEach((id) => {

        changes.push(
          changeMember(
            id,
            "energy",
            8
          )
        );
      });

      break;


    default:

      mini =
        "RESULT";

      title =
        "変化はなかった。";

      break;
  }


  saveState();


  return {
    mini,
    title,
    changes
  };
}


/* =========================
   RESULT UI
========================= */

function formatValue(
  metric,
  value
){

  if(metric === "cash"){

    return (
      "¥" +
      value.toLocaleString("ja-JP")
    );
  }

  return value;
}


function formatDelta(
  metric,
  value
){

  if(metric === "cash"){

    const abs =
      Math.abs(value);

    return (
      "¥" +
      abs.toLocaleString("ja-JP")
    );
  }

  return Math.abs(value);
}


function showResult(
  data,
  nextNode
){

  const rows =
    data.changes
      .map((change) => {

        const sign =
          change.delta > 0
            ? "+"
            : change.delta < 0
              ? "-"
              : "";


        const className =
          change.delta < 0
            ? "minus"
            : "";


        return `
          <div class="resultRow">

            <span>
              ${change.name}・${metricLabel(change.metric)}
            </span>

            <span>
              ${formatValue(change.metric, change.before)}
              →
              ${formatValue(change.metric, change.after)}
            </span>

            <span class="resultDelta ${className}">
              ${sign}${formatDelta(change.metric, change.delta)}
            </span>

          </div>
        `;

      })
      .join("");


  resultBox.innerHTML = `

    <div class="resultMini">
      ${data.mini}
    </div>

    <div class="resultTitle">
      ${data.title}
    </div>

    <div class="resultRows">
      ${rows}
    </div>

    <div class="resultHint">
      タップして続ける
    </div>
  `;


  result.classList.add(
    "show"
  );


  result.onclick = () => {

    result.classList.remove(
      "show"
    );


    if(nextNode){

      state.node =
        nextNode;

      saveState();

      renderNode();
    }
  };
}


/* =========================
   WEEK SUMMARY
========================= */

function buildWeekSummaryRows(){

  const rows = [];


  if(
    state.snapshot.reach !==
    state.reach
  ){

    const delta =
      state.reach -
      state.snapshot.reach;


    rows.push(`

      <div class="weekRow">

        <span>
          GROUP｜認知
        </span>

        <strong>
          ${state.snapshot.reach}
          →
          ${state.reach}

          <span>
            ${delta >= 0 ? "+" : ""}
            ${delta}
          </span>
        </strong>

      </div>
    `);
  }


  if(
   
