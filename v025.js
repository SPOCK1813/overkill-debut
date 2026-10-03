/* =========================================================
   O-VER-KiLL | MANAGER'S STORY
   v0.25 FOUNDATION

   ・HOMEをゲームの中心へ
   ・E1～SS100 長期ランク
   ・MEMBER RANK
   ・ランクアップSP
   ・SP自由配分
========================================================= */


/* =========================================================
   VERSION
========================================================= */

state.version = "0.25";


/* =========================================================
   LONG RANK SYSTEM

   E  1 - 100
   D  1 - 100
   C  1 - 100
   B  1 - 100
   A  1 - 100
   S  1 - 100
   SS 1 - 100
========================================================= */

const LONG_RANKS = [
  "E",
  "D",
  "C",
  "B",
  "A",
  "S",
  "SS"
];


/*
  MEMBER RANK昇格時のSP

  E → D   +3
  D → C   +4
  C → B   +5
  B → A   +6
  A → S   +8
  S → SS +10
*/

const MEMBER_RANK_SP = [
  0,
  3,
  4,
  5,
  6,
  8,
  10
];


/* =========================================================
   RANK HELPERS
========================================================= */

function longRankParts(value) {

  const safeValue =
    Math.max(
      1,
      Math.min(
        700,
        Math.round(
          Number(value) || 1
        )
      )
    );


  const tier =
    Math.min(
      6,
      Math.floor(
        (safeValue - 1) / 100
      )
    );


  const point =
    safeValue -
    tier * 100;


  return {
    tier,
    rank:
      LONG_RANKS[tier],
    point,
    value:
      safeValue
  };
}


function formatLongRank(value) {

  const data =
    longRankParts(value);


  return (
    `${data.rank}${data.point}`
  );
}


/*
  game.jsで使われている
  rankOf / rankIndexも
  新ランクに対応させる
*/

rankOf =
function (value) {

  return longRankParts(
    value
  ).rank;
};


rankIndex =
function (rank) {

  return LONG_RANKS.indexOf(
    rank
  );
};


/* =========================================================
   MEMBER RANK
========================================================= */

function memberCoreAverage(id) {

  const member =
    state.members[id];


  if (!member)
    return 1;


  const stats = [
    member.stats.vocal,
    member.stats.dance,
    member.stats.mc,
    member.stats.bond
  ];


  return Math.round(
    stats.reduce(
      (a,b) => a + b,
      0
    ) /
    stats.length
  );
}


function memberRankData(id) {

  return longRankParts(
    memberCoreAverage(id)
  );
}


/* =========================================================
   v0.25 SAVE MIGRATION
========================================================= */

if (!state.v025Migrated) {

  DATA.memberOrder.forEach(
    id => {

      const member =
        state.members[id];


      if (!member)
        return;


      /*
        以前のLvアップSPとは
        別システムになるため
        v0.25で一度初期化。
      */

      member.sp = 0;


      /*
        MEMBER RANKで
        既に受け取った段階
      */

      member.rankBonusClaimed =
        memberRankData(id).tier;


      member.rankHistory =
        [
          memberRankData(id).rank
        ];
    }
  );


  state.v025Migrated =
    true;
}


saveState();


/* =========================================================
   MEMBER RANK UP BONUS
========================================================= */

function checkMemberRankUp(id) {

  const member =
    state.members[id];


  if (!member)
    return;


  const currentTier =
    memberRankData(id).tier;


  const claimed =
    member.rankBonusClaimed ?? 0;


  if (
    currentTier <= claimed
  ) {

    return;
  }


  let gainedSP = 0;


  for (
    let tier =
      claimed + 1;

    tier <= currentTier;

    tier++
  ) {

    gainedSP +=
      MEMBER_RANK_SP[tier] || 0;
  }


  member.sp =
    (member.sp || 0) +
    gainedSP;


  member.rankBonusClaimed =
    currentTier;


  member.rankHistory =
    member.rankHistory || [];


  member.rankHistory.push(
    LONG_RANKS[currentTier]
  );


  /*
    HOMEで通知する
  */

  state.rankNotices =
    state.rankNotices || [];


  state.rankNotices.push({
    id,
    rank:
      LONG_RANKS[
        currentTier
      ],
    sp:
      gainedSP
  });


  saveState();
}


/* =========================================================
   STAT CHANGE
   体力だけ0～100
   能力値は1～700
========================================================= */

changeStat =
function (
  id,
  stat,
  amount
) {

  const member =
    state.members[id];


  if (!member)
    return;


  if (
    stat === "energy"
  ) {

    member.stats.energy =
      Math.max(
        0,
        Math.min(
          100,
          member.stats.energy +
          amount
        )
      );


    return;
  }


  member.stats[stat] =
    Math.max(
      1,
      Math.min(
        700,
        member.stats[stat] +
        amount
      )
    );


  /*
    通常成長だけが
    MEMBER RANK UP判定対象
  */

  checkMemberRankUp(
    id
  );
};


