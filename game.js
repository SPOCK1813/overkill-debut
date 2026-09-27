const DATA = window.GAME_DATA;
const STORY_DATA = window.GAME_STORY;

const MEMBERS = DATA.members;
const MEMBER_IDS = DATA.memberOrder;
const IMAGES = DATA.images;
const STORY = STORY_DATA.nodes;

const STORAGE_KEY = "overkill_manager_v10";

const $ = id =>
  document.getElementById(id);


const screens = {
  loading: $("loading"),
  title: $("title"),
  prologue: $("prologue"),
  game: $("game"),
  training: $("training")
};


function createMemberState(id){

  const base = MEMBERS[id].initial;

  return {
    vocal: base.vocal,
    dance: base.dance,
    mc: base.mc,
    bond: base.bond,
    energy: base.energy,

    level: 1,
    exp: 0,
    points: 0,

    skills: [],

    equipment: {
      costume: null,
      accessory: null,
      shoes: null
    }
  };
}


function createState(){

  const members = {};

  MEMBER_IDS.forEach(id => {
    members[id] =
      createMemberState(id);
  });

  return {

    started: false,
    prologueSeen: false,
    tutorialSeen: false,

    season: 1,
    week: 1,
    action: 0,

    node: "m1",

    reach: 10,
    fans: 0,
    cash: 220000,

    ovkPoints: 0,

    members,

    collection: {},
    achievements: [],
    clearHistory: [],

    weekSnapshot: null
  };
}


function loadState(){

  try{

    const saved =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        )
      );

    if(saved){
      return saved;
    }

  }catch(error){}

  return createState();
}


let state = loadState();


function saveState(){

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}


function resetGame(){

  const permanentPoints =
    state.ovkPoints || 0;

  const collection =
    state.collection || {};

  const history =
    state.clearHistory || [];

  state = createState();

  state.ovkPoints =
    permanentPoints;

  state.collection =
    collection;

  state.clearHistory =
    history;

  state.started = true;

  makeWeekSnapshot();

  saveState();
}


function clamp(value,min=0,max=100){

  return Math.max(
    min,
    Math.min(max,value)
  );
}


function showScreen(name){

  Object.values(screens)
    .forEach(screen =>
      screen.classList.remove(
        "active"
      )
    );

  screens[name]
    .classList.add("active");
}


function rankOf(value){

  const found =
    DATA.ranks.find(
      item =>
        value >= item.min
    );

  return found
    ? found.rank
    : "E";
}


function metricName(key){

  return {
    vocal: "歌唱",
    dance: "ダンス",
    mc: "MC",
    bond: "連携",
    energy: "体力"
  }[key] || key;
}


function expNeeded(level){

  return (
    DATA.expTable.base +
    ((level - 1) *
      DATA.expTable.growth)
  );
}


function addExp(id,amount){

  const member =
    state.members[id];

  const levelUps = [];

  member.exp += amount;

  while(
    member.exp >=
    expNeeded(member.level)
  ){

    member.exp -=
      expNeeded(member.level);

    member.level++;

    member.points +=
      DATA.expTable.pointPerLevel;

    levelUps.push(
      member.level
    );
  }

  return levelUps;
}


function changeStat(
  id,
  metric,
  amount
){

  const member =
    state.members[id];

  const before =
    member[metric];

  member[metric] =
    clamp(
      before + amount
    );

  return {
    id,
    metric,
    before,
    after: member[metric],
    delta:
      member[metric] - before
  };
}


function makeWeekSnapshot(){

  state.weekSnapshot = {
    reach: state.reach,
    cash: state.cash,
    members:
      JSON.parse(
        JSON.stringify(
          state.members
        )
      )
  };
}


/* =========================
   LOADING
========================= */

const loadSet = [

  [
    "./sarina_smile.png",
    "4人の予定を確認中…"
  ],

  [
    "./miyu_smile.png",
    "SNSのネタを整理中…"
  ],

  [
    "./kilua_smile.png",
    "レッスン場を準備中…"
  ],

  [
    "./raisa_smile.png",
    "ステージを確認中…"
  ]

];


function startLoading(){

  let progress = 0;

  const timer =
    setInterval(() => {

      progress += 5;

      if(progress > 100){
        progress = 100;
      }

      const index =
        Math.min(
          3,
          Math.floor(
            progress / 26
          )
        );

      $("loadChar").src =
        loadSet[index][0];

      $("loadMsg").textContent =
        loadSet[index][1];

      $("loadBar").style.width =
        progress + "%";

      $("loadPct").textContent =
        progress + "%";

      if(progress >= 100){

        clearInterval(timer);

        setTimeout(() => {
          showScreen("title");
        },250);
      }

    },60);
}


