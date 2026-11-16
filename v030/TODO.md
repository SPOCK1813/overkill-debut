# v0.30 実装TODO

## [x] 1. 現行版の基準仕様・アセット移行マップ

- 現行 `index.html` のscript順 `data.js → story.js → game.js → v024.js → v025.js`、同名関数の上書き箇所、初期値、訓練コマンド、条件別成功率、ストーリー分岐、週結果、保存フィールドを `docs/v030-baseline.md` に記録する。
- 4人の初期値は、歌唱／ダンス／MC／連携／体力の順にSARiNA 78/48/62/74/72、MiYU 74/54/65/68/76、KiLUA 52/84/55/40/80、RAiSA 42/44/58/58/70。共有初期値は認知度10、ファン0、活動資金220,000円、OVKポイント0とする。
- 既存のキャラクター画像、背景、BGM、プロローグ、ストーリー、訓練演出、週間結果、コンディション、ランダム成功判定を可能な限り再利用し、参照先が存在するかを一覧化する。欠落背景を使う場合は対応する既存ファイルへのfallbackをmanifestで記録する。
- 現行基本行動はダンス35TP/歌唱+4/体力−7/費用3,000円/EXP35、ボーカル35TP/歌唱+4/体力−6/費用3,000円/EXP35、MC25TP/MC+4・連携+2/体力−4/費用1,000円/EXP30、SNS20TP/MC+2/認知度基礎+7/体力−3/費用1,000円/EXP25、チラシ20TP/認知度基礎+11/体力−6/費用3,000円/EXP25、休養0TP/体力+13/無料/EXP10である。

## [x] 2. 型付きGameStateとdomain進行・育成処理

- 全4SEASON×8WEEKを保持し、週開始時に自由行動3回・TP100と週snapshotを用意する。TPコストと残行動の両方を検証し、失敗した操作は状態を変えない。休養はTP0でも行動回数を1回消費する。各行動後は結果確定後にHOMEへ戻す。3行動後は通常行動を拒否し、週末ストーリー（定義がある場合）／WEEK RESULT／次週移行へ進む。STORY閲覧自体はTP・行動数を消費しない。
- 能力は歌唱・ダンス・MC・連携を内部値1〜700とし、ランクをE1〜E100、D1〜D100、C1〜C100、B1〜B100、A1〜A100、S1〜S100、SS1〜SS100で表示する。体力は0〜100でランクを付けない。MEMBER RANKは4能力平均の四捨五入値から共通rank関数で算出する。
- 昇格SPはE→D +3、D→C +4、C→B +5、B→A +6、A→S +8、S→SS +10。1SPずつ歌唱・ダンス・MC・連携へ配分する。SPでランク境界を越えた場合は昇格SPを付与せず、その境界を報酬済みとして進め、後続通常成長でも同じ境界のSPを再取得しない。
- 旧版の条件別ランダム成功判定・結果倍率・コンディションをデータとして移し、乱数を注入可能にする。既存計算式の能力・EXP・体力・認知度・ファン・資金変化とレベルアップを維持し、確定したOutcomeを行動記録へ保存する。
- 同一ActionRecord ID／StoryEffect IDの二重適用を拒否し、状態と結果を保存してから演出を再生する。乱数抽選を演出時に再実行しない。

## [x] 3. SaveRepositoryと既存セーブ移行

- 新しいlocalStorageキー `overkill_manager_v030` と最上位 `schemaVersion` / `gameVersion:"0.30"` を導入する。既存キー `overkill_manager_v22` は削除・上書きしない。
- 新キーがあればschema検証・必要なmigrationを行う。新キーがなければ旧キーを変換し、検証と新キー保存が成功してからゲームを開始する。JSON破損、未知schema、書込失敗では新規データで黙って上書きしない。
- season/week/node/started/prologueSeen/actionsUsed/trainingTP/reach/fans/cash/ovkPoints/members.level/exp/sp/stats/weekSnapshot/rankBonusClaimed/rankHistory/rankNotices/v025Migrated/collection/achievements/clearHistory等を可能な限り保持する。能力・体力・EXP・行動・TPの範囲を検証する。旧セーブのSPを再初期化せず、移行読込でSPを再付与しない。
- 新キーへ移行後に再読込しても進行・能力・SP・結果が一致し、旧キーが保持される。

## [x] 4. HOME・主要ナビ・最小1WEEKプレイ

