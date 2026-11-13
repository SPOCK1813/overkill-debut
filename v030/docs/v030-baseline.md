# O-VER-KiLL v0.30 基準分析（現行 v0.25相当）

## 対象・方法

- 対象リポジトリ: `/tmp/overkill-debut`
- 基準コミット: `d719279df440af13551a197a1a98dc00dda85cb6`（作業時HEADと一致）
- 基準は同一の既取得分析要約（`/home/ubuntu/overkill-v030-design.md`）を参照し、現行リポジトリ上の実ソースを行番号で再照合した。数値は指定SHAのソース基準。
- 読み取り専用で調査。ゲームコードは実行せず、ブラウザ・外部サイトにはアクセスも変更もしていない。

## 1. 読み込み順と同名上書き

`index.html` は通常のscriptタグを `data.js → story.js → game.js → v024.js → v025.js` の順に読み込む（`index.html:352–365`）。先にデータと物語をグローバルへ登録し、`game.js` の基本処理を後続パッチがグローバル関数の再代入・再宣言で上書きする構造。

具体例:

- `startBGM`: `game.js:205–235` の関数を `v024.js:103–139` で再代入。後勝ちでv0.24の音声要素選択・iOS向け処理が使われる。
- `rankOf` / `rankIndex`: `game.js:73–83` の短いランク定義を `v025.js:126–141` で長期ランク対応に置換。
- `changeStat`: `game.js:726–740` の単純clamp処理を `v025.js:329–382` が上書きし、体力は0–100、能力は1–700に分けた上でMEMBER RANK判定を追加。
- `addExp`: `game.js:742–762` はレベルアップ時に `DATA.exp.pointPerLevel` SPを加えるが、`v025.js:394–427` が上書きし、v0.25ではレベルアップSPを付けない。
- `applyTraining` / `beginTraining`: `game.js:1518–1566` の基本実装を `v024.js:393–516`、`v024.js:523–630` が置換し、結果倍率・成功判定・TP処理を加える。
- `nextWeek`: `game.js:2411–2453` を `v024.js:1247–1256` が包み、先にTPを100へ戻してから元処理を呼ぶ。

v0.24内でも後続再代入がある（例: `renderTrainingHeader` は `v024.js:158–195` と `1626`以降、`renderCommands` は `296–386` と `1657`以降、`showTrainingScene` は `637`以降、`1766`以降、`2349`以降）。実際の挙動は読込順と最後の定義に依存し、同名関数を追うときは各パッチ末尾まで確認する必要がある。

## 2. 初期状態と共有資源

**初期能力・体力**（歌唱／ダンス／MC／連携／体力）:

| メンバー | 歌唱 | ダンス | MC | 連携 | 体力 |
|---|---:|---:|---:|---:|---:|
| SARiNA | 78 | 48 | 62 | 74 | 72 |
| MiYU | 74 | 54 | 65 | 68 | 76 |
| KiLUA | 52 | 84 | 55 | 40 | 80 |
| RAiSA | 42 | 44 | 58 | 58 | 70 |

根拠: `data.js:12–69`。

**共有初期値**: 認知度（reach）10、ファン0、活動資金（cash）220,000円、OVKポイント0。メンバーはLv.1・EXP 0・SP 0。Season 1 Week 1から開始し、行動数0。根拠: `game.js:102–148`。

週は4 SEASON×8 WEEKの設計、週の行動枠3回、TP 100。根拠: `data.js:165–186`。v0.22初期状態オブジェクトには`trainingTP`がまだ無く、v0.24パッチ読込時に未設定なら100を補完する（`game.js:119–148`; `v024.js:7–14`）。プロローグ完了時にも100と週snapshotを設定する（`v024.js:1306–1327`）。

## 3. TP・行動ルールと基本行動表

- 通常活動は「残り週行動がある」「TPが足りる」「費用が足りる」の各条件を満たす場合に限る。条件不足なら何もせず戻る。根拠: `v024.js:523–616`。
- 週3行動を使い切ると通常活動を終え、Week 1は帰り道ストーリー、他週はWEEK RESULTへ向かう（後述）。休養はTP 0だが、成功判定なしで体力を回復し、通常どおり活動回数を1消費する（TP／活動表: `data.js:435–457`; 行動数・TP更新: `v024.js:570–613`）。
- STORYの台詞送りはノード保存・再描画で、行動数・TPを減らす処理はない（`game.js:607–633`）。選択肢は訓練とは別の固定ステータス効果を適用する。