/* =========================
   TITLE
========================= */

$("startBtn").onclick = () => {

  resetGame();

  startPrologue();
};


$("contBtn").onclick = () => {

  if(!state.started){

    resetGame();

    startPrologue();

    return;
  }

  if(!state.prologueSeen){

    startPrologue();

    return;
  }

  if(
    state.node ===
    "openTraining"
  ){

    openTraining();

  }else{

    showScreen("game");

    renderStory();
  }
};


/* =========================
   PROLOGUE
========================= */

let proIndex = 0;
let proTyping = false;
let proFull = "";
let proTimer = null;


function startPrologue(){

  showScreen("prologue");

  proIndex = 0;

  typePrologue(
    STORY_DATA.prologue[0]
  );
}


function typePrologue(line){

  clearInterval(proTimer);

  proFull = line;

  $("proText").textContent = "";

  proTyping = true;

  let index = 0;

  proTimer =
    setInterval(() => {

      index++;

      $("proText").textContent =
        line.slice(0,index);

      if(index >= line.length){

        clearInterval(proTimer);

        proTyping = false;
      }

    },35);
}


screens.prologue.onclick = () => {

  if(proTyping){

    clearInterval(proTimer);

    $("proText").textContent =
      proFull;

    proTyping = false;

    return;
  }

  proIndex++;

  if(
    proIndex >=
    STORY_DATA.prologue.length
  ){

    state.prologueSeen = true;

    makeWeekSnapshot();

    saveState();

    showScreen("game");

    renderStory();

    return;
  }

  typePrologue(
    STORY_DATA.prologue[
      proIndex
    ]
  );
};


/* =========================
   BACKGROUND
========================= */

function setBackground(key){

  const src =
    DATA.backgrounds[key] ||
    DATA.backgrounds.manager;

  $("env").style.backgroundImage =
    `url("${src}")`;
}


/* =========================
   CHARACTER
========================= */

function setCharacter(
  memberId,
  expression
){

  const char = $("char");
  const mark = $("managerMark");

  if(!memberId){

    char.classList.remove(
      "show"
    );

    char.style.display =
      "none";

    mark.style.display =
      "flex";

    return;
  }

  const image =
    IMAGES[memberId][
      expression || "normal"
    ] ||
    IMAGES[memberId].normal;

  mark.style.display =
    "none";

  char.src = image;

  char.style.display =
    "block";

  requestAnimationFrame(() => {

    char.classList.add(
      "show"
    );

  });
}


function setReaction(symbol){

  const el =
    $("reaction");

  el.textContent =
    symbol || "";

  el.classList.toggle(
    "show",
    Boolean(symbol)
  );
}


/* =========================
   STORY
========================= */

let typing = false;
let fullText = "";
let typeTimer = null;


function typeText(line){

  clearInterval(typeTimer);

  const text =
    $("text");

  fullText =
    line || "";

  text.textContent = "";

  typing = true;

  $("nextMark").style.display =
    "none";

  let i = 0;

  typeTimer =
    setInterval(() => {

      i++;

      text.textContent =
        fullText.slice(0,i);

      if(i >= fullText.length){

        clearInterval(typeTimer);

        typing = false;

        $("nextMark")
          .style.display =
          "block";
      }

    },20);
}


function renderStory(){

  const node =
    STORY[state.node];

  if(!node){
    return;
  }

  if(node.type === "training"){

    openTraining();

    return;
  }

  $("seasonLabel").textContent =
    `SEASON ${state.season}`;

  $("chapter").textContent =
    node.chapter ||
    `WEEK ${state.week}`;

  $("speaker").textContent =
    node.speaker ||
    "MANAGER";

  setBackground(node.bg);

  setCharacter(
    node.member,
    node.expression
  );

  setReaction(
    node.reaction
  );

  $("dialogue").dataset.mode =
    node.choices
      ? "choice"
      : "story";

  if(node.choices){

    renderStoryChoices(node);

  }else{

    typeText(
      node.text || ""
    );
  }
}


function renderStoryChoices(node){

  typing = false;

  $("nextMark").style.display =
    "none";

  const lead =
    String(node.text)
      .split("\n")
      .join("<br>");

  const buttons =
    node.choices
      .map(
        (choice,index) => `
          <button
            class="choiceBtn"
            data-choice="${index}"
          >
            ${choice.text}
          </button>
        `
      )
      .join("");

  $("text").innerHTML = `
    <div class="choiceLead">
      ${lead}
    </div>

    <div class="choiceGrid">
      ${buttons}
    </div>
  `;
}


