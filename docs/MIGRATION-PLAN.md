# Manifelator：GitHub Pages移行計画（リポジトリ確定版・第3版）

作成・更新日：2026-11-05（日本時間）
確定owner：`codeforhodogaya`（既存Organization）
確定リポジトリ：`codeforhodogaya/manifelator-yokohama`（Public・作成済み・main・READMEあり）
想定Pages URL：`https://codeforhodogaya.github.io/manifelator-yokohama/`（規則上の想定。公開・到達確認は未実施）
対象：β0.35.0、保存版91、ソースコミット `fc424b9dcd6b245617e7164d8cf8dc52b6965fdb`
状態：リポジトリはSさんが作成済み。Pages用抽出スクリプト・workflow準備版と配置一覧を作成。互換改修、GitHubへのソース配置、Pages公開、Workers/D1移設は未実施。

## 1. 方針と確認済み事項

最初の到達点は、ChatGPTアカウントなしで、公式データの検索、政策の作成・編集、試算、可視化、LOD出力を試せる静的体験版をGitHub Pagesに公開すること。サーバー機能の移行完了は初回公開の条件にしない。既存の限定公開Sites版は検証用として維持する。

確認済みの根拠は、上記コミットのソースと公式文書。移設後の実動作を確認したという意味ではない。

- `dist/`にブラウザ用アプリ、固定データ、ライブラリ、メディアがある。政策・設定・保存版・試算の保存はブラウザ内。
- `worker/index.mjs`がURL取込、活動、対話、台帳、SPARQL、GitHub連携のAPIを振り分ける。`.openai/hosting.json`はD1の`DB`バインディングを指定。
- APIではSitesが付与する利用者ID等を参照する。別ホストでその認証が自動的に使えるわけではない。
- AIの自動生成・自動評価APIは未接続。現在のAI関連は、外部AIへ渡す資料・プロンプト作成と回答の手動取込が中心。「自前AI方式」は既存の方式を明確にする方向で進められる。
- `GITHUB_SETUP.md`は利用者の政策LODを別の公開先へ送る連携の説明。アプリ本体のPages設定とは別。公開先未設定は利用者側でも確認済み。
- `dist/municipality.js`のカタログ・語彙基準URLは現Sitesを指す。`/maps/`、`/citizens/`、`/api/...`などのルート起点参照がある。
- `npm run build`はWorkers用の`dist/server/`、静的コピーの`dist/client/`、配信用設定等も生成する。出力全体をPagesへ上げる構成にはしない。
- 完全版の取得元には動画26本、OCR関連WASM7ファイル・辞書2ファイル・PDF CMapsが存在する。配布用の設置ZIP・軽量ZIPとは内容が異なる。
- 依存関係の固定ファイルは`pnpm-lock.yaml`。`package-lock.json`は元ソースに存在しない。

応募期間は2027-01-05まで。規定5は応募期間中および2027-03-31までのインターネットからのアクセス又はダウンロードを求める。規定8では締切日時点の作品が審査対象。締切後の機能追加が審査対象になるとは扱わない。[S1]

## 2. リポジトリ・配信物の構成案

アプリ本体は、GitHub上の1リポジトリでソースを管理し、Actionsで静的ファイルだけを抽出した`_site/`をPagesへ配信する。`docs/`への手動複製や別の配信用ブランチは、初期の標準構成にしない。修正箇所を一つにし、誤ってサーバー用成果物まで公開することを防ぐ。

| パス | 役割 | Pagesへの配信 |
|---|---|---|
| `dist/` | 既存のブラウザ用コード・固定データ・完全な実行用アセット | 必要な静的ファイルのみ抽出 |
| `worker/` | 後段で判断するAPI実装 | 配信しない |
| `db/`・`drizzle/` | DB定義・マイグレーション | 配信しない |
| `scripts/`・`tests/` | 開発・ビルド・検証 | 配信しない |
| `docs/` | 移行計画、運用・応募資料（新設予定） | 必要な利用者向け文書のみ |
| `.github/workflows/pages.yml` | Pages公開ワークフロー（新設予定） | 実行設定のみ |
| `scripts/build-pages.mjs` | Pages用抽出・参照検査（新設予定） | 配信しない |
| `_site/` | Pages公開専用の生成物。Git管理対象外 | このディレクトリだけ配信 |
| 設定・ライセンス・固定ファイル | `package.json`、`pnpm-lock.yaml`、LICENSE等 | LICENSE・再配布表示等を必要に応じて配信 |

