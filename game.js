/* =========================================================
   O-VER-KiLL | MANAGER'S STORY
   game.js
   v0.22
========================================================= */

const DATA = window.GAME_DATA;
const STORY = window.GAME_STORY;

const STORAGE_KEY = "overkill_manager_v22";

const $ = id => document.getElementById(id);

const clamp = (v, min = 0, max = 100) =>
  Math.max(min, Math.min(max, v));

const wait = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const clone = obj =>
  JSON.parse(JSON.stringify(obj));


/* =========================================================
   ELEMENTS
========================================================= */

const screens = {
  loading: $("loading"),
  title: $("title"),
  prologue: $("prologue"),
  game: $("game"),
  training: $("training"),
  actionResult: $("actionResult"),
  weekEnd: $("weekEnd")
};

const charEl = $("char");
const reactionEl = $("reaction");
const envEl = $("env");
const managerMark = $("managerMark");

const speakerEl = $("speaker");
const textEl = $("text");
const choicesEl = $("choices");
const dialogueEl = $("dialogue");

const seasonLabel = $("seasonLabel");
const chapterEl = $("chapter");

const trainingSeason = $("trainingSeason");
const trainingWeek = $("trainingWeek");
const trainingMembers = $("trainingMembers");
const commandGrid = $("commandGrid");

const statusModal = $("statusModal");

const audio = $("bgm") || document.querySelector("audio");


/* =========================================================
   HELPERS
========================================================= */

function statLabel(stat) {
  return DATA.statLabels?.[stat] || stat;
}

function getMemberName(id) {
  return DATA.members[id]?.name || id;
}

function rankOf(value) {
  const found =
    DATA.ranks.find(r => value >= r.min);

  return found?.rank || "E";
}

function rankIndex(rank) {
  return ["E", "D", "C", "B", "A", "S"]
    .indexOf(rank);
}

function expNeeded(level) {
  return (
    DATA.exp.base +
    (level - 1) * DATA.exp.growth
  );
}

function formatMoney(value) {
  return `¥${Math.max(0, value)
    .toLocaleString("ja-JP")}`;
}


/* =========================================================
   STATE
========================================================= */

function createMember(id) {
  return {
    id,
    level: 1,
    exp: 0,
    sp: 0,
    stats: clone(DATA.members[id].initial)
  };
}

function createInitialState() {
  const members = {};

  DATA.memberOrder.forEach(id => {
    members[id] = createMember(id);
  });

  return {
    version: "0.22",

    started: false,
    prologueSeen: false,

    season: 1,
    week: 1,

    node: STORY.weeks[1].start,

    reach: 10,
    fans: 0,
    cash: 220000,

    ovkPoints: 0,

    members,

    actionsUsed: 0,
    selectedMember: null,

    weekSnapshot: null,

    pendingStoryNext: null,

    collection: {},
    achievements: [],
    clearHistory: []
  };
}

function loadState() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw)
      return createInitialState();

    const saved = JSON.parse(raw);

    if (!saved.members)
      return createInitialState();

    return saved;

  } catch (e) {
    console.error(e);
    return createInitialState();
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}


/* =========================================================
   SCREEN
========================================================= */

function hideScreens() {
  Object.values(screens)
    .forEach(screen => {
      screen?.classList.remove("active");
    });
}

function showScreen(screen) {
  hideScreens();
  screen?.classList.add("active");
}


/* =========================================================
   BGM
========================================================= */

let bgmStarted = false;

async function startBGM() {
  if (!audio) return;

  try {
    if (!audio.src ||
        !audio.src.includes("akunaki-kodou")) {
      audio.src = "./akunaki-kodou.mp3";
    }

    audio.loop = true;
    audio.volume = 0.28;

    await audio.play();

    bgmStarted = true;

  } catch (e) {
    /*
      Safariはユーザー操作前の再生を
      ブロックするのでここでは無視。
    */
    console.log("BGM waiting for user gesture");
  }
}

function ensureBGM() {
  if (!audio) return;

  if (audio.paused) {
    startBGM();
  }
}


/* =========================================================
   IMAGE CACHE
========================================================= */

const imageCache = new Map();

function preloadImage(src) {
  if (!src)
    return Promise.resolve();

  if (imageCache.has(src))
    return imageCache.get(src);

  const promise =
    new Promise(resolve => {
      const img = new Image();

      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });

  imageCache.set(src, promise);

  return promise;
}

async function preloadAssets() {
  const sources = [];

  Object.values(DATA.images)
    .forEach(member => {
      Object.values(member)
        .forEach(src => sources.push(src));
    });

  Object.values(DATA.backgrounds)
    .forEach(src => sources.push(src));

  const unique =
    [...new Set(sources)];

  /*
    ロード画面の4人をJS側で追加
  */
  createLoadingMembers();

  for (let i = 0; i < unique.length; i++) {
    await preloadImage(unique[i]);

    const percent =
      Math.round(
        ((i + 1) / unique.length) * 100
      );

    const progress =
      $("loadingProgress");

    const number =
      $("loadingPercent");

    if (progress)
      progress.style.width =
        `${percent}%`;

    if (number)
      number.textContent =
        `${percent}%`;
  }
}


/* =========================================================
   LOADING MEMBERS
========================================================= */

function createLoadingMembers() {
  const loading = screens.loading;

  if (!loading) return;

  let stage =
    document.getElementById(
      "loadingMembers"
    );

  if (stage) return;

  stage = document.createElement("div");
  stage.id = "loadingMembers";

  DATA.memberOrder.forEach(
    (id, index) => {
      const img =
        document.createElement("img");

      img.src =
        DATA.images[id].smile ||
        DATA.images[id].normal;

      img.alt =
        DATA.members[id].name;

      img.style.animationDelay =
        `${index * 0.12}s`;

      stage.appendChild(img);
    }
  );

  /*
    ロゴより上に配置
  */
  loading.prepend(stage);
}