$("dialogue").onclick =
event => {

  const node =
    STORY[state.node];

  if(!node){
    return;
  }

  if(
    $("dialogue")
      .dataset.mode ===
      "choice"
  ){

    const button =
      event.target.closest(
        "[data-choice]"
      );

    if(!button){
      return;
    }

    const choice =
      node.choices[
        Number(
          button.dataset.choice
        )
      ];

    applyStoryResult(
      choice.result
    );

    state.node =
      choice.next;

    saveState();

    renderStory();

    return;
  }

  if(typing){

    clearInterval(typeTimer);

    $("text").textContent =
      fullText;

    typing = false;

    $("nextMark").style.display =
      "block";

    return;
  }

  if(node.next){

    state.node =
      node.next;

    saveState();

    renderStory();
  }
};


/* =========================
   WEEK1 STORY RESULT
========================= */

function applyStoryResult(type){

  if(type === "teach"){

    changeStat(
      "kilua",
      "bond",
      6
    );

    MEMBER_IDS.forEach(id => {

      changeStat(
        id,
        "dance",
        id === "kilua"
          ? 3
          : 5
      );

      changeStat(
        id,
        "energy",
        -7
      );

      addExp(id,30);
    });
  }


  if(type === "split"){

    MEMBER_IDS.forEach(id => {

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

      addExp(id,30);
    });
  }


  if(type === "push"){

    MEMBER_IDS.forEach(id => {

      changeStat(
        id,
        "dance",
        5
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

      addExp(id,35);
    });
  }


  if(type === "break"){

    MEMBER_IDS.forEach(id => {

      changeStat(
        id,
        "dance",
        2
      );

      changeStat(
        id,
        "bond",
        4
      );

      changeStat(
        id,
        "energy",
        -3
      );

      addExp(id,25);
    });
  }

  saveState();
}


/* =========================
   TRAINING
========================= */

function openTraining(){

  state.node =
    "openTraining";

  saveState();

  showScreen("training");

  $("trainingSeason")
    .textContent =
    `SEASON ${state.season}`;

  $("trainingWeek")
    .textContent =
    `WEEK ${state.week}`;

  renderTrainingMembers();

  renderCommands();
}


function renderTrainingMembers(){

  $("trainingMembers")
    .innerHTML =
    MEMBER_IDS.map(id => {

      const data =
        MEMBERS[id];

      const member =
        state.members[id];

      const needed =
        expNeeded(
          member.level
        );

      const pct =
        Math.round(
          member.exp /
          needed *
          100
        );

      return `
        <div class="miniMember">

          <img
            src="${IMAGES[id].smile}"
            alt=""
          >

          <div>

            <strong
              style="color:${data.color}"
            >
              ${data.name}
            </strong>

            <small>
              Lv.${member.level}
            </small>

            <div class="expTrack">

              <span
                style="width:${pct}%"
              ></span>

            </div>

          </div>

        </div>
      `;

    }).join("");
}


function renderCommands(){

  $("commandGrid")
    .innerHTML =
    DATA.commands.map(
      command => `

        <button
          class="commandCard"
          data-command="${command.id}"
        >

          <span class="commandIcon">
            ${command.icon}
          </span>

          <strong>
            ${command.name}
          </strong>

          <small>
            ${command.desc}
          </small>

        </button>

      `
    ).join("");
}


$("commandGrid").onclick =
event => {

  const button =
    event.target.closest(
      "[data-command]"
    );

  if(!button){
    return;
  }

  runCommand(
    button.dataset.command
  );
};


function runCommand(id){

  const command =
    DATA.commands.find(
      item =>
        item.id === id
    );

  if(!command){
    return;
  }

  const changes = [];

  state.cash +=
    command.cash;

  MEMBER_IDS.forEach(
    memberId => {

      if(id === "dance"){

        changes.push(
          changeStat(
            memberId,
            "dance",
            memberId === "kilua"
              ? 5
              : 3
          )
        );

        changes.push(
          changeStat(
            memberId,
            "energy",
            -7
          )
        );
      }


      if(id === "vocal"){

        changes.push(
          changeStat(
            memberId,
            "vocal",
            (
              memberId === "sarina" ||
              memberId === "miyu"
            )
              ? 5
              : 3
          )
        );

        changes.push(
          changeStat(
            memberId,
            "energy",
            -6
          )
        );
      }


      if(id === "mc"){

        changes.push(
          changeStat(
            memberId,
            "mc",
            4
          )
        );

        changes.push(
          changeStat(
            memberId,
            "bond",
            2
          )
        );
      }


      if(id === "sns"){

        changes.push(
          changeStat(
            memberId,
            "mc",
            2
          )
        );

        changes.push(
          changeStat(
            memberId,
            "energy",
            -3
          )
        );
      }


      if(id === "flyer"){

        changes.push(
          changeStat(
            memberId,
            "energy",
            -6
          )
        );
      }


      if(id === "rest"){

        changes.push(
          changeStat(
            memberId,
            "energy",
            12
          )
        );
      }


      addExp(
        memberId,
        command.exp
      );

    }
  );


  if(id === "sns"){
    state.reach =
      clamp(
        state.reach + 7
      );
  }

  if(id === "flyer"){
    state.reach =
      clamp(
        state.reach + 11
      );
  }


  state.action++;

  saveState();

  showActionResult(
    command,
    changes
  );
}


/* =========================
   ACTION RESULT
========================= */

function showActionResult(
  command,
  changes
){

  const useful =
    changes.filter(
      change =>
        change.delta !== 0
    );


  $("resultBox").innerHTML = `

    <div class="resultIcon">
      ${command.icon}
    </div>

    <div class="resultMini">
      ACTIVITY RESULT
    </div>

    <div class="resultTitle">
      ${command.name}
    </div>

    <div class="resultRows">

      ${useful.slice(0,8)
        .map(change => `

          <div class="resultRow">

            <span>
              ${MEMBERS[change.id].name}
              ${metricName(change.metric)}
            </span>

            <strong>
              ${change.before}
              →
              ${change.after}
            </strong>

            <b class="${
              change.delta < 0
                ? "minus"
                : "plus"
            }">
              ${
                change.delta > 0
                  ? "+"
                  : ""
              }${change.delta}
            </b>

          </div>

        `).join("")}

    </div>

    <div class="resultTap">
      タップして続ける
    </div>
  `;


  $("result")
    .classList.add("show");


  $("result").onclick = () => {

    $("result")
      .classList.remove(
        "show"
      );

    if(state.action >= 3){

      finishWeek();

    }else{

      openTraining();
    }
  };
}


