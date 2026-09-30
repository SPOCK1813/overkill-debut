/* =========================================================
   O-VER-KiLL | MANAGER'S STORY
   v0.23 PATCH
   data.js v0.23 + game.js v0.22
========================================================= */

/* ---------- SAVE DATA MIGRATION ---------- */

if (typeof state.trainingTP !== "number") {
  state.trainingTP = DATA.weeklyTP || 100;
}

state.version = "0.23";
saveState();


/* =========================================================
   CONDITION
========================================================= */

function conditionOf(energy) {
  const table = DATA.condition || [
    { min: 80, key: "best", icon: "🔥", label: "絶好調" },
    { min: 60, key: "good", icon: "🟢", label: "好調" },
    { min: 40, key: "normal", icon: "🟡", label: "普通" },
    { min: 20, key: "bad", icon: "🟠", label: "不調" },
    { min: 0, key: "worst", icon: "🔴", label: "絶不調" }
  ];

  return (
    table.find(item => energy >= item.min) ||
    table[table.length - 1]
  );
}


/* =========================================================
   TRAINING RANDOM
========================================================= */

function rollTrainingOutcome(energy) {
  const condition = conditionOf(energy);

  const probabilities =
    DATA.trainingProbabilities?.[condition.key] || {
      super: 1,
      great: 10,
      success: 34,
      normal: 45,
      fail: 10
    };

  let roll = Math.random() * 100;

  for (
    const key of [
      "super",
      "great",
      "success",
      "normal",
      "fail"
    ]
  ) {
    roll -= probabilities[key] || 0;

    if (roll < 0) {
      return key;
    }
  }

  return "normal";
}


function getTrainingOutcome(key) {
  const data =
    DATA.trainingOutcomes?.[key];

  if (data) {
    return {
      key,
      label: data.label,
      icon: data.icon,
      mult: data.statMultiplier,
      expMult: data.expMultiplier
    };
  }

  return {
    key: "normal",
    label: "普通",
    icon: "•",
    mult: 0.8,
    expMult: 0.9
  };
}


/* =========================================================
   BGM FIX
========================================================= */

startBGM = async function () {
  const bgm =
    $("song") ||
    $("bgm") ||
    document.querySelector("audio");

  if (!bgm) return;

  try {
    if (
      !bgm.src ||
      !bgm.src.includes("akunaki-kodou")
    ) {
      bgm.src =
        "./akunaki-kodou.mp3";
    }

    bgm.loop = true;
    bgm.volume = 0.28;
    bgm.muted = false;

    bgm.setAttribute(
      "playsinline",
      ""
    );

    await bgm.play();

    bgmStarted = true;

  } catch (error) {
    console.log(
      "BGM waiting for user gesture",
      error
    );
  }
};


ensureBGM = function () {
  const bgm =
    $("song") ||
    $("bgm") ||
    document.querySelector("audio");

  if (bgm?.paused) {
    void startBGM();
  }
};


/* =========================================================
   TRAINING HEADER
========================================================= */

renderTrainingHeader = function () {
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
       　⚡TP ${state.trainingTP}/${DATA.weeklyTP || 100}
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
};


/* =========================================================
   TRAINING MEMBERS
========================================================= */