/* =========================================================
   BACKGROUND
========================================================= */

async function setBackground(key) {
  const src =
    DATA.backgrounds[key];

  if (!envEl || !src) return;

  await preloadImage(src);

  envEl.style.backgroundImage =
    `linear-gradient(
      rgba(4,6,12,.10),
      rgba(4,6,12,.28)
    ),
    url("${src}")`;
}


/* =========================================================
   CHARACTER
========================================================= */

async function setCharacter(
  memberId,
  expression = "normal"
) {
  if (!charEl) return;

  charEl.classList.remove("show");

  managerMark?.classList.remove("show");

  /*
    MANAGERでもロゴを中央に出さない。
    背景を見せる。
  */
  if (!memberId) {
    charEl.style.display = "none";
    return;
  }

  const src =
    DATA.images?.[memberId]?.[expression] ||
    DATA.images?.[memberId]?.normal;

  if (!src) return;

  await preloadImage(src);

  charEl.src = src;
  charEl.style.display = "block";

  if (charEl.decode) {
    try {
      await charEl.decode();
    } catch (_) {}
  }

  requestAnimationFrame(() => {
    charEl.classList.add("show");
  });

  await wait(120);
}


/* =========================================================
   REACTION
========================================================= */

function setReaction(value) {
  if (!reactionEl) return;

  reactionEl.classList.remove("show");
  reactionEl.textContent = "";

  if (!value) return;

  reactionEl.textContent = value;

  void reactionEl.offsetWidth;

  reactionEl.classList.add("show");
}


/* =========================================================
   TYPEWRITER
========================================================= */

let typing = false;
let skipTyping = false;
let typingToken = 0;

async function typeText(
  element,
  text,
  speed = 21
) {
  if (!element) return;

  const token = ++typingToken;

  typing = true;
  skipTyping = false;

  element.innerHTML = "";

  const chars =
    Array.from(String(text));

  for (const char of chars) {
    if (token !== typingToken)
      return;

    if (skipTyping) {
      element.innerHTML =
        String(text)
          .replace(/\n/g, "<br>");

      break;
    }

    if (char === "\n") {
      element.appendChild(
        document.createElement("br")
      );
    } else {
      element.append(
        document.createTextNode(char)
      );
    }

    await wait(speed);
  }

  if (token === typingToken)
    typing = false;
}


/* =========================================================
   STORY
========================================================= */

let storyToken = 0;

async function renderStory() {
  ensureBGM();

  const token = ++storyToken;

  typingToken++;

  const node =
    STORY.nodes[state.node];

  if (!node) {
    console.error(
      "Missing story node:",
      state.node
    );
    return;
  }

  if (node.type === "training") {
    openTraining();
    return;
  }

  if (node.type === "weekComplete") {
    finishWeek();
    return;
  }

  showScreen(screens.game);

  if (seasonLabel)
    seasonLabel.textContent =
      `SEASON ${state.season}`;

  if (chapterEl)
    chapterEl.textContent =
      node.chapter || "";

  if (speakerEl)
    speakerEl.textContent =
      node.speaker || "";

  if (textEl)
    textEl.innerHTML = "";

  if (choicesEl)
    choicesEl.innerHTML = "";

  if (dialogueEl) {
    dialogueEl.dataset.mode =
      node.choices
        ? "choice"
        : "normal";
  }

  /*
    先に背景。
  */
  await setBackground(
    node.bg || "manager"
  );

  if (token !== storyToken)
    return;

  /*
    次にキャラ。
  */
  await setCharacter(
    node.member,
    node.expression || "normal"
  );

  if (token !== storyToken)
    return;

  setReaction(node.reaction);

  await wait(110);

  /*
    最後に文章。
    これでキャラより先に文字が
    出始めるのを防ぐ。
  */
  await typeText(
    textEl,
    node.text || ""
  );

  if (token !== storyToken)
    return;

  if (node.choices)
    renderChoices(node);
  else
    renderNext(node);

  saveState();
}

function renderNext(node) {
  if (!choicesEl) return;

  const button =
    document.createElement("button");

  button.className =
    "storyNextBtn";

  button.textContent =
    "NEXT ›";

  button.onclick = () => {
    if (typing) {
      skipTyping = true;
      return;
    }

    if (!node.next) return;

    state.node = node.next;

    saveState();
    renderStory();
  };

  choicesEl.appendChild(button);
}

function renderChoices(node) {
  if (!choicesEl) return;

  const grid =
    document.createElement("div");

  grid.className =
    "choiceGrid";

  node.choices.forEach(choice => {
    const button =
      document.createElement("button");

    button.className =
      "choiceBtn";

    button.innerHTML = `
      <span class="choiceTitle">
        ${choice.title}
      </span>

      ${
        choice.hint
          ? `
            <span class="choiceHint">
              ${choice.hint}
            </span>
          `
          : ""
      }
    `;

    button.onclick = async () => {
      document
        .querySelectorAll(".choiceBtn")
        .forEach(b => b.disabled = true);

      const result =
        applyDecision(choice.result);

      state.pendingStoryNext =
        choice.next;

      saveState();

      /*
        キャラを残したまま
        能力変化演出。
      */
      await playStatPopSequence(
        result,
        "MANAGER DECISION"
      );

      showDecisionResult(result);
    };

    grid.appendChild(button);
  });

  choicesEl.appendChild(grid);
}