| 行動 | TP | 基礎効果 | 体力 | 費用 | 基礎EXP |
|---|---:|---|---:|---:|---:|
| ダンス | 35 | ダンス+4 | −7 | 3,000円 | 35 |
| ボーカル | 35 | 歌唱+4 | −6 | 3,000円 | 35 |
| MC練習 | 25 | MC+4、連携+2 | −4 | 1,000円 | 30 |
| SNS配信 | 20 | MC+2、認知度基礎+7 | −3 | 1,000円 | 25 |
| チラシ配り | 20 | 認知度基礎+11 | −6 | 3,000円 | 25 |
| 休養 | 0 | なし | +13 | 無料 | 10 |

根拠: `data.js:335–457`。基礎能力・認知度値は結果倍率適用前。体力変化は固定値、休養にランダム判定はない。

## 4. 体力条件・成功率・倍率と計算式

体力に応じてコンディションを決める: 80以上=絶好調(best)、60–79=好調(good)、40–59=普通(normal)、20–39=不調(bad)、0–19=絶不調(worst)（`data.js:193–229`; 判定: `v024.js:21–34`）。

| 体力コンディション | 超大成功 | 大成功 | 成功 | 普通 | 失敗 |
|---|---:|---:|---:|---:|---:|
| 絶好調 | 2% | 35% | 45% | 16% | 2% |
| 好調 | 1% | 20% | 44% | 30% | 5% |
| 普通 | 1% | 10% | 34% | 45% | 10% |
| 不調 | 1% | 5% | 19% | 50% | 25% |
| 絶不調 | 1% | 2% | 7% | 40% | 50% |

根拠: `data.js:287–328`。`rollTrainingOutcome`は`Math.random()*100`を閾値累積で振り分ける（`v024.js:41–72`）。

| 結果 | 能力・認知度倍率 | EXP倍率 |
|---|---:|---:|
| 超大成功 | 1.75 | 1.45 |
| 大成功 | 1.40 | 1.25 |
| 成功 | 1.10 | 1.10 |
| 普通 | 0.80 | 0.90 |
| 失敗 | 0.20 | 0.55 |

根拠: `data.js:236–271`。適用式（結果倍率を `m`、EXP倍率を `e` とする）:

- 主能力: `max(0, round(基礎能力gain × 1.5 × m))`。連携ボーナスも同じ式（`v024.js:403–449`）。反映先は`changeStat`で能力1–700にclamp（`v025.js:329–382`）。
- 認知度: `max(1, round(基礎reach × m))`を共有reachに加算（`v024.js:461–475`）。SNS／チラシのファン増分は`max(1, floor(実際のreach増分 / 4))`（`v024.js:477–489`）。
- EXP: `max(1, round(基礎EXP × 1.6 × e))`（`v024.js:500–513`）。必要EXPは`100 + (Lv−1)×35`で、必要値を超える限り差し引いてレベルを上げる（`data.js:154–158`; `game.js:85–90`; `v025.js:394–427`）。v0.25ではレベルアップだけではSPを付与しない（`v025.js:385–427`）。
- 体力は行動定義の固定値を適用し、結果倍率による増減なし（`v024.js:452–458`）。資金は行動費を加算し0円を下限にclamp（`v024.js:492–498`）。

## 5. Week 1冒頭の四択と固定効果

選択肢は「KiLUAに教える（teach）」「8カウントずつ4人で確認（split）」「本番速度で通す（push）」「休憩して話す（talk）」の4つ（`story.js:354–397`）。`applyDecision`が固定効果を直ちに全対象メンバーへ適用する（`game.js:769–848`）。

| 選択 | 効果（体力・EXPを含む） |
|---|---|
| teach | KiLUA: MC+5、連携+6、ダンス+3、体力−5、EXP+45。他3人: ダンス+3、連携+2、体力−5、EXP+25。 |
| split | 4人全員: ダンス+4、連携+3、体力−6、EXP+30。 |
| push | 4人全員: 体力−11、連携−2、EXP+35。ダンスはKiLUA+4、他3人+6。 |
| talk | 4人全員: 連携+4、MC+2、ダンス+1、体力+2、EXP+25。 |

これはTRAININGの乱数結果・1.5倍・成功倍率を通さない固定効果。能力は最終的にv0.25のclampを受ける。新しい`addExp`が読込済みのため、Week 1選択肢によるレベルアップもv0.25規則（レベルSPなし）となる。

## 6. 週末ストーリー、WEEK RESULT、次週

