const CFG = window.GAME_CONFIG;
const MEMBERS = CFG.members;
const CHAR_IMAGES = CFG.charImages;
const PROLOGUE_LINES = CFG.prologue;
const STORY = CFG.story;

const STORAGE_KEY = "overkill_manager_story_v5";

const $ = (id) => document.getElementById(id);

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
    sarina: { vocal:78, dance:48, bond:74, energy:72 },
    miyu:   { vocal:74, dance:54, bond:68, energy:76 },
    kilua:  { vocal:52, dance:84, bond:40, energy:80 },
    raisa:  { vocal:42, dance:44, bond:58, energy:70 }
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
    members,
    snapshot: {
      reach: 10,
      cash: 220000,
      members: clone(members)
    }
  };
}

function loadState(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || freshState();
  }catch{
    return freshState();
  }
}

let state = loadState();

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(n){
  return Math.max(0, Math.min(999999, n));
}

function avgBond(){
  const keys = Object.keys(state.members);
  return Math.round(keys.reduce((sum, key) => sum + state.members[key].bond, 0) / keys.length);
}

function metricLabel(metric){
  return {
    vocal: "歌唱",
    dance: "ダンス",
    bond: "連携",
    energy: "体力",
    reach: "認知",
    cash: "活動資金"
  }[metric] || metric;
}

function showScreen(name){
  Object.values(screens).forEach(el => el.classList.remove("active"));
  screens[name].classList.add("active");
}

function tryPlaySong(){
  songAudio.volume = 0.4;
  songAudio.play().catch(() => {});
}

function resetGame(){
  state = freshState();
  state.started = true;
  saveState();
}

/* =========================
   LOADING
========================= */
const loadingSet = [
  { img: "./sarina_smile.png", msg: "4人の予定を確認中…" },
  { img: "./miyu_smile.png",   msg: "SNSのネタを整理中…" },
  { img: "./kilua_smile.png",  msg: "レッスン場を準備中…" },
  { img: "./raisa_smile.png",  msg: "ステージを確認中…" }
];

function startLoading(){
  let p = 0;
  let idx = 0;

  const timer = setInterval(() => {
    p += Math.floor(Math.random() * 7) + 3;
    if(p > 100) p = 100;

    const nextIdx = Math.min(loadingSet.length - 1, Math.floor(p / 25));
    if(nextIdx !== idx){
      idx = nextIdx;
      loadChar.src = loadingSet[idx].img;
      loadMsg.textContent = loadingSet[idx].msg;
    }

    loadBar.style.width = p + "%";
    loadPct.textContent = p + "%";

    if(p >= 100){
      clearInterval(timer);
      setTimeout(() => showScreen("title"), 350);
    }
  }, 110);
}

/* =========================
   TITLE / PROLOGUE
========================= */
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
    proText.textContent = line.slice(0, i);
    if(i >= line.length){
      clearInterval(prologueTimer);
      prologueTyping = false;
    }
  }, 42);
}

$("startBtn").addEventListener("click", () => {
  resetGame();
  tryPlaySong();
  startPrologue();
});

$("contBtn").addEventListener("click", () => {
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
});

screens.prologue.addEventListener("click", () => {
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
});

/* =========================
   CHARACTER / BG
========================= */
function setBackground(bg){
  env.className = "environment " + (bg || "office");
}

function setCharacter(memberId, expression = "normal"){
  char.classList.remove("show");
  aura.classList.remove("show");
  managerMark.classList.remove("show");

  if(!memberId){
    char.style.opacity = "0";
    managerMark.classList.add("show");
    return;
  }

  const member = MEMBERS[memberId];
  const src = (CHAR_IMAGES[memberId] && CHAR_IMAGES[memberId][expression]) || CHAR_IMAGES[memberId].normal;

  char.src = src;
  char.alt = member.name;
  char.style.opacity = "1";
  aura.style.setProperty("--char-rgb", member.rgb);

  requestAnimationFrame(() => {
    char.classList.add("show");
    aura.classList.add("show");
  });
}

