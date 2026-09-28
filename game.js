/* =========================================================
   O-VER-KiLL | MANAGER'S STORY
   game.js
   v0.21
========================================================= */

const DATA = window.GAME_DATA;
const STORY = window.GAME_STORY;

const STORAGE_KEY = "overkill_manager_v20";

const $ = id => document.getElementById(id);

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

/* =========================================================
   BASIC
========================================================= */

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const wait = ms =>
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

/*
  体力はランク対象外。
*/
function rankOf(value) {
  const found =
    DATA.ranks.find(rank => value >= rank.min);

  return found ? found.rank : "E";
}

function rankIndex(rank) {
  const order = ["E", "D", "C", "B", "A", "S"];
  return order.indexOf(rank);
}

function expNeeded(level) {
  return (
    DATA.exp.base +
    ((level - 1) * DATA.exp.growth)
  );
}

function formatMoney(value) {
  return `¥${Math.max(0, value).toLocaleString("ja-JP")}`;
}

function averageStat(stat) {
  const values =
    DATA.memberOrder.map(
      id => state.members[id].stats[stat]
    );

  return Math.round(
    values.reduce((a, b) => a + b, 0) /
    values.length
  );
}

function minimumStat(stat) {
  return Math.min(
    ...DATA.memberOrder.map(
      id => state.members[id].stats[stat]
    )
  );
}

/* =========================================================
   STATE
========================================================= */

function createMemberState(id) {
  return {
    id,
    level: 1,
    exp: 0,
    sp: 0,
    stats: deepClone(
      DATA.members[id].initial
    )
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
    weekRewardClaimed: false,

    collection: {},
    achievements: [],
    clearHistory: []
  };
}

let state = loadState();

/* =========================================================
   SAVE
========================================================= */

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function loadState() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createInitialState();
    }

    const parsed =
      JSON.parse(raw);

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
    ovkPoints:
      state.ovkPoints || 0,

    collection:
      state.collection || {},

    achievements:
      state.achievements || [],

    clearHistory:
      state.clearHistory || []
  };

  state = createInitialState();

  Object.assign(
    state,
    permanent
  );

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
  ].forEach(screen => {
    screen?.classList.remove("active");
  });
}

function showScreen(screen) {
  hideAllScreens();
  screen?.classList.add("active");
}

/* =========================================================
   IMAGE CACHE
========================================================= */

const imageCache = new Map();

function preloadImage(src) {
  if (!src) {
    return Promise.resolve();
  }

  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

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
    .forEach(expressions => {
      Object.values(expressions)
        .forEach(src => {
          sources.push(src);
        });
    });

  Object.values(DATA.backgrounds)
    .forEach(src => {
      sources.push(src);
    });

  const unique =
    [...new Set(sources)];

  for (
    let i = 0;
    i < unique.length;
    i++
  ) {
    await preloadImage(unique[i]);

    const percent =
      Math.round(
        ((i + 1) / unique.length) * 100
      );

    const progress =
      $("loadingProgress");

    const number =
      $("loadingPercent");

    if (progress) {
      progress.style.width =
        `${percent}%`;
    }

    if (number) {
      number.textContent =
        `${percent}%`;
    }
  }
}

/* =========================================================
   BACKGROUND
========================================================= */

async function setBackground(bgKey) {
  const src =
    DATA.backgrounds[bgKey];

  if (!envEl || !src) {
    return;
  }

  await preloadImage(src);

  envEl.style.backgroundImage = `
    linear-gradient(
      rgba(4,6,13,.13),
      rgba(4,6,13,.28)
    ),
    url("${src}")
  `;
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

  if (!memberId) {
    charEl.style.display = "none";
    managerMark?.classList.add("show");
    return;
  }

  const src =
    DATA.images?.[memberId]?.[expression] ||
    DATA.images?.[memberId]?.normal;

  if (!src) return;

  await preloadImage(src);

  charEl.src = src;
  charEl.style.display = "block";

  if (!charEl.complete) {
    await new Promise(resolve => {
      charEl.onload = resolve;
      charEl.onerror = resolve;
    });
  }

  requestAnimationFrame(() => {
    charEl.classList.add("show");
  });

  await wait(130);
}

