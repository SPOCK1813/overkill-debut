const CFG = window.GAME_CONFIG;
const MEMBERS = CFG.members;
const CHAR_IMAGES = CFG.charImages;
const PROLOGUE_LINES = CFG.prologue;
const STORY = CFG.story;

const STORAGE_KEY = "overkill_manager_story_v6";
const $ = id => document.getElementById(id);

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


function initialMembers(){
  return {
    sarina:{ vocal:78, dance:48, bond:74, energy:72 },
    miyu:{ vocal:74, dance:54, bond:68, energy:76 },
    kilua:{ vocal:52, dance:84, bond:40, energy:80 },
    raisa:{ vocal:42, dance:44, bond:58, energy:70 }
  };
}

function clone(obj){
  return JSON.parse(JSON.stringify(obj));
}

function freshState(){
  const members = initialMembers();

  return {
    started:false,
    prologueSeen:false,
    tutorialSeen:false,
    node:"m1",
    week:1,
    reach:10,
    cash:220000,
    members,
    snapshot:{
      reach:10,
      cash:220000,
      members:clone(members)
    }
  };
}

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if(!saved || !saved.node || !STORY[saved.node]){
      return freshState();
    }

    return saved;
  }catch{
    return freshState();
  }
}

let state = loadState();

function saveState(){
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function resetGame(){
  state = freshState();
  state.started = true;
  saveState();
}

function clamp(n){
  return Math.max(0, Math.min(999999, n));
}

function metricLabel(metric){
  return {
    vocal:"歌唱",
    dance:"ダンス",
    bond:"連携",
    energy:"体力",
    reach:"認知",
    cash:"活動資金"
  }[metric] || metric;
}

function avgBond(){
  const ids = Object.keys(state.members);
  const total = ids.reduce(
    (sum,id) => sum + state.members[id].bond,
    0
  );

  return Math.round(total / ids.length);
}

function showScreen(name){
  Object.values(screens).forEach(
    el => el.classList.remove("active")
  );

  screens[name].classList.add("active");
}

function tryPlaySong(){
  if(!songAudio) return;

  songAudio.volume = 0.35;
  songAudio.play().catch(() => {});
}


/* LOADING */

const loadingSet = [
  { img:"./sarina_smile.png", msg:"4人の予定を確認中…" },
  { img:"./miyu_smile.png", msg:"SNSのネタを整理中…" },
  { img:"./kilua_smile.png", msg:"レッスン場を準備中…" },
  { img:"./raisa_smile.png", msg:"ステージを確認中…" }
];

function startLoading(){
  let p = 0;
  let current = 0;

  const timer = setInterval(() => {
    p += Math.floor(Math.random() * 7) + 3;
    p = Math.min(100,p);

    const index = Math.min(
      loadingSet.length - 1,
      Math.floor(p / 25)
    );

    if(index !== current){
      current = index;
      loadChar.src = loadingSet[index].img;
      loadMsg.textContent = loadingSet[index].msg;
    }

    loadBar.style.width = p + "%";
    loadPct.textContent = p + "%";

    if(p >= 100){
      clearInterval(timer);

      setTimeout(() => {
        showScreen("title");
      },350);
    }
  },110);
}


/* PROLOGUE */

let prologueIndex = 0;
let prologueTyping = false;
let prologueFullText = "";
let prologueTimer = null;

function startPrologue(){
  showScreen("prologue");
  prologueIndex = 0;
  typePrologue(PROLOGUE_LINES[0]);
}

function typePrologue(line){
  clearInterval(prologueTimer);

  prologueFullText = line;
  proText.textContent = "";
  prologueTyping = true;

  let i = 0;

  prologueTimer = setInterval(() => {
    i++;
    proText.textContent = line.slice(0,i);

    if(i >= line.length){
      clearInterval(prologueTimer);
      prologueTyping = false;
    }
  },42);
}

$("startBtn").onclick = () => {
  resetGame();
  tryPlaySong();
  startPrologue();
};

$("contBtn").onclick = () => {
  if(!state.started){
    state.started = true;
    saveState();
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
};

screens.prologue.onclick = () => {
  if(prologueTyping){
    clearInterval(prologueTimer);
    proText.textContent = prologueFullText;
    prologueTyping = false;
    return;
  }

  prologueIndex++;

  if(prologueIndex >= PROLOGUE_LINES.length){
    state.prologueSeen = true;
    saveState();
    showScreen("game");
    renderNode();
    return;
  }

  typePrologue(PROLOGUE_LINES[prologueIndex]);
};


/* BACKGROUND */

function setBackground(bg){
  const allowed = [
    "manager",
    "studio",
    "lounge",
    "sns",
    "city",
    "live",
    "outdoor"
  ];

  const key = allowed.includes(bg)
    ? bg
    : "manager";

  env.className = "environment " + key;
}


/* CHARACTER */

function setCharacter(memberId, expression = "normal"){
  return new Promise((resolve) => {

    char.classList.remove("show");
    reaction.textContent = "";

    if(!memberId){
      char.style.display = "none";
      aura.style.display = "none";
      managerMark.style.display = "flex";
      resolve();
      return;
    }

    const member = MEMBERS[memberId];
    const images = CHAR_IMAGES[memberId];

    if(!member || !images){
      char.style.display = "none";
      aura.style.display = "none";
      managerMark.style.display = "flex";
      resolve();
      return;
    }

    managerMark.style.display = "none";
    aura.style.display = "block";

    const src =
      images[expression] ||
      images.normal;

    char.onload = () => {
      char.style.display = "block";

      requestAnimationFrame(() => {
        char.classList.add("show");
        resolve();
      });
    };

    char.onerror = () => {
      char.style.display = "block";
      resolve();
    };

    char.src = src;
    char.alt = member.name;

    aura.style.setProperty(
      "--char-rgb",
      member.rgb
    );

    if(char.complete){
      char.style.display = "block";

      requestAnimationFrame(() => {
        char.classList.add("show");
        resolve();
      });
    }
  });
}

/* TYPEWRITER */

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
  nextMark.style.display = "none";
  dialogue.dataset.mode = "dialogue";

  let i = 0;

  typingTimer = setInterval(() => {
    i++;

    text.textContent =
      line.slice(0,i);

    if(i >= line.length){
      stopTyping();
      typing = false;
      nextMark.style.display = "block";
    }
  },22);
}


/* CHOICES */

function renderChoices(node){
  stopTyping();

  typing = false;
  nextMark.style.display = "none";
  dialogue.dataset.mode = "choice";

  const lead =
    String(node.text || "")
      .split("\n")
      .join("<br>");

  const buttons =
    node.choices.map((choice,index) => `
      <button
        class="choiceBtn"
        data-choice="${index}"
      >
        ${choice.text}
      </button>
    `).join("");

  text.innerHTML = `
    <div class="choiceLead">
      ${lead}
    </div>

    <div class="choiceGrid">
      ${buttons}
    </div>
  `;
}


/* STORY */

function renderNode(){
  if(state.node === "weekComplete"){
    renderWeekEnd();
    return;
  }

  const node = STORY[state.node];

  if(!node){
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

  setBackground(node.bg);

  setCharacter(
    node.member,
    node.expression
  );

  setReaction(node.reaction);

  if(node.choices){
    renderChoices(node);
  }else{
    typeDialogue(node.text || "");
  }

  tapGuide.classList.toggle(
    "show",
    !state.tutorialSeen
  );
}

dialogue.onclick = event => {
  if(!state.tutorialSeen){
    state.tutorialSeen = true;
    saveState();
    tapGuide.classList.remove("show");
  }

  const node = STORY[state.node];

  if(!node) return;

  if(dialogue.dataset.mode === "choice"){
    const button =
      event.target.closest("[data-choice]");

    if(!button) return;

    const choice =
      node.choices[
        Number(button.dataset.choice)
      ];

    if(!choice) return;

    state.node = choice.next;
    saveState();
    renderNode();

    return;
  }

  advanceDialogue();
};

function advanceDialogue(){
  const node = STORY[state.node];

  if(!node) return;

  if(typing){
    stopTyping();

    text.textContent = fullText;
    typing = false;
    nextMark.style.display = "block";

    return;
  }

  if(node.resultId){
    const data =
      applyResult(node.resultId);

    showResult(
      data,
      node.next
    );

    return;
  }

  if(node.next){
    state.node = node.next;
    saveState();
    renderNode();
  }
}


/* STATS */

function changeMember(id, metric, delta){
  const before =
    state.members[id][metric];

  const after =
    clamp(before + delta);

  state.members[id][metric] = after;

  return {
    name:MEMBERS[id].name,
    metric,
    before,
    after,
    delta
  };
}

function changeReach(delta){
  const before = state.reach;
  const after = clamp(before + delta);

  state.reach = after;

  return {
    name:"GROUP",
    metric:"reach",
    before,
    after,
    delta
  };
}

function changeCash(delta){
  const before = state.cash;
  const after = clamp(before + delta);

  state.cash = after;

  return {
    name:"GROUP",
    metric:"cash",
    before,
    after,
    delta
  };
}


/* RESULTS */

function applyResult(id){
  const changes = [];
  let mini = "RESULT";
  let title = "";

  const all = [
    "sarina",
    "miyu",
    "kilua",
    "raisa"
  ];

  if(id === "teachResult"){
    mini = "LESSON RESULT";
    title = "教えることも、練習。";

    changes.push(
      changeMember("sarina","dance",5),
      changeMember("miyu","dance",5),
      changeMember("raisa","dance",4),
      changeMember("kilua","dance",3),
      changeMember("kilua","bond",6)
    );

    all.forEach(member => {
      changes.push(
        changeMember(member,"energy",-7)
      );
    });
  }

  else if(id === "splitResult"){
    mini = "LESSON RESULT";
    title = "少しずつなら、4人で揃えられる。";

    all.forEach(member => {
      changes.push(
        changeMember(member,"dance",4),
        changeMember(member,"bond",3),
        changeMember(member,"energy",-6)
      );
    });
  }

  else if(id === "pushResult"){
    mini = "LESSON RESULT";
    title = "伸びた。でも、少し無理をした。";

    changes.push(
      changeMember("sarina","dance",6),
      changeMember("miyu","dance",6),
      changeMember("kilua","dance",4),
      changeMember("raisa","dance",5),
      changeMember("sarina","bond",-2),
      changeMember("miyu","bond",-2),
      changeMember("raisa","bond",-3),
      changeMember("sarina","energy",-12),
      changeMember("miyu","energy",-12),
      changeMember("kilua","energy",-8),
      changeMember("raisa","energy",-13)
    );
  }

  else if(id === "restResult"){
    mini = "LESSON RESULT";
    title = "空気を戻したから、前へ進めた。";

    all.forEach(member => {
      changes.push(
        changeMember(member,"bond",4),
        changeMember(member,"dance",2),
        changeMember(member,"energy",-3)
      );
    });
  }

  else if(id === "snsResult"){
    mini = "SNS RESULT";
    title = "はじめて、画面の向こうに届いた。";

    changes.push(
      changeReach(8),
      changeCash(-2000),
      changeMember("miyu","bond",2)
    );

    all.forEach(member => {
      changes.push(
        changeMember(member,"energy",-3)
      );
    });
  }

  else if(id === "flyerResult"){
    mini = "PROMOTION RESULT";
    title = "一枚ずつ、名前を知ってもらう。";

    changes.push(
      changeReach(12),
      changeCash(-5000)
    );

    all.forEach(member => {
      changes.push(
        changeMember(member,"energy",-7)
      );
    });
  }

  else if(id === "vocalResult"){
    mini = "VOCAL RESULT";
    title = "認知は増えない。でも歌は前に進む。";

    changes.push(
      changeMember("sarina","vocal",5),
      changeMember("miyu","vocal",5),
      changeMember("kilua","vocal",4),
      changeMember("raisa","vocal",4),
      changeCash(-3000)
    );

    all.forEach(member => {
      changes.push(
        changeMember(member,"energy",-6)
      );
    });
  }

  else if(id === "recoverResult"){
    mini = "RECOVERY";
    title = "休むことも、デビューまでの仕事。";

    all.forEach(member => {
      changes.push(
        changeMember(member,"energy",8)
      );
    });
  }

  saveState();

  return {
    mini,
    title,
    changes
  };
}


/* RESULT UI */

function formatValue(metric,value){
  if(metric === "cash"){
    return "¥" +
      value.toLocaleString("ja-JP");
  }

  return value;
}

function formatDelta(metric,value){
  const abs = Math.abs(value);

  if(metric === "cash"){
    return "¥" +
      abs.toLocaleString("ja-JP");
  }

  return abs;
}

function showResult(data,nextNode){
  const rows = data.changes.map(change => {
    const sign =
      change.delta > 0
        ? "+"
        : change.delta < 0
          ? "-"
          : "";

    const cls =
      change.delta < 0
        ? "minus"
        : "";

    return `
      <div class="resultRow">
        <span>
          ${change.name}・${metricLabel(change.metric)}
        </span>

        <span>
          ${formatValue(change.metric,change.before)}
          →
          ${formatValue(change.metric,change.after)}
        </span>

        <span class="resultDelta ${cls}">
          ${sign}${formatDelta(change.metric,change.delta)}
        </span>
      </div>
    `;
  }).join("");

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

  result.classList.add("show");

  result.onclick = () => {
    result.classList.remove("show");

    if(nextNode){
      state.node = nextNode;
      saveState();
      renderNode();
    }
  };
}


/* WEEK END */

function buildWeekSummaryRows(){
  const rows = [];

  if(state.snapshot.reach !== state.reach){
    const d =
      state.reach -
      state.snapshot.reach;

    rows.push(`
      <div class="weekRow">
        <span>GROUP｜認知</span>
        <strong>
          ${state.snapshot.reach}
          →
          ${state.reach}
          (${d >= 0 ? "+" : ""}${d})
        </strong>
      </div>
    `);
  }

  if(state.snapshot.cash !== state.cash){
    const d =
      state.cash -
      state.snapshot.cash;

    rows.push(`
      <div class="weekRow">
        <span>GROUP｜活動資金</span>
        <strong>
          ¥${state.snapshot.cash.toLocaleString("ja-JP")}
          →
          ¥${state.cash.toLocaleString("ja-JP")}
        </strong>
      </div>
    `);
  }

  Object.keys(MEMBERS).forEach(id => {
    [
      "vocal",
      "dance",
      "bond",
      "energy"
    ].forEach(metric => {
      const before =
        state.snapshot.members[id][metric];

      const after =
        state.members[id][metric];

      if(before === after) return;

      const d =
        after - before;

      rows.push(`
        <div class="weekRow">
          <span>
            ${MEMBERS[id].name}｜
            ${metricLabel(metric)}
          </span>

          <strong>
            ${before}
            →
            ${after}
            (${d >= 0 ? "+" : ""}${d})
          </strong>
        </div>
      `);
    });
  });

  return rows.join("") || `
    <div class="weekRow">
      <span>変化なし</span>
      <strong>--</strong>
    </div>
  `;
}

function renderWeekEnd(){
  weekEnd.innerHTML = `
    <div class="weekTag">
      WEEK 1 COMPLETE
    </div>

    <div class="weekTitle">
      最初の1週間、<br>
      ここから始まった。
    </div>

    <div class="weekText">
      まだ4人は完成していない。<br>
      でも、選んだ判断のぶんだけ
      前に進んでいる。
    </div>

    <div class="weekSummary">
      ${buildWeekSummaryRows()}
    </div>

    <div class="weekDays">
      デビューまで
      <strong>あと21日</strong>
    </div>

    <div class="weekBtns">
      <button
        class="weekBtn primary"
        id="restartWeekBtn"
      >
        もう一度WEEK 1をやる
      </button>

      <button
        class="weekBtn sub"
        id="backTitleBtn"
      >
        タイトルへ戻る
      </button>
    </div>
  `;

  weekEnd.classList.add("show");

  $("restartWeekBtn").onclick = () => {
    resetGame();
    weekEnd.classList.remove("show");
    showScreen("game");
    renderNode();
  };

  $("backTitleBtn").onclick = () => {
    weekEnd.classList.remove("show");
    showScreen("title");
  };
}


/* STATUS */

$("statusBtn").onclick = () => {
  const cards =
    Object.keys(MEMBERS).map(id => {
      const member = MEMBERS[id];
      const stats = state.members[id];

      return `
        <div class="memberCard">
          <h3 style="color:${member.color}">
            ${member.name}
          </h3>

          <div class="memberGrid">
            <div>🎤 歌唱 ${stats.vocal}</div>
            <div>💃 ダンス ${stats.dance}</div>
            <div>🤝 連携 ${stats.bond}</div>
            <div>❤️ 体力 ${stats.energy}</div>
          </div>
        </div>
      `;
    }).join("");

  modalBox.innerHTML = `
    <h2>O-VER-KiLL STATUS</h2>

    <div class="statusHead">
      認知：${state.reach}<br>
      活動資金：¥${state.cash.toLocaleString("ja-JP")}<br>
      連携平均：${avgBond()}
    </div>

    ${cards}

    <button
      class="modalClose"
      data-close
    >
      閉じる
    </button>
  `;

  modal.classList.add("show");
};

modal.onclick = event => {
  if(
    event.target.id === "modal" ||
    event.target.matches("[data-close]")
  ){
    modal.classList.remove("show");
  }
};


/* START */

startLoading();