function setReaction(symbol){
  reaction.classList.remove("show");
  reaction.textContent = "";
  if(!symbol) return;

  reaction.textContent = symbol;
  requestAnimationFrame(() => reaction.classList.add("show"));
}

/* =========================
   TYPEWRITER
========================= */
let typing = false;
let fullText = "";
let typingTimer = null;

function typeDialogue(line){
  clearInterval(typingTimer);
  typing = true;
  fullText = line;
  text.textContent = "";
  nextMark.style.display = "none";

  let i = 0;
  typingTimer = setInterval(() => {
    i++;
    text.textContent = line.slice(0, i);
    if(i >= line.length){
      clearInterval(typingTimer);
      typing = false;
      nextMark.style.display = "block";
    }
  }, 22);
}

/* =========================
   RENDER
========================= */
function renderChoices(node){
  nextMark.style.display = "none";
  text.innerHTML = `
    <div class="choiceLead">${node.text.replace(/\n/g, "<br>")}</div>
    <div class="choices">
      ${node.choices.map((c, i) => `
        <button class="choiceBtn" data-choice="${i}">${c.text}</button>
      `).join("")}
    </div>
  `;
  dialogue.dataset.mode = "choice";
}

function renderNode(){
  if(state.node === "weekComplete"){
    renderWeekEnd();
    return;
  }

  const node = STORY[state.node];
  if(!node) return;

  chapter.textContent = node.chapter || `WEEK ${state.week}`;
  speaker.textContent = node.speaker || "MANAGER";
  setBackground(node.bg);
  setCharacter(node.member, node.expression);
  setReaction(node.reaction);

  if(node.choices){
    renderChoices(node);
  }else{
    dialogue.dataset.mode = "advance";
    typeDialogue(node.text);
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
dialogue.addEventListener("click", (e) => {
  if(!state.tutorialSeen){
    state.tutorialSeen = true;
    saveState();
    tapGuide.classList.remove("show");
  }

  const node = STORY[state.node];
  if(!node) return;

  if(dialogue.dataset.mode === "choice"){
    const btn = e.target.closest("[data-choice]");
    if(!btn) return;

    const choice = node.choices[Number(btn.dataset.choice)];
    state.node = choice.next;
    saveState();
    renderNode();
    return;
  }

  advanceDialogue();
});

function advanceDialogue(){
  const node = STORY[state.node];
  if(!node) return;

  if(typing){
    clearInterval(typingTimer);
    text.textContent = fullText;
    typing = false;
    nextMark.style.display = "block";
    return;
  }

  if(node.resultId){
    const res = applyResult(node.resultId);
    showResult(res, node.next);
    return;
  }

  if(node.next){
    state.node = node.next;
    saveState();
    renderNode();
  }
}

/* =========================
   RESULT LOGIC
========================= */
function changeMember(memberId, metric, delta){
  const before = state.members[memberId][metric];
  const after = clamp(before + delta);
  state.members[memberId][metric] = after;
  return {
    name: MEMBERS[memberId].name,
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
  return { name: "GROUP", metric: "reach", before, after, delta };
}

function changeCash(delta){
  const before = state.cash;
  const after = clamp(before + delta);
  state.cash = after;
  return { name: "GROUP", metric: "cash", before, after, delta };
}

function applyResult(id){
  const changes = [];
  let mini = "RESULT";
  let title = "";

  switch(id){
    case "teachResult":
      mini = "LESSON RESULT";
      title = "教えることも、練習。";
      changes.push(
        changeMember("sarina","dance",5),
        changeMember("miyu","dance",5),
        changeMember("raisa","dance",4),
        changeMember("kilua","dance",3),
        changeMember("kilua","bond",6),
        changeMember("sarina","energy",-7),
        changeMember("miyu","energy",-7),
        changeMember("kilua","energy",-7),
        changeMember("raisa","energy",-7)
      );
      break;

    case "splitResult":
      mini = "LESSON RESULT";
      title = "少しずつなら、4人で揃えられる。";
      ["sarina","miyu","kilua","raisa"].forEach(id => {
        changes.push(changeMember(id,"dance",4));
        changes.push(changeMember(id,"bond",3));
        changes.push(changeMember(id,"energy",-6));
      });
      break;

    case "pushResult":
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
      break;

    case "restResult":
      mini = "LESSON RESULT";
      title = "空気を戻したから、前へ進めた。";
      ["sarina","miyu","kilua","raisa"].forEach(id => {
        changes.push(changeMember(id,"bond",4));
        changes.push(changeMember(id,"dance",2));
        changes.push(changeMember(id,"energy",-3));
      });
      break;

    case "snsResult":
      mini = "SNS RESULT";
      title = "はじめて、画面の向こうに届いた。";
      changes.push(
        changeReach(8),
        changeCash(-2000),
        changeMember("miyu","bond",2),
        changeMember("sarina","energy",-3),
        changeMember("miyu","energy",-3),
        changeMember("kilua","energy",-3),
        changeMember("raisa","energy",-3)
      );
      break;

    case "flyerResult":
      mini = "PROMOTION RESULT";
      title = "一枚ずつ、名前を知ってもらう。";
      changes.push(
        changeReach(12),
        changeCash(-5000),
        changeMember("sarina","energy",-7),
        changeMember("miyu","energy",-7),
        changeMember("kilua","energy",-7),
        changeMember("raisa","energy",-7)
      );
      break;

    case "vocalResult":
      mini = "VOCAL RESULT";
      title = "認知は増えない。でも歌は前に進む。";
      changes.push(
        changeMember("sarina","vocal",5),
        changeMember("miyu","vocal",5),
        changeMember("kilua","vocal",4),
        changeMember("raisa","vocal",4),
        changeCash(-3000),
        changeMember("sarina","energy",-6),
        changeMember("miyu","energy",-6),
        changeMember("kilua","energy",-6),
        changeMember("raisa","energy",-6)
      );
      break;

    case "recoverResult":
      mini = "RECOVERY";
      title = "休むことも、デビューまでの仕事。";
      changes.push(
        changeMember("sarina","energy",8),
        changeMember("miyu","energy",8),
        changeMember("kilua","energy",8),
        changeMember("raisa","energy",8)
      );
      break;
  }

  saveState();
  return { mini, title, changes };
}

/* =========================
   RESULT UI
========================= */
function showResult(data, nextNode){
  resultBox.innerHTML = `
    <div class="resultMini">${data.mini}</div>
    <div class="resultTitle">${data.title}</div>
    <div class="resultRows">
      ${data.changes.map(ch => `
        <div class="resultRow">
          <span>${ch.name}・${metricLabel(ch.metric)}</span>
          <span>${formatValue(ch.metric, ch.before)} → ${formatValue(ch.metric, ch.after)}</span>
          <span class="resultDelta ${ch.delta < 0 ? 'minus' : ''}">
            ${ch.delta > 0 ? '+' : ''}${formatDelta(ch.metric, ch.delta)}
          </span>
        </div>
      `).join("")}
    </div>
    <div class="resultHint">タップして続ける</div>
  `;

  result.classList.add("show");
  result.onclick = () => {
    result.classList.remove("show");
    state.node = nextNode;
    saveState();
    renderNode();
  };
}

function formatValue(metric, value){
  return metric === "cash" ? `¥${value.toLocaleString("ja-JP")}` : value;
}

function formatDelta(metric, value){
  return metric === "cash" ? `¥${Math.abs(value).toLocaleString("ja-JP")}` : value;
}

/* =========================
   WEEK END
========================= */
function buildWeekSummaryRows(){
  const rows = [];

  if(state.snapshot.reach !== state.reach){
    const d = state.reach - state.snapshot.reach;
    rows.push(`
      <div class="weekRow">
        <span>GROUP｜認知</span>
        <strong>${state.snapshot.reach} → ${state.reach} <span style="color:${d >= 0 ? '#ddff63' : '#ff9da7'};">${d >= 0 ? '+' : ''}${d}</span></strong>
      </div>
    `);
  }

  if(state.snapshot.cash !== state.cash){
    const d = state.cash - state.snapshot.cash;
    rows.push(`
      <div class="weekRow">
        <span>GROUP｜活動資金</span>
        <strong>¥${state.snapshot.cash.toLocaleString("ja-JP")} → ¥${state.cash.toLocaleString("ja-JP")} <span style="color:${d >= 0 ? '#ddff63' : '#ff9da7'};">${d >= 0 ? '+' : ''}¥${Math.abs(d).toLocaleString("ja-JP")}</span></strong>
      </div>
    `);
  }

  Object.keys(MEMBERS).forEach(id => {
    ["vocal","dance","bond","energy"].forEach(metric => {
      const before = state.snapshot.members[id][metric];
      const after = state.members[id][metric];
      if(before === after) return;
      const d = after - before;
      rows.push(`
        <div class="weekRow">
          <span>${MEMBERS[id].name}｜${metricLabel(metric)}</span>
          <strong>${before} → ${after} <span style="color:${d >= 0 ? '#ddff63' : '#ff9da7'};">${d >= 0 ? '+' : ''}${d}</span></strong>
        </div>
      `);
    });
  });

  return rows.join("") || `<div class="weekRow"><span>変化なし</span><strong>--</strong></div>`;
}

function renderWeekEnd(){
  weekEnd.innerHTML = `
    <div class="weekTag">WEEK 1 COMPLETE</div>
    <div class="weekTitle">最初の1週間、<br>ここから始まった。</div>
    <div class="weekText">
      まだ4人は完成していない。<br>
      でも、選んだ判断のぶんだけ前に進んでいる。
    </div>

    <div class="weekSummary">
      ${buildWeekSummaryRows()}
    </div>

    <div class="weekDays">
      デビューまで
      <strong>あと21日</strong>
    </div>

    <div class="weekBtns">
      <button class="weekBtn primary" id="restartWeekBtn">もう一度WEEK 1をやる</button>
      <button class="weekBtn sub" id="backTitleBtn">タイトルへ戻る</button>
    </div>
  `;

  weekEnd.classList.add("show");

  $("restartWeekBtn").onclick = () => {
    resetGame();
    showScreen("game");
    weekEnd.classList.remove("show");
    renderNode();
  };

  $("backTitleBtn").onclick = () => {
    weekEnd.classList.remove("show");
    showScreen("title");
  };
}

/* =========================
   STATUS
========================= */
$("statusBtn").addEventListener("click", () => {
  modalBox.innerHTML = `
    <h2>O-VER-KiLL STATUS</h2>
    <div class="statusHead">
      認知：${state.reach}<br>
      活動資金：¥${state.cash.toLocaleString("ja-JP")}<br>
      連携平均：${avgBond()}
    </div>

    ${Object.keys(MEMBERS).map(id => `
      <div class="memberCard">
        <h3 style="color:${MEMBERS[id].color};">${MEMBERS[id].name}</h3>
        <div class="memberGrid">
          <div>🎤 歌唱 ${state.members[id].vocal}</div>
          <div>💃 ダンス ${state.members[id].dance}</div>
          <div>🤝 連携 ${state.members[id].bond}</div>
          <div>❤️ 体力 ${state.members[id].energy}</div>
        </div>
      </div>
    `).join("")}

    <button class="modalClose" data-close>閉じる</button>
  `;
  modal.classList.add("show");
});

modal.addEventListener("click", (e) => {
  if(e.target.id === "modal" || e.target.matches("[data-close]")){
    modal.classList.remove("show");
  }
});

/* =========================
   INIT
========================= */
startLoading();