/* =========================================================
   REACTION
========================================================= */

function setReaction(reaction) {
  if (!reactionEl) return;

  reactionEl.classList.remove("show");
  reactionEl.textContent = "";

  if (!reaction) return;

  reactionEl.textContent =
    reaction;

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
  speed = 23
) {
  if (!element) return;

  const myToken =
    ++typingToken;

  typing = true;
  skipTyping = false;

  element.innerHTML = "";

  const chars =
    Array.from(String(text));

  for (const char of chars) {
    if (myToken !== typingToken) {
      return;
    }

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

  if (myToken === typingToken) {
    typing = false;
  }
}

/* =========================================================
   STORY
========================================================= */

let storyRenderToken = 0;

async function renderStory() {
  const renderToken =
    ++storyRenderToken;

  typingToken++;

  const node =
    STORY.nodes[state.node];

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

  if (textEl) {
    textEl.innerHTML = "";
  }

  if (choicesEl) {
    choicesEl.innerHTML = "";
  }

  if (dialogueEl) {
    dialogueEl.dataset.mode =
      node.choices
        ? "choice"
        : "normal";
  }

  await setBackground(
    node.bg || "manager"
  );

  if (
    renderToken !== storyRenderToken
  ) return;

  await setCharacter(
    node.member,
    node.expression || "normal"
  );

  if (
    renderToken !== storyRenderToken
  ) return;

  setReaction(node.reaction);

  await wait(130);

  if (
    renderToken !== storyRenderToken
  ) return;

  await typeText(
    textEl,
    node.text || ""
  );

  if (
    renderToken !== storyRenderToken
  ) return;

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

    button.innerHTML = `
      <span class="choiceTitle">
        ${choice.title || choice.text || ""}
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

      await playDecisionEffect(
        result
      );

      showDecisionResult(
        result
      );
    };

    grid.appendChild(button);
  });

  choicesEl.appendChild(grid);
}

/* =========================================================
   MEMBER / STATS
========================================================= */

function snapshotMember(id) {
  const member =
    state.members[id];

  return {
    level: member.level,
    exp: member.exp,
    sp: member.sp,
    stats:
      deepClone(member.stats)
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

function addExp(id, amount) {
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

/* =========================================================
   MANAGER DECISION
========================================================= */

function applyStoryDecision(type) {
  const before =
    snapshotAllMembers();

  switch (type) {
    case "teach":
      changeStat("kilua", "mc", 5);
      changeStat("kilua", "bond", 6);
      changeStat("kilua", "dance", 3);

      ["sarina", "miyu", "raisa"]
        .forEach(id => {
          changeStat(id, "dance", 3);
          changeStat(id, "bond", 2);
        });

      DATA.memberOrder.forEach(id => {
        changeStat(id, "energy", -5);
      });

      addExp("kilua", 45);

      ["sarina", "miyu", "raisa"]
        .forEach(id => {
          addExp(id, 25);
        });

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
    title: "MANAGER DECISION",
    before,
    after:
      snapshotAllMembers()
  };
}

/* =========================================================
   COLLECT CHANGES
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

        if (diff === 0) return;

        const change = {
          stat,
          oldValue,
          newValue,
          diff,
          oldRank: null,
          newRank: null,
          rankDirection: 0
        };

        /*
          体力にはランクを付けない。
        */
        if (stat !== "energy") {
          change.oldRank =
            rankOf(oldValue);

          change.newRank =
            rankOf(newValue);

          change.rankDirection =
            rankIndex(change.newRank) -
            rankIndex(change.oldRank);
        }

        changes.push(change);
      });

    return {
      id,
      changes,
      levelDiff:
        after[id].level -
        before[id].level
    };
  });
}

/* =========================================================
   FLOAT EFFECT
========================================================= */

async function playDecisionEffect(result) {
  if (!gameScreen) return;

  /*
    選択肢を一旦消して、
    キャラ＋背景を残す。
  */
  if (dialogueEl) {
    dialogueEl.classList.add(
      "decisionFade"
    );
  }

  await wait(180);

  const old =
    document.getElementById(
      "decisionFloatLayer"
    );

  old?.remove();

  const layer =
    document.createElement("div");

  layer.id =
    "decisionFloatLayer";

  gameScreen.appendChild(layer);

  const changes =
    collectChanges(
      result.before,
      result.after
    );

  /*
    同じ内容をある程度まとめて、
    一瞬で読み取れるようにする。
  */
  const messages = [];

  changes.forEach(member => {
    member.changes.forEach(change => {
      const sign =
        change.diff > 0 ? "+" : "";

      messages.push({
        member: member.id,
        stat: change.stat,
        text:
          `${getMemberName(member.id)}　${statLabel(change.stat)} ${sign}${change.diff}`,
        positive:
          change.diff > 0
      });
    });
  });

  /*
    最大6件程度を優先表示。
    詳細は次のRESULTで確認できる。
  */
  const important =
    messages
      .sort((a, b) =>
        Math.abs(
          parseInt(
            b.text.match(/[+-]\d+/)?.[0] || 0
          )
        ) -
        Math.abs(
          parseInt(
            a.text.match(/[+-]\d+/)?.[0] || 0
          )
        )
      )
      .slice(0, 6);

  for (
    let i = 0;
    i < important.length;
    i++
  ) {
    const item =
      important[i];

    const pop =
      document.createElement("div");

    pop.className =
      `statFloat ${
        item.positive
          ? "positive"
          : "negative"
      }`;

    pop.textContent =
      item.text;

    layer.appendChild(pop);

    requestAnimationFrame(() => {
      pop.classList.add("show");
    });

    await wait(220);
  }

  await wait(600);

  const button =
    document.createElement("button");

  button.className =
    "floatResultBtn";

  button.textContent =
    "RESULTを見る";

  layer.appendChild(button);

  await new Promise(resolve => {
    button.onclick = resolve;
  });

  layer.classList.add("hide");

  await wait(220);

  layer.remove();

  dialogueEl?.classList.remove(
    "decisionFade"
  );
}

/* =========================================================
   RESULT
========================================================= */

function resultChangeHTML(change) {
  const sign =
    change.diff > 0 ? "+" : "";

  /*
    体力
  */
  if (change.stat === "energy") {
    const percent =
      clamp(change.newValue);

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
          <i
            style="width:${percent}%"
          ></i>
        </div>

      </div>
    `;
  }

  let rankText = "";

  if (change.rankDirection > 0) {
    rankText = `
      <small class="rankUpLabel">
        RANK UP!
      </small>
    `;
  }

  if (change.rankDirection < 0) {
    rankText = `
      <small class="rankDownLabel">
        RANK DOWN
      </small>
    `;
  }

  return `
    <div class="
      compactStat
      ${
        change.rankDirection > 0
          ? "rankUp"
          : ""
      }
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

      ${rankText}

    </div>
  `;
}

