# ちびSARiNA パーツ仕様（v0.30試作）

## 1. 実装方針と対象

今回はSARiNA 1人だけを試作する。GIF・動画・Canvasで一枚絵を置き換える方式ではなく、透過PNGを同じ座標に重ねるCSSアニメーションとする。既存のSARiNA立ち絵から暗い茶髪・黒い衣装・緑担当のアクセントを参照し、仮素材はsource-controlledの描画scriptで作ったオリジナルのちび絵。後日、絵師の完成素材へ同名PNGを差し替えられる。

描画器自体はSARiNA専用で固定せず、`ChibiManifest`から画像パス・レイヤー順を受け取る汎用`renderLayeredChibi(manifest, options)`とする。今回の画面ではSARiNAのみを表示し、MiYU/KiLUA/RAiSAは追加しない。

## 2. ディレクトリ構成

```text
v030/
├── public/assets/chibi/sarina/parts/  # 全パーツの透過PNGとmanifest.json
├── src/components/chibi/
│   ├── LayeredChibi.ts                # manifest駆動DOM・visual-only tap renderer
│   ├── chibi.css                      # 共有mood/animation/layout
│   └── sarina/SarinaChibi.ts          # SARiNA専用manifest・story expression mapping
├── scripts/generate_chibi_parts.py    # 仮PNGの決定的な再生成元
├── tests/chibi.test.ts                # PNG・layer order・mood・汎用manifest
└── docs/chibi-sarina-parts.md         # この差し替え仕様
```

## 3. 必要画像ファイル一覧

ファイルはすべて`public/assets/chibi/sarina/parts/`に置く。要求された19種類に、happy/tap用の`effect_sparkle.png`を追加した計20レイヤーである。

| ファイル | 用途 |
|---|---|
| `body.png` | 首・衣装・スカート・脚・ブーツを含む体 |
| `head_base.png` | 顔・耳・頬のベース |
| `hair_back.png` | 顔より後ろの髪・後ろ結び |
| `hair_front.png` | 前髪・緑のヘアアクセント |
| `eye_left_open.png`, `eye_right_open.png` | 左右の開いた目 |
| `eye_left_closed.png`, `eye_right_closed.png` | 左右の閉じ目／まばたき |
| `brow_normal.png` | 通常の左右眉 |
| `brow_happy.png` | happy用の左右眉 |
| `brow_troubled.png` | troubled用の左右眉 |
| `mouth_1.png`, `mouth_2.png`, `mouth_3.png` | talk中に切り替える3つの口フレーム |
| `mouth_smile.png` | idle/happy用の閉じ笑顔 |
| `mouth_troubled.png` | 困り口 |
| `arm_left.png`, `arm_right.png` | 左右の袖・手。別々に回転 |
| `effect_sweat.png` | troubled時の汗 |
| `effect_sparkle.png` | happy/tap時の控えめな星 |
| `manifest.json` | canvas、anchor、partsの奥→手前順 |

## 4. キャンバス・基準位置・レイヤー順

全PNGを**512×512px、RGBA、背景alpha 0**とする。座標原点は左上 `(0,0)`、足元中央の基準点は `(256,512)`、顔中心は約 `(256,192)`。すべてのパーツは同じキャンバスで、Vite上では全レイヤーを同じ寸法の`img`に`object-fit: contain`して重ねる。個別crop・trim・リサイズ・CSS位置調整はしない。

DOMと`SARINA_CHIBI_PART_ORDER`は奥から手前の同じ順序を使う。

1. `body`
2. `arm_left`, `arm_right`
3. `hair_back`
4. `head_base`
5. `eye_left_open`, `eye_right_open`, `eye_left_closed`, `eye_right_closed`（開閉状態に応じてCSS表示）
6. `brow_normal`, `brow_happy`, `brow_troubled`（moodに応じて一組を表示）
7. `mouth_1`, `mouth_2`, `mouth_3`, `mouth_smile`, `mouth_troubled`（talkまたはmoodに応じて一つを表示）
8. `hair_front`
9. `effect_sparkle`（happy/tap）
10. `effect_sweat`（troubled）

## 5. 画面上のcomponent

汎用`renderLayeredChibi(manifest, { placement, mood, talking, ariaLabel })`は`button.chibi-sprite`と全レイヤーを作る。`ChibiManifest`には`id`・`displayName`・`assetBase`・`partOrder`を渡す。`placement`は`home | story`、moodは`idle | talk | happy | troubled`。各画像は`data-part`で識別し、文字列を自由評価せず共通CSSで表示状態を決める。

`renderSarinaChibi(options)`はSARiNA manifestを渡す薄いwrapper。HOMEではSARiNAの既存condition `best`をhappy、`bad/worst`をtroubled、それ以外をidleへ対応させる。STORYは`member === "sarina"`の既存立ち絵だけちび絵へ置き換える。SARiNAがspeakerのdialogueでは口パクを有効にし、expression `smile`をhappy、`angry/troubled/cry`をtroubledへ対応させる。他3人は現在の表示のまま。

ちび絵は44px以上のbuttonタップ領域を持ち、tapは約520msの見た目リアクションのみで、行動回数・TP・GameState・セーブを変更しない。汎用rendererは同じPNG命名と座標契約を使う将来の各メンバーmanifestから再利用できる。

## 6. animation制御

CSSの`data-chibi-mood`・`data-chibi-talking`・`data-tapped`を切り替え、JavaScriptの`requestAnimationFrame`、Canvas、GIF、動画は使わない。

- **idle:** 2.6秒周期の小さな上下呼吸と約4.8秒周期の短い瞬き。
- **talk:** `mouth_1`〜`mouth_3`を約540msのsteps keyframesで切替え、キャラクターを760ms周期で軽く揺らす。
- **happy:** 1.35秒周期で小さく跳ね、左右の腕を少しずつずらして振り、sparkleを表示。
- **troubled:** 1.8秒周期で控えめに縮こまり、困り眉・困り口・汗レイヤーを表示。
- **tap:** happyへ一時切替し、約420msのぴょこっとした反応を一度再生。520ms後に元のmoodへ戻す。
- `transform`と`opacity`を中心に使用し、`prefers-reduced-motion: reduce`では反復モーション・口パク・瞬きを停止する。

## 7. 仮画像の差し替え・拡張

現在の仮画像は`python3 scripts/generate_chibi_parts.py`で再生成できる。同名の完成透過PNGで置き換えればcomponentコードを変えずに更新可能。

- 完成絵も512×512の同一キャンバス、同一足元anchor、alpha 0の背景にする。縁の半透明アンチエイリアスは可。
- 目・眉・口・手足の基準位置を変えず、画像端の余白を個別に除去しない。腕の回転基点も維持する。
- レイヤー順・canvas・anchor・ファイル名を変える場合はmanifest、component、CSS、テストを同時に更新する。
- 他メンバーを追加する場合は別`assetBase`に同じpart名の画像とmanifestを置き、共通`renderLayeredChibi`と`chibi.css`を使う。GameState・save schemaは変更しない。

## 確認

`pnpm typecheck`、`pnpm test`、`pnpm build`を実行する。PreviewではHOME・STORY表示、全レイヤー読み込み、mouth keyframes、troubled表情・汗、tap後のmood復帰を確認する。390×844のChromiumモバイルviewportで横はみ出しがないことを確認する。実機iPhone Safariでの操作確認は本試作環境では未実施。