/* =========================================================
   LEVEL EXP

   v0.25以降
   LvアップではSPを配らない。

   SPはMEMBER RANK UPのみ。
========================================================= */

addExp =
function (
  id,
  amount
) {

  const member =
    state.members[id];


  if (!member)
    return;


  member.exp +=
    amount;


  while (
    member.exp >=
    expNeeded(
      member.level
    )
  ) {

    member.exp -=
      expNeeded(
        member.level
      );


    member.level++;
  }
};


/* =========================================================
   SP ALLOCATION

   SPによる能力UPでは
   SPボーナスを再発生させない。
========================================================= */

function allocateMemberSP(
  id,
  stat
) {

  const member =
    state.members[id];


  if (!member)
    return;


  if (
    ![
      "vocal",
      "dance",
      "mc",
      "bond"
    ].includes(stat)
  ) {

    return;
  }


  if (
    (member.sp || 0) <= 0
  ) {

    return;
  }


  if (
    member.stats[stat] >= 700
  ) {

    return;
  }


  member.sp--;


  member.stats[stat] =
    Math.min(
      700,
      member.stats[stat] + 1
    );


  saveState();


  renderMemberStatus();
  renderHome();
}


/* =========================================================
   HOME SCREEN
========================================================= */

function ensureHomeScreen() {

  let home =
    document.getElementById(
      "home"
    );


  if (home) {

    screens.home =
      home;

    return home;
  }


  home =
    document.createElement(
      "section"
    );


  home.id =
    "home";


  home.className =
    "screen";


  document.body.appendChild(
    home
  );


  screens.home =
    home;


  return home;
}


/* =========================================================
   HOME LABELS
========================================================= */

function currentGroupName() {

  /*
    Season1 WEEK7で
    O-VER-KiLL正式解禁予定
  */

  if (
    state.season === 1 &&
    state.week <= 6
  ) {

    return "NAMELESS";
  }


  return "O-VER-KiLL";
}


function homeStoryTitle() {

  const week =
    STORY.weeks[
      state.week
    ];


  return (
    week?.title ||
    `WEEK ${state.week}`
  );
}


/* =========================================================
   HOME RENDER
========================================================= */

function renderHome() {

  const home =
    ensureHomeScreen();


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
      state.trainingTP ??
      maxTP
    );


  home.innerHTML = `
    <div class="homeShade"></div>

    <header class="homeHeader">

      <div>

        <small>
          SEASON ${state.season}
        </small>

        <strong>
          WEEK ${state.week}
        </strong>

      </div>

      <button
        id="homeStatusBtn"
        class="homeStatusBtn"
      >
        MEMBER
      </button>

    </header>


    <main class="homeBody">

      <section class="homeHero">

        <small class="homeGroupLabel">
          CURRENT TEAM
        </small>

        <h1>
          ${currentGroupName()}
        </h1>

        <p>
          ${homeStoryTitle()}
        </p>

      </section>


      <section
        class="homeResourcePanel"
      >

        <div>

          <span>
            残り活動
          </span>

          <strong>
            ${"●".repeat(
              remaining
            )}
            <em>
              ${"○".repeat(
                Math.max(
                  0,
                  DATA.weekActions -
                  remaining
                )
              )}
            </em>
          </strong>

        </div>


        <div>

          <span>
            育成TP
          </span>

          <strong>
            ⚡${tp}
            <small>
              /${maxTP}
            </small>
          </strong>

        </div>


        <div>

          <span>
            ファン
          </span>

          <strong>
            ${state.fans}
          </strong>

        </div>


        <div>

          <span>
            認知度
          </span>

          <strong>
            ${state.reach}
          </strong>

        </div>

      </section>


      <section
        id="homeMembers"
        class="homeMembers"
      >

        ${DATA.memberOrder.map(
          id => {

            const base =
              DATA.members[id];


            const member =
              state.members[id];


            const rank =
              memberRankData(id);


            const condition =
              typeof conditionOf ===
              "function"

                ? conditionOf(
                    member.stats.energy
                  )

                : {
                    icon: "●",
                    label: ""
                  };


            return `
              <button
                class="homeMember"
                data-member="${id}"
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

                <div>

                  <strong>
                    ${base.name}
                  </strong>

                  <span>
                    MEMBER
                    ${rank.rank}${rank.point}
                  </span>

                  <small>
                    ${condition.icon}
                    ${condition.label}

                    ${
                      member.sp > 0
                        ? `　SP ${member.sp}`
                        : ""
                    }
                  </small>

                </div>

              </button>
            `;
          }
        ).join("")}

      </section>


      <section class="homeMainMenu">

        <button
          id="homeStory"
          class="homeMenu primary"
        >
          <span>
            STORY
          </span>

          <strong>
            今週の物語
          </strong>

          <small>
            ${homeStoryTitle()}
          </small>
        </button>


        <button
          id="homeTraining"
          class="homeMenu"
          ${
            remaining <= 0
              ? "disabled"
              : ""
          }
        >
          <span>
            TRAINING
          </span>

          <strong>
            育成
          </strong>

          <small>
            歌・ダンス・MC
          </small>
        </button>


        <button
          id="homeActivity"
          class="homeMenu"
        >
          <span>
            ACTIVITY
          </span>

          <strong>
            活動
          </strong>

          <small>
            SNS・チラシ・配信
          </small>
        </button>


        <button
          id="homeLive"
          class="homeMenu"
        >
          <span>
            LIVE
          </span>

          <strong>
            ライブ
          </strong>

          <small>
            対バン・本番
          </small>
        </button>


        <button
          id="homeMission"
          class="homeMenu"
        >
          <span>
            MISSION
          </span>

          <strong>
            今週の目標
          </strong>

          <small>
            達成状況を確認
          </small>
        </button>


        <button
          id="homeRoom"
          class="homeMenu"
        >
          <span>
            ROOM
          </span>

          <strong>
            メンバールーム
          </strong>

          <small>
            Coming Soon
          </small>
        </button>

      </section>


      <div class="homeMoney">
        活動資金
        <strong>
          ${formatMoney(
            state.cash
          )}
        </strong>
      </div>

    </main>


    <div
      id="homeToast"
      class="homeToast"
    ></div>
  `;


  bindHomeButtons();


  showRankNotice();
}


