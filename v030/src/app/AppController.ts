import { CORE_STATS } from "../domain/types";
import { allocateMemberSP } from "../domain/sp";
import { createWeekSnapshot, startNewGame, cloneState, createInitialState } from "../domain/stateFactory";
import { nextWeek, returnToStablePhase } from "../domain/progression";
import { executeTraining } from "../domain/training";
import { SaveRepository, type LoadResult } from "../services/SaveRepository";
import { MathRandomSource } from "../services/RandomSource";
import { advanceStory, beginWeekendStory, chooseStory, nodeFor, openStory, storyStartFor, PROLOGUE } from "../services/StoryEngine";
import { AudioService } from "../services/AudioService";
import { playSarinaTap } from "../components/chibi/sarina/SarinaChibi";
import { renderActionResultScreen } from "../screens/ActionResultScreen";
import { renderHomeScreen } from "../screens/HomeScreen";
import { renderMemberScreen } from "../screens/MemberScreen";
import { renderPlaceholderScreen, renderGameCompleteScreen } from "../screens/PlaceholderScreen";
import { renderPrologueScreen } from "../screens/PrologueScreen";
import { renderSaveErrorScreen } from "../screens/SaveErrorScreen";
import { renderStoryScreen } from "../screens/StoryScreen";
import { renderTitleScreen } from "../screens/TitleScreen";
import { renderTrainingScreen } from "../screens/TrainingScreen";
import { renderWeekResultScreen } from "../screens/WeekResultScreen";
import type { ActionType, CoreStat, GameState, MemberId, ScreenPhase } from "../domain/types";

export class AppController {
  private state: GameState;
  private showingTitle = true;
  private selectedTrainingMember: MemberId | null = null;
  private placeholder = "activity";
  private loadError: string | null = null;
  private legacyPresent = false;
  private loadWarnings: string[] = [];
  private message: string | null = null;
  private readonly random = new MathRandomSource();
  private readonly audio: AudioService;

  constructor(
    private readonly root: HTMLElement,
    private readonly saves: SaveRepository,
    loaded: LoadResult,
  ) {
    if (loaded.status === "loaded" || loaded.status === "migrated") {
      this.state = loaded.state;
      this.loadWarnings = loaded.warnings;
    } else {
      this.state = createInitialState();
      if (loaded.status === "error") {
        this.loadError = loaded.message;
        this.legacyPresent = loaded.legacyPresent;
        this.state.progress.phase = "saveError";
        this.showingTitle = false;
      }
    }
    this.audio = new AudioService(document.querySelector<HTMLAudioElement>("#bgm"));
    this.root.addEventListener("click", this.onClick);
    this.render();
  }