所有者は`codeforhodogaya`、リポジトリは`codeforhodogaya/manifelator-yokohama`に確定した。横展開に備えて横浜版を名前で識別する利用者決定を採用する。画面・出力データの`YOKOHAMA-SHIGI`は維持する。GitHubプラグインでPublic、既定ブランチmain、READMEの存在を確認した。取得時点でhas_pagesはfalseだった。想定Pages URLは`https://codeforhodogaya.github.io/manifelator-yokohama/`で、到達性は未確認。Organizationトップ用リポジトリは変更しない。

将来の「利用者の政策をGitHubへ公開する機能」は、アプリ本体とは別のデータ公開リポジトリを使う。今回はそのGitHub Appや鍵の設定を行わず、アプリ本体のActions公開にも流用しない。

## 3. Pagesへ初回公開する手順

### P0-1：完全版の基準を固定する

上記コミットを基準にし、完全版のファイル一覧・ハッシュを保管する。軽量版だけで完全動作を判定しない。移行前の政策はJSONバックアップを取得する。新URLのブラウザ保存領域には自動移行されないため、移行後は利用者が読み込む。

### P0-2：アセットを揃える

完全版`dist/`のコード・JSON/JSON-LD/Turtle/CSV・CSS・JSを使用する。PDF/OCRを公開機能に含める場合、WASM、辞書、CMaps、必要フォント、ライブラリとライセンス表示も揃える。

不足する読取用アセットは、固定されたNode/pnpm環境で`pnpm install --frozen-lockfile`後、既存の`node scripts/build-import-assets.mjs`で再生成する。依存関係を無断で最新版へ更新しない。公開先でWASMや辞書を実際に読み込めるかは別途確認する。

説明動画は完全版のアセットから配置し、再生できるものだけ掲載する。初回公開までに揃わなければ該当する再生導線を非表示にする。軽量ZIPの欠落をリンク切れのまま公開しない。動画の再取得・転載可否を一括して確認済みとは扱わない。

### P0-3：Pages用の設定と表示を整える

新設する公開プロファイルで静的版であること、基底パス、公開データの基準URL、利用可能機能を一元管理する。これは改修案であり、現在すでに実装済みの設定ではない。

- `/manifelator-yokohama/`配下で動くよう、画面リンク・アセット参照を確認する。ルート起点のリンクを機械的に一括置換せず、APIと通常ページを分けて修正する。
- サーバー依存画面・ボタンは静的版では非表示、又は明示した読取専用デモにする。通常操作で存在しない`/api/`を呼ばないことを合格条件とする。
- 自前AIの導線は「資料・プロンプトを出力→利用者のAIへ手動で渡す→原文・出典と照合→取込」と表示する。直接分析する内蔵AIがあるような名称にしない。
- LODの新しい公開基準URLを決め、カタログ・語彙・HTML・JSON-LD・Turtle・CSV・配布メタデータを揃える。既存の政策ID・自治体コード・バックアップ形式は保つ。過去のURIは対応表を残し、所有していない旧ホストの転送ができるとは約束しない。
- URIはPagesで実際に取得できるHTMLと明示的なデータファイルへ解決させる。現Workerが処理する拡張子なしURIや内容交渉がPagesでも動くとは仮定しない。

### P0-4：静的ファイルを抽出する

`scripts/build-pages.mjs`を新設し、完全版`dist/`から`_site/`を生成する。`dist/client/`、`dist/server/`、`.openai/`、`.git/`、`node_modules/`、実行時環境ファイル、既成の再帰的な配布ZIPは配信物へ入れない。公開対象アセットとライセンス表示は許可リストで抽出する。