- 初回プロローグは5段落で、完了するとWeek 1開始ノードへ進む（`story.js:14–49`; `v024.js:1306–1329`）。Week 1冒頭の会話・四択を経てトレーニングへ入る（`story.js:56–64`, `story.js:354–397`, `story.js:614–628`）。
- Week 1の3行動後は`w1_after_training`から帰り道の会話4ノード、続いて`w1_end_01`〜`w1_end_05`の週末会話へ進み、`w1_complete`でWEEK RESULTを呼ぶ（`game.js:2098–2127`; `v025.js:1612–1657`; `story.js:635–769`; `v025.js:1028–1052`）。STORYを進めるときはHOME経由。Week 1以外で3行動を使い切ると直接WEEK RESULTへ（同上）。
- WEEK RESULTは週開始snapshotと比較して認知度・ファン・活動資金・メンバーごとの能力差、体力・Lv等を表示し、Week 1では3つのミッションを評価する（`game.js:2179–2404`）。ミッションはダンス平均45以上、連携平均45以上、全員体力40以上（`data.js:464–489`; 判定: `game.js:2161–2176`）。
- 「次週へ」は行動数を0、選択メンバーと週snapshotを初期化し、週を進める。Season内Week 8の次はWeek 1、Seasonが4未満ならSeason+1。v0.24 wrapperがTPを100に戻す（`game.js:2411–2453`; `v024.js:1247–1256`）。Week 1の後にSeason 1 Week 2ストーリーを開始するが、その他の新しい週は基本的に訓練へ直行する。
- 要注意: Week 3以降にストーリー定義はなく、Season 2–4は既存ストーリー開始分岐の対象外。さらにSeason 4 Week 8後の現行ロジックは`week=1`へ戻す一方、Seasonは4のまま。終端・エンディング処理がない（`game.js:2416–2453`）。

## 7. localStorageと世代別save fields

- v0.22のlocalStorageキーは`overkill_manager_v22`。`game.js:10`で定義し、`loadState`が読む（`game.js:151–172`）。新規状態には`version`, `started`, `prologueSeen`, `season`, `week`, `node`, `reach`, `fans`, `cash`, `ovkPoints`, `members`, `actionsUsed`, `selectedMember`, `weekSnapshot`, `pendingStoryNext`, `collection`, `achievements`, `clearHistory`等がある（`game.js:119–148`）。
- v0.23/TPパッチ: `trainingTP`がない保存に週TP上限を補完し、`version`を`0.23`にして保存（`v024.js:7–14`）。後続の同ファイルでversionを`0.24`に更新（`v024.js:1468–1476`）。データ定義自体は`data.js`の`version: "0.23"`（`data.js:1–4`）。
- v0.25: `version: "0.25"`（`v025.js:13–18`）、一回限りのmigration marker `v025Migrated`、各メンバーの`rankBonusClaimed`（初期時点のMEMBER RANK tier）と`rankHistory`を追加・初期化（`v025.js:185–229`）。rank up時に`rankNotices`配列へ通知を追加（`v025.js:291–319`）。これらのほか`members[].sp`を利用する。
- 重要な移行挙動: 初回`v025Migrated`未設定時に全員の`sp`を0へリセットしてからmigration済みにする（`v025.js:188–229`）。過去セーブのSPがあっても一度目のv0.25ロードで消える実装であり、既存SPを保全する移行ではない。
- 旧キーから新キーへの別保存やschemaVersionは現行コードにはない。壊れたJSONまたは`members`欠損時は初期状態へ戻す（`game.js:151–169`）。保存キーを保持して状態を安全に検証・移行する仕組みを追加する際の要確認点。

## 8. v0.25 MEMBER RANKとSP報酬

能力値を1–700に丸め・clampし、100刻みでE/D/C/B/A/S/SS各1–100に表示する。MEMBER RANKは歌唱・ダンス・MC・連携4値の算術平均を四捨五入して同じランク関数へ渡す。体力は対象外（`v025.js:69–117`, `148–181`）。昇格SPはE→D=3、D→C=4、C→B=5、B→A=6、A→S=8、S→SS=10（`v025.js:43–62`）。

通常の`changeStat`は能力を更新後に`checkMemberRankUp`を呼び、未報酬tierを越えた分のSPを合計し、`rankBonusClaimed`・履歴・通知を更新（`v025.js:329–382`, `239–320`）。一方、SP配分は1SPを選択能力+1に直接加え、`checkMemberRankUp`を呼ばない（`v025.js:430–494`）。したがってSP配分操作そのものでは即時SP報酬は発生しない。