  private readonly onClick = (event: Event): void => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-action]") : null;
    if (!target || (target instanceof HTMLButtonElement && target.disabled)) return;
    const action = target.dataset.action;
    if (action !== "toggle-audio" && action !== "chibi-tap") void this.audio.startFromUserGesture();

    switch (action) {
      case "new-game": this.newGame(); break;
      case "continue": this.continueGame(); break;
      case "return-title": this.showingTitle = true; this.render(); break;
      case "toggle-audio": void this.audio.toggle().then(() => this.render()); break;
      case "prologue-next": this.advancePrologue(); break;
      case "chibi-tap": playSarinaTap(target); break;
      case "go-home": this.goHome(); break;
      case "open-story": this.openStory(); break;
      case "story-next": this.advanceCurrentStory(); break;
      case "story-choice": this.chooseCurrentStory(Number(target.dataset.choiceIndex)); break;
      case "open-training": this.openTraining(); break;
      case "select-member": this.selectMember(target.dataset.memberId); break;
      case "train": this.train(target.dataset.trainingId); break;
      case "action-result-continue": this.finishActionResult(); break;
      case "close-week": this.closeWeek(); break;
      case "next-week": this.advanceWeek(); break;
      case "open-member": this.setPhase("member"); break;
      case "allocate-sp": this.allocateSp(target.dataset.memberId, target.dataset.stat); break;
      case "open-placeholder": this.openPlaceholder(target.dataset.feature); break;
      default: break;
    }
  };

  private save(next: GameState): boolean {
    try {
      next.updatedAt = new Date().toISOString();
      this.saves.save(next);
      this.state = next;
      this.loadError = null;
      this.legacyPresent = false;
      this.message = null;
      return true;
    } catch (error) {
      this.message = error instanceof Error ? error.message : "保存に失敗しました。状態は変更していません。";
      return false;
    }
  }

  private setPhase(phase: ScreenPhase): void {
    this.state = returnToStablePhase(this.state, phase);
    this.message = null;
    this.render();
  }

  private newGame(): void {
    if (this.state.started && !window.confirm("現在のv0.30セーブを新規データで置き換えますか？ 既存セーブはバックアップし、旧v0.22キーも削除しません。")) return;
    try {
      if (this.state.started || this.loadError) this.saves.preserveCurrentSave();
    } catch {
      this.message = "既存セーブをバックアップできなかったため、新規データ開始を中止しました。";
      this.render();
      return;
    }
    const next = startNewGame(this.state);
    if (this.save(next)) {
      this.showingTitle = false;
      this.selectedTrainingMember = null;
    }
    this.render();
  }

  private continueGame(): void {
    if (!this.state.started) return;
    this.showingTitle = false;
    if (this.state.progress.phase === "title") this.state.progress.phase = this.state.prologueSeen ? "home" : "prologue";
    this.render();
  }

  private advancePrologue(): void {
    const next = cloneState(this.state);
    if (next.progress.prologueIndex < PROLOGUE.length - 1) {
      next.progress.prologueIndex += 1;
      next.progress.phase = "prologue";
    } else {
      next.prologueSeen = true;
      next.progress.phase = "home";
      next.progress.prologueIndex = 0;
      const start = storyStartFor(next.progress.season, next.progress.week);
      next.progress.story.nodeId = start;
      next.progress.story.eventId = start ? `S${next.progress.season}W${next.progress.week}-opening` : null;
      next.progress.story.returnPhase = "home";
      next.progress.story.startedAt = null;
      next.weekStartSnapshot = createWeekSnapshot(next);
      next.ui.lastStablePhase = "home";
    }
    this.save(next);
    this.render();
  }

  private goHome(): void {
    this.selectedTrainingMember = null;
    const next = cloneState(this.state);
    next.progress.phase = "home";
    next.ui.lastStablePhase = "home";
    if (["story", "member", "training", "placeholder"].includes(this.state.progress.phase)) this.save(next);
    else this.state = next;
    this.render();
  }

  private openStory(): void {
    const next = openStory(this.state);
    if (next.progress.phase !== "story") {
      this.message = "この週のストーリーはまだ準備中です。行動や保存データは変更していません。";
      this.render();
      return;
    }
    this.save(next);
    this.render();
  }

  private advanceCurrentStory(): void {
    this.save(advanceStory(this.state));
    this.render();
  }

  private chooseCurrentStory(index: number): void {
    const next = chooseStory(this.state, index);
    if (next === this.state) {
      this.message = "この選択肢は現在選べません。";
      this.render();
      return;
    }
    this.save(next);
    this.render();
  }

  private openTraining(): void {
    if (this.state.week.actionsUsed >= 3) {
      this.message = "今週の自由行動は終了しました。週末へ進んでください。";
      this.render();
      return;
    }
    this.selectedTrainingMember = null;
    this.setPhase("training");
  }

  private selectMember(value?: string): void {
    const members: MemberId[] = ["sarina", "miyu", "kilua", "raisa"];
    if (!value || !members.includes(value as MemberId)) return;
    this.selectedTrainingMember = value as MemberId;
    this.message = null;
    this.render();
  }

  private train(value?: string): void {
    const actions: ActionType[] = ["dance", "vocal", "mc", "sns", "flyer", "rest"];
    if (!this.selectedTrainingMember || !value || !actions.includes(value as ActionType)) {
      this.message = "メンバーと行動を選んでください。";
      this.render();
      return;
    }
    const result = executeTraining(this.state, this.selectedTrainingMember, value as ActionType, this.random);
    if (!result.ok) {
      this.message = result.reason;
      this.render();
      return;
    }
    // Persist the applied record and state before rendering the result animation.
    if (this.save(result.state)) this.selectedTrainingMember = null;
    this.render();
  }

  private finishActionResult(): void {
    const next = cloneState(this.state);
    next.week.pendingActionId = null;
    next.progress.phase = "home";
    next.ui.lastStablePhase = "home";
    this.save(next);
    this.render();
  }

  private closeWeek(): void {
    if (this.state.week.actionsUsed < 3) {
      this.message = "自由行動が3回終わると週末へ進めます。";
      this.render();
      return;
    }
    const next = this.state.week.weekendEventId && this.state.progress.story.nodeId
      ? openStory(this.state)
      : beginWeekendStory(this.state);
    this.save(next);
    this.render();
  }

  private advanceWeek(): void {
    const nextSeason = this.state.progress.week === 8 ? this.state.progress.season + 1 : this.state.progress.season;
    const nextWeekNumber = this.state.progress.week === 8 ? 1 : this.state.progress.week + 1;
    const storyNode = nextSeason <= 4 ? storyStartFor(nextSeason, nextWeekNumber) : null;
    const next = nextWeek(this.state, storyNode);
    if (next === this.state) {
      this.message = "週結果を確定してから次週へ進んでください。";
      this.render();
      return;
    }
    this.save(next);
    this.render();
  }

  private allocateSp(memberValue?: string, statValue?: string): void {
    const ids: MemberId[] = ["sarina", "miyu", "kilua", "raisa"];
    if (!memberValue || !ids.includes(memberValue as MemberId) || !statValue || !CORE_STATS.includes(statValue as CoreStat)) return;
    const id = memberValue as MemberId;
    const member = allocateMemberSP(this.state.members[id], statValue as CoreStat);
    if (!member) {
      this.message = "配分できるSPがないか、能力値が上限です。";
      this.render();
      return;
    }
    const next = cloneState(this.state);
    next.members[id] = member;
    next.updatedAt = new Date().toISOString();
    this.save(next);
    this.render();
  }

  private openPlaceholder(feature?: string): void {
    this.placeholder = feature ?? "activity";
    this.setPhase("placeholder");
  }

  private render(): void {
    if (this.showingTitle) {
      this.root.innerHTML = renderTitleScreen({ canContinue: this.state.started, errorMessage: this.loadError, audioEnabled: this.audio.isEnabled });
      return;
    }
    switch (this.state.progress.phase) {
      case "title":
        this.showingTitle = true;
        this.root.innerHTML = renderTitleScreen({ canContinue: this.state.started, errorMessage: this.loadError, audioEnabled: this.audio.isEnabled });
        return;
      case "saveError":
        this.root.innerHTML = renderSaveErrorScreen(this.loadError ?? "保存データを確認できません。", this.legacyPresent);
        return;
      case "prologue":
        this.root.innerHTML = renderPrologueScreen(this.state.progress.prologueIndex);
        return;
      case "home":
        this.root.innerHTML = renderHomeScreen(this.state, { notice: this.message, saveWarning: this.loadWarnings.join(" ") || null, audioEnabled: this.audio.isEnabled });
        return;
      case "story": {
        const node = nodeFor(this.state);
        this.root.innerHTML = node ? renderStoryScreen(this.state, node, this.message) : renderPlaceholderScreen(this.state, "story");
        return;
      }
      case "training":
        this.root.innerHTML = renderTrainingScreen(this.state, this.selectedTrainingMember, this.message);
        return;
      case "actionResult": {
        const record = this.state.week.actionHistory.find((item) => item.id === this.state.week.pendingActionId);
        this.root.innerHTML = record ? renderActionResultScreen(this.state, record) : renderSaveErrorScreen("保存済みの行動結果を見つけられません。再実行を防ぐため状態を停止しました。", true);
        return;
      }
      case "weekResult":
        this.root.innerHTML = renderWeekResultScreen(this.state);
        return;
      case "member":
        this.root.innerHTML = renderMemberScreen(this.state, this.message);
        return;
      case "placeholder":
        this.root.innerHTML = renderPlaceholderScreen(this.state, this.placeholder);
        return;
      case "gameComplete":
        this.root.innerHTML = renderGameCompleteScreen();
        return;
      default:
        this.root.innerHTML = renderSaveErrorScreen("画面状態を認識できません。セーブデータは変更していません。", false);
    }
  }
}