Worker用の既存ビルドをそのままPages公開ワークフローの唯一のビルドとして使わない。LOD再生成が必要な場合は公開プロファイルを確定し、既存の`node scripts/build-open-data.mjs`を実行する。参照切れ、基底パス、外部Sitesへの依存、公開物への秘密情報混入を検査する。

### P0-5：GitHub Pagesを設定する

Publicリポジトリ`codeforhodogaya/manifelator-yokohama`はSさんが作成済み。既存READMEと履歴を保持し、main起点の移行ブランチへ完全版ソースを配置する。管理権限でリポジトリのSettings→Pages→Build and deploymentのSourceをGitHub Actionsへ設定する。これはGitHub公式文書に基づく手順で、今回このアカウントで操作済みという意味ではない。[S2]

Actionsは「ソース取得→固定環境の準備→Pages用抽出→検査→Pages artifactアップロード→デプロイ」とする。配信対象は`_site/`だけ。権限は`contents: read`、配信ジョブに`pages: write`と`id-token: write`を設定し、`github-pages`環境を使う。Actionの版は実装時に公式文書を確認し、検証した版に固定する。[S3]

本体ホスティングのために利用者政策公開用GitHub Appの秘密鍵は不要。初回は手動実行で公開を確認し、その後mainへの承認済み変更で再配信する。独自のアップロード工程ではJekyllを使わない。ブランチ配信へ切り替える場合は`.nojekyll`等を含め別途設定する。

### P0-6：公開URLで受入試験を行う

Actionsの成功だけで完了にしない。GitHubが表示した実URLを記録し、サインインしていないブラウザから次を検証する。HTTPSと、相対パスを含む直接アクセス・再読み込みも確認する。[S4]

| 検証 | 合格条件 |
|---|---|
| 初回アクセス | ChatGPT・GitHubのサインイン要求なしでトップが開く |
| 最初の1件 | ひな形／サンプル編集から保存でき、再読み込み後も残る |
| 編集と試算 | 閉じる・Escape・未保存確認が動き、試算が原案を勝手に変えない |
| 出力と引継ぎ | 印刷/PDF、PNG、JSON、JSON-LD、Turtle、バックアップ・復元が意図した範囲で動く |
| LOD | 代表政策URI、語彙、JSON-LD/Turtle/CSVが認証なしで取得でき、リンク先・ライセンス・出典が一致する |
| API依存 | 通常の静的版操作で停止対象のAPI呼出しや401/404を起こさない |
| PDF/OCR | 小さな日本語PDF・画像で読取と取消を確認する。含めない場合は導線が隠れている |
| 地図 | 自分の政策の場所と区タグが表示される。背景の外部通信失敗も理由を表示する |
| 端末 | PCと実機スマホで主要導線を確認する |
| 復旧 | 前の公開版へ戻す手順を一度確認する |

この試験に合格してから、取得した実URLを応募フォームへ記載する。

## 4. 機能棚卸し

「静的維持」はブラウザ処理をソースで確認したという意味。Pages上の動作保証ではない。