**実装上の注意／仕様差**: SPによるランク越え時に`rankBonusClaimed`を越えたtierまで進める処理はこのソースにはない。SP配分後も`rankBonusClaimed`が古いtierのままなので、その後の通常訓練などが`changeStat`を呼ぶと、既にSPで越えたtierを`checkMemberRankUp`が報酬対象として遡及計上し得る（`v025.js:253–320`, `329–382`, `437–494`）。よって「SP昇格ではSP報酬を再付与しない」は即時付与を避ける点のみ実装され、報酬済み境界を前進させる完全な抑止は不足している。

## 9. 画像・音声・物語アセット在庫

| 種別 | 実在ファイル／定義 | 判定・用途 |
|---|---|---|
| キャラクター立ち絵 | SARiNA／MiYU／KiLUA／RAiSA × normal, smile, angry, troubled, cry（合計20 PNG） | `data.js:76–109`が全て参照。 |
| 背景 | 実在: `bg-studio.png`, `bg-backstage.png`, `bg-stream.png`, `bg-street-night.png`, `bg-livehouse.png`, `bg-outdoor.png` | `data.js:116–125`。storyはstudio/manager/night/snsを使う。 |
| 欠落背景 | `bg-manager.png`, `bg-street.png` | `data.js:117`, `121`の参照ファイルはリポジトリ内にない。v0.24がmanager→`bg-backstage.png`、city→`bg-street-night.png`へ再代入する（`v024.js:2319–2341`）。同ファイルの先行fallback city→`bg-outdoor.png`（`v024.js:1479–1487`）は後段でstreet-nightに上書きされる。 |
| 表紙・タイトル／ライブ画像 | `debut-live.webp` | HTMLとCSSで参照（`index.html:71–77`; `style.css:234`, `2791`）。 |
| 音声 | `akunaki-kodou.mp3` | HTMLのaudio sourceおよびJSでBGMとして参照（`index.html:335–349`; `game.js:203–235`; v0.24差替え: `v024.js:103–139`）。 |
| 物語 | `story.js` | プロローグ5段落（`story.js:14–49`）、Week 1開始・四択・訓練導入・帰り道・週末ノード（`story.js:56–769`）、Week 2開始とSNS導入・訓練入口（`story.js:772–863`）。story背景キーはmanager/studio/night/sns。 |

在庫確認対象のルート実ファイルはPNG 26点（うち20点がキャラ、背景6点）、WebP 1点、MP3 1点。`debut-live.webp`とBGMはindexから利用される。キャラ画像参照は全て存在。欠落は宣言上のmanager/street背景で、v0.24 fallbackが対応。

## 10. スマホCSS上の懸念

- `index.html:6–9`は`viewport-fit=cover`。CSSに`safe-area-inset-top/bottom`変数がある（`style.css:7–15`）ほか、一部ヘッダーや画面のpaddingに使用（例: `style.css:500–511`, `1415–1417`, `1738–1740`, `2857`以降）。しかし、safe-area対応は画面全域で一貫しているとは限らず、実機確認が必要。
- `body{overflow:hidden}`（`style.css:39–42`）に加え、各`.screen`は`position:fixed; height:100dvh; overflow:hidden`（`style.css:63–70`）。story/長文結果の内容が高さを超えたとき、画面自身のスクロールへ逃げられず、子要素側のスクロール指定がない画面では文・ボタンが切れる懸念がある。
- 文字サイズに7–9px指定が多数存在（例: `style.css:528–536`, `813–815`, `938–940`, `1229–1245`, `2228–2229`, `2680–2688`, `2868–2875`）。小さい端末で補助文字・ラベルが判読しにくい。週結果/ホームの情報密度、画面下端のsafe-areaと操作ボタンの重なりも確認対象。

## 11. 未実装・今後の対象

- データ上は4×8=32週（`data.js:165–186`）だが、`story.js:56–71`にはWeek 1・2しかなく、Week 3–32の週別ストーリー、分岐・週末エピソードは未定義。週末WEEK RESULT後の実装済み物語もWeek 1中心。
- Week 1以外はWEEK MISSION定義がなく、`game.js:2188–2191`ではWeek 1以外のミッション配列を空にする。ACTIVITY、LIVE、MISSION、ROOMもv0.25 HOMEに入口／Coming Soon表示・toastがあるだけ（`v025.js:1078–1123`）。
- 4シーズン目Week 8の先に終端・エンディングがない（`game.js:2416–2453`）。全32週コンテンツ拡張、週末イベント、他モード、終端処理は後続実装に残る。