/* =========================================================
   MEMBER
========================================================= */

function snapshotMember(id) {
  const m = state.members[id];

  return {
    level: m.level,
    exp: m.exp,
    sp: m.sp,
    stats: clone(m.stats)
  };
}

function snapshotAll() {
  const result = {};

  DATA.memberOrder.forEach(id => {
    result[id] =
      snapshotMember(id);
  });

  return result;
}

function changeStat(
  id,
  stat,
  amount
) {
  const member =
    state.members[id];

  if (!member) return;

  member.stats[stat] =
    clamp(
      member.stats[stat] + amount
    );
}

function addExp(id, amount) {
  const member =
    state.members[id];

  if (!member) return;

  member.exp += amount;

  while (
    member.exp >=
    expNeeded(member.level)
  ) {
    member.exp -=
      expNeeded(member.level);

    member.level++;

    member.sp +=
      DATA.exp.pointPerLevel;
  }
}


/* =========================================================
   DECISION
========================================================= */

function applyDecision(type) {
  const before =
    snapshotAll();

  switch (type) {

    case "teach":

      changeStat("kilua", "mc", 5);
      changeStat("kilua", "bond", 6);
      changeStat("kilua", "dance", 3);

      ["sarina","miyu","raisa"]
        .forEach(id => {
          changeStat(id, "dance", 3);
          changeStat(id, "bond", 2);
        });

      DATA.memberOrder.forEach(id => {
        changeStat(id, "energy", -5);
      });

      addExp("kilua", 45);

      ["sarina","miyu","raisa"]
        .forEach(id =>
          addExp(id, 25)
        );

      break;


    case "split":

      DATA.memberOrder.forEach(id => {
        changeStat(id, "dance", 4);
        changeStat(id, "bond", 3);
        changeStat(id, "energy", -6);
        addExp(id, 30);
      });

      break;


    case "push":

      DATA.memberOrder.forEach(id => {
        changeStat(
          id,
          "dance",
          id === "kilua" ? 4 : 6
        );

        changeStat(id, "bond", -2);
        changeStat(id, "energy", -11);

        addExp(id, 35);
      });

      break;


    case "talk":

      DATA.memberOrder.forEach(id => {
        changeStat(id, "bond", 4);
        changeStat(id, "mc", 2);
        changeStat(id, "dance", 1);
        changeStat(id, "energy", 2);

        addExp(id, 25);
      });

      break;
  }

  return {
    before,
    after: snapshotAll()
  };
}


/* =========================================================
   CHANGE DATA
========================================================= */

function collectChanges(
  before,
  after
) {
  return DATA.memberOrder.map(id => {
    const changes = [];

    Object.keys(DATA.statLabels)
      .forEach(stat => {
        const oldValue =
          before[id].stats[stat];

        const newValue =
          after[id].stats[stat];

        const diff =
          newValue - oldValue;

        if (!diff) return;

        let oldRank = null;
        let newRank = null;
        let rankDirection = 0;

        /*
          体力はランクなし。
        */
        if (stat !== "energy") {
          oldRank = rankOf(oldValue);
          newRank = rankOf(newValue);

          rankDirection =
            rankIndex(newRank) -
            rankIndex(oldRank);
        }

        changes.push({
          stat,
          oldValue,
          newValue,
          diff,
          oldRank,
          newRank,
          rankDirection
        });
      });

    return {
      id,
      changes
    };
  });
}


/* =========================================================
   STAT POP
========================================================= */

async function playStatPopSequence(
  result,
  title
) {
  if (!screens.game) return;

  dialogueEl?.classList.add(
    "decisionFade"
  );

  await wait(180);

  document
    .getElementById("statPopLayer")
    ?.remove();

  const layer =
    document.createElement("div");

  layer.id = "statPopLayer";

  const label =
    document.createElement("div");

  label.className =
    "lessonPopTitle";

  label.textContent = title;

  layer.appendChild(label);

  screens.game.appendChild(layer);

  const memberChanges =
    collectChanges(
      result.before,
      result.after
    );

  const messages = [];

  memberChanges.forEach(item => {
    item.changes.forEach(change => {
      messages.push({
        id: item.id,
        stat: change.stat,
        diff: change.diff
      });
    });
  });

  /*
    画面が文字だらけにならないよう、
    重要な変化を最大6個。
  */
  messages.sort(
    (a,b) =>
      Math.abs(b.diff) -
      Math.abs(a.diff)
  );

  for (
    const item of messages.slice(0,6)
  ) {
    const pop =
      document.createElement("div");

    pop.className =
      `statPop ${
        item.diff >= 0
          ? "positive"
          : "negative"
      }`;

    pop.innerHTML = `
      <small>
        ${getMemberName(item.id)}
      </small>

      <strong>
        ${statLabel(item.stat)}
      </strong>

      <b>
        ${item.diff > 0 ? "+" : ""}
        ${item.diff}
      </b>
    `;

    layer.appendChild(pop);

    requestAnimationFrame(() => {
      pop.classList.add("show");
    });

    await wait(250);
  }

  await wait(500);

  const btn =
    document.createElement("button");

  btn.className =
    "floatResultBtn";

  btn.textContent =
    "RESULTを見る";

  layer.appendChild(btn);

  await new Promise(resolve => {
    btn.onclick = resolve;
  });

  layer.classList.add("hide");

  await wait(180);

  layer.remove();

  dialogueEl?.classList.remove(
    "decisionFade"
  );
}