| 機能 | 現在の構成 | 静的版の扱い | 後段の判断 |
|---|---|---|---|
| 政策作成・編集・15分野ひな形・サンプル | ブラウザ | 維持 | P0公開試験 |
| 試算・可視化・記載チェック | ブラウザの計算・規則判定 | 維持。AIの実現性判定と表示しない | P0公開試験 |
| ブラウザ保存・バックアップ日数と変更表示 | localStorage等 | 維持。新URLへは利用者がバックアップを読込 | P0移行案内 |
| 印刷・画像・JSON/CSV/JSON-LD/Turtle出力 | ブラウザ | 維持。公開先URIと出力設定を確認 | P0 |
| 原稿貼付・TXT/Word/PDF/画像OCR | ブラウザ、同梱ライブラリ・アセット | 維持。PDF/OCRは資材復元が条件 | P0又は明示して後送り |
| AI向け資料・プロンプト、回答取込 | 手動の外部AI方式 | 維持・名称明確化。APIキー不要、外部AIの利用条件・アカウントは利用者側 | 内蔵AI追加は応募の必須条件にしない |
| ウェブURL本文取込 `/api/import-source` | 認証付きAPI | 停止。本文貼付・ファイル・利用者が取得した文章で代替。URLだけ貼れば抽出できるとは表示しない | P2：利用頻度が高ければWorkers化。取得安全性・制限・認証を再設計 |
| YouTube等の動画原稿 | 自動字幕・音声取得は未実装 | 利用者が用意した文字起こしと出典URLを使う。専用字幕パーサーも現状未実装 | 将来機能 |
| 自分の政策の地図 | ブラウザ＋OSM/地理院の背景通信 | 維持 | P0で外部通信を確認 |
| 共通地図・公約台帳・市民コメント・審査 | API＋D1＋認証 | 停止。必要なら架空又は公開許諾済みの固定データによる読取デモを新設。非公開DBを丸ごと移さない | P3：運営体制・審査・認証が決まってから |
| 議員活動の共有保存・対話 `/api/activity`・`/api/dialogue` | API＋D1＋認証 | 停止。政策作成側の端末内メモ・出力とは区別 | P3：継続利用の必要性を確認してから |
| 横断SPARQL `/api/manifestos/sparql` | 現在はサーバーの検索エンジン | 初回は既存APIへ接続しない。固定RDFの配布と検索例を提示 | P1：固定RDFをブラウザで検索するデモを新設。容量・速度が不適なら公開データだけのWorkers読取APIを検討 |
| 利用者政策のGitHub公開 `/api/github` | GitHub App＋API＋D1。公開先未設定 | 停止。公開用LOD ZIPを手動配置する方式で代替 | 最後に検討。本体Pages公開と別リポジトリ・別権限 |
| 説明動画・画面ガイド | 静的アセット | 再生可能な分だけ配信。未配置動画の導線を残さない | P0で存在・再生を確認 |

P1のブラウザSPARQLデモは新規実装案であり、現時点で存在する機能として応募しない。実装する場合は固定データのバージョン・出典を表示し、他人の未公開政策を検索対象にしない。ライブな複数利用者横断検索と、固定サンプル比較を混同しない。

## 5. 後段のWorkers/D1を採用する判断

サービスとして継続する必要が確認されたものに限定する。優先順位は、公開データの読取SPARQL、URL取込、共有保存・投稿の順を初期案とする。P1をブラウザ内で満たせれば、そのためのD1や認証は不要。

Workersへコードを移すだけで完了としない。Sites固有ヘッダーの信頼を新基盤へ持ち込まず、利用者認証・権限・CORS・Origin確認・公開／非公開データ境界を設計し直す。DBを移す場合は移行対象、件数、権限、照合方法、戻し方を別計画にする。現在のD1の実データ・件数は本計画では調査していない。

## 6. 公開URL確保と日程案

以下は内部目標の提案。owner・リポジトリ名・Public・作成は確定済み。担当者・Pages/Actions設定・資材の確認後に日程を確定する。応募の必須日を勝手に延長できるとは扱わない。

| 目標日 | 成果・判定 |
|---|---|
| 2026-11-12まで | 確定済みリポジトリへの完全版配置・Pages設定確認・P0改修に着手 |
| 2026-11-20まで | Pagesで最初のログイン不要URLを取得し、基本操作の受入試験に合格 |
| 2026-11-30まで | LODの公開基準URL・URI到達性・利用条件を確定。SPARQLデモをどこまで応募に含めるか決定 |
| 2026-12-15まで | 応募用候補版を固定し、PC・スマホ・未ログインで通し確認。説明・既知の制限を整える |
| 2026-12-25まで | 応募を完了する内部目標。実際のフォームでURL・説明を確認し受付記録を保管 |
| 2027-01-05 | 公式の応募締切。時刻・タイムゾーンはフォーム等で別途確認。締切日時点のコミット・公開artifact・データ・説明を保存 |
| 応募後〜2027-03-31 | 同じURLを維持。障害修正は履歴を残し、締切後に追加した機能を審査対象と混同しない |

