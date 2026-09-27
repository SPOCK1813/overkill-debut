/* =========================================================
   O-VER-KiLL | MANAGER'S STORY
   game.js
   v0.20
========================================================= */

const DATA = window.GAME_DATA;
const STORY = window.GAME_STORY;

const STORAGE_KEY = "overkill_manager_v20";

/* =========================================================
   DOM
========================================================= */

const $ = (id) => document.getElementById(id);

const loadingScreen = $("loading");
const titleScreen = $("title");
const prologueScreen = $("prologue");
const gameScreen = $("game");
const trainingScreen = $("training");
const actionResultScreen = $("actionResult");
const weekEndScreen = $("weekEnd");
const statusModal = $("statusModal");

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

const audioEl = $("song");

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const wait = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getMemberName(id) {
  return DATA.members[id]?.name || id;
}

function statLabel(stat) {
  return DATA.statLabels?.[stat] || stat;
}

function rankOf(value) {
  const found = DATA.ranks.find(r => value >= r.min);
  return found ? found.rank : "E";
}

function expNeeded(level) {
  return DATA.exp.base + ((level - 1) * DATA.exp.growth);
}

function averageStat(stat) {
  const values = DATA.memberOrder.map(id =>
    state.members[id].stats[stat]
  );

  return Math.round(
    values.reduce((a, b) => a + b, 0) / values.length
  );
}

function minimumStat(stat) {
  return Math.min(
    ...DATA.memberOrder.map(id =>
      state.members[id].stats[stat]
    )
  );
}

function formatMoney(value) {
  return `¥${Math.max(0, value).toLocaleString("ja-JP")}`;
}

/* =========================================================
   STATE
========================================================= */

function createMemberState(id) {
  const base = DATA.members[id];

  return {
    id,
    level: 1,
    exp: 0,
    sp: 0,
    stats: deepClone(base.initial)
  };
}

function createInitialState() {

  const members = {};

  DATA.memberOrder.forEach(id => {
    members[id] = createMemberState(id);
  });

  return {
    version: DATA.version,

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

    selectedMember: "all",

    pendingStoryNext: null,

    weekSnapshot: null,

    collection: {},
    achievements: [],
    clearHistory: []
  };
}

let state = loadState();

/* =========================================================
   SAVE / LOAD
========================================================= */

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function loadState() {

  try {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createInitialState();
    }

    const parsed = JSON.parse(raw);

    if (
      !parsed.members ||
      parsed.version !== DATA.version
    ) {
      return createInitialState();
    }

    return parsed;

  } catch (error) {

    console.error(error);
    return createInitialState();
  }
}

function resetRun() {

  const permanent = {
    ovkPoints: state.ovkPoints || 0,
    collection: state.collection || {},
    achievements: state.achievements || [],
    clearHistory: state.clearHistory || []
  };

  state = createInitialState();

  state.ovkPoints = permanent.ovkPoints;
  state.collection = permanent.collection;
  state.achievements = permanent.achievements;
  state.clearHistory = permanent.clearHistory;

  saveState();
}

/* =========================================================
   SCREEN
========================================================= */

function hideAllScreens() {

  [
    loadingScreen,
    titleScreen,
    prologueScreen,
    gameScreen,
    trainingScreen,
    actionResultScreen,
    weekEndScreen
  ].forEach(el => {
    if (el) el.classList.remove("active");
  });
}

function showScreen(screen) {

  hideAllScreens();

  if (screen) {
    screen.classList.add("active");
  }
}

/* =========================================================
   IMAGE PRELOAD
========================================================= */

const imageCache = new Map();

function preloadImage(src) {

  if (!src) return Promise.resolve();

  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const promise = new Promise(resolve => {

    const img = new Image();

    img.onload = () => resolve();
    img.onerror = () => resolve();

    img.src = src;
  });

  imageCache.set(src, promise);

  return promise;
}

async function preloadAssets() {

  const sources = [];

  Object.values(DATA.images).forEach(member => {
    Object.values(member).forEach(src => {
      sources.push(src);
    });
  });

  Object.values(DATA.backgrounds).forEach(src => {
    sources.push(src);
  });

  const unique = [...new Set(sources)];

  let loaded = 0;

  for (const src of unique) {

    await preloadImage(src);

    loaded++;

    const percent =
      Math.round((loaded / unique.length) * 100);

    const progress =
      $("loadingProgress") ||
      document.querySelector(".loadingProgress");

    if (progress) {
      progress.style.width = `${percent}%`;
    }

    const number =
      $("loadingPercent") ||
      document.querySelector(".loadingPercent");

    if (number) {
      number.textContent = `${percent}%`;
    }
  }
}