/* =========================
   WEEK RESULT
========================= */

function statDelta(
  id,
  metric
){

  if(!state.weekSnapshot){
    return 0;
  }

  return (
    state.members[id][metric] -
    state.weekSnapshot.members[id][metric]
  );
}


function renderWeekCard(id){

  const member =
    state.members[id];

  const data =
    MEMBERS[id];

  const stats = [
    "vocal",
    "dance",
    "mc",
    "bond",
    "energy"
  ];


  return `

    <div class="weekMemberCard">

      <div class="weekMemberTop">

        <img
          src="${IMAGES[id].smile}"
          alt=""
        >

        <div>

          <strong
            style="color:${data.color}"
          >
            ${data.name}
          </strong>

          <small>
            Lv.${member.level}
          </small>

        </div>

      </div>


      <div class="weekStatList">

        ${stats.map(metric => {

          const value =
            member[metric];

          const delta =
            statDelta(
              id,
              metric
            );

          return `

            <div class="weekStat">

              <span>
                ${metricName(metric)}
              </span>

              <b class="rank rank${rankOf(value)}">
                ${rankOf(value)}
              </b>

              <strong>
                ${value}
              </strong>

              <em class="${
                delta < 0
                  ? "down"
                  : delta > 0
                    ? "up"
                    : ""
              }">
                ${
                  delta === 0
                    ? ""
                    : delta > 0
                      ? `+${delta}`
                      : delta
                }
              </em>

            </div>

          `;

        }).join("")}

      </div>

    </div>
  `;
}


