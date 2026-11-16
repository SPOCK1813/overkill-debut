# O-VER-KiLL v0.30 — Game Feel試作計画

## 今回の範囲と境界

既存のVite + TypeScript製v0.30 Preview基盤を使い、「HOME＋SARiNA 1人」の小さなGame Feel縦切りを作る。初回表示はHOME。見えるゲーム操作はSTORY / TRAINING / MEMBERに絞る。HOMEではSEASON 1・WEEK 1・残り行動3・TP100・ファン・認知度・活動資金・SARiNAを見せる。STORYはSARiNAが会話してNEXTでHOMEへ戻る。TRAININGはSARiNAを選び、ダンスを選び、成功演出・成長表示の後HOMEへ戻る。MEMBERはSARiNAだけを表示する。

既存のdomain、GameState、SaveRepository、legacy migration、rank/SP、週進行、ActionRecordの二重適用防止、LayeredChibi汎用rendererは維持する。全4人表示、32WEEKの新ストーリー制作、ACTIVITY/LIVE/MISSION/ROOMの本実装、ミニゲーム、育成バランス調整は今回行わない。既存のタイトル・プロローグ・長編STORY/週末処理はモジュールとして残し、今回のPreview体験では短いHOME→STORY/TRAININGの流れを優先する。

既存公開リポジトリ `SPOCK1813/overkill-debut` の `main`、公開URL `https://overkill-debut.vercel.app/` は変更しない。GitHubでは `feature/v030-phase1-4` だけを更新する。Webdevの別Previewプロジェクトで動作させ、`publishing.auto_publish=false` を維持して公開しない。

## 実装・状態方針

新しいフレームワークや依存は加えず、現行のVite + TypeScript静的SPAを使う。ブラウザ内のlocalStorageには既存の `overkill_manager_v030` / schemaVersionを使い、今回のための別セーブやサーバー/DBは追加しない。未保存時は初期値を使ってHOMEを表示し、初回プロローグやタイトル操作を試作導線の前に要求しない。既存セーブ・移行状態は上書きせず、開始表示のみHOMEに整える。

STORYは既存Week 1のSARiNA発話（`w1_02`）を一画面で表示し、口パクを行う。NEXTは行動数・TPを消費せずHOMEに戻る。TRAININGはSARiNA選択後にダンス（TP35）だけを提示する。状態の変更と保存は既存 `executeTraining` / `SaveRepository` を使う。Game Feel確認用の成功結果は `SequenceRandomSource([0.01])` で決定的に再現するが、domainの成功確率や計算式は変更しない。結果画面では保存済みActionRecordに基づき成功・成長値を表示し、SARiNAをhappyで見せ、HOME復帰後に数値を短くポップさせる。

## 表示資産と交換契約

SARiNAアニメーションには、既存の生成済み20枚PNGを**Preview限定の仮キャラクター素材**としてのみ使う。新しい絵は生成しない。仮素材であることを既存manifestの `assetStatus: placeholder` / `productionApproved: false` と画面上の `ANIMATION TEST / 仮ビジュアル` 表記で明示し、正式デザイン・本番承認済みのように見せない。ユーザー提供の完成SARiNA全身画像と既存の立ち絵は改変せず、正式ビジュアルへの差替え基準として保持する。`LayeredChibi`、`renderSarinaChibi`、manifestの `id/displayName/assetBase/partOrder`、mood/talking/placement、tap APIの契約は保つ。

## iPhone UIとGame Feel

黒・濃紺のライブハウス風UIに、SARiNA担当色のネオングリーン `#69e09a` を明確な主アクセントとして使う。HOMEは片手で読みやすい縦積みヒーロー：上部のS1/W1と行動/TP、中央の動くSARiNA、ファン/認知度/活動資金、下部のSTORY/TRAINING/MEMBERカード。画面は縦スクロール可能とし、safe-areaを守る。

キャラはCSS transform/opacityだけで軽く動かし、待機の呼吸・まばたき・小さな揺れ、会話口パク、成功時の小さなhappy hop、タップ時の一度きりの反応を使う。ボタンは押下時に少し沈み、画面間は短いfade/slide、能力・資源の増加は短くpopさせる。`prefers-reduced-motion`では反復アニメーションを抑える。タップ領域は44px以上を目標、補助文字は12px以上、iPhone Safariの縦画面を優先する。