/* =========================================================
   DECISION RESULT
========================================================= */

function showDecisionResult(result) {
  showScreen(screens.actionResult);

  renderResultScreen({
    kicker: "RESULT",
    title: "MANAGER DECISION",
    before: result.before,
    after: result.after,
    buttonText: "ストーリーへ戻る",
    onContinue: () => {
      state.node =
        state.pendingStoryNext;

      state.pendingStoryNext = null;

      saveState();
      renderStory();
    }
  });
}


/* =========================================================
   RESULT HTML
========================================================= */

function resultStatHTML(change) {
  const sign =
    change.diff > 0 ? "+" : "";

  if (change.stat === "energy") {
    return `
      <div class="compactStat energyStat">

        <div class="compactStatTop">

          <span>体力</span>

          <b>
            ${change.oldValue}
            →
            ${change.newValue}
          </b>

          <em class="${
            change.diff >= 0
              ? "up"
              : "down"
          }">
            ${sign}${change.diff}
          </em>

        </div>

        <div class="energyBar">
          <i style="
            width:${change.newValue}%
          "></i>
        </div>

      </div>
    `;
  }

  const rankUp =
    change.rankDirection > 0;

  const rankDown =
    change.rankDirection < 0;

  return `
    <div class="
      compactStat
      ${rankUp ? "rankUp" : ""}
    ">

      <span>
        ${statLabel(change.stat)}
      </span>

      <b>
        ${change.oldRank}${change.oldValue}
        →
        ${change.newRank}${change.newValue}
      </b>

      <em class="${
        change.diff >= 0
          ? "up"
          : "down"
      }">
        ${sign}${change.diff}
      </em>

      ${
        rankUp
          ? `
            <small class="rankUpLabel">
              RANK UP!
            </small>
          `
          : ""
      }

      ${
        rankDown
          ? `
            <small class="rankDownLabel">
              RANK DOWN
            </small>
          `
          : ""
      }

    </div>
  `;
}

function renderResultScreen({
  kicker,
  title,
  subtitle = "",
  before,
  after,
  buttonText,
  onContinue,
  focusMember = null
}) {
  const screen =
    screens.actionResult;

  if (!screen) return;

  const changes =
    collectChanges(before, after);

  screen.innerHTML = `
    <div class="resultWrap">

      <div class="resultKicker">
        ${kicker}
      </div>

      <h2 class="resultTitle">
        ${title}
      </h2>

      ${
        subtitle
          ? `
            <div class="resultSub">
              ${subtitle}
            </div>
          `
          : ""
      }

      <div class="resultMemberGrid">

        ${changes.map(item => {
          const base =
            DATA.members[item.id];

          const member =
            state.members[item.id];

          const isFocus =
            item.id === focusMember;

          return `
            <article
              class="
                resultMemberCard
                ${isFocus ? "focusResult" : ""}
                ${
                  item.changes.length
                    ? ""
                    : "noChangeCard"
                }
              "
              style="
                --member-rgb:${base.rgb};
              "
            >

              <div class="resultMemberHead">

                <img
                  src="${
                    DATA.images[item.id]
                      .smile
                  }"
                  alt=""
                >

                <div>
                  <strong>
                    ${base.name}
                  </strong>

                  <span>
                    Lv.${member.level}
                  </span>
                </div>

              </div>

              <div class="compactStats">

                ${
                  item.changes.length
                    ? item.changes
                        .map(resultStatHTML)
                        .join("")
                    : `
                      <div class="noChange">
                        変化なし
                      </div>
                    `
                }

              </div>

            </article>
          `;
        }).join("")}

      </div>

      <button
        id="resultContinueBtn"
        class="mainActionBtn"
      >
        ${buttonText}
      </button>

    </div>
  `;

  $("resultContinueBtn")
    ?.addEventListener(
      "click",
      onContinue
    );
}


/* =========================================================
   WEEK SNAPSHOT
========================================================= */

function makeWeekSnapshot() {
  state.weekSnapshot = {
    season: state.season,
    week: state.week,

    reach: state.reach,
    fans: state.fans,
    cash: state.cash,

    members: snapshotAll()
  };

  saveState();
}


/* =========================================================
   TRAINING
========================================================= */

function openTraining() {
  ensureBGM();

  if (!state.weekSnapshot)
    makeWeekSnapshot();

  showScreen(screens.training);

  renderTrainingHeader();
  renderTrainingMembers();
  renderCommands();
}

function renderTrainingHeader() {
  if (trainingSeason)
    trainingSeason.textContent =
      `SEASON ${state.season}`;

  if (trainingWeek) {
    const remaining =
      Math.max(
        0,
        DATA.weekActions -
        state.actionsUsed
      );

    trainingWeek.innerHTML =
      `WEEK ${state.week}
       <span>
         残り活動 ${remaining}
       </span>`;
  }

  if ($("trainingReach"))
    $("trainingReach").textContent =
      state.reach;

  if ($("trainingFans"))
    $("trainingFans").textContent =
      state.fans;

  if ($("trainingCash"))
    $("trainingCash").textContent =
      formatMoney(state.cash);
}


/* =========================================================
   TRAINING MEMBERS
========================================================= */