- HOMEからSTORY / TRAINING / ACTIVITY / LIVE / MEMBER / MISSION / ROOMへ移動できる。HOMEにはSEASON/WEEK、残り行動数、残りTP、活動資金、認知度、ファン数、4人のコンディション、メンバーランクを表示する。
- TitleからNEW GAME/CONTINUEへ進み、既存プロローグを見た後HOMEに到着できる。STORYは行動枠を消費せずに開閉・読み返しでき、Week 1の既存主要ストーリーと選択肢効果を再利用できる。
- TRAININGで対象メンバーと行動を選択し、各行動の結果・能力・体力・EXP・TP・cash・reach・fans・ランク・SPを一度だけ確定して保存し、演出後HOMEへ戻れる。
- 3行動後のWeek 1週末ストーリーとWEEK RESULT、結果確定後の次週処理を行える。週末ストーリーがない週はWEEK RESULTへ進める。週8→次Season Week1の境界をdomainで扱う。開始Storyがある次週は自動表示する。オープニングStoryが未読・途中の場合もカーソルを保持して再開し、完了後に週末Storyへ進める。
- Week1ミッションは表示文言を達成閾値45/40と一致させ、既存target・達成判定を変更しない。
- ACTIVITY/LIVE/MISSION/ROOMの完全機能はこの実装範囲に含めず、HOME上の入口は設けて未実装であることを分かるようにする。

## [x] 5. iPhone Safari向け共通レイアウト

- 縦画面を基本とし、`safe-area-inset-*`を考慮する。主要操作は44px以上を目標にし、本文16px以上・補助文字12px以上を基準とする。旧版CSSにある7〜9pxの表示を移植しない。
- HOMEと長いSTORY/RESULTの縦スクロールを可能にし、操作・フッターがsafe-areaやSafari表示領域に隠れないようにする。タップ可能/不可と行動不足の理由を判読可能にする。390×844のiPhone相当viewportでChromium描画を確認した。実機iPhone Safariでの操作確認は本タスク環境では未実施。
- 既存の暗い配色・キャラクター画像・背景・BGM・ロゴ表記を再利用し、iOSでユーザー操作後に音声を開始し、`prefers-reduced-motion`に対応する。

## [x] 6. 現行版対Previewの同条件1WEEK比較

- 現行版とv0.30 Preview版をそれぞれ新規セーブ（共有OVKポイント0）で開始し、Week 1 Storyの同じ選択肢 `split` と同じ乱数ロール列を使う。SARiNAのダンス35TP → MiYUのボーカル35TP → KiLUAのSNS20TPを同じ順に実行し、3行動・TP90消費・TP10残の週末、WEEK RESULT、「次週へ」後のSeason 1 Week 2を比較する。
- 比較表に初期ステータス、各行動のTP消費と残行動、能力変化、体力変化、EXP/level、各能力とMEMBER RANK、SP、WEEK RESULT（認知度・ファン・cash・各メンバー・ミッション）、次週のSeason/Week/TP/残行動を記録する。
- すべての差を「仕様として意図した差」「不具合」「判定保留」に分ける。ランダム結果を両版で固定できない場合は、乱数条件を開示し、実測値の差と計算式/仕様の差を混同しない。結果を `docs/v030-week-comparison.md` として保存する。

## [x] 7. ちびSARiNAのパーツ分けアニメ最小試作（placeholder限定）

- 4人全員ではなくSARiNA 1人だけを対象にする。静止画の差し替え、GIF、動画ベタ貼りではなく、重ねたパーツPNGをCSS/JavaScriptで動かす。
- 必要パーツ名は `body`, `head_base`, `hair_back`, `hair_front`, `eye_left_open`, `eye_right_open`, `eye_left_closed`, `eye_right_closed`, `brow_normal`, `brow_happy`, `brow_troubled`, `mouth_1`, `mouth_2`, `mouth_3`, `mouth_smile`, `mouth_troubled`, `arm_left`, `arm_right`, `effect_sweat` とする。必要に応じ `effect_sparkle` はhappy用に追加できる。
- 全パーツは透過PNG、同一キャンバスサイズ、同一基準位置とし、同名素材の差し替えでズレない。ファイル名一覧、レイヤー順、アンカー位置、fallback/差し替え方針を設計資料に記録する。
- `idle`は小さな上下呼吸と時々のまばたき、`talk`はmouth_1〜3を切り替える口パクと軽い揺れ、`happy`は小さく跳ねる笑顔と任意のキラッとする反応、`troubled`は少し縮こまり困り眉と汗マーク、tapは軽い拡大またはぴょこっとした反応を行う。
- HomeではSARiNAの表示にidle/conditionに応じたhappyまたはtroubledとtap反応を使う。会話・STORYではSARiNAの台詞でtalk、happy/troubledの表情を切り替える。他メンバーの既存表示は変えない。
- 現在の自動生成SARiNAパーツはデザイン確認用のplaceholderであり、既存SARiNAと異なるため本番素材として採用しない。画像は削除せずPreview専用に保持し、正式素材が承認されるまで本番・リリースに使用しない。新しいキャラクターデザインは作らず、既存ゲーム内素材を基準にする。
- アニメと入力はiPhone Safariで軽く動き、タップしやすい領域、`prefers-reduced-motion`対応、HOME/STORY以外への無関係な変更なしを満たす。仮画像がなくてもcomponent・asset manifestを通して同じ座標のPNGへ置き換えられる構成とする。
- `SarinaChibi` componentのmarkup/mood API、layer manifest、PNG資産、描画元、Story/Home組込み、animation制御、差し替え説明をv0.30へ追加し、GitHubでは既存 `feature/v030-phase1-4` のみ更新する。mainと現行公開URLは変更しない。

