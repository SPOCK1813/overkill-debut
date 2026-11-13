# ちびSARiNA パーツ仕様（v0.30試作）

## 1. 実装方針と対象

今回はSARiNA 1人だけを試作する。GIF・動画・Canvasで一枚絵を置き換える方式ではなく、透過PNGを同じ座標に重ねるCSSアニメーションとする。`LayeredChibi`、manifest、idle/talk/happy/troubled/tapReaction、HOME/STORYへの組込みは維持する。現在の自動生成PNGは見た目のplaceholderであり、SARiNAの完成デザインや本番素材ではない。既存ゲーム内のSARiNA絵をそのまま基準に分割する素材仕様は [sarina-chibi-material-spec.md](./sarina-chibi-material-spec.md) に記載する。

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
| `hair_front.png` | 前髪・顔前の毛束。元画像にない髪飾りや緑装飾は追加しない |
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
| `effect_sparkle.png` | 互換用effectレイヤー。既存の公式素材が指定されない限り、本番PNGは透明にする |
| `manifest.json` | canvas、anchor、partsの奥→手前順 |

## 4. キャンバス・基準位置・レイヤー順

現在のPNGは**512×512px、RGBA、背景alpha 0のplaceholder**である。足元アンカー `(256,512)` と `headCenter: (256,192)` は仮素材の参考値で、正式絵の位置・頭身を決める基準ではない。正式素材も同じ512×512契約を保ち、1024×1536の既存絵を縦横別々に伸縮せず一様に1/3縮小して正方形キャンバス中央へ配置する。全レイヤーはこの同じ変換で重ね、個別crop・trim・リサイズ・CSS位置調整を行わない。詳細は [SARiNA素材仕様書](./sarina-chibi-material-spec.md) を参照。

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
- **happy:** 1.35秒周期で小さく跳ね、左右の腕を少しずつずらして振る。CSSはsparkleレイヤーも切り替えるが、既存の正式演出素材が指定されない限り本番PNGは透明にして新しい星を描かない。
- **troubled:** 1.8秒周期で控えめに縮こまり、困り眉・困り口・汗レイヤーを表示。
- **tap:** happyへ一時切替し、約420msのぴょこっとした反応を一度再生。520ms後に元のmoodへ戻す。tap演出も新しいキャラクター装飾を追加せず、全身の動きで表現する。
- `transform`と`opacity`を中心に使用し、`prefers-reduced-motion: reduce`では反復モーション・口パク・瞬きを停止する。

## 7. 仮画像の差し替え・拡張

現在のPNGは`python3 scripts/generate_chibi_parts.py`で再生成できるPreview専用placeholderであり、本番・リリースには使用しない。同名の承認済み透過PNGで置き換えればcomponentコードを変えずに更新可能。具体的な既存絵の参照元、比率を維持する座標変換、各パーツの切り分け元は [SARiNA素材仕様書](./sarina-chibi-material-spec.md) を参照する。

- placeholderでは512×512の同一キャンバス、同一足元anchor、alpha 0の背景を使用する。完成素材の制作時も、同じパス・ファイル名・512×512契約を保ち、元絵の2:3比率を一様縮小して配置する。縁の半透明アンチエイリアスは可。
- 目・眉・口・手足の基準位置を変えず、画像端の余白を個別に除去しない。腕の回転基点も維持する。
- レイヤー順・canvas・anchor・ファイル名を変える場合はmanifest、component、CSS、テストを同時に更新する。
- 他メンバーを追加する場合は別`assetBase`に同じpart名の画像とmanifestを置き、共通`renderLayeredChibi`と`chibi.css`を使う。GameState・save schemaは変更しない。

## 確認

`pnpm typecheck`、`pnpm test`、`pnpm build`を実行する。PreviewではHOME・STORY表示、全レイヤー読み込み、mouth keyframes、troubled表情・汗、tap後のmood復帰を確認する。390×844のChromiumモバイルviewportで横はみ出しがないことを確認する。実機iPhone Safariでの操作確認は本試作環境では未実施。