function showDecisionResult(result) {
  showScreen(actionResultScreen);

  if (!actionResultScreen) return;

  const changes =
    collectChanges(
      result.before,
      result.after
    );

  actionResultScreen.innerHTML = `
    <div class="resultWrap">

      <div class="resultKicker">
        RESULT
      </div>

      <h2 class="resultTitle">
        ${result.title}
      </h2>

      <div class="resultMemberGrid">

        ${changes.map(item => {
          const base =
            DATA.members[item.id];

          const member =
            state.members[item.id];

          return `
            <article
              class="resultMemberCard"
              style="
                --member-rgb:
                ${base.rgb};
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
                        .map(
                          resultChangeHTML
                        )
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

  if ($("trainingReach")) {
    $("trainingReach").textContent =
      state.reach;
  }

  if ($("trainingFans")) {
    $("trainingFans").textContent =
      state.fans;
  }

  if ($("trainingCash")) {
    $("trainingCash").textContent =
      formatMoney(state.cash);
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
   TRAINING MEMBER
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
          member.exp /
          needed *
          100
        )
      );

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
            style="width:${percent}%"
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
   COMMAND
========================================================= */

function renderCommands() {
  if (!commandGrid) return;

  commandGrid.innerHTML = "";

  DATA.trainingCommands.forEach(
    command => {
      const button =
        document.createElement("button");

      button.className =
        "commandCard";

      const cost =
        command.cash < 0
          ? formatMoney(
              Math.abs(command.cash)
            )
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
        ) return;

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

function runTrainingCommand(command) {
  const before =
    snapshotAllMembers();

  const targets =
    state.selectedMember === "all"
      ? [...DATA.memberOrder]
      : [state.selectedMember];

  const multiplier =
    state.selectedMember === "all"
      ? 1
      : 1.6;

  targets.forEach(id => {
    if (command.primary) {
      changeStat(
        id,
        command.primary,
        Math.max(
          1,
          Math.round(
            command.primaryGain *
            multiplier
          )
        )
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

  if (command.reach) {
    const gain =
      state.selectedMember === "all"
        ? command.reach
        : Math.max(
            1,
            Math.round(
              command.reach * 0.7
            )
          );

    state.reach += gain;

    if (
      command.id === "sns" ||
      command.id === "flyer"
    ) {
      state.fans +=
        Math.max(
          0,
          Math.floor(gain / 4)
        );
    }
  }

  state.cash =
    Math.max(
      0,
      state.cash + command.cash
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
          state.selectedMember === "all"
            ? "4人で活動"
            : `${getMemberName(state.selectedMember)}を重点育成`
        }
      </div>

      <div class="resultMemberGrid">

        ${changes.map(item => {
          const base =
            DATA.members[item.id];

          const member =
            state.members[item.id];

          return `
            <article
              class="resultMemberCard"
              style="
                --member-rgb:
                ${base.rgb};
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
                        .map(
                          resultChangeHTML
                        )
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

function continueAfterTraining() {
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
        mission.type === "average"
      ) {
        value =
          averageStat(
            mission.stat
          );
      }

      if (
        mission.type === "minimum"
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
   WEEK RESULT
========================================================= */

function finishWeek() {
  showScreen(weekEndScreen);

  if (!state.weekSnapshot) {
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
      mission => mission.success
    ).length;

  if (
    state.week === 1 &&
    !state.weekRewardClaimed
  ) {
    const bonusExp =
      successCount * 15;

    DATA.memberOrder.forEach(id => {
      addExp(id, bonusExp);
    });

    state.weekRewardClaimed = true;
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

              <h2>
                WEEK MISSION
              </h2>

              <div class="weekMissionList">

                ${missions.map(
                  mission => `
                    <div class="
                      weekMission
                      ${
                        mission.success
                          ? "success"
                          : "failed"
                      }
                    ">

                      <span>
                        ${
                          mission.success
                            ? "✓"
                            : "—"
                        }
                      </span>

                      <div>
                        <strong>
                          ${mission.label}
                        </strong>

                        <small>
                          現在 ${mission.value}
                        </small>
                      </div>

                    </div>
                  `
                ).join("")}

              </div>

              <div class="missionReward">
                達成
                ${successCount}/${missions.length}
                ・ 全員EXP
                +${successCount * 15}
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

          const needed =
            expNeeded(member.level);

          const expPercent =
            Math.min(
              100,
              Math.round(
                member.exp /
                needed *
                100
              )
            );

          const abilityStats =
            [
              "vocal",
              "dance",
              "mc",
              "bond"
            ];

          return `
            <article
              class="weekMemberCard"
              style="
                --member-rgb:
                ${base.rgb};
              "
            >

              <div class="weekMemberTop">

                <img
                  src="${
                    DATA.images[id].smile
                  }"
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

              <div class="weekExpBar">
                <i
                  style="
                    width:${expPercent}%
                  "
                ></i>
              </div>

              <div class="weekStats">

                ${abilityStats.map(stat => {
                  const now =
                    member.stats[stat];

                  const oldValue =
                    old.stats[stat];

                  const diff =
                    now - oldValue;

                  const sign =
                    diff > 0 ? "+" : "";

                  return `
                    <div>
                      <span>
                        ${statLabel(stat)}
                      </span>

                      <b>
                        ${rankOf(now)}
                        ${now}
                      </b>

                      <em class="${
                        diff > 0
                          ? "plus"
                          : diff < 0
                            ? "minus"
                            : ""
                      }">
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

              <div class="weekEnergy">

                <div>
                  <span>体力</span>

                  <strong>
                    ${member.stats.energy}
                  </strong>
                </div>

                <div class="energyBar">
                  <i
                    style="
                      width:
                      ${member.stats.energy}%
                    "
                  ></i>
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
            ? `SEASON ${state.season + 1}へ`
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
  state.selectedMember = "all";
  state.weekSnapshot = null;
  state.weekRewardClaimed = false;

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

  if (
    state.season === 1 &&
    STORY.weeks[state.week]
  ) {
    state.node =
      STORY.weeks[state.week].start;

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

  statusModal.classList.add("show");
  renderStatus();
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

          const needed =
            expNeeded(member.level);

          const percent =
            Math.min(
              100,
              Math.round(
                member.exp /
                needed *
                100
              )
            );

          return `
            <section
              class="statusMember"
              style="
                --member-rgb:
                ${base.rgb};
              "
            >

              <div class="statusMemberHead">

                <img
                  src="${
                    DATA.images[id].smile
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

                  <div class="statusExp">
                    <i
                      style="
                        width:${percent}%
                      "
                    ></i>
                  </div>

                  <small>
                    EXP ${member.exp}/${needed}
                  </small>
                </div>

              </div>

              <div class="statusStats">

                ${[
                  "vocal",
                  "dance",
                  "mc",
                  "bond"
                ].map(stat => {
                  const value =
                    member.stats[stat];

                  return `
                    <div class="statusStat">

                      <span>
                        ${statLabel(stat)}
                      </span>

                      <b>
                        <i>
                          ${rankOf(value)}
                        </i>
                        ${value}
                      </b>

                      ${
                        member.sp > 0
                          ? `
                            <button
                              class="statPlus"
                              data-member="${id}"
                              data-stat="${stat}"
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

              <div class="statusEnergy">

                <div>
                  <span>体力</span>

                  <strong>
                    ${member.stats.energy}/100
                  </strong>
                </div>

                <div class="energyBar">
                  <i
                    style="
                      width:
                      ${member.stats.energy}%
                    "
                  ></i>
                </div>

              </div>

              <div class="statusPoints">
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
    .querySelectorAll(".statPlus")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          useStatPoint(
            button.dataset.member,
            button.dataset.stat
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
   PROLOGUE
========================================================= */

let prologueRunning = false;

async function startPrologue() {
  showScreen(prologueScreen);

  const prologueText =
    $("prologueText");

  const prologueNext =
    $("prologueNext");

  let index = 0;

  async function showPage() {
    /*
      前ページ描画中は次へ行かない。
      これで文章が重なるバグを止める。
    */
    if (prologueRunning) {
      skipTyping = true;
      return;
    }

    if (
      index >= STORY.prologue.length
    ) {
      state.prologueSeen = true;
      state.node =
        STORY.weeks[1].start;

      makeWeekSnapshot();
      saveState();
      renderStory();
      return;
    }

    prologueRunning = true;

    if (prologueNext) {
      prologueNext.disabled = true;
      prologueNext.textContent = "…";
    }

    await typeText(
      prologueText,
      STORY.prologue[index],
      22
    );

    index++;

    prologueRunning = false;

    if (prologueNext) {
      prologueNext.disabled = false;

      prologueNext.textContent =
        index >= STORY.prologue.length
          ? "START"
          : "NEXT";
    }
  }

  if (prologueNext) {
    prologueNext.onclick =
      showPage;
  }

  await showPage();
}

/* =========================================================
   TITLE
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
   SKIP
========================================================= */

dialogueEl?.addEventListener(
  "click",
  event => {
    if (
      event.target.closest("button")
    ) return;

    if (typing) {
      skipTyping = true;
    }
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
  showScreen(loadingScreen);

  await preloadAssets();
  await wait(220);

  showTitle();
}

initializeGame();