/* =========================================================
   HOME OPEN
========================================================= */

function openHome() {

  ensureBGM();


  renderHome();


  showScreen(
    screens.home
  );
}


/* =========================================================
   HOME BUTTONS
========================================================= */

function bindHomeButtons() {

  $("homeStatusBtn")
    ?.addEventListener(
      "click",
      () =>
        renderMemberStatus()
    );


  document
    .querySelectorAll(
      ".homeMember"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            renderMemberStatus(
              button.dataset.member
            );
          }
        );
      }
    );


  $("homeStory")
    ?.addEventListener(
      "click",
      () => {

        const node =
          STORY.nodes[
            state.node
          ];


        /*
          ストーリー上の
          training地点なら
          TRAININGを開く
        */

        if (
          node?.type ===
          "training"
        ) {

          openTraining();

          return;
        }


        if (
          node?.type ===
          "weekComplete"
        ) {

          finishWeek();

          return;
        }


        renderStory();
      }
    );


  $("homeTraining")
    ?.addEventListener(
      "click",
      () => {

        if (
          state.actionsUsed >=
          DATA.weekActions
        ) {

          homeToast(
            "今週の活動は終了しています"
          );

          return;
        }


        openTraining();
      }
    );


  $("homeActivity")
    ?.addEventListener(
      "click",
      () => {

        homeToast(
          "ACTIVITYは次のアップデートで解放"
        );
      }
    );


  $("homeLive")
    ?.addEventListener(
      "click",
      () => {

        homeToast(
          "LIVEはストーリー進行で解放されます"
        );
      }
    );


  $("homeMission")
    ?.addEventListener(
      "click",
      () => {

        homeToast(
          `WEEK ${state.week} のミッションを準備中`
        );
      }
    );


  $("homeRoom")
    ?.addEventListener(
      "click",
      () => {

        homeToast(
          "メンバールームは後日解放予定"
        );
      }
    );
}


/* =========================================================
   HOME TOAST
========================================================= */

function homeToast(message) {

  const toast =
    $("homeToast");


  if (!toast)
    return;


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    homeToast.timer
  );


  homeToast.timer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      1800
    );
}


/* =========================================================
   RANK UP NOTICE
========================================================= */

function showRankNotice() {

  const notices =
    state.rankNotices ||
    [];


  if (
    !notices.length
  ) {

    return;
  }


  const notice =
    notices.shift();


  const member =
    DATA.members[
      notice.id
    ];


  state.rankNotices =
    notices;


  saveState();


  setTimeout(
    () => {

      homeToast(
        `${member.name} MEMBER RANK ${notice.rank}！ SP +${notice.sp}`
      );

    },
    300
  );
}


/* =========================================================
   MEMBER STATUS / SP SCREEN
========================================================= */