function renderTrainingMembers() {
  if (!trainingMembers) return;

  trainingMembers.innerHTML = "";

  DATA.memberOrder.forEach(id => {
    const base =
      DATA.members[id];

    const member =
      state.members[id];

    const button =
      document.createElement("button");

    button.className =
      `trainingMember ${
        state.selectedMember === id
          ? "selected"
          : ""
      }`;

    button.style.setProperty(
      "--member-rgb",
      base.rgb
    );

    const expPercent =
      Math.min(
        100,
        Math.round(
          member.exp /
          expNeeded(member.level) *
          100
        )
      );

    button.innerHTML = `
      <img
        src="${DATA.images[id].smile}"
        alt=""
      >

      <div class="trainingMemberInfo">

        <strong>
          ${base.name}
        </strong>

        <span>
          Lv.${member.level}
        </span>

        <div class="miniExp">
          <i style="
            width:${expPercent}%
          "></i>
        </div>

      </div>
    `;

    button.onclick = () => {
      state.selectedMember = id;

      saveState();

      renderTrainingMembers();
      renderCommands();
    };

    trainingMembers.appendChild(button);
  });
}


/* =========================================================
   COMMANDS
========================================================= */

function renderCommands() {
  if (!commandGrid) return;

  commandGrid.innerHTML = "";

  /*
    メンバー未選択時。
    長い説明文は出さない。
  */
  if (!state.selectedMember) {
    commandGrid.innerHTML = `
      <div class="selectMemberPrompt">
        ↑ メンバーを選択
      </div>
    `;
    return;
  }

  DATA.trainingCommands.forEach(
    command => {
      const button =
        document.createElement("button");

      button.className =
        "commandCard";

      button.innerHTML = `
        <div class="commandIcon">
          ${command.icon}
        </div>

        <div class="commandText">

          <strong>
            ${command.title}
          </strong>

          <span>
            ${command.description}
          </span>

          <small>
            ${
              command.id === "rest"
                ? "体力回復"
                : command.cash < 0
                  ? formatMoney(
                      Math.abs(command.cash)
                    )
                  : "FREE"
            }
          </small>

        </div>
      `;

      button.onclick = () => {
        beginTraining(command);
      };

      commandGrid.appendChild(button);
    }
  );
}


/* =========================================================
   TRAINING START
========================================================= */

function beginTraining(command) {
  if (!state.selectedMember)
    return;

  if (
    state.actionsUsed >=
    DATA.weekActions
  )
    return;

  const memberId =
    state.selectedMember;

  /*
    先に計算するが、
    RESULTにはまだ行かない。
  */
  const before =
    snapshotAll();

  applyTraining(
    memberId,
    command
  );

  const after =
    snapshotAll();

  state.actionsUsed++;

  saveState();

  /*
    ここでレッスン場面へ。
  */
  showTrainingScene(
    memberId,
    command,
    before,
    after
  );
}


/* =========================================================
   APPLY TRAINING
========================================================= */

function applyTraining(
  memberId,
  command
) {
  /*
    個人重点育成。
  */
  if (command.primary) {
    const gain =
      Math.max(
        1,
        Math.round(
          command.primaryGain * 1.5
        )
      );

    changeStat(
      memberId,
      command.primary,
      gain
    );
  }

  if (command.bondGain) {
    changeStat(
      memberId,
      "bond",
      Math.round(
        command.bondGain * 1.5
      )
    );
  }

  if (command.energy) {
    changeStat(
      memberId,
      "energy",
      command.energy
    );
  }

  /*
    SNS / チラシだけ認知度UP。
    レッスンでは認知度は増えない。
  */
  if (command.reach) {
    state.reach += command.reach;

    if (
      command.id === "sns" ||
      command.id === "flyer"
    ) {
      state.fans +=
        Math.max(
          1,
          Math.floor(
            command.reach / 4
          )
        );
    }
  }

  state.cash =
    Math.max(
      0,
      state.cash +
      command.cash
    );

  addExp(
    memberId,
    Math.round(
      command.exp * 1.6
    )
  );
}


/* =========================================================
   TRAINING SCENE
========================================================= */

function trainingSceneData(
  memberId,
  command
) {
  const lines = {

    dance: {
      sarina:
        "もう一回、頭から合わせよう。",
      miyu:
        "よし。今度こそ合わせる。",
      kilua:
        "ここ、もっと揃えられる。",
      raisa:
        "もう一回やってみる！"
    },

    vocal: {
      sarina:
        "もう少し声、前に出してみる。",
      miyu:
        "ここ、もっと気持ち乗せたい。",
      kilua:
        "歌もちゃんと仕上げる。",
      raisa:
        "もう一回歌っていい？"
    },

    mc: {
      sarina:
        "4人の空気、もっと作りたいね。",
      miyu:
        "喋るなら任せて……たぶん。",
      kilua:
        "こういうのも練習いるんだ。",
      raisa:
        "ちゃんと話せるようになりたい。"
    },

    sns: {
      sarina:
        "見つけてもらえる投稿にしよう。",
      miyu:
        "これ、ちょっと盛れたかも。",
      kilua:
        "もっと攻めてもよくない？",
      raisa:
        "コメント来るかな……。"
    },

    flyer: {
      sarina:
        "一人ずつちゃんと渡そう。",
      miyu:
        "よし、声出してこ。",
      kilua:
        "全部配り切ろ。",
      raisa:
        "受け取ってくれるかな……。"
    },

    rest: {
      sarina:
        "今日はちゃんと休もう。",
      miyu:
        "休むのも仕事ってことで。",
      kilua:
        "……寝る。",
      raisa:
        "ちょっと元気戻ったかも。"
    }
  };

  const backgrounds = {
    dance: "studio",
    vocal: "studio",
    mc: "studio",
    sns: "sns",
    flyer: "city",
    rest: "lounge"
  };

  const reactions = {
    dance: "🔥",
    vocal: "🎤",
    mc: "💬",
    sns: "📱",
    flyer: "📄",
    rest: "💤"
  };

  return {
    bg:
      backgrounds[command.id] ||
      "studio",

    reaction:
      reactions[command.id] || "✨",

    line:
      lines[command.id]?.[memberId] ||
      "もう一回やってみよう。"
  };
}