renderTrainingMembers = function () {
  if (!trainingMembers) return;

  trainingMembers.innerHTML = "";

  DATA.memberOrder.forEach(id => {
    const base =
      DATA.members[id];

    const member =
      state.members[id];

    const condition =
      conditionOf(
        member.stats.energy
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

        <small class="conditionBadge">
          ${condition.icon}
          ${condition.label}
        </small>

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

    trainingMembers.appendChild(
      button
    );
  });
};


/* =========================================================
   COMMANDS
========================================================= */

renderCommands = function () {
  if (!commandGrid) return;

  commandGrid.innerHTML = "";

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
        document.createElement(
          "button"
        );

      const tp =
        command.tp || 0;

      const noTP =
        tp > state.trainingTP;

      const noCash =
        command.cash < 0 &&
        Math.abs(command.cash) >
        state.cash;

      button.className =
        `commandCard ${
          noTP || noCash
            ? "disabled"
            : ""
        }`;

      button.disabled =
        noTP || noCash;

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

          <small class="commandTp">
            ⚡TP ${tp}
          </small>

          <small>
            ${
              command.id === "rest"
                ? "体力回復"
                : command.cash < 0
                  ? formatMoney(
                      Math.abs(
                        command.cash
                      )
                    )
                  : "FREE"
            }
          </small>

        </div>
      `;

      button.onclick =
        () => beginTraining(
          command
        );

      commandGrid.appendChild(
        button
      );
    }
  );
};


/* =========================================================
   APPLY TRAINING
========================================================= */

applyTraining = function (
  memberId,
  command,
  outcome
) {
  const meta = {
    expGain: 0,
    reachGain: 0
  };

  const multiplier =
    outcome?.mult ?? 1;

  const expMultiplier =
    outcome?.expMult ?? 1;


  if (command.primary) {
    const gain =
      Math.max(
        0,
        Math.round(
          command.primaryGain *
          1.5 *
          multiplier
        )
      );

    if (gain) {
      changeStat(
        memberId,
        command.primary,
        gain
      );
    }
  }


  if (command.bondGain) {
    const gain =
      Math.max(
        0,
        Math.round(
          command.bondGain *
          1.5 *
          multiplier
        )
      );

    if (gain) {
      changeStat(
        memberId,
        "bond",
        gain
      );
    }
  }


  if (command.energy) {
    changeStat(
      memberId,
      "energy",
      command.energy
    );
  }


  if (command.reach) {
    const reachGain =
      Math.max(
        1,
        Math.round(
          command.reach *
          multiplier
        )
      );

    state.reach +=
      reachGain;

    meta.reachGain =
      reachGain;

    if (
      command.id === "sns" ||
      command.id === "flyer"
    ) {
      state.fans +=
        Math.max(
          1,
          Math.floor(
            reachGain / 4
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


  meta.expGain =
    Math.max(
      1,
      Math.round(
        command.exp *
        1.6 *
        expMultiplier
      )
    );

  addExp(
    memberId,
    meta.expGain
  );

  return meta;
};


/* =========================================================
   BEGIN TRAINING
========================================================= */

beginTraining = function (command) {
  if (!state.selectedMember)
    return;

  if (
    state.actionsUsed >=
    DATA.weekActions
  )
    return;


  const memberId =
    state.selectedMember;

  const tpCost =
    command.tp || 0;


  if (
    tpCost >
    state.trainingTP
  )
    return;


  if (
    command.cash < 0 &&
    Math.abs(command.cash) >
    state.cash
  )
    return;


  const energyBefore =
    state.members[
      memberId
    ].stats.energy;

  const condition =
    conditionOf(
      energyBefore
    );


  let outcome;


  if (command.id === "rest") {
    outcome = {
      key: "rest",
      label: "休養",
      icon: "💤",
      mult: 1,
      expMult: 1
    };

  } else {

    outcome =
      getTrainingOutcome(
        rollTrainingOutcome(
          energyBefore
        )
      );
  }


  const before =
    snapshotAll();


  const meta =
    applyTraining(
      memberId,
      command,
      outcome
    );


  const after =
    snapshotAll();


  state.actionsUsed++;

  state.trainingTP =
    Math.max(
      0,
      state.trainingTP -
      tpCost
    );


  saveState();


  showTrainingScene(
    memberId,
    command,
    before,
    after,
    {
      condition,
      outcome,
      ...meta
    }
  );
};


/* =========================================================
   TRAINING SCENE
========================================================= */

showTrainingScene =
async function (
  memberId,
  command,
  before,
  after,
  meta
) {

  showScreen(
    screens.game
  );


  const scene =
    trainingSceneData(
      memberId,
      command
    );


  if (seasonLabel) {
    seasonLabel.textContent =
      `SEASON ${state.season}`;
  }


  if (chapterEl) {
    chapterEl.textContent =
      `WEEK ${state.week}｜${command.title}`;
  }


  if (speakerEl) {
    speakerEl.textContent =
      getMemberName(
        memberId
      );
  }


  if (choicesEl) {
    choicesEl.innerHTML = "";
  }


  if (textEl) {
    textEl.innerHTML = "";
  }


  dialogueEl.dataset.mode =
    "normal";


  await setBackground(
    scene.bg
  );


  let expression =
    "normal";


  if (
    command.id === "dance" ||
    command.id === "vocal"
  ) {
    expression =
      "smile";
  }


  if (
    command.id === "rest" ||
    meta?.outcome?.key ===
      "fail"
  ) {
    expression =
      "troubled";
  }


  await setCharacter(
    memberId,
    expression
  );


  setReaction(
    scene.reaction
  );


  await wait(180);


  await typeText(
    textEl,
    scene.line,
    23
  );


  await wait(400);


  const button =
    document.createElement(
      "button"
    );


  button.className =
    "storyNextBtn";


  button.textContent =
    command.id === "rest"
      ? "休養結果 ›"
      : "レッスン結果 ›";


  choicesEl.appendChild(
    button
  );


  button.onclick =
  async () => {

    button.disabled = true;


    await playTrainingStatPops(
      memberId,
      command,
      before,
      after,
      meta
    );


    showTrainingResult(
      memberId,
      command,
      before,
      after,
      meta
    );
  };
};


/* =========================================================
   TRAINING POP
========================================================= */

playTrainingStatPops =
async function (
  memberId,
  command,
  before,
  after,
  meta
) {

  dialogueEl.classList.add(
    "decisionFade"
  );


  await wait(170);


  document
    .getElementById(
      "statPopLayer"
    )
    ?.remove();


  const layer =
    document.createElement(
      "div"
    );


  layer.id =
    "statPopLayer";


  screens.game.appendChild(
    layer
  );


  const title =
    document.createElement(
      "div"
    );


  title.className =
    "lessonPopTitle";


  title.innerHTML = `
    <small>
      ${getMemberName(memberId)}
    </small>

    ${command.icon}
    ${command.title.toUpperCase()}
  `;


  layer.appendChild(
    title
  );


  const verdict =
    document.createElement(
      "div"
    );


  verdict.className =
    `trainingVerdict outcome-${
      meta?.outcome?.key ||
      "normal"
    }`;


  if (
    command.id === "rest"
  ) {

    verdict.innerHTML = `
      <strong>
        💤 休養
      </strong>

      <span>
        しっかり体力を回復した
      </span>
    `;

  } else {

    verdict.innerHTML = `
      <span>
        ${meta.condition.icon}
        コンディション：
        ${meta.condition.label}
      </span>

      <strong>
        ${meta.outcome.icon}
        ${meta.outcome.label}
      </strong>
    `;
  }


  layer.appendChild(
    verdict
  );


  requestAnimationFrame(
    () =>
      verdict.classList.add(
        "show"
      )
  );


  await wait(520);


  const oldMember =
    before[memberId];

  const newMember =
    after[memberId];


  const changes = [];


  Object.keys(
    DATA.statLabels
  ).forEach(stat => {

    const diff =
      newMember.stats[stat] -
      oldMember.stats[stat];


    if (diff) {
      changes.push({
        stat,
        diff
      });
    }
  });


  for (
    const change of changes
  ) {

    const pop =
      document.createElement(
        "div"
      );


    pop.className =
      `statPop ${
        change.diff >= 0
          ? "positive"
          : "negative"
      }`;


    pop.innerHTML = `
      <strong>
        ${statLabel(
          change.stat
        )}
      </strong>

      <b>
        ${
          change.diff > 0
            ? "+"
            : ""
        }
        ${change.diff}
      </b>
    `;


    layer.appendChild(
      pop
    );


    requestAnimationFrame(
      () =>
        pop.classList.add(
          "show"
        )
    );


    await wait(270);
  }


  const expPop =
    document.createElement(
      "div"
    );


  expPop.className =
    "statPop positive";


  expPop.innerHTML = `
    <strong>EXP</strong>
    <b>+${meta.expGain}</b>
  `;


  layer.appendChild(
    expPop
  );


  requestAnimationFrame(
    () =>
      expPop.classList.add(
        "show"
      )
  );


  await wait(330);


  if (meta.reachGain) {

    const reachPop =
      document.createElement(
        "div"
      );


    reachPop.className =
      "statPop positive";


    reachPop.innerHTML = `
      <strong>
        認知度
      </strong>

      <b>
        +${meta.reachGain}
      </b>
    `;


    layer.appendChild(
      reachPop
    );


    requestAnimationFrame(
      () =>
        reachPop.classList.add(
          "show"
        )
    );


    await wait(300);
  }


  await wait(300);


  const resultButton =
    document.createElement(
      "button"
    );


  resultButton.className =
    "floatResultBtn";


  resultButton.textContent =
    "RESULTを見る";


  layer.appendChild(
    resultButton
  );


  await new Promise(
    resolve => {
      resultButton.onclick =
        resolve;
    }
  );


  layer.classList.add(
    "hide"
  );


  await wait(180);


  layer.remove();


  dialogueEl.classList.remove(
    "decisionFade"
  );
};


/* =========================================================
   TRAINING RESULT
========================================================= */

showTrainingResult =
function (
  memberId,
  command,
  before,
  after,
  meta
) {

  showScreen(
    screens.actionResult
  );


  const subtitle =
    command.id === "rest"

      ? `${getMemberName(memberId)}　💤 休養`

      : `${getMemberName(memberId)}
        　${meta.condition.icon}
        ${meta.condition.label}
        　${meta.outcome.icon}
        ${meta.outcome.label}`;


  renderResultScreen({

    kicker:
      "TRAINING RESULT",

    title:
      `${command.icon} ${command.title}`,

    subtitle,

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
};


/* =========================================================
   STATUS CONDITION
========================================================= */

const renderStatusV022 =
  renderStatus;


renderStatus = function () {

  renderStatusV022();


  DATA.memberOrder.forEach(
    (id, index) => {

      const card =
        statusModal
          ?.querySelectorAll(
            ".statusMember"
          )
          ?.[index];


      const head =
        card
          ?.querySelector(
            ".statusMemberHead > div"
          );


      if (!head)
        return;


      const condition =
        conditionOf(
          state.members[id]
            .stats.energy
        );


      const badge =
        document.createElement(
          "small"
        );


      badge.className =
        "conditionBadge";


      badge.textContent =
        `${condition.icon} ${condition.label}`;


      head.appendChild(
        badge
      );
    }
  );
};


/* =========================================================
   NEXT WEEK TP RESET
========================================================= */

const nextWeekV022 =
  nextWeek;


nextWeek = function () {

  state.trainingTP =
    DATA.weeklyTP || 100;

  nextWeekV022();
};


/* =========================================================
   PROLOGUE FIX
========================================================= */

let prologueTransitionToken = 0;


startPrologue =
async function () {

  showScreen(
    screens.prologue
  );


  void startBGM();


  createPrologueMembers();


  const text =
    $("prologueText");


  const next =
    $("prologueNext");


  const token =
    ++prologueTransitionToken;


  prologueBusy = false;


  async function showPage() {

    if (
      prologueBusy ||
      token !==
      prologueTransitionToken
    )
      return;


    if (
      prologueIndex >=
      STORY.prologue.length
    ) {

      state.prologueSeen =
        true;


      state.node =
        STORY.weeks[1].start;


      state.trainingTP =
        DATA.weeklyTP || 100;


      makeWeekSnapshot();


      saveState();


      renderStory();

      return;
    }


    prologueBusy = true;


    typingToken++;

    typing = false;

    skipTyping = false;


    if (next) {

      next.disabled = true;

      next.textContent =
        "…";
    }


    if (text) {
      text.classList.add(
        "prologueOut"
      );
    }


    await wait(260);


    if (
      token !==
      prologueTransitionToken
    )
      return;


    if (text) {

      text.innerHTML = "";

      text.classList.remove(
        "prologueOut",
        "prologueIn"
      );
    }


    await wait(150);


    if (text) {

      text.innerHTML =
        String(
          STORY.prologue[
            prologueIndex
          ]
        ).replace(
          /\n/g,
          "<br>"
        );


      void text.offsetWidth;


      text.classList.add(
        "prologueIn"
      );
    }


    await wait(420);


    prologueIndex++;


    prologueBusy = false;


    if (next) {

      next.disabled =
        false;


      next.textContent =
        prologueIndex >=
        STORY.prologue.length

          ? "START"

          : "NEXT";
    }
  }


  if (next) {
    next.onclick =
      showPage;
  }


  await showPage();
};


/* =========================================================
   iPHONE AUDIO GESTURE
========================================================= */

$("startBtn")
  ?.addEventListener(
    "click",
    () =>
      void startBGM(),
    {
      capture: true
    }
  );


$("continueBtn")
  ?.addEventListener(
    "click",
    () =>
      void startBGM(),
    {
      capture: true
    }
  );

/* =========================================================
   v0.24 UX UPDATE
   ・TP / 残り活動を見やすく
   ・活動ごとのRESULT画面を省略
   ・チラシ配り背景を修正
========================================================= */

state.version = "0.24";
saveState();


/* =========================================================
   チラシ配り背景 FIX
   bg-street.png が存在しないため
   現在存在する bg-outdoor.png を使用
========================================================= */

if (DATA.backgrounds) {
  DATA.backgrounds.city = "./bg-outdoor.png";
}


/* =========================================================
   WEEK RESOURCE PANEL
========================================================= */

function ensureWeeklyResourcePanel() {

  if (!trainingMembers) return;

  let panel =
    document.getElementById(
      "weeklyResourcePanel"
    );


  if (!panel) {

    panel =
      document.createElement(
        "section"
      );

    panel.id =
      "weeklyResourcePanel";

    panel.className =
      "weeklyResourcePanel";


    const parent =
      trainingMembers.parentElement;


    parent?.insertBefore(
      panel,
      trainingMembers
    );
  }


  const remaining =
    Math.max(
      0,
      DATA.weekActions -
      state.actionsUsed
    );


  const maxTP =
    DATA.weeklyTP || 100;


  const tp =
    Math.max(
      0,
      state.trainingTP
    );


  const tpPercent =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          tp / maxTP * 100
        )
      )
    );


  panel.innerHTML = `
    <div class="weeklyResourceTop">

      <div>

        <small>
          今週の残り活動
        </small>

        <strong>
          ${"●".repeat(remaining)}
          <span>
            ${"○".repeat(
              Math.max(
                0,
                DATA.weekActions -
                remaining
              )
            )}
          </span>
        </strong>

      </div>


      <div class="weeklyTpNumber">

        <small>
          育成TP
        </small>

        <strong>
          ⚡ ${tp}
          <em>
            /${maxTP}
          </em>
        </strong>

      </div>

    </div>


    <div class="weeklyTpBar">
      <i style="
        width:${tpPercent}%
      "></i>
    </div>


    <p>
      活動を選ぶと、
      回数とTPを消費します
    </p>
  `;
}


/* =========================================================
   TRAINING HEADER
========================================================= */

const renderTrainingHeaderV023 =
  renderTrainingHeader;


renderTrainingHeader =
function () {

  renderTrainingHeaderV023();


  /*
    上部にはWEEKだけ。
    残り活動とTPは
    中央パネルへ移動。
  */

  if (trainingWeek) {

    trainingWeek.innerHTML =
      `WEEK ${state.week}`;
  }


  ensureWeeklyResourcePanel();
};


/* =========================================================
   COMMAND TP DISPLAY
========================================================= */

const renderCommandsV023 =
  renderCommands;


renderCommands =
function () {

  renderCommandsV023();

  ensureWeeklyResourcePanel();


  if (!state.selectedMember)
    return;


  commandGrid
    ?.querySelectorAll(
      ".commandCard"
    )
    .forEach(
      (button, index) => {

        const command =
          DATA.trainingCommands[
            index
          ];


        if (!command)
          return;


        const tp =
          command.tp || 0;


        const afterTP =
          Math.max(
            0,
            state.trainingTP -
            tp
          );


        const tpLabel =
          button.querySelector(
            ".commandTp"
          );


        /*
          例：
          ⚡35 → 残りTP 65
        */

        if (tpLabel) {

          tpLabel.innerHTML = `
            ⚡ ${tp}

            <b>
              → 残りTP
              ${afterTP}
            </b>
          `;
        }


        /*
          TP不足時
        */

        if (
          tp >
          state.trainingTP
        ) {

          const note =
            document.createElement(
              "small"
            );


          note.className =
            "commandShortage";


          note.textContent =
            `TPがあと${
              tp -
              state.trainingTP
            }必要`;


          button
            .querySelector(
              ".commandText"
            )
            ?.appendChild(
              note
            );
        }
      }
    );
};


/* =========================================================
   TRAINING SCENE
   毎回の詳細RESULT画面を省略
========================================================= */

showTrainingScene =
async function (
  memberId,
  command,
  before,
  after,
  meta
) {

  showScreen(
    screens.game
  );


  const scene =
    trainingSceneData(
      memberId,
      command
    );


  if (seasonLabel) {

    seasonLabel.textContent =
      `SEASON ${state.season}`;
  }


  if (chapterEl) {

    chapterEl.textContent =
      `WEEK ${state.week}｜${command.title}`;
  }


  if (speakerEl) {

    speakerEl.textContent =
      getMemberName(
        memberId
      );
  }


  if (choicesEl) {

    choicesEl.innerHTML =
      "";
  }


  if (textEl) {

    textEl.innerHTML =
      "";
  }


  dialogueEl.dataset.mode =
    "normal";


  await setBackground(
    scene.bg
  );


  let expression =
    "normal";


  if (
    command.id === "dance" ||
    command.id === "vocal"
  ) {

    expression =
      "smile";
  }


  if (
    command.id === "rest" ||
    meta?.outcome?.key ===
      "fail"
  ) {

    expression =
      "troubled";
  }


  await setCharacter(
    memberId,
    expression
  );


  setReaction(
    scene.reaction
  );


  await wait(180);


  await typeText(
    textEl,
    scene.line,
    23
  );


  await wait(300);


  const button =
    document.createElement(
      "button"
    );


  button.className =
    "storyNextBtn";


  button.textContent =
    command.id === "rest"

      ? "休養結果 ›"

      : "結果を見る ›";


  choicesEl.appendChild(
    button
  );


  button.onclick =
  async () => {

    button.disabled =
      true;


    /*
      キャラ横の
      ＋○ / −○演出は残す
    */

    await playTrainingStatPops(
      memberId,
      command,
      before,
      after,
      meta
    );


    /*
      以前：
      ↓
      TRAINING RESULT
      ↓
      次の活動

      今回：
      ↓
      そのまま次の活動
    */

    continueAfterTraining();
  };
};


/* =========================================================
   TRAINING POP
========================================================= */

playTrainingStatPops =
async function (
  memberId,
  command,
  before,
  after,
  meta
) {

  dialogueEl.classList.add(
    "decisionFade"
  );


  await wait(140);


  document
    .getElementById(
      "statPopLayer"
    )
    ?.remove();


  const layer =
    document.createElement(
      "div"
    );


  layer.id =
    "statPopLayer";


  screens.game.appendChild(
    layer
  );


  /* ---------- TITLE ---------- */

  const title =
    document.createElement(
      "div"
    );


  title.className =
    "lessonPopTitle";


  title.innerHTML = `
    <small>
      ${getMemberName(
        memberId
      )}
    </small>

    ${command.icon}
    ${command.title.toUpperCase()}
  `;


  layer.appendChild(
    title
  );


  /* ---------- OUTCOME ---------- */

  const verdict =
    document.createElement(
      "div"
    );


  verdict.className =
    `trainingVerdict outcome-${
      meta?.outcome?.key ||
      "normal"
    }`;


  if (
    command.id === "rest"
  ) {

    verdict.innerHTML = `
      <strong>
        💤 休養
      </strong>

      <span>
        しっかり体力を回復した
      </span>
    `;

  } else {

    verdict.innerHTML = `
      <span>
        ${meta.condition.icon}
        コンディション：
        ${meta.condition.label}
      </span>

      <strong>
        ${meta.outcome.icon}
        ${meta.outcome.label}
      </strong>
    `;
  }


  layer.appendChild(
    verdict
  );


  requestAnimationFrame(
    () => {

      verdict.classList.add(
        "show"
      );
    }
  );


  await wait(430);


  /* ---------- STAT ---------- */

  const oldMember =
    before[memberId];


  const newMember =
    after[memberId];


  const changes = [];


  Object
    .keys(
      DATA.statLabels
    )
    .forEach(
      stat => {

        const diff =
          newMember.stats[stat] -
          oldMember.stats[stat];


        if (diff) {

          changes.push({
            stat,
            diff
          });
        }
      }
    );


  for (
    const change of changes
  ) {

    const pop =
      document.createElement(
        "div"
      );


    pop.className =
      `statPop ${
        change.diff >= 0

          ? "positive"

          : "negative"
      }`;


    pop.innerHTML = `
      <strong>
        ${statLabel(
          change.stat
        )}
      </strong>

      <b>
        ${
          change.diff > 0
            ? "+"
            : ""
        }
        ${change.diff}
      </b>
    `;


    layer.appendChild(
      pop
    );


    requestAnimationFrame(
      () => {

        pop.classList.add(
          "show"
        );
      }
    );


    await wait(230);
  }


  /* ---------- EXP ---------- */

  const expPop =
    document.createElement(
      "div"
    );


  expPop.className =
    "statPop positive";


  expPop.innerHTML = `
    <strong>
      EXP
    </strong>

    <b>
      +${meta.expGain}
    </b>
  `;


  layer.appendChild(
    expPop
  );


  requestAnimationFrame(
    () => {

      expPop.classList.add(
        "show"
      );
    }
  );


  await wait(260);


  /* ---------- REACH ---------- */

  if (
    meta.reachGain
  ) {

    const reachPop =
      document.createElement(
        "div"
      );


    reachPop.className =
      "statPop positive";


    reachPop.innerHTML = `
      <strong>
        認知度
      </strong>

      <b>
        +${meta.reachGain}
      </b>
    `;


    layer.appendChild(
      reachPop
    );


    requestAnimationFrame(
      () => {

        reachPop.classList.add(
          "show"
        );
      }
    );


    await wait(240);
  }


  /* ---------- NEXT ---------- */

  const nextButton =
    document.createElement(
      "button"
    );


  nextButton.className =
    "floatResultBtn";


  nextButton.textContent =
    state.actionsUsed >=
    DATA.weekActions

      ? "WEEK RESULTへ"

      : "次の活動へ";


  layer.appendChild(
    nextButton
  );


  await new Promise(
    resolve => {

      nextButton.onclick =
        resolve;
    }
  );


  layer.classList.add(
    "hide"
  );


  await wait(160);


  layer.remove();


  dialogueEl.classList.remove(
    "decisionFade"
  );
};

/* =========================================================
   v0.24.1 FIX
   ・プロローグを上から順番に表示
   ・MANAGER背景の黒画面修正
   ・チラシを街背景へ
   ・「結果を見る」を廃止
========================================================= */


/* =========================================================
   BACKGROUND FIX
========================================================= */

/*
  bg-manager.png が現在リポジトリに無いため
  暫定で backstage を使用
*/

if (DATA.backgrounds) {

  DATA.backgrounds.manager =
    "./bg-backstage.png";


  /*
    bg-street.png も存在しないため
    実在する街背景へ
  */

  DATA.backgrounds.city =
    "./bg-street-night.png";
}


/* =========================================================
   TRAINING SCENE
   「結果を見る」ボタンを完全廃止
========================================================= */

showTrainingScene =
async function (
  memberId,
  command,
  before,
  after,
  meta
) {

  showScreen(
    screens.game
  );


  const scene =
    trainingSceneData(
      memberId,
      command
    );


  if (seasonLabel) {

    seasonLabel.textContent =
      `SEASON ${state.season}`;
  }


  if (chapterEl) {

    chapterEl.textContent =
      `WEEK ${state.week}｜${command.title}`;
  }


  if (speakerEl) {

    speakerEl.textContent =
      getMemberName(
        memberId
      );
  }


  if (choicesEl) {

    choicesEl.innerHTML =
      "";
  }


  if (textEl) {

    textEl.innerHTML =
      "";
  }


  dialogueEl.dataset.mode =
    "normal";


  await setBackground(
    scene.bg
  );


  let expression =
    "normal";


  if (
    command.id === "dance" ||
    command.id === "vocal"
  ) {

    expression =
      "smile";
  }


  if (
    command.id === "rest" ||
    meta?.outcome?.key === "fail"
  ) {

    expression =
      "troubled";
  }


  await setCharacter(
    memberId,
    expression
  );


  setReaction(
    scene.reaction
  );


  await wait(180);


  /*
    メンバーのセリフ
  */

  await typeText(
    textEl,
    scene.line,
    23
  );


  /*
    「結果を見る」は出さない。

    少し間を置いて
    そのまま結果演出へ。
  */

  await wait(550);


  await playTrainingStatPops(
    memberId,
    command,
    before,
    after,
    meta
  );


  /*
    結果演出の
    「次の活動へ」を押したら
    次へ進む
  */

  continueAfterTraining();
};


/* =========================================================
   PROLOGUE
   上から1行ずつ表示
========================================================= */

let prologueLineToken = 0;


startPrologue =
async function () {

  showScreen(
    screens.prologue
  );


  void startBGM();


  createPrologueMembers();


  const text =
    $("prologueText");


  const next =
    $("prologueNext");


  const token =
    ++prologueLineToken;


  prologueBusy =
    false;


  async function showPage() {

    if (
      prologueBusy ||
      token !== prologueLineToken
    ) {

      return;
    }


    /*
      全ページ終了
    */

    if (
      prologueIndex >=
      STORY.prologue.length
    ) {

      state.prologueSeen =
        true;


      state.node =
        STORY.weeks[1].start;


      state.trainingTP =
        DATA.weeklyTP || 100;


      makeWeekSnapshot();


      saveState();


      renderStory();

      return;
    }


    prologueBusy =
      true;


    typingToken++;

    typing =
      false;

    skipTyping =
      false;


    if (next) {

      next.disabled =
        true;

      next.textContent =
        "…";
    }


    /*
      前ページを消す
    */

    if (text) {

      text.classList.add(
        "prologueOut"
      );
    }


    await wait(260);


    if (
      token !==
      prologueLineToken
    ) {

      return;
    }


    if (text) {

      text.innerHTML =
        "";

      text.classList.remove(
        "prologueOut",
        "prologueIn"
      );
    }


    await wait(120);


    /*
      今回のページ
    */

    const page =
      String(
        STORY.prologue[
          prologueIndex
        ]
      );


    /*
      改行単位で分割
    */

    const lines =
      page
        .split("\n")
        .map(
          line =>
            line.trim()
        );


    /*
      上から順番に表示
    */

    for (
      const line of lines
    ) {

      if (
        token !==
        prologueLineToken
      ) {

        return;
      }


      /*
        空行は余白
      */

      if (!line) {

        const spacer =
          document.createElement(
            "div"
          );


        spacer.className =
          "prologueSpacer";


        text.appendChild(
          spacer
        );


        await wait(120);


        continue;
      }


      const row =
        document.createElement(
          "div"
        );


      row.className =
        "prologueLine";


      row.textContent =
        line;


      text.appendChild(
        row
      );


      /*
        CSSアニメーション開始
      */

      requestAnimationFrame(
        () => {

          row.classList.add(
            "show"
          );
        }
      );


      /*
        1行ごとの間隔
      */

      await wait(430);
    }


    prologueIndex++;


    prologueBusy =
      false;


    if (next) {

      next.disabled =
        false;


      next.textContent =
        prologueIndex >=
        STORY.prologue.length

          ? "START"

          : "NEXT";
    }
  }


  if (next) {

    next.onclick =
      showPage;
  }


  await showPage();
};

/* =========================================================
   v0.24.2
   MANAGER DECISION RESULT を簡略化
========================================================= */

playStatPopSequence =
async function (
  result,
  title
) {

  if (!screens.game)
    return;


  dialogueEl
    ?.classList.add(
      "decisionFade"
    );


  await wait(180);


  document
    .getElementById(
      "statPopLayer"
    )
    ?.remove();


  const layer =
    document.createElement(
      "div"
    );


  layer.id =
    "statPopLayer";


  const label =
    document.createElement(
      "div"
    );


  label.className =
    "lessonPopTitle";


  label.textContent =
    title;


  layer.appendChild(
    label
  );


  screens.game.appendChild(
    layer
  );


  const memberChanges =
    collectChanges(
      result.before,
      result.after
    );


  const messages =
    [];


  memberChanges.forEach(
    item => {

      item.changes.forEach(
        change => {

          messages.push({
            id: item.id,
            stat: change.stat,
            diff: change.diff
          });
        }
      );
    }
  );


  messages.sort(
    (a,b) =>
      Math.abs(b.diff) -
      Math.abs(a.diff)
  );


  /*
    重要な変化を
    最大6個だけ表示
  */

  for (
    const item of
    messages.slice(0,6)
  ) {

    const pop =
      document.createElement(
        "div"
      );


    pop.className =
      `statPop ${
        item.diff >= 0
          ? "positive"
          : "negative"
      }`;


    pop.innerHTML = `
      <small>
        ${getMemberName(
          item.id
        )}
      </small>

      <strong>
        ${statLabel(
          item.stat
        )}
      </strong>

      <b>
        ${
          item.diff > 0
            ? "+"
            : ""
        }
        ${item.diff}
      </b>
    `;


    layer.appendChild(
      pop
    );


    requestAnimationFrame(
      () => {

        pop.classList.add(
          "show"
        );
      }
    );


    await wait(220);
  }


  await wait(300);


  /*
    RESULTを見る
    ↓
    NEXT
  */

  const btn =
    document.createElement(
      "button"
    );


  btn.className =
    "floatResultBtn";


  btn.textContent =
    "NEXT";


  layer.appendChild(
    btn
  );


  await new Promise(
    resolve => {

      btn.onclick =
        resolve;
    }
  );


  layer.classList.add(
    "hide"
  );


  await wait(160);


  layer.remove();


  dialogueEl
    ?.classList.remove(
      "decisionFade"
    );
};


/* =========================================================
   DECISION RESULT 自体も飛ばす
========================================================= */

showDecisionResult =
function (
  result
) {

  state.node =
    state.pendingStoryNext;


  state.pendingStoryNext =
    null;


  saveState();


  renderStory();
};