/* =========================================================
   BACKGROUND
========================================================= */

async function setBackground(bgKey) {

  const src = DATA.backgrounds[bgKey];

  if (!envEl || !src) return;

  await preloadImage(src);

  envEl.style.backgroundImage =
    `linear-gradient(
      rgba(4,6,13,.13),
      rgba(4,6,13,.26)
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

  if (managerMark) {
    managerMark.classList.remove("show");
  }

  if (!memberId) {

    charEl.style.display = "none";

    if (managerMark) {
      managerMark.classList.add("show");
    }

    return;
  }

  const src =
    DATA.images?.[memberId]?.[expression] ||
    DATA.images?.[memberId]?.normal;

  if (!src) {
    charEl.style.display = "none";
    return;
  }

  /*
    重要：
    画像の読み込み完了を待ってから
    DOMへ表示する。

    これで
    「文字 → 後から人物」
    を防止する。
  */

  await preloadImage(src);

  charEl.style.display = "block";
  charEl.src = src;

  await new Promise(resolve => {

    if (charEl.complete) {
      resolve();
      return;
    }

    charEl.onload = () => resolve();
    charEl.onerror = () => resolve();
  });

  requestAnimationFrame(() => {
    charEl.classList.add("show");
  });

  await wait(120);
}

/* =========================================================
   REACTION
========================================================= */

function setReaction(reaction) {

  if (!reactionEl) return;

  reactionEl.classList.remove("show");
  reactionEl.textContent = "";

  if (!reaction) return;

  reactionEl.textContent = reaction;

  void reactionEl.offsetWidth;

  reactionEl.classList.add("show");
}

/* =========================================================
   TYPEWRITER
========================================================= */

let typing = false;
let skipTyping = false;

async function typeText(text, speed = 24) {

  if (!textEl) return;

  typing = true;
  skipTyping = false;

  textEl.innerHTML = "";

  const chars = Array.from(String(text));

  for (const char of chars) {

    if (skipTyping) {
      textEl.innerHTML =
        String(text).replace(/\n/g, "<br>");
      break;
    }

    if (char === "\n") {
      textEl.innerHTML += "<br>";
    } else {
      textEl.append(
        document.createTextNode(char)
      );
    }

    await wait(speed);
  }

  typing = false;
}

/* =========================================================
   STORY
========================================================= */

async function renderStory() {

  const node = STORY.nodes[state.node];

  if (!node) {
    console.error(
      "Story node not found:",
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

  showScreen(gameScreen);

  if (seasonLabel) {
    seasonLabel.textContent =
      `SEASON ${state.season}`;
  }

  if (chapterEl) {
    chapterEl.textContent =
      node.chapter || "";
  }

  if (speakerEl) {
    speakerEl.textContent =
      node.speaker || "";
  }

  if (choicesEl) {
    choicesEl.innerHTML = "";
  }

  if (dialogueEl) {
    dialogueEl.dataset.mode =
      node.choices ? "choice" : "normal";
  }

  /*
    表示順を固定

    1. 背景
    2. キャラ画像ロード
    3. キャラ表示
    4. リアクション
    5. 少し待つ
    6. 文字開始
  */

  await setBackground(node.bg || "manager");

  await setCharacter(
    node.member,
    node.expression || "normal"
  );

  setReaction(node.reaction);

  await wait(140);

  await typeText(node.text || "");

  if (node.choices) {

    renderStoryChoices(node);

  } else {

    renderNextButton(node);
  }

  saveState();
}

function renderNextButton(node) {

  if (!choicesEl) return;

  const button =
    document.createElement("button");

  button.className =
    "storyNextBtn";

  button.textContent =
    "NEXT ›";

  button.onclick = () => {

    if (node.next) {

      state.node = node.next;
      saveState();

      renderStory();
    }
  };

  choicesEl.appendChild(button);
}

function renderStoryChoices(node) {

  if (!choicesEl) return;

  choicesEl.innerHTML = "";

  const grid =
    document.createElement("div");

  grid.className =
    "choiceGrid";

  node.choices.forEach(choice => {

    const button =
      document.createElement("button");

    button.className =
      "choiceBtn";

    const title =
      choice.title ||
      choice.text ||
      "";

    const hint =
      choice.hint || "";

    button.innerHTML = `
      <span class="choiceTitle">
        ${title}
      </span>

      ${
        hint
        ? `
          <span class="choiceHint">
            ${hint}
          </span>
        `
        : ""
      }
    `;

    button.onclick = async () => {

      document
        .querySelectorAll(".choiceBtn")
        .forEach(btn => {
          btn.disabled = true;
        });

      const result =
        applyStoryDecision(
          choice.result
        );

      state.pendingStoryNext =
        choice.next;

      saveState();

      showDecisionResult(result);
    };

    grid.appendChild(button);
  });

  choicesEl.appendChild(grid);
}

/* =========================================================
   STORY DECISION EFFECTS
========================================================= */

function snapshotMember(id) {

  const member =
    state.members[id];

  return {
    level: member.level,
    exp: member.exp,
    sp: member.sp,
    stats: deepClone(member.stats)
  };
}

function snapshotAllMembers() {

  const snapshot = {};

  DATA.memberOrder.forEach(id => {
    snapshot[id] =
      snapshotMember(id);
  });

  return snapshot;
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

function addExp(
  id,
  amount
) {

  const member =
    state.members[id];

  if (!member) return [];

  const levelUps = [];

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

    levelUps.push(
      member.level
    );
  }

  return levelUps;
}

function applyStoryDecision(type) {

  const before =
    snapshotAllMembers();

  switch (type) {

    case "teach":

      changeStat(
        "kilua",
        "mc",
        5
      );

      changeStat(
        "kilua",
        "bond",
        6
      );

      changeStat(
        "kilua",
        "dance",
        3
      );

      ["sarina", "miyu", "raisa"]
        .forEach(id => {

          changeStat(
            id,
            "dance",
            3
          );

          changeStat(
            id,
            "bond",
            2
          );
        });

      DATA.memberOrder.forEach(id => {
        changeStat(
          id,
          "energy",
          -5
        );
      });

      addExp("kilua", 45);

      ["sarina", "miyu", "raisa"]
        .forEach(id => {
          addExp(id, 25);
        });

      break;


    case "split":

      DATA.memberOrder.forEach(id => {

        changeStat(
          id,
          "dance",
          4
        );

        changeStat(
          id,
          "bond",
          3
        );

        changeStat(
          id,
          "energy",
          -6
        );

        addExp(
          id,
          30
        );
      });

      break;


    case "push":

      DATA.memberOrder.forEach(id => {

        const gain =
          id === "kilua"
            ? 4
            : 6;

        changeStat(
          id,
          "dance",
          gain
        );

        changeStat(
          id,
          "bond",
          -2
        );

        changeStat(
          id,
          "energy",
          -11
        );

        addExp(
          id,
          35
        );
      });

      break;


    case "talk":

      DATA.memberOrder.forEach(id => {

        changeStat(
          id,
          "bond",
          4
        );

        changeStat(
          id,
          "mc",
          2
        );

        changeStat(
          id,
          "dance",
          1
        );

        changeStat(
          id,
          "energy",
          2
        );

        addExp(
          id,
          25
        );
      });

      break;
  }

  const after =
    snapshotAllMembers();

  return {
    title:
      "MANAGER DECISION",
    before,
    after
  };
}

/* =========================================================
   DECISION RESULT
========================================================= */

function collectChanges(
  before,
  after
) {

  const result = [];

  DATA.memberOrder.forEach(id => {

    const changes = [];

    Object.keys(
      DATA.statLabels
    ).forEach(stat => {

      const oldValue =
        before[id].stats[stat];

      const newValue =
        after[id].stats[stat];

      const diff =
        newValue - oldValue;

      if (diff === 0) return;

      changes.push({
        stat,
        oldValue,
        newValue,
        diff,
        oldRank:
          rankOf(oldValue),
        newRank:
          rankOf(newValue)
      });
    });

    const levelDiff =
      after[id].level -
      before[id].level;

    result.push({
      id,
      changes,
      levelDiff
    });
  });

  return result;
}

function showDecisionResult(result) {

  showScreen(actionResultScreen);

  const changes =
    collectChanges(
      result.before,
      result.after
    );

  if (!actionResultScreen) {
    state.node =
      state.pendingStoryNext;

    state.pendingStoryNext =
      null;

    renderStory();

    return;
  }

  actionResultScreen.innerHTML = `
    <div class="resultWrap">

      <div class="resultKicker">
        RESULT
      </div>

      <h2 class="resultTitle">
        ${result.title}
      </h2>

      <div class="decisionResultList">

        ${changes.map(item => {

          const member =
            DATA.members[item.id];

          return `
            <div
              class="decisionMemberCard"
              style="
                --member-rgb:
                ${member.rgb};
              "
            >

              <div class="decisionMemberHead">

                <img
                  src="${
                    DATA.images[item.id]
                      .smile
                  }"
                  alt=""
                >

                <div>
                  <strong>
                    ${member.name}
                  </strong>

                  <span>
                    Lv.
                    ${
                      state.members[item.id]
                        .level
                    }
                  </span>
                </div>

              </div>

              <div class="decisionChanges">

                ${
                  item.changes.length
                  ? item.changes
                      .map(change => {

                        const sign =
                          change.diff > 0
                            ? "+"
                            : "";

                        const rankUp =
                          change.oldRank !==
                          change.newRank;

                        return `
                          <div
                            class="
                              decisionChange
                              ${
                                rankUp
                                  ? "rankUp"
                                  : ""
                              }
                            "
                          >

                            <span>
                              ${
                                statLabel(
                                  change.stat
                                )
                              }
                            </span>

                            <b>
                              ${
                                change.oldRank
                              }
                              ${
                                change.oldValue
                              }
                              →
                              ${
                                change.newRank
                              }
                              ${
                                change.newValue
                              }
                            </b>

                            <em>
                              ${sign}${
                                change.diff
                              }
                            </em>

                            ${
                              rankUp
                              ? `
                                <small>
                                  RANK UP!
                                </small>
                              `
                              : ""
                            }

                          </div>
                        `;
                      })
                      .join("")
                  : `
                    <div class="noChange">
                      能力変化なし
                    </div>
                  `
                }

              </div>

            </div>
          `;
        }).join("")}

      </div>

      <button
        id="decisionContinue"
        class="mainActionBtn"
      >
        ストーリーへ戻る
      </button>

    </div>
  `;

  $("decisionContinue")
    ?.addEventListener(
      "click",
      () => {

        state.node =
          state.pendingStoryNext;

        state.pendingStoryNext =
          null;

        saveState();
        renderStory();
      }
    );
}

/* =========================================================
   WEEK SNAPSHOT
========================================================= */

function makeWeekSnapshot() {

  state.weekSnapshot = {

    season:
      state.season,

    week:
      state.week,

    reach:
      state.reach,

    fans:
      state.fans,

    cash:
      state.cash,

    members:
      snapshotAllMembers()
  };

  saveState();
}

/* =========================================================
   TRAINING
========================================================= */

function openTraining() {

  if (!state.weekSnapshot) {
    makeWeekSnapshot();
  }

  showScreen(trainingScreen);

  renderTrainingHeader();
  renderTrainingMembers();
  renderCommands();
}

function renderTrainingHeader() {

  if (trainingSeason) {
    trainingSeason.textContent =
      `SEASON ${state.season}`;
  }

  if (trainingWeek) {

    const remaining =
      Math.max(
        0,
        DATA.weekActions -
        state.actionsUsed
      );

    trainingWeek.innerHTML = `
      WEEK ${state.week}
      <span>
        残り活動 ${remaining}
      </span>
    `;
  }

  const reachEl =
    $("trainingReach");

  const cashEl =
    $("trainingCash");

  const fanEl =
    $("trainingFans");

  if (reachEl) {
    reachEl.textContent =
      state.reach;
  }

  if (cashEl) {
    cashEl.textContent =
      formatMoney(state.cash);
  }

  if (fanEl) {
    fanEl.textContent =
      state.fans;
  }

  const days =
    $("trainingDays");

  if (days) {

    const totalWeeks =
      (
        (state.season - 1) *
        DATA.seasons.weeksPerSeason
      ) +
      state.week;

    const remainingDays =
      Math.max(
        0,
        28 -
        ((totalWeeks - 1) * 7)
      );

    days.textContent =
      `デビューまであと${remainingDays}日`;
  }
}

/* =========================================================
   MEMBER SELECT
========================================================= */

function renderTrainingMembers() {

  if (!trainingMembers) return;

  trainingMembers.innerHTML = "";

  const allButton =
    document.createElement("button");

  allButton.className =
    `trainingMember allMember ${
      state.selectedMember === "all"
        ? "selected"
        : ""
    }`;

  allButton.innerHTML = `
    <strong>ALL</strong>
    <span>4人全員</span>
  `;

  allButton.onclick = () => {
    state.selectedMember = "all";
    renderTrainingMembers();
  };

  trainingMembers.appendChild(
    allButton
  );

  DATA.memberOrder.forEach(id => {

    const base =
      DATA.members[id];

    const member =
      state.members[id];

    const needed =
      expNeeded(member.level);

    const percent =
      Math.min(
        100,
        Math.round(
          (member.exp / needed) *
          100
        )
      );

    const button =
      document.createElement(
        "button"
      );

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
          <i
            style="
              width:${percent}%
            "
          ></i>
        </div>

      </div>
    `;

    button.onclick = () => {

      state.selectedMember = id;

      renderTrainingMembers();
    };

    trainingMembers.appendChild(
      button
    );
  });
}

