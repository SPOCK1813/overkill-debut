# O-VER-KiLL v0.30 — 実装計画

## 目的と境界

`SPOCK1813/overkill-debut` の現行v0.25相当を基準に、関数上書き式の `game.js → v024.js → v025.js` を段階的なTypeScriptモジュールへ置き換える。ユーザー承認済みのv0.30再構築設計書と今回指定されたPhase 1〜4を実装し、既存の1WEEKを再現できる最小プレイ可能なPreviewを用意する。全32週のストーリー制作、成長バランスの最終調整、ACTIVITY/LIVE/MISSION/ROOMの完全実装などPhase 5以降は行わない。

現行main・既存公開URL `https://overkill-debut.vercel.app` は変更しない。GitHubの `feature/v030-phase1-4` だけを更新し、同一コードを別Web Previewプロジェクトに反映する。Previewのみで確認し、本番公開・mainへの統合はしない。Web Preview設定では `publishing.auto_publish=false` を確認済み。設定の有効化やデータベース／サーバーの追加は行わない。

## 実装方針

既存ゲームは静的HTML/CSS/JavaScriptであるため、フレームワークを追加せず **Vite + TypeScriptの静的SPA** とする。Vite、TypeScript、Vitestのみを開発依存として使用し、サーバー・DBなしでPreviewを配信する。`src/domain`はDOM・localStorageを参照しない純粋なゲーム規則、`src/services`は保存・移行・乱数等の境界、`src/app`は状態変更と遷移、`src/screens`は表示・入力に限定する。状態変更は共通Controller/Reducerへ集約し、同名関数のグローバル再代入と、画面側からのゲーム状態直接更新を禁止する。

### Project structure

```text
/
├── index.html
├── package.json                 # Vite/TypeScript/Vitest、dev/build/test scripts
├── pnpm-workspace.yaml          # pnpm 11 build script permissions
├── vite.config.ts
├── tsconfig.json
├── public/
│   ├── manus-routes.json        # `/` のみ。Vite Preview開始前に配置
│   └── assets/                  # 既存キャラクター/背景/音声/ロゴと試作パーツ
│       └── chibi/sarina/parts/  # 同一基準の透過512x512 PNGレイヤー
├── src/
│   ├── main.ts                  # 起動・依存の組立て
│   ├── app/                     # AppController、画面ID、描画/遷移
│   ├── components/chibi/         # 汎用LayeredChibi renderer・共有motion CSS
│   │   └── sarina/               # SARiNA用manifest・表情mapping・薄いwrapper
│   ├── domain/                  # 型、初期値、selector、rank、SP、週進行、訓練
│   ├── data/                    # メンバー、行動、旧シナリオ、asset manifest
│   ├── services/                # SaveRepository、legacy/schema migration、乱数、音声
│   ├── screens/                 # Title、Prologue、Home、Story、Training、Member、Result
│   └── styles/                  # tokens、base、screens、iPhone向けmobile
├── scripts/generate_chibi_parts.py # 交換前の試作PNGを再生成する決定的な描画源
├── tests/                       # domain、migration、冪等性、week progression
├── docs/
│   ├── v030-baseline.md         # Phase 1の現行機能・数値・資産・参照一覧
│   ├── v030-week-comparison.md  # 実行後の現行版／Preview差分報告
│   └── chibi-sarina-parts.md    # レイヤー名、基準位置、差し替え契約
└── TODO.md
```

今回未実装のACTIVITY/LIVE/MISSION/ROOMはHOMEの独立した入口と拡張先を確保し、未実装であることを明示する。将来用のStoryCondition等は型・宣言データの境界を設け、任意JavaScript文字列を評価しない。主要イベントの存在・順序は固定し、条件は会話・演出差分だけに使う設計を妨げない。

## データ・進行の契約

