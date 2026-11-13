import { backgroundFor, MEMBER_PORTRAITS } from "../data/assetManifest";
import type { GameState, StoryNode } from "../domain/types";
import { escapeHtml } from "../utils/format";

export function renderStoryScreen(state: GameState, node: StoryNode, errorMessage?: string | null): string {
  const member = node.member;
  const expression = node.expression ?? "normal";
  const portrait = member ? MEMBER_PORTRAITS[member][expression] : "";
  const background = backgroundFor(node.bg);
  const choices = node.choices?.length
    ? `<div class="story-choices">${node.choices.map((choice, index) => `<button class="story-choice" type="button" data-action="story-choice" data-choice-index="${index}"><strong>${escapeHtml(choice.title)}</strong>${choice.hint ? `<small>${escapeHtml(choice.hint)}</small>` : ""}</button>`).join("")}</div>`
    : `<button class="button button-primary button-large story-next" type="button" data-action="story-next">${node.type === "weekComplete" ? "WEEK RESULTを見る" : node.type === "training" ? "HOMEへ" : "NEXT"}</button>`;
  return `
    <section class="screen-shell story-screen">
      <header class="screen-header story-screen-header">
        <div class="screen-heading"><p class="eyebrow">SEASON ${state.progress.season} · WEEK ${state.progress.week}</p><h1>${escapeHtml(node.chapter ?? "STORY")}</h1></div>
        <button class="button button-quiet" type="button" data-action="go-home">HOME</button>
      </header>
      <div class="story-stage" style="--scene-background:url('${background}')">
        <div class="scene-shade"></div>
        ${portrait ? `<img class="story-portrait" src="${portrait}" alt="" fetchpriority="high" />` : '<div class="story-portrait-placeholder" aria-hidden="true"></div>'}
        ${node.reaction ? `<span class="story-reaction" aria-hidden="true">${escapeHtml(node.reaction)}</span>` : ""}
        <article class="dialogue-panel">
          ${node.speaker ? `<p class="speaker-name">${escapeHtml(node.speaker)}</p>` : ""}
          ${node.text ? `<p class="dialogue-text">${escapeHtml(node.text)}</p>` : ""}
          ${errorMessage ? `<p class="inline-error" role="alert">${escapeHtml(errorMessage)}</p>` : ""}
          ${choices}
        </article>
      </div>
      <p class="story-note">STORYの閲覧では行動回数・TPを消費しません。</p>
    </section>
  `;
}