応募フォームにまだ取得していない仮URLを書かない。公開成功時にGitHubが表示した実URLを採用する。設定後は、リポジトリ名・所有者・独自ドメイン・URI基準を不用意に変更しない。

## 7. 3月末までの公開維持

- 担当者と代理担当者を決め、Pages設定と公開元を管理する。独自ドメインを使う場合は契約・DNS・更新期限も確認する。
- 少なくとも週1回、未ログインでトップ、代表政策URI、JSON-LD/Turtle、代表アセットを確認する。これは運用案であり、監視の自動設定はまだ行っていない。
- 応募時点の版にタグを付け、ZIPとSHA-256をGitHub Release等にも残す。Releaseは補助のダウンロード先であり、操作できるPages体験版も維持する。
- Pagesが壊れた場合は、最終正常artifact／コミットへ戻す。キャッシュ・URI・データも含め復旧後に未ログインで再検証する。
- 2027-03-31までは削除・非公開化・Pages無効化を行わない運用にする。以後もURIを保つことが望ましい。
- Pagesの公開サイズ上限1GB、帯域のソフト上限等を踏まえ、必要アセットだけを配信する。サービスの継続や無停止を無条件に保証するものではない。[S5]

## 8. 未確認事項・検証設計

| 未確認事項 | 確認方法・決める人 |
|---|---|
| Pages/Actionsの組織ポリシー・環境制限 | 対象リポジトリは作成済み。接続の権限応答はadmin/push=trueだが、設定操作・workflow成功は未検証 |
| Pagesの実URL、正規URL、LODの恒久URIの実到達性 | 初回は標準github.ioを使用する計画。公開結果を確認して確定。独自ドメインは後段 |
| 利用者側で完全版ソースとアセットを復元できるか | 元コミットの一覧・ハッシュと照合。軽量版のみなら不足を復元 |
| PagesでのPDF/OCR・WASM・日本語フォント・動画・外部地図の動作 | 実URLと実機で試験 |
| Pagesが返すJSON-LD/TurtleのContent-Type、CORS、各URIの解決 | 実HTTP応答とブラウザで確認。任意のレスポンスヘッダーや拡張子なしルーティングを前提にしない |
| ブラウザSPARQLのデータ量・速度・公開データの権利 | 小規模な固定RDFで試作し、利用端末を含め測定 |
| D1の実データ量・公開可否・移行要否 | 後段の棚卸しで確認。今回は未調査 |
| 応募締切の正確な時刻・最終規定、応募時の必要情報 | 提出前に公式フォーム・最新募集要項を確認 |

検証仮説：サーバー機能を切り離しても、公式データから政策を作り、試算し、LODとして出力する価値を体験できる。

成功基準：未ログインのPC・スマホで「サンプル編集→保存→試算→LOD出力→代表URI取得」が完了し、停止機能へのAPI呼出しがない。元データのバックアップを復元できる。

最小実験：最初はサンプル1件、PDF1件、JSON-LD/Turtle各1件でP0公開試験を行う。これが通ってから全公式データ・全主要導線へ広げる。

主なリスク：サブパスのリンク切れ、旧Sitesの認証付きURLに依存したLOD、不足アセット、停止APIの呼出し、保存先変更による引継ぎ忘れ、締切後の変更と応募版の混同。代替は、取得可能な静的データとZIPの維持、最後の正常版への復旧、SPARQLを固定データ試用に限定すること。

## 9. 公式情報・ソース上の根拠