- `GameState`は `schemaVersion` と `gameVersion:"0.30"` を分離する。週は4 SEASON×8 WEEK、各週開始時に3行動・TP100を用意し、行動履歴と週開始snapshotを保持する。
- 能力は `vocal/dance/mc/bond` の1〜700、体力は0〜100。能力TierはE/D/C/B/A/S/SSの各1〜100。MEMBER RANKは4能力の平均を四捨五入して同じrank関数へ渡す。
- MEMBER RANK昇格SPはE→D 3、D→C 4、C→B 5、B→A 6、A→S 8、S→SS 10。SPは1ポイントずつ4能力へ配分する。SPが越えたTierは報酬対象Tierも進め、後の通常成長で遡及報酬を与えない。
- TRAININGの基礎TPはダンス35、ボーカル35、MC25、SNS20、チラシ20、休養0。通常行動はTPと残行動の両方を満たす場合だけ確定し、休養も行動枠を1回使う。STORY閲覧は行動・TPを消費しない。各行動後は保存済みの結果を表示し、演出後にHOMEへ戻る。
- 移行時は現在の数値計算を原則維持する。旧v0.24は能力gainを `round(baseGain × 1.5 × resultMultiplier)`、EXPを `round(baseExp × 1.6 × expMultiplier)`、体力を固定値、reachを `round(baseReach × resultMultiplier)` で更新する。条件別の確率と結果倍率は既存データを移す。成長値の最終バランスは今回変更しない。
- 行動結果は乱数判定時に一度確定し、ActionRecordへ保存してから画面演出を開始する。ActionRecord/effect ID、週末結果確定ガードで再読込・連打による二重適用を防ぐ。
- 新キーは `overkill_manager_v030`。旧 `overkill_manager_v22` は保持したまま変換し、失敗時に新規状態で上書きしない。既存メンバー能力・Lv/EXP/SP、資源、進行位置、週snapshot、rankBonusClaimed/rankHistory等を可能な限り保つ。

## 画面・ユーザー体験

HOMEを縦画面のハブとして、STORY / TRAINING / ACTIVITY / LIVE / MEMBER / MISSION / ROOMへ移動する。HOMEにはSEASON/WEEK、残り行動、残りTP、活動資金、認知度、ファン数、4人のコンディション、各MEMBER RANKを表示する。タイトルと既存プロローグの後HOMEへ着地し、STORYはいつでも非消費で閲覧可能にする。Week 1の既存選択肢・週末エピソード・WEEK RESULTを再利用する。次週開始Storyが定義済みなら現行版同様に自動表示し、定義がなければHOMEに戻す。

見た目は旧版の黒紺基調（`#080a10` / `#11141d`）、白い情報文字、4人の既存色・立ち絵、夜景/舞台背景を継承した暗くシネマティックなADV/マネージャーUIとする。画像・BGM・プロローグ・シナリオは既存ファイルをできるだけ無変更で再利用し、欠落参照はmanifestで代替先を明示する。汎用飾り素材は追加せず、今回の専用試作としてのみSARiNAの仮chibiパーツを作り、最終絵へ個別差し替え可能にする。

**Design Movement:** 既存の暗いシネマティックADVとモバイル管理UIを継承する。

**Core Principles:** 1) 物語の余韻を残す暗い背景、2) 4人の色で状態を即座に識別、3) 週・TP・行動をHOMEで明瞭化、4) 数値やボタンは片手操作で読める。

**Color Philosophy:** 現行の黒紺背景・濃いパネル・明るい文字を基礎に、既存キャラクターカラーを状態アクセントとして使う。結果・エラーは色だけでなく文言とアイコンも併用する。

**Layout Paradigm:** iPhone縦長の一画面シェルと縦スクロールするHOMEカード列。週の進行情報は画面上部、主要操作は下部の親指が届く範囲。長い台詞・結果は安全なスクロール領域に置く。

**Signature Elements:** 背景の写真/舞台シーン、4人の立ち絵と名前色、薄い発光ラインと週次ラベル。
**Interaction Philosophy:** 主要タップ領域は44px以上を目標にし、操作結果・TP・残行動を確定後すぐ更新する。多重タップは無効化し、操作可能/不可の理由を画面上で示す。
**Animation:** 既存演出の短いフェード/スライドを尊重し、成長量の演出は保存後に再生する。iOSの再生制約を守り、`prefers-reduced-motion`では移動・点滅を抑える。
**Typography System:** iOSシステムフォントを使用し、本文16px以上・補助文字12px以上を基準とする。SEASON/WEEKや能力数値は太字・桁揃えで階層化し、旧CSSにある7〜9px文字を移植しない。

**Brand Essence:** 何者でもない4人をマネージャーの選択と育成で初舞台へ導く、物語中心のアイドル育成ゲーム。個性的・切実・前進する。

**Brand Voice:** 短く、舞台裏の会話として自然に。例：「今日の3回、誰に使う？」「4人の1週間を、ここで確かめよう。」

**Wordmark & Logo:** 既存のO-VER-KiLLロゴ表記を再利用し、字間と区切りを維持する。新しい汎用テキストロゴへ置換しない。