/* =========================================================
   TRAINING SCENE RENDER
========================================================= */

async function showTrainingScene(
  memberId,
  command,
  before,
  after
) {
  showScreen(screens.game);

  const scene =
    trainingSceneData(
      memberId,
      command
    );

  if (seasonLabel)
    seasonLabel.textContent =
      `SEASON ${state.season}`;

  if (chapterEl)
    chapterEl.textContent =
      `WEEK ${state.week}｜${command.title}`;

  if (speakerEl)
    speakerEl.textContent =
      getMemberName(memberId);

  if (choicesEl)
    choicesEl.innerHTML = "";

  if (textEl)
    textEl.innerHTML = "";

  dialogueEl.dataset.mode =
    "normal";

  await setBackground(scene.bg);

  /*
    練習時は表情を少し変える。
  */
  let expression = "normal";

  if (
    command.id === "dance" ||
    command.id === "vocal"
  ) {
    expression = "smile";
  }

  if (command.id === "rest") {
    expression = "troubled";
  }

  await setCharacter(
    memberId,
    expression
  );

  setReaction(scene.reaction);

  await wait(180);

  /*
    まず本人の一言。
  */
  await typeText(
    textEl,
    scene.line,
    23
  );

  await wait(400);

  /*
    NEXTではなく、
    「レッスン結果」を出す。
  */
  const button =
    document.createElement("button");

  button.className =
    "storyNextBtn";

  button.textContent =
    "レッスン結果 ›";

  choicesEl.appendChild(button);

  button.onclick = async () => {
    button.disabled = true;

    await playTrainingStatPops(
      memberId,
      command,
      before,
      after
    );

    showTrainingResult(
      memberId,
      command,
      before,
      after
    );
  };
}


/* =========================================================
   TRAINING POP
========================================================= */

async function playTrainingStatPops(
  memberId,
  command,
  before,
  after
) {
  dialogueEl.classList.add(
    "decisionFade"
  );

  await wait(170);

  const old =
    document.getElementById(
      "statPopLayer"
    );

  old?.remove();

  const layer =
    document.createElement("div");

  layer.id = "statPopLayer";

  screens.game.appendChild(layer);

  const title =
    document.createElement("div");

  title.className =
    "lessonPopTitle";

  title.innerHTML = `
    <small>
      ${getMemberName(memberId)}
    </small>

    ${command.icon}
    ${command.title.toUpperCase()}
  `;

  layer.appendChild(title);

  const oldMember =
    before[memberId];

  const newMember =
    after[memberId];

  const changes = [];

  Object.keys(DATA.statLabels)
    .forEach(stat => {
      const diff =
        newMember.stats[stat] -
        oldMember.stats[stat];

      if (!diff) return;

      changes.push({
        stat,
        diff
      });
    });

  /*
    EXP差も表示。
    レベルアップをまたいでも
    今回獲得したEXP量を表示。
  */
  const expGain =
    Math.round(
      command.exp * 1.6
    );

  changes.forEach(() => {});

  for (const change of changes) {
    const pop =
      document.createElement("div");

    pop.className =
      `statPop ${
        change.diff >= 0
          ? "positive"
          : "negative"
      }`;

    pop.innerHTML = `
      <strong>
        ${statLabel(change.stat)}
      </strong>

      <b>
        ${change.diff > 0 ? "+" : ""}
        ${change.diff}
      </b>
    `;

    layer.appendChild(pop);

    requestAnimationFrame(() => {
      pop.classList.add("show");
    });

    await wait(300);
  }

  /*
    EXP
  */
  const expPop =
    document.createElement("div");

  expPop.className =
    "statPop positive";

  expPop.innerHTML = `
    <strong>EXP</strong>
    <b>+${expGain}</b>
  `;

  layer.appendChild(expPop);

  requestAnimationFrame(() => {
    expPop.classList.add("show");
  });

  await wait(450);

  /*
    認知度が上がった活動だけ。
  */
  if (command.reach) {
    const reachPop =
      document.createElement("div");

    reachPop.className =
      "statPop positive";

    reachPop.innerHTML = `
      <strong>認知度</strong>
      <b>+${command.reach}</b>
    `;

    layer.appendChild(reachPop);

    requestAnimationFrame(() => {
      reachPop.classList.add("show");
    });

    await wait(300);
  }

  await wait(400);

  const resultButton =
    document.createElement("button");

  resultButton.className =
    "floatResultBtn";

  resultButton.textContent =
    "RESULTを見る";

  layer.appendChild(resultButton);

  await new Promise(resolve => {
    resultButton.onclick = resolve;
  });

  layer.classList.add("hide");

  await wait(180);

  layer.remove();

  dialogueEl.classList.remove(
    "decisionFade"
  );
}


/* =========================================================
   TRAINING RESULT
========================================================= */

function showTrainingResult(
  memberId,
  command,
  before,
  after
) {
  showScreen(screens.actionResult);

  renderResultScreen({

    kicker:
      "TRAINING RESULT",

    title:
      `${command.icon} ${command.title}`,

    subtitle:
      `${getMemberName(memberId)}を重点育成`,

    before,
    after,

    focusMember:
      memberId,

    buttonText:
      state.actionsUsed >=
      DATA.weekActions
        ? "ストーリーへ"
        : "次の活動へ",

    onContinue:
      continueAfterTraining
  });
}