- [S1] LODチャレンジ2026 作品募集要項（応募期間、規定5・8、審査基準）：https://2026.lodc.jp/entry.html
- [S2] GitHub Pages公開元の設定：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- [S3] GitHub Pagesカスタムワークフロー：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- [S4] GitHub Pages HTTPS：https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
- [S5] GitHub Pages利用上限：https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- ソース：`dist/app.js`、`dist/municipality.js`、`dist/import-reader.js`、`dist/policy-map.js`、`worker/index.mjs`、`worker/registry.mjs`、`worker/github.mjs`、`scripts/build-activity.mjs`、`scripts/build-import-assets.mjs`、`GITHUB_SETUP.md`、`.openai/hosting.json`。確認日は2026-11-05。
## 10. 確定事項と確認の範囲（第3版）

| 項目 | 状態・根拠 |
|---|---|
| リポジトリ名・Public・作成済み | 利用者決定＋GitHub取得結果で確認 |
| リポジトリ | https://github.com/codeforhodogaya/manifelator-yokohama |
| 既定ブランチ・README | main・README.mdあり（本文は見出し1行） |
| 接続の権限応答 | admin/maintain/push=true。実際の書込・設定操作は未実施 |
| Pages | 取得時点のhas_pages=false。初回公開・実URL到達性は未検証 |
| Actionsの組織ポリシー・環境制限 | 未確認 |

## 11. /manifelator-yokohama/ 配信を前提にする影響と設定値

次のURLは設計上の標準値・例であり、実HTTP応答の確認済みURLではない。

| 対象 | 標準値・必要な対応 |
|---|---|
| アプリの想定URL | `https://codeforhodogaya.github.io/manifelator-yokohama/` |
| 基底パス | `/manifelator-yokohama/`。末尾スラッシュを含める |
| サイト内リンク | 例：`/maps/`はOrganizationホスト直下へ飛ぶため不可。静的版で提供するページなら基底パスを含むURL又は文脈に応じた相対参照にする |
| アセット | JS/CSS/動画/フォント/WASM/OCR辞書を、トップ画面と下層ページの双方から参照できるようにする |
| 固定LODのカタログ基準 | `https://codeforhodogaya.github.io/manifelator-yokohama/open-data/`を採用候補にし、`catalogBase`等と生成済みHTML/RDF/CSVを揃える |
| 語彙 | `vocabularyBase`と生成物の語彙URIを整理。既存の`/manifestos/vocab`はWorkerの解決処理に依存するため、Pages上の実ファイルへの参照等を別途設計する |
| 固定カタログの識別URI例 | `https://codeforhodogaya.github.io/manifelator-yokohama/open-data/id/budget/<既存ID>/`。対応する静的ファイルがあることを確認する |
| 配布ファイル | JSON-LD/Turtle/CSVのURL、HTMLのalternateリンク、配布メタデータを同じ公開基準へ揃える。chatgpt.siteへの意図しない参照を検出する |
| API | `/api/`に`/manifelator-yokohama/`を付けてもAPIは生えない。サーバー依存機能を静的版から停止・代替し、通常操作で呼び出さない |
| 保存領域 | chatgpt.siteからgithub.ioへはオリジンが変わるので自動引継ぎされない。一方、同じ`codeforhodogaya.github.io`上の別プロジェクトはパスが違ってもlocalStorageを共有する。既存の自治体別キーと他アプリとの衝突を確認する |
| ルーティング | アプリ内部の`#dashboard`等のハッシュ導線を維持。下層HTMLは静的ファイルとして直接開けるようにし、SPA用のサーバー転送があると仮定しない |

既存の政策ID・自治体コード・バックアップ形式は維持する。公開先変更によるHTTP URIの変更は記録し、旧URIからの転送を未検証のまま約束しない。公開後にリポジトリ名を変えるとパスとURIへ影響するため、名前は最初の公開前に確定する。

## 12. 実行フェーズの担当別チェックリスト

### A. Sさん側