**Signature Brand Color:** 白い文字に添えるクールなブルーラベンダー`#bfc9ff`。4人それぞれの名前色・能力色を置き換えず、共通UIのフォーカスと週次進行にだけ使う。

## ちびSARiNAの1人限定試作

新しい共通ゲーム状態・save schemaは増やさず、`src/components/chibi/LayeredChibi.ts`がmanifestの`id/displayName/assetBase/partOrder`から共通DOMとvisual-only tap reactionを生成する。`src/components/chibi/sarina/SarinaChibi.ts`はSARiNA manifest・表情対応・薄いwrapperだけを持つ。HomeではSARiNAカードに小さく配置し、condition `best`ならhappy、`bad/worst`ならtroubled、それ以外はidle。Storyでは`member === "sarina"`の台詞立ち絵だけchibiへ置き換え、normalの発話中にtalk、smileにhappy、angry/troubled/cryにtroubledを割り当てる。他メンバーの既存立ち絵は無変更とする。クリックはControllerの委譲イベントで短いtap reactionだけ再生し、ゲーム進行・保存データは変更しない。
素材は`public/assets/chibi/sarina/parts/`に透明背景PNGとして配置し、全ファイルを512×512、同じ左上原点・足元基準で固定する。placeholderの生成PNGはPreview専用で、本番素材ではない。正式素材は既存ゲーム内の `sarina_normal.png` と5表情差分を参照し、顔・髪・衣装・色・頭身・線を変えずに同じpart名で差し替える。フラット画像のみからは隠れた部分を完全一致で復元できないため、レイヤー付き原画が利用できる場合は優先する。既存の `#69e09a` 担当色はUIで保ち、元絵にない衣装・髪の緑アクセサリーは追加しない。詳細な出典・座標変換・パーツ境界は `docs/sarina-chibi-material-spec.md` を参照する。

レイヤーはDOMの奥から手前へ`body`, `arm_left`, `arm_right`, `hair_back`, `head_base`, active eye pair, active brow pair, active mouth, `hair_front`, `effect_sparkle`（happy/tap）, `effect_sweat`（troubledのみ）とする。eyes/brows/mouthは各状態に必要な同一座標の画像だけopacityで切り替える。idleは2.6秒程度の小さい上下呼吸と約4.8秒周期の短いblink、talkは3種の口形を約540msで切替え体を小さく揺らす。happyは間を置いて小さく跳ねながら腕を動かし、troubledは小さく縮こまって汗を出し、tapは約520msの一度きりのぴょこっと反応。CSS `transform`/`opacity`中心でJavaScriptのframe loop・canvas・GIF・動画は使わず、`prefers-reduced-motion`では反復運動とblinkを停止する。MiYU/KiLUA/RAiSAはそれぞれの`ChibiManifest`と同名partsを追加し、同じ`renderLayeredChibi(manifest, options)`と共有CSSを利用できる。今回の画面に表示するのはSARiNAだけ。

## 動作・配信・比較

PreviewサーバーはViteを `0.0.0.0:3000` で起動し、相対アセットURLを使う。静的ルートは `/` のみで、`public/manus-routes.json` をPreview起動前に設置する。認証やサーバー機能は追加しない。Vite buildとVitestで確認し、最後にiPhone相当縦画面でPreviewを確認する。現行公開版と新Previewは独立したブラウザプロフィール／セーブで動作させる。

比較シナリオは両方を新規状態（共有ovkPoints=0）で開始し、同じWeek 1 Story選択 `split`、同じ乱数ロール列、同じメンバー・順序で「SARiNA:ダンス35TP → MiYU:ボーカル35TP → KiLUA:SNS20TP」を実施する。合計3行動・TP90消費・TP10残の後、Week 1の週末ストーリー／WEEK RESULTを開き、同じ「次週へ」でSeason 1 Week 2へ移る（週開始Storyがあれば自動表示）。両版で初期ステータス、各時点のTP/行動数、能力・体力・EXP・ランク・SP、週結果、次週状態を記録する。ランダム性は可能な限り同じ結果に固定し、固定できない場合は確率差と計算式差を分けて記録する。各差分を「仕様として意図した差」「不具合」「判定保留」に分類する。

比較結果は `docs/v030-week-comparison.md` に残し、GitHubではfeature branchにだけ反映する。Preview確認後もmain統合・現行URL公開は行わない。