## [x] 8. 既存SARiNAデザインを守る本番素材分割仕様

- 基準はゲームで実際に使う `public/assets/characters/sarina_normal.png` と表情差分の `sarina_smile.png` / `sarina_angry.png` / `sarina_troubled.png` / `sarina_cry.png`（各1024×1536 RGBA）とする。リポジトリに独立したちびPNGやPSD/CLIP等のレイヤー原画は見つからないため、その制約を明記する。
- `LayeredChibi`、manifest構造、idle/talk/happy/troubled/tapReaction、HOME/STORYへの組込みは維持する。現在の自動生成PNGは削除せずplaceholderと明記し、本番・リリースには使わない。
- 顔・髪型・衣装・色・頭身・線を新規デザインへ置き換えず、normalを全身基準、他表情を顔パーツの参考にする。緑担当色は既存UI色 `#69e09a` を維持し、元絵に確認できない緑の衣装・髪アクセサリーを追加しない。
- 既存実装の差替え契約を維持するため、同名20 PNGを512×512 RGBAで用意する。元絵1024×1536を一様に1/3縮小して512×512キャンバス中央へ置き、全レイヤー共通の座標変換と足元基準 `(256,512)` を使う。元絵を正方形へ縦横別々に伸縮しない。
- `docs/sarina-chibi-material-spec.md` に参照元、SHA-256、各partの切り出し元、座標・alpha・線画・緑アクセントの規則、素材品質確認、レイヤー原画がない場合の限界を記録する。今回この仕様を作り、実素材の描画・分割やゲームコード変更は行わない。

## [x] 9. HOMEをSARiNA 1人のGame Feelハブにする

- 初回表示でタイトルや長いプロローグを挟まずiPhone縦画面向けHOMEを表示する。
- HOMEに「SEASON 1」「WEEK 1」「残り行動 3」「TP 100」「ファン」「認知度」「活動資金」「SARiNA」を表示する。
- 操作はSTORY / TRAINING / MEMBERに限定し、別メンバーや後続機能の新画面をこの試作で実装しない。
- 黒ベース・暗め・緑アクセントの地下アイドル/ライブハウス風で、ゲームらしいパネルと余白を使う。画面はiPhone縦画面とsafe-areaを優先し、本文は読める大きさ、主要タップ領域は44px以上を目標にする。

## [x] 10. STORYをSARiNA会話の短い一往復にする

- HOMEからSTORYを押すとSARiNAが会話する。会話中は口パクし、キャラクターは静止せず軽い呼吸/揺れを続ける。
- NEXTを押すとHOMEに戻る。STORYの表示・終了では行動数とTPを消費しない。
- 使用する会話は既存Week 1のSARiNA台詞など、現行ゲーム資産を優先して再利用する。

## [x] 11. TRAININGからダンス成功・成長をHOMEへ返す

- HOMEからTRAININGを押し、SARiNAを選択し、ダンスを選べる。
- ダンスを確定すると成功演出を一度表示し、SARiNAがhappyになって小さく跳ね、ダンス能力が少し増える。
- TP・行動回数・能力変化を反映して保存し、結果からHOMEへ戻る。表示された増加数と保存状態を一致させる。
- 週初期値は残り行動3・TP100。既存TRAINING/domain/save APIを使い、試作専用に計算式や長期育成バランスを変更しない。

## [x] 12. キャラクターmotionと仮素材を明確に扱う

- SARiNA表示に、待機中の小さな呼吸、自然なまばたき、会話口パク、時々の軽い揺れ、タップ時の小さな跳ね、嬉しい時の笑顔を用意する。
- ボタンを押した時に少し沈み、数字が増えた時に短くpopし、画面遷移は滑らかにして紙芝居感を弱める。動きは派手すぎない。
- 既存のLayeredChibi / manifest / animation APIを維持し、placeholder素材は仮ビジュアルと画面・manifestで明示する。仮キャラクターを正式SARiNAデザインとして固定せず、後から既存SARiNA画像/正式パーツへ交換しやすくする。元の完成全身絵は変更しない。
- `prefers-reduced-motion`を尊重し、iPhone Safariで軽く動くCSS transform/opacity中心の構成とする。