function finishWeek(){

  const completedWeek =
    state.week;

  $("weekEndInner")
    .innerHTML = `

      <div class="weekCompleteTag">
        WEEK ${completedWeek} COMPLETE
      </div>

      <h1>
        4人の成長
      </h1>

      <div class="weekGroupInfo">

        <div>
          <small>認知度</small>
          <strong>
            ${state.reach}
          </strong>
        </div>

        <div>
          <small>活動資金</small>
          <strong>
            ¥${state.cash.toLocaleString("ja-JP")}
          </strong>
        </div>

      </div>


      <div class="weekCardGrid">

        ${MEMBER_IDS
          .map(renderWeekCard)
          .join("")}

      </div>


      <div class="weekNextInfo">

        ${
          state.season === 1
            ? `デビューまであと${Math.max(
                0,
                28 -
                completedWeek * 7
              )}日`
            : DATA.seasons.titles[
                state.season
              ]
        }

      </div>


      <button
        id="nextWeekBtn"
        class="nextWeekBtn"
      >
        WEEK ${completedWeek + 1}へ進む
      </button>

      <button
        id="weekStatusBtn"
        class="subBtn"
      >
        STATUSを見る
      </button>

      <button
        id="weekTitleBtn"
        class="subBtn"
      >
        タイトルへ戻る
      </button>

    `;


  $("weekEnd")
    .classList.add("show");


  $("nextWeekBtn").onclick =
    nextWeek;


  $("weekStatusBtn").onclick =
    openStatus;


  $("weekTitleBtn").onclick =
    () => {

      $("weekEnd")
        .classList.remove(
          "show"
        );

      showScreen("title");
    };
}


function nextWeek(){

  $("weekEnd")
    .classList.remove(
      "show"
    );


  state.week++;

  state.action = 0;


  if(
    state.week >
    DATA.seasons.weeksPerSeason
  ){

    state.week = 1;
    state.season++;
  }


  if(
    state.season >
    DATA.seasons.total
  ){

    state.season =
      DATA.seasons.total;

    state.week =
      DATA.seasons.weeksPerSeason;
  }


  makeWeekSnapshot();

  saveState();

  openTraining();
}


/* =========================
   STATUS
========================= */

function openStatus(){

  const cards =
    MEMBER_IDS.map(id => {

      const member =
        state.members[id];

      const data =
        MEMBERS[id];

      const needed =
        expNeeded(
          member.level
        );

      return `

        <div class="statusCard">

          <div class="statusCharacter">

            <img
              src="${IMAGES[id].smile}"
              alt=""
            >

          </div>


          <div class="statusData">

            <div class="statusName">

              <strong
                style="color:${data.color}"
              >
                ${data.name}
              </strong>

              <span>
                Lv.${member.level}
              </span>

            </div>


            <div class="statusExp">

              EXP
              ${member.exp}
              /
              ${needed}

            </div>


            <div class="statusStats">

              ${[
                "vocal",
                "dance",
                "mc",
                "bond",
                "energy"
              ].map(metric => `

                <div>

                  <span>
                    ${metricName(metric)}
                  </span>

                  <b class="rank rank${rankOf(member[metric])}">
                    ${rankOf(member[metric])}
                  </b>

                  <strong>
                    ${member[metric]}
                  </strong>

                  ${
                    metric !== "energy" &&
                    member.points > 0
                      ? `
                        <button
                          data-point="${id}"
                          data-metric="${metric}"
                        >
                          ＋
                        </button>
                      `
                      : ""
                  }

                </div>

              `).join("")}

            </div>


            <div class="statusPoints">

              育成PT
              <strong>
                ${member.points}
              </strong>

            </div>

          </div>

        </div>
      `;

    }).join("");


  $("modalBox").innerHTML = `

    <div class="modalTitle">
      O-VER-KiLL STATUS
    </div>

    <div class="groupStatus">

      <span>
        SEASON ${state.season}
        / WEEK ${state.week}
      </span>

      <span>
        認知 ${state.reach}
      </span>

      <span>
        ¥${state.cash.toLocaleString("ja-JP")}
      </span>

    </div>


    <div class="statusCards">
      ${cards}
    </div>


    <button
      class="modalClose"
      data-close
    >
      閉じる
    </button>
  `;


  $("modal")
    .classList.add("show");
}


$("statusBtn").onclick =
  openStatus;

$("trainingStatusBtn").onclick =
  openStatus;


$("modal").onclick =
event => {

  const pointButton =
    event.target.closest(
      "[data-point]"
    );


  if(pointButton){

    const id =
      pointButton.dataset.point;

    const metric =
      pointButton.dataset.metric;

    const member =
      state.members[id];


    if(
      member.points > 0 &&
      member[metric] < 100
    ){

      member.points--;

      member[metric] =
        clamp(
          member[metric] + 1
        );

      saveState();

      openStatus();
    }

    return;
  }


  if(
    event.target.id === "modal" ||
    event.target.closest(
      "[data-close]"
    )
  ){

    $("modal")
      .classList.remove(
        "show"
      );
  }
};


/* =========================
   START
========================= */

startLoading();
