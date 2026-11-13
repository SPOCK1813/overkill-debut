import { escapeHtml } from "../utils/format";

export function renderSaveErrorScreen(message: string, legacyPresent: boolean): string {
  return `<section class="screen-shell save-error-screen"><p class="eyebrow">SAVE DATA</p><h1>セーブを安全に読み込めません</h1><p>${escapeHtml(message)}</p><p>${legacyPresent ? "旧セーブは残っています。新規開始を選んでも旧データは削除しません。" : "保存領域を変更せずに停止しました。"}</p><button class="button button-primary button-large" type="button" data-action="return-title">タイトルへ戻る</button></section>`;
}