/* =========================================================
   COMMANDS
========================================================= */

function renderCommands() {

  if (!commandGrid) return;

  commandGrid.innerHTML = "";

  DATA.trainingCommands.forEach(
    command => {

      const button =
        document.createElement(
          "button"
        );

      button.className =
        "commandCard";

      const cost =
        command.cash < 0
          ? `${formatMoney(
              Math.abs(command.cash)
            )}`
          : "FREE";

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
                : cost
            }
          </small>

        </div>
      `;

      button.onclick = () => {

        if (
          state.actionsUsed >=
          DATA.weekActions
        ) {
          return;
        }

        runTrainingCommand(
          command
        );
      };

      commandGrid.appendChild(
        button
      );
    }
  );
}

/* =========================================================
   TRAINING EFFECT
========================================================= */

function runTrainingCommand(command) {

  const before =
    snapshotAllMembers();

  const targets =
    state.selectedMember === "all"
      ? [...DATA.memberOrder]
      : [state.selectedMember];

  /*
    個人育成は効果が高い。
    全体育成は広く伸びる。

    これで
    「誰を育てるか」
    の意味を作る。
  */

  const multiplier =
    state.selectedMember === "all"
      ? 1
      : 1.6;

  targets.forEach(id => {

    if (command.primary) {

      const gain =
        Math.max(
          1,
          Math.round(
            command.primaryGain *
            multiplier
          )
        );

      changeStat(
        id,
        command.primary,
        gain
      );
    }

    if (command.bondGain) {

      changeStat(
        id,
        "bond",
        Math.round(
          command.bondGain *
          multiplier
        )
      );
    }

    if (command.energy) {

      changeStat(
        id,
        "energy",
        Math.round(
          command.energy *
          (
            state.selectedMember ===
            "all"
              ? 1
              : 0.9
          )
        )
      );
    }

    addExp(
      id,
      Math.round(
        command.exp *
        multiplier
      )
    );
  });

  /*
    SNS・チラシは
    認知度を上げる。

    レッスンでは
    認知度は上がらない。
  */

  if (command.reach) {

    const reachGain =
      state.selectedMember === "all"
        ? command.reach
        : Math.max(
            1,
            Math.round(
              command.reach * .7
            )
          );

    state.reach +=
      reachGain;

    /*
      小規模な初期ファン増加。
    */

    if (
      command.id === "sns" ||
      command.id === "flyer"
    ) {

      const fanGain =
        Math.max(
          0,
          Math.floor(
            reachGain / 4
          )
        );

      state.fans +=
        fanGain;
    }
  }

  state.cash =
    Math.max(
      0,
      state.cash +
      command.cash
    );

  state.actionsUsed++;

  const after =
    snapshotAllMembers();

  saveState();

  showTrainingResult(
    command,
    before,
    after
  );
}

/* =========================================================
   TRAINING RESULT
========================================================= */

function showTrainingResult(
  command,
  before,
  after
) {

  showScreen(actionResultScreen);

  const changes =
    collectChanges(
      before,
      after
    );

  const activeChanges =
    changes.filter(
      item =>
        item.changes.length > 0
    );

  actionResultScreen.innerHTML = `
    <div class="resultWrap">

      <div class="resultKicker">
        TRAINING RESULT
      </div>

      <h2 class="resultTitle">
        ${command.icon}
        ${command.title}
      </h2>

      <div class="resultSub">
        ${
          state.selectedMember ===
          "all"
            ? "4人で活動"
            : `${
                getMemberName(
                  state.selectedMember
                )
              }を重点育成`
        }
      </div>

      <div class="decisionResultList">

        ${
          activeChanges.map(item => {

            const base =
              DATA.members[item.id];

            return `
              <div
                class="
                  decisionMemberCard
                "
                style="
                  --member-rgb:
                  ${base.rgb};
                "
              >

                <div
                  class="
                    decisionMemberHead
                  "
                >

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
                      Lv.${
                        state.members[
                          item.id
                        ].level
                      }
                    </span>
                  </div>

                </div>

                <div
                  class="
                    decisionChanges
                  "
                >

                  ${item.changes
                    .map(change => {

                      const sign =
                        change.diff > 0
                          ? "+"
                          : "";

                      const rankUp =
                        change.oldRank !==
                        change.newRank;

                      return `
                        <div
                          class="
                            decisionChange
                            ${
                              rankUp
                                ? "rankUp"
                                : ""
                            }
                          "
                        >

                          <span>
                            ${
                              statLabel(
                                change.stat
                              )
                            }
                          </span>

                          <b>
                            ${
                              change.oldRank
                            }
                            ${
                              change.oldValue
                            }
                            →
                            ${
                              change.newRank
                            }
                            ${
                              change.newValue
                            }
                          </b>

                          <em>
                            ${sign}${
                              change.diff
                            }
                          </em>

                          ${
                            rankUp
                            ? `
                              <small>
                                RANK UP!
                              </small>
                            `
                            : ""
                          }

                        </div>
                      `;
                    })
                    .join("")}

                </div>

              </div>
            `;
          }).join("")
        }

      </div>

      <button
        id="trainingContinue"
        class="mainActionBtn"
      >
        CONTINUE
      </button>

    </div>
  `;

  $("trainingContinue")
    ?.addEventListener(
      "click",
      continueAfterTraining
    );
}

/* =========================================================
   TRAINING FLOW
========================================================= */

function continueAfterTraining() {

  /*
    WEEK1では3回の育成を終えたら
    夜イベントへ。

    WEEK2以降は、
    今後それぞれ専用イベントを
    追加していける。
  */

  if (
    state.actionsUsed >=
    DATA.weekActions
  ) {

    if (state.week === 1) {

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

  openTraining();
}

/* =========================================================
   MISSIONS
========================================================= */

function checkWeek1Missions() {

  return DATA.week1Mission.map(
    mission => {

      let value = 0;

      if (
        mission.type ===
        "average"
      ) {

        value =
          averageStat(
            mission.stat
          );

      } else if (
        mission.type ===
        "minimum"
      ) {

        value =
          minimumStat(
            mission.stat
          );
      }

      return {
        ...mission,
        value,
        success:
          value >= mission.target
      };
    }
  );
}

/* =========================================================
   WEEK END
========================================================= */

function finishWeek() {

  showScreen(weekEndScreen);

  const before =
    state.weekSnapshot;

  if (!before) {
    makeWeekSnapshot();
  }

  const snapshot =
    state.weekSnapshot;

  const missions =
    state.week === 1
      ? checkWeek1Missions()
      : [];

  const successCount =
    missions.filter(
      m => m.success
    ).length;

  /*
    WEEK1ミッション報酬
  */

  if (
    state.week === 1 &&
    !state.weekRewardClaimed
  ) {

    const bonusExp =
      successCount * 15;

    DATA.memberOrder.forEach(
      id => {
        addExp(
          id,
          bonusExp
        );
      }
    );

    state.weekRewardClaimed =
      true;
  }

  weekEndScreen.innerHTML = `
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
            →
            ${state.reach}
          </strong>
        </div>

        <div>
          <span>ファン</span>
          <strong>
            ${snapshot.fans}
            →
            ${state.fans}
          </strong>
        </div>

        <div>
          <span>活動資金</span>
          <strong>
            ${formatMoney(
              state.cash
            )}
          </strong>
        </div>

      </div>

      ${
        missions.length
        ? `
          <section
            class="
              weekMissionSection
            "
          >

            <h2>
              WEEK MISSION
            </h2>

            <div
              class="
                weekMissionList
              "
            >

              ${missions
                .map(mission => `
                  <div
                    class="
                      weekMission
                      ${
                        mission.success
                          ? "success"
                          : "failed"
                      }
                    "
                  >

                    <span>
                      ${
                        mission.success
                          ? "✓"
                          : "—"
                      }
                    </span>

                    <div>
                      <strong>
                        ${
                          mission.label
                        }
                      </strong>

                      <small>
                        現在
                        ${mission.value}
                      </small>
                    </div>

                  </div>
                `)
                .join("")}

            </div>

            <div
              class="
                missionReward
              "
            >
              達成
              ${successCount}
              /${missions.length}

              ・

              全員EXP
              +${successCount * 15}
            </div>

          </section>
        `
        : ""
      }

      <div
        class="
          weekMemberGrid
        "
      >

        ${DATA.memberOrder
          .map(id => {

            const base =
              DATA.members[id];

            const member =
              state.members[id];

            const old =
              snapshot.members[id];

            const needed =
              expNeeded(
                member.level
              );

            const expPercent =
              Math.min(
                100,
                Math.round(
                  (
                    member.exp /
                    needed
                  ) *
                  100
                )
              );

            return `
              <article
                class="
                  weekMemberCard
                "
                style="
                  --member-rgb:
                  ${base.rgb};
                "
              >

                <img
                  src="${
                    DATA.images[id]
                      .smile
                  }"
                  alt=""
                >

                <div
                  class="
                    weekMemberName
                  "
                >
                  ${base.name}
                </div>

                <div
                  class="
                    weekMemberLevel
                  "
                >
                  Lv.${member.level}
                </div>

                <div
                  class="
                    weekExpBar
                  "
                >
                  <i
                    style="
                      width:
                      ${expPercent}%
                    "
                  ></i>
                </div>

                <div
                  class="
                    weekStats
                  "
                >

                  ${[
                    "vocal",
                    "dance",
                    "mc",
                    "bond",
                    "energy"
                  ].map(stat => {

                    const now =
                      member.stats[
                        stat
                      ];

                    const oldValue =
                      old.stats[
                        stat
                      ];

                    const diff =
                      now -
                      oldValue;

                    const sign =
                      diff > 0
                        ? "+"
                        : "";

                    return `
                      <div>
                        <span>
                          ${
                            statLabel(
                              stat
                            )
                          }
                        </span>

                        <b>
                          ${
                            rankOf(now)
                          }
                          ${now}
                        </b>

                        <em
                          class="${
                            diff > 0
                              ? "plus"
                              : diff < 0
                                ? "minus"
                                : ""
                          }"
                        >
                          ${
                            diff !== 0
                              ? `${sign}${diff}`
                              : "±0"
                          }
                        </em>
                      </div>
                    `;
                  }).join("")}

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
            ? `SEASON ${
                state.season + 1
              }へ`
            : `WEEK ${
                state.week + 1
              }へ`
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
  state.selectedMember = "all";

  state.weekSnapshot = null;
  state.weekRewardClaimed =
    false;

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

  /*
    現在はWEEK1・2に
    専用ストーリーがある。

    WEEK3以降は今後
    順番に追加する。
  */

  if (
    state.season === 1 &&
    STORY.weeks[state.week]
  ) {

    state.node =
      STORY.weeks[state.week]
        .start;

    saveState();
    renderStory();

    return;
  }

  saveState();
  openTraining();
}

/* =========================================================
   STATUS
========================================================= */

function openStatus() {

  if (!statusModal) return;

  statusModal.classList.add(
    "show"
  );

  renderStatus();
}

function closeStatus() {

  statusModal?.classList.remove(
    "show"
  );
}

function renderStatus() {

  if (!statusModal) return;

  statusModal.innerHTML = `
    <div class="statusPanel">

      <div class="statusTop">

        <div>
          <small>
            O-VER-KiLL
          </small>

          <h2>
            MEMBER STATUS
          </h2>
        </div>

        <button
          id="statusClose"
          class="statusClose"
        >
          ×
        </button>

      </div>

      <div
        class="
          statusMemberList
        "
      >

        ${DATA.memberOrder
          .map(id => {

            const base =
              DATA.members[id];

            const member =
              state.members[id];

            const needed =
              expNeeded(
                member.level
              );

            const percent =
              Math.min(
                100,
                Math.round(
                  (
                    member.exp /
                    needed
                  ) * 100
                )
              );

            return `
              <section
                class="
                  statusMember
                "
                style="
                  --member-rgb:
                  ${base.rgb};
                "
              >

                <div
                  class="
                    statusMemberHead
                  "
                >

                  <img
                    src="${
                      DATA.images[id]
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

                    <div
                      class="
                        statusExp
                      "
                    >
                      <i
                        style="
                          width:
                          ${percent}%
                        "
                      ></i>
                    </div>

                    <small>
                      EXP
                      ${member.exp}
                      /
                      ${needed}
                    </small>

                  </div>

                </div>

                <div
                  class="
                    statusStats
                  "
                >

                  ${[
                    "vocal",
                    "dance",
                    "mc",
                    "bond",
                    "energy"
                  ].map(stat => {

                    const value =
                      member.stats[
                        stat
                      ];

                    return `
                      <div
                        class="
                          statusStat
                        "
                      >

                        <span>
                          ${
                            statLabel(
                              stat
                            )
                          }
                        </span>

                        <b>
                          <i>
                            ${
                              rankOf(
                                value
                              )
                            }
                          </i>

                          ${value}
                        </b>

                        ${
                          stat !==
                            "energy" &&
                          member.sp > 0
                          ? `
                            <button
                              class="
                                statPlus
                              "
                              data-member="
                                ${id}
                              "
                              data-stat="
                                ${stat}
                              "
                            >
                              ＋
                            </button>
                          `
                          : ""
                        }

                      </div>
                    `;
                  }).join("")}

                </div>

                <div
                  class="
                    statusPoints
                  "
                >
                  育成PT
                  <strong>
                    ${member.sp}
                  </strong>
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

  statusModal
    .querySelectorAll(
      ".statPlus"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.member;

          const stat =
            button.dataset.stat;

          useStatPoint(
            id,
            stat
          );
        }
      );
    });
}

function useStatPoint(
  memberId,
  stat
) {

  const member =
    state.members[memberId];

  if (
    !member ||
    member.sp <= 0
  ) return;

  member.sp--;

  changeStat(
    memberId,
    stat,
    1
  );

  saveState();
  renderStatus();
}

/* =========================================================
   TITLE / PROLOGUE
========================================================= */

function showTitle() {

  showScreen(titleScreen);

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

  resetRun();

  state.started = true;

  saveState();

  startPrologue();
}

async function startPrologue() {

  showScreen(prologueScreen);

  const prologueText =
    $("prologueText");

  const prologueNext =
    $("prologueNext");

  let index = 0;

  async function showPage() {

    if (
      index >=
      STORY.prologue.length
    ) {

      state.prologueSeen =
        true;

      state.node =
        STORY.weeks[1].start;

      makeWeekSnapshot();

      saveState();

      renderStory();

      return;
    }

    if (prologueText) {

      prologueText.innerHTML = "";

      const text =
        STORY.prologue[index];

      for (
        const char of
        Array.from(text)
      ) {

        if (char === "\n") {
          prologueText.innerHTML +=
            "<br>";
        } else {
          prologueText.append(
            document.createTextNode(
              char
            )
          );
        }

        await wait(25);
      }
    }

    index++;
  }

  if (prologueNext) {

    prologueNext.onclick =
      showPage;
  }

  await showPage();
}

function continueGame() {

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

if (dialogueEl) {

  dialogueEl.addEventListener(
    "click",
    event => {

      if (
        event.target.closest(
          "button"
        )
      ) return;

      if (typing) {
        skipTyping = true;
      }
    }
  );
}

/* =========================================================
   BUTTON BINDINGS
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
   INITIALIZE
========================================================= */

async function initializeGame() {

  showScreen(loadingScreen);

  /*
    20枚のキャラ＋背景を
    最初にキャッシュ。

    初回ロードは少し長くなるが、
    会話中の
    「文字が先・人物が後」
    を防ぐことを優先。
  */

  await preloadAssets();

  await wait(250);

  showTitle();
}

initializeGame();