**Design Movement:** 既存O-VER-KiLLの暗い舞台裏に、ゲームUIの状態表示と地下ライブハウスの小さなネオンを重ねる。

**Core Principles:** 1) 黒い余白でキャラクターを主役にする、2) 緑の光で操作と成長を伝える、3) 3つの選択肢だけに絞り迷わせない、4) 動きは小さく軽く、触った結果はすぐ返す。

**Color Philosophy:** 黒・チャコールを夜のライブハウス、白を読みやすさ、`#69e09a`をSARiNAの担当色と行動可能性のサインに使う。緑は面積を抑え、数値変化やフォーカスで短く発光させる。

**Layout Paradigm:** iPhone縦長の一枚ステージ。週情報を上、SARiNAを中央、資源と3つの主要導線を下に流す縦スクロール。PC幅では最大幅を抑え、スマホの片手操作感を維持する。

**Signature Elements:** 緑のライブメーター、細い発光縁の黒いカード、タップ/成長時の小さなリング波紋。

**Interaction Philosophy:** ボタンは押すと沈み、成功は即時に反応する。STORYのNEXTはいつでもHOMEに戻せ、行動数/TPを消費しない。

**Animation:** 連続する大きな演出は使わず、呼吸2.6秒・瞬き約4.8秒周期・短いmouth cycle・0.4秒程度のタップ/成長反応を重ねる。移動量を抑え、`prefers-reduced-motion`を尊重する。

**Typography System:** iOSシステムフォントと日本語ゴシック。本文16px以上、補助12px以上。SEASON/WEEK・TP・行動数・成長数値は太字で優先順位を付ける。

**Brand Essence:** 地下ライブハウスから始まる4人組の物語を、まずSARiNAと触って確かめる小さなアイドル育成Preview。親しみやすい・夜っぽい・手応えがある。

**Brand Voice:** 短く、舞台裏の会話として自然に。例：「今日のレッスン、ちゃんと見ててね。」「いい感じ！ダンスが少し揃ってきた。」

**Wordmark & Logo:** 既存の `O-VER-KiLL` 表記と区切りを再利用し、ロゴ画像を無断で描き直さない。

**Signature Brand Color:** SARiNA担当色のネオングリーン `#69e09a`。

## プロジェクト構成と責務

- `src/app/AppController.ts`: HOME/STORY/TRAINING/MEMBERの画面遷移と操作イベント。GameState変更は既存domain/serviceへ委譲。
- `src/screens/HomeScreen.ts`: S1/W1、行動/TP、資源、SARiNAヒーロー、3導線。
- `src/screens/GameFeelScreens.ts`（追加）: 1画面STORY、SARiNA選択＋ダンスTRAINING、SARiNAのみのMEMBER表示。
- `src/screens/ActionResultScreen.ts`: 保存済み結果、成功リアクション、成長数値。
- `src/components/chibi/LayeredChibi.ts` と `src/components/chibi/sarina/SarinaChibi.ts`: 既存汎用renderer、placeholder manifest、mood/tap API。
- `src/domain/`, `src/services/`: ランク/育成/保存/legacy移行等の既存共通基盤。今回のGame Feel化で旧仕様計算式を変更しない。
- `src/styles/tokens.css`, `screens.css`, `mobile.css`, `components/chibi/chibi.css`: 黒/緑テーマ、ボタン・遷移・ポップ、iPhone縦画面とアニメーション。
- `public/assets/`: 既存の背景/BGM/全身画像、Preview専用の仮chibi PNG。
- `public/manus-routes.json`: 現行SPAの `/` route manifest。

## 実行環境

既存lockfileと `pnpm@11.25.0` を使い、新規依存を加えない。Viteは既存Preview port 3000 / `0.0.0.0` を再利用し、全ブラウザasset URLは相対/ルート相対とする。TypeScriptのWebdev host diagnosticsは登録済みであり、既存route manifestを維持する。機能変更はVitest・typecheck・Vite buildを通し、必要な表示確認は390×844相当のPreviewで行う。Webdev内部checkpointもこのPreviewプロジェクトだけに保存し、別プロジェクトの自動公開はfalseのままにする。ユーザーのGitHub側は `feature/v030-phase1-4` のみ更新する。