/* =========================================================
   AFTER TRAINING
========================================================= */

function continueAfterTraining() {
  /*
    次の活動では
    もう一度メンバーを選ぶ。
  */
  state.selectedMember = null;

  if (
    state.actionsUsed >=
    DATA.weekActions
  ) {
    if (
      state.season === 1 &&
      state.week === 1
    ) {
      state.node =
        STORY.weeks[1]
          .afterTraining;

      saveState();
      renderStory();
      return;
    }

    finishWeek();
    return;
  }

  saveState();
  openTraining();
}


/* =========================================================
   WEEK RESULT
========================================================= */

function averageStat(stat) {
  const values =
    DATA.memberOrder.map(
      id =>
        state.members[id]
          .stats[stat]
    );

  return Math.round(
    values.reduce(
      (a,b) => a + b,
      0
    ) / values.length
  );
}

function minimumStat(stat) {
  return Math.min(
    ...DATA.memberOrder.map(
      id =>
        state.members[id]
          .stats[stat]
    )
  );
}

function checkWeek1Missions() {
  return DATA.week1Mission.map(
    mission => {
      const value =
        mission.type === "minimum"
          ? minimumStat(mission.stat)
          : averageStat(mission.stat);

      return {
        ...mission,
        value,
        success:
          value >= mission.target
      };
    }
  );
}

function finishWeek() {
  showScreen(screens.weekEnd);

  if (!state.weekSnapshot)
    makeWeekSnapshot();

  const snapshot =
    state.weekSnapshot;

  const missions =
    state.week === 1
      ? checkWeek1Missions()
      : [];

  const screen =
    screens.weekEnd;

  screen.innerHTML = `
    <div class="weekResultWrap">

      <div class="resultKicker">
        WEEK ${state.week}
      </div>

      <h1 class="weekResultTitle">
        WEEK RESULT
      </h1>

      <div class="weekSummary">

        <div>
          <span>認知度</span>
          <strong>
            ${snapshot.reach}
            → ${state.reach}
          </strong>
        </div>

        <div>
          <span>ファン</span>
          <strong>
            ${snapshot.fans}
            → ${state.fans}
          </strong>
        </div>

        <div>
          <span>活動資金</span>
          <strong>
            ${formatMoney(state.cash)}
          </strong>
        </div>

      </div>

      ${
        missions.length
          ? `
            <section class="weekMissionSection">

              <h2>WEEK MISSION</h2>

              <div class="weekMissionList">

                ${missions.map(m => `
                  <div class="
                    weekMission
                    ${
                      m.success
                        ? "success"
                        : "failed"
                    }
                  ">

                    <span>
                      ${m.success ? "✓" : "—"}
                    </span>

                    <div>
                      <strong>
                        ${m.label}
                      </strong>

                      <small>
                        現在 ${m.value}
                      </small>
                    </div>

                  </div>
                `).join("")}

              </div>

            </section>
          `
          : ""
      }

      <div class="weekMemberGrid">

        ${DATA.memberOrder.map(id => {
          const base =
            DATA.members[id];

          const member =
            state.members[id];

          const old =
            snapshot.members[id];

          return `
            <article
              class="weekMemberCard"
              style="
                --member-rgb:${base.rgb};
              "
            >

              <div class="weekMemberTop">

                <img
                  src="${DATA.images[id].smile}"
                  alt=""
                >

                <div>
                  <div class="weekMemberName">
                    ${base.name}
                  </div>

                  <div class="weekMemberLevel">
                    Lv.${member.level}
                  </div>
                </div>

              </div>

              <div class="weekStats">

                ${[
                  "vocal",
                  "dance",
                  "mc",
                  "bond"
                ].map(stat => {
                  const now =
                    member.stats[stat];

                  const previous =
                    old.stats[stat];

                  const diff =
                    now - previous;

                  return `
                    <div>

                      <span>
                        ${statLabel(stat)}
                      </span>

                      <b>
                        ${rankOf(now)}
                        ${now}
                      </b>

                      <em>
                        ${
                          diff > 0
                            ? `+${diff}`
                            : diff
                        }
                      </em>

                    </div>
                  `;
                }).join("")}

              </div>

              <div class="weekEnergy">

                <div>
                  <span>体力</span>
                  <strong>
                    ${member.stats.energy}
                  </strong>
                </div>

                <div class="energyBar">
                  <i style="
                    width:${member.stats.energy}%
                  "></i>
                </div>

              </div>

            </article>
          `;
        }).join("")}

      </div>

      <button
        id="nextWeekBtn"
        class="mainActionBtn"
      >
        ${
          state.week ===
          DATA.seasons.weeksPerSeason
            ? "NEXT SEASON"
            : `WEEK ${state.week + 1}へ`
        }
      </button>

    </div>
  `;

  $("nextWeekBtn")
    ?.addEventListener(
      "click",
      nextWeek
    );

  saveState();
}


/* =========================================================
   NEXT WEEK
========================================================= */

function nextWeek() {
  state.actionsUsed = 0;
  state.selectedMember = null;
  state.weekSnapshot = null;

  if (
    state.week <
    DATA.seasons.weeksPerSeason
  ) {
    state.week++;
  } else {
    state.week = 1;

    if (
      state.season <
      DATA.seasons.total
    ) {
      state.season++;
    }
  }

  const weekStory =
    STORY.weeks[state.week];

  if (
    state.season === 1 &&
    weekStory?.start
  ) {
    state.node =
      weekStory.start;

    makeWeekSnapshot();

    saveState();
    renderStory();
    return;
  }

  makeWeekSnapshot();

  saveState();
  openTraining();
}