- [x] GitHub、codeforhodogaya/manifelator-yokohama、Publicを確定しREADME付きで作成。
- [ ] 公開するソース・固定データ・メディアと再配布条件を確認。個人の下書き・D1実データは公開しない。
- [ ] 組織Actions制限とgithub-pages環境の承認条件を確認。
- [ ] 初回公開前にSettings → Pages → SourceをGitHub Actionsに設定。
- [ ] 移行PR・公開範囲を確認しmainへの取り込みと初回公開を決定。
- [ ] 実機スマホで受入確認し応募URL・保守担当を確定。

### B. ChatGPT側

- [x] 対象リポジトリとREADMEを読取確認。
- [x] `.github/workflows/pages.yml`準備版を作成。PR/mainでは抽出、手動でのみ公開へ進む設計。
- [x] `scripts/build-pages.mjs`準備版を作成。元distを変更せず_siteへ抽出し配置一覧・SHA-256・参照検出結果を生成。
- [x] 完全版ソースから候補1134ファイル・109382238バイトを抽出し、一覧を作成。
- [x] YAML構文・Node構文と公開ゲートの停止を確認。
- [ ] 完全版を既存履歴を保持した移行ブランチへ配置し、元コミット・ハッシュの来歴を記録。
- [ ] 基準パス、停止APIのUI・通信制御、LOD基準URIと生成物を改修。
- [ ] 既存出典を保持して参照検出854件（ファイルと検出種別の組合せ）を分類・解消又は根拠付きで許容する。
- [ ] アセット参照・ライセンス・秘密情報・既存バックアップとの互換性を検査。
- [ ] 固定環境・実検証ロジックを整え、公開ゲートを合格条件付きに置換。
- [ ] 差分レビュー後にブランチpush・PRを準備。今回リモート書込はしていない。
- [ ] 公開後に未ログインでHTTP・PC操作試験を行い、未検証範囲を記録。

設定操作等も対応ツール・権限と後続の反映依頼があれば代行可能。Sさんの手操作が常に必須という意味ではない。完全版配置の詳細手順は準備キット内docs/PAGES-HANDOFF.mdに記載。

### C. 共同受入

- [ ] 未ログインでトップ・下層画面を直接開き再読み込み。
- [ ] サンプル編集→保存→試算→LOD出力→代表URI→バックアップ復元。
- [ ] 公開対象のOCR・地図・動画とPC/実機スマホを確認。
- [ ] 停止API通信・必須アセット404・意図しない旧Sites依存がない。
- [ ] 実URL、応募版コミット・配布物、復旧手順を記録し2027-03-31まで維持。

検証仮説：/manifelator-yokohama/上で主要静的機能とLOD到達性を維持できる。最小実験：政策1件・代表URI1件。成功基準：上記通し操作と通信検査の合格。主なリスク：基準パス漏れ、URI一括置換による出典破壊、不足OCR資材、API依存、保存キー衝突。

## 13. 第3版の成果物・検証状態

準備キット`manifelator-yokohama-pages-preparation.zip`にはworkflow、抽出スクリプト、完全版配置手順、全配置候補一覧（JSON/TSV）、参照検出結果がある。アプリ本体や動画を含む完全ソースZIPではない。

抽出は候補をコピーする段階で、静的互換改修はまだ行っていない。workflowのdeploy=trueを指定しても、抽出スクリプトの--releaseゲートが意図して停止する。未対応版を誤公開しないための準備状態であり、「公開可能な完成版」とは扱わない。ゲート解除前に実装・受入を行い、実検証ロジックへ置換する。通常抽出の成功と公開ゲートの期待どおりの失敗をローカルNode v24.22.1で確認した。GitHub Actionsでの実行と実ブラウザは未検証。

Actionのメジャー版はGitHub公式例に基づくcheckout@v6、configure-pages@v5、upload-pages-artifact@v4、deploy-pages@v4。コミットSHA固定は未実施。Nodeはrunner版の22以上を検査する準備構成であり、再現性のための固定環境は残作業。

根拠：利用者decision_update、GitHub APIによる対象リポジトリ・README取得（2026-11-05）、β0.35.0ソースコミット、GitHub公式文書 https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