function renderMemberStatus(
  focusId = null
) {

  if (!statusModal)
    return;


  statusModal.innerHTML = `
    <div class="statusPanel memberV025">

      <div class="statusTop">

        <div>

          <small>
            MEMBER
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


      <div class="memberHelp">

        ランクアップで獲得したSPを
        好きな能力へ割り振れます。

      </div>


      <div
        class="statusMemberList"
      >

        ${DATA.memberOrder.map(
          id => {

            const base =
              DATA.members[id];


            const member =
              state.members[id];


            const overall =
              memberRankData(id);


            const selected =
              id === focusId;


            return `
              <section
                class="
                  statusMember
                  ${
                    selected
                      ? "focusMember025"
                      : ""
                  }
                "
                style="
                  --member-rgb:
                  ${base.rgb};
                "
              >

                <div
                  class="statusMemberHead"
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

                    <b
                      class="memberOverallRank"
                    >
                      MEMBER
                      ${overall.rank}${overall.point}
                    </b>

                    <small
                      class="memberSP"
                    >
                      FREE SP
                      ${member.sp || 0}
                    </small>

                  </div>

                </div>


                <div
                  class="statusStats v025Stats"
                >

                  ${[
                    "vocal",
                    "dance",
                    "mc",
                    "bond"
                  ].map(
                    stat => {

                      const value =
                        member.stats[
                          stat
                        ];


                      return `
                        <div
                          class="statusStat"
                        >

                          <span>
                            ${statLabel(stat)}
                          </span>

                          <b>
                            ${formatLongRank(
                              value
                            )}
                          </b>

                          <button
                            class="spAdd"
                            data-member="${id}"
                            data-stat="${stat}"

                            ${
                              (member.sp || 0) <= 0 ||
                              value >= 700

                                ? "disabled"

                                : ""
                            }
                          >
                            ＋
                          </button>

                        </div>
                      `;
                    }
                  ).join("")}

                </div>


                <div
                  class="statusEnergy"
                >

                  <div>

                    <span>
                      体力
                    </span>

                    <strong>
                      ${member.stats.energy}/100
                    </strong>

                  </div>


                  <div
                    class="energyBar"
                  >

                    <i style="
                      width:
                      ${member.stats.energy}%;
                    "></i>

                  </div>

                </div>

              </section>
            `;
          }
        ).join("")}

      </div>

    </div>
  `;


  statusModal.classList.add(
    "show"
  );


  $("statusClose")
    ?.addEventListener(
      "click",
      () => {

        statusModal.classList.remove(
          "show"
        );
      }
    );


  document
    .querySelectorAll(
      ".spAdd"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            allocateMemberSP(
              button.dataset.member,
              button.dataset.stat
            );
          }
        );
      }
    );
}


/*
  既存STATUSボタンも
  v0.25 MEMBER画面へ。
*/

renderStatus =
function () {

  renderMemberStatus();
};


/* =========================================================
   HEADER HOME BUTTON
========================================================= */

function addHomeHeaderButtons() {

  const headers = [
    document.querySelector(
      ".storyHeader"
    ),

    document.querySelector(
      ".trainingHeader"
    )
  ];


  headers.forEach(
    header => {

      if (
        !header ||
        header.querySelector(
          ".homeHeaderBtn"
        )
      ) {

        return;
      }


      const button =
        document.createElement(
          "button"
        );


      button.className =
        "homeHeaderBtn";


      button.textContent =
        "HOME";


      button.addEventListener(
        "click",
        openHome
      );


      const statusButton =
        header.querySelector(
          "#statusBtn, #trainingStatusBtn"
        );


      if (statusButton) {

        header.insertBefore(
          button,
          statusButton
        );

      } else {

        header.appendChild(
          button
        );
      }
    }
  );
}


/* =========================================================
   STORY → HOME ROUTING

   story.jsの「training」地点で
   強制TRAININGせずHOMEへ戻す。
========================================================= */

const renderStoryV024 =
  renderStory;


renderStory =
function () {

  const node =
    STORY.nodes[
      state.node
    ];


  if (
    node?.type ===
    "training"
  ) {

    openHome();

    return;
  }


  renderStoryV024();
};


/* =========================================================
   TRAINING → HOME ROUTING

   1活動ごとにHOMEへ戻る。
========================================================= */

continueAfterTraining =
function () {

  state.selectedMember =
    null;


  /*
    3回終了
  */

  if (
    state.actionsUsed >=
    DATA.weekActions
  ) {

    /*
      現在実装済みの
      WEEK1帰り道ストーリー
    */

    if (
      state.season === 1 &&
      state.week === 1
    ) {

      state.node =
        STORY.weeks[1]
          .afterTraining;


      saveState();


      openHome();

      return;
    }


    saveState();


    finishWeek();

    return;
  }


  saveState();


  openHome();
};


/* =========================================================
   INIT v0.25
========================================================= */

ensureHomeScreen();

addHomeHeaderButtons();

saveState();