/* =========================================================
   STATUS
========================================================= */

function openStatus() {
  if (!statusModal) return;

  renderStatus();
  statusModal.classList.add("show");
}

function closeStatus() {
  statusModal?.classList.remove("show");
}

function renderStatus() {
  if (!statusModal) return;

  statusModal.innerHTML = `
    <div class="statusPanel">

      <div class="statusTop">

        <div>
          <small>O-VER-KiLL</small>
          <h2>MEMBER STATUS</h2>
        </div>

        <button
          id="statusClose"
          class="statusClose"
        >
          ×
        </button>

      </div>

      <div class="statusMemberList">

        ${DATA.memberOrder.map(id => {
          const base =
            DATA.members[id];

          const member =
            state.members[id];

          return `
            <section
              class="statusMember"
              style="
                --member-rgb:${base.rgb};
              "
            >

              <div class="statusMemberHead">

                <img
                  src="${DATA.images[id].smile}"
                  alt=""
                >

                <div>
                  <strong>
                    ${base.name}
                  </strong>

                  <span>
                    Lv.${member.level}
                  </span>

                  <small>
                    EXP
                    ${member.exp}
                    /
                    ${expNeeded(member.level)}
                  </small>
                </div>

              </div>

              <div class="statusStats">

                ${[
                  "vocal",
                  "dance",
                  "mc",
                  "bond"
                ].map(stat => `
                  <div class="statusStat">

                    <span>
                      ${statLabel(stat)}
                    </span>

                    <b>
                      ${rankOf(
                        member.stats[stat]
                      )}
                      ${member.stats[stat]}
                    </b>

                  </div>
                `).join("")}

              </div>

              <div class="statusEnergy">

                <div>
                  <span>体力</span>

                  <strong>
                    ${member.stats.energy}/100
                  </strong>
                </div>

                <div class="energyBar">
                  <i style="
                    width:${member.stats.energy}%
                  "></i>
                </div>

              </div>

            </section>
          `;
        }).join("")}

      </div>

    </div>
  `;

  $("statusClose")
    ?.addEventListener(
      "click",
      closeStatus
    );
}


/* =========================================================
   PROLOGUE
========================================================= */

let prologueIndex = 0;
let prologueBusy = false;

function createPrologueMembers() {
  const screen =
    screens.prologue;

  if (!screen) return;

  if (
    document.getElementById(
      "prologueMembers"
    )
  )
    return;

  const members =
    document.createElement("div");

  members.id =
    "prologueMembers";

  DATA.memberOrder.forEach(
    (id, index) => {
      const img =
        document.createElement("img");

      img.src =
        DATA.images[id].normal;

      img.style.animationDelay =
        `${index * .1}s`;

      members.appendChild(img);
    }
  );

  screen.prepend(members);
}

async function startPrologue() {
  showScreen(screens.prologue);

  ensureBGM();

  createPrologueMembers();

  const text =
    $("prologueText");

  const next =
    $("prologueNext");

  async function showPage() {
    if (prologueBusy) {
      skipTyping = true;
      return;
    }

    if (
      prologueIndex >=
      STORY.prologue.length
    ) {
      state.prologueSeen = true;

      state.node =
        STORY.weeks[1].start;

      makeWeekSnapshot();

      saveState();
      renderStory();

      return;
    }

    prologueBusy = true;

    if (next) {
      next.disabled = true;
      next.textContent = "…";
    }

    await typeText(
      text,
      STORY.prologue[
        prologueIndex
      ],
      24
    );

    prologueIndex++;

    prologueBusy = false;

    if (next) {
      next.disabled = false;

      next.textContent =
        prologueIndex >=
        STORY.prologue.length
          ? "START"
          : "NEXT";
    }
  }

  if (next)
    next.onclick = showPage;

  await showPage();
}


/* =========================================================
   TITLE
========================================================= */

function showTitle() {
  showScreen(screens.title);

  const continueBtn =
    $("continueBtn");

  if (continueBtn) {
    continueBtn.style.display =
      state.started
        ? ""
        : "none";
  }
}

function startNewGame() {
  /*
    クリック＝Safariで音を
    開始できるタイミング。
  */
  startBGM();

  const permanent = {
    ovkPoints:
      state.ovkPoints || 0,

    collection:
      state.collection || {},

    achievements:
      state.achievements || [],

    clearHistory:
      state.clearHistory || []
  };

  state =
    createInitialState();

  Object.assign(
    state,
    permanent
  );

  state.started = true;

  prologueIndex = 0;

  saveState();

  startPrologue();
}

function continueGame() {
  startBGM();

  if (!state.started) {
    startNewGame();
    return;
  }

  if (!state.prologueSeen) {
    startPrologue();
    return;
  }

  renderStory();
}


/* =========================================================
   TAP TO SKIP TEXT
========================================================= */

dialogueEl?.addEventListener(
  "click",
  e => {
    if (e.target.closest("button"))
      return;

    if (typing)
      skipTyping = true;
  }
);


/* =========================================================
   BUTTONS
========================================================= */

$("startBtn")
  ?.addEventListener(
    "click",
    startNewGame
  );

$("continueBtn")
  ?.addEventListener(
    "click",
    continueGame
  );

$("statusBtn")
  ?.addEventListener(
    "click",
    openStatus
  );

$("trainingStatusBtn")
  ?.addEventListener(
    "click",
    openStatus
  );


/* =========================================================
   INIT
========================================================= */

async function initializeGame() {
  showScreen(screens.loading);

  await preloadAssets();

  await wait(350);

  showTitle();
}

initializeGame();
