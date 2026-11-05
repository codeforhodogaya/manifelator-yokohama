# β0.35.0 GitHub Pages移行用準備物（2026-11-05）

対象: codeforhodogaya/manifelator-yokohama、main、Public。
基準パス: /manifelator-yokohama/
想定公開URL: https://codeforhodogaya.github.io/manifelator-yokohama/

## 成果物の状態

このZIPは完全版ソースではなく、既存ソースへ重ねる小さな準備キット。アプリ本体を改修・公開した成果物ではない。抽出スクリプトは元のdistを変更せず静的ファイルを_siteへコピーし、配置一覧と参照検出結果を生成する。リンク・LOD URIの書換え、API機能のUI停止、ブラウザ検証は次工程。releaseReadyはfalseであり、--releaseは意図して失敗する。workflowのdeploy入力をtrueにしても、このゲートを通過するまで公開されない。検出件数0だけでゲートを解除しない。

## 完全版ソースの配置

Sさん側:
1. 現行Sites版の利用者政策をバックアップする。公開ソース・データ・メディアとライセンスの範囲を確認する。利用者の下書きやDBの実データは登録しない。
2. 対象リポジトリのPages設定と組織Actionsポリシーを確認する。初回公開直前にSettings → Pages → Build and deployment → Source: GitHub Actionsとする。
3. 準備された差分を確認し、mainへのマージ・初回公開を決定する。実機スマホで受入確認し、応募URLを確定する。

ChatGPT/実装担当側:
1. READMEのある既存リポジトリをcloneし、main起点でmigration/pages-staticブランチを作る。既存履歴を残し、force pushしない。
2. 完全版β0.35.0（元コミット fc424b9dcd6b245617e7164d8cf8dc52b6965fdb）の追跡ファイル一覧を元checkoutのgit ls-filesで取得し、レビュー済みファイルのみ新cloneへコピーする。元の.git、node_modules、.env実値、.openai、生成dist/client・dist/server、既成の配布ZIPは除外する。元READMEはdocs/README-sites-0.35.0.mdとして保存し、既存READMEには移行状態を追記する。元コミットは新リポジトリの履歴に自動的に存在するわけではないため、ハッシュ付きIMPORT-PROVENANCE.jsonを別に記録する。
3. dist/（メディア・OCR資材を含む）、worker/、db/、drizzle/、scripts/、tests/、package.json、pnpm-lock.yaml、pnpm-workspace.yaml、既存設定・文書・LICENSEを同じ相対構成で配置する。worker/dbはソース管理のみ。EXPORT-MANIFEST.jsonが完全版に付属していれば保持し、なければ「既存付属」と偽らず移行時の一覧を新規生成する。
4. このキットの.github/workflows/pages.yml、scripts/build-pages.mjsを重ねる。_site/、pages-reports/、node_modules/、.env、dist/client/、dist/server/を.gitignoreへ追記する。元の無視規則を置換しない。
5. git diff --stat、公開禁止情報・大容量単体ファイル・ライセンスを確認する。git add -Aを確認なしで実行しない。コミット・ブランチpush・PRを行う工程は後続の反映依頼時に実施する。

例（既存READMEの履歴を保つ取得操作）:
```sh
git clone https://github.com/codeforhodogaya/manifelator-yokohama.git
cd manifelator-yokohama
git switch -c migration/pages-static
# レビュー済み完全版とキットを上記の条件で配置
node scripts/build-pages.mjs
```

## 抽出・ビルド手順

Node 22以上でリポジトリルートから:
```sh
node scripts/build-pages.mjs
```
この抽出処理はNode標準機能のみで、npm install不要。npm run buildはWorker用なのでここでは実行しない。ソースの版が0.35.0以外なら停止。出力は_site/とpages-reports/files.json・files.tsv・readiness.json。

不足OCR資材の復元は別工程。元lockfileと互換の固定pnpmを決め、pnpm install --frozen-lockfile → node scripts/build-import-assets.mjs。pnpm具体版の固定・依存再生成は今回未実施。軽量ZIPのみでOCR・動画が揃ったと判定しない。

_siteはパスそのものをmanifelator-yokohama/で二重に包まない。Pagesがプロジェクトの基準パスで配信する。ローカルでのサブパス試験は一時サーバールート配下にmanifelator-yokohama/として_siteを配置して行う。元distから検出される旧Sites URLは出典と識別URIを分類し、出典URLを誤って変更しない。

## 配置対象一覧

公開対象の機械可読一覧はpages-reports/files.tsv・files.jsonに全ファイル単位で生成（サイズ・SHA-256付き）。抽出対象はdistルートの許可拡張子と、screen-guide/open-data/data/vendor/videos/downloads/maps/citizens/manifestos各ディレクトリ。ZIP、隠しファイル、シンボリックリンク、client/server/node_modulesは配信しない。未知の拡張子は自動公開しないため、実参照と一覧を別途照合する。maps/citizensはこの段階では元のAPI依存コードも含む候補であり、公開可とは判定していない。

| リポジトリ内 | Pages公開 |
|---|---|
| dist/index.html、JS/CSS、data/、open-data/ | 静的版改修後の内容を_siteへ |
| dist/vendor/、videos/、downloads/、screen-guide/ | 完全版資材と参照・再配布条件の照合後 |
| dist/maps/、citizens/、manifestos/ | API依存を除去又は固定デモ化後 |
| worker/、db/、drizzle/ | 公開しない（Publicリポジトリではコード自体は閲覧可能） |
| scripts/、tests/、開発設定 | Pagesには公開しない |
| _site/ | Pages artifactとしてのみ配置 |

## workflow

PR/main pushでは抽出のみ。初回公開はmain上でworkflow_dispatchのdeploy=trueを指定する設計。現時点では公開ゲートで停止。互換改修後にゲートを実検証ロジックへ置換し、合格した時だけartifact uploadとdeployへ進める。自動main配信は初回受入後に別途有効化する。
checkout@v6、configure-pages@v5、upload-pages-artifact@v4、deploy-pages@v4はGitHub公式カスタムworkflow例のメジャー版を採用。SHA固定は未実施。Nodeはrunner内版を22以上で検査する準備版で、再現性を高める固定環境の導入は公開前の残作業。Actions上での実行は未検証。

## 公開前の残作業・受入基準

- /manifelator-yokohama/を一元設定し、通常リンク、CSS参照、動的生成リンク、WASM/辞書を含む下層参照を修正。
- URL取込、共通台帳・市民投稿、共有保存・対話、GitHub公開、サーバーSPARQLへの導線を停止又は代替。通常操作で停止APIを呼ばない。
- catalogBase/vocabularyBaseと固定RDF/HTML/配布情報を一致させて再生成。旧新URI対応表を保存。Pagesでの実ファイル到達性を確認。
- README、ライセンス、秘密情報と公開データを確認。リポジトリ上のコード公開とPagesで配る範囲を区別。
- 未ログインでサンプル編集→保存→再読込→試算→JSON-LD/Turtle→代表URI→バックアップ復元。PCと実機スマホで確認。

検証仮説: サブパス上で主要静的機能とLODの到達性を維持できる。
最小実験: サンプル政策1件、代表URI1件と小さなOCRファイル1件で試す。
成功基準: 上記通し操作が完了し、停止APIへの通信・必須アセット404・意図しない旧Sites依存がない。
リスク: URL一括置換による出典破壊、未配置OCR資材、API依存画面の残存、同一github.ioオリジンの保存キー衝突。

公式根拠: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
