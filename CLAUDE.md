# projector-tool

複数の単体 HTML ツール（プロジェクター選定、距離-SPL減衰、アウトラインエディタ、PEQ変換など）を
集めた静的サイト。ビルド工程はなく、各 `*.html` をブラウザで開けばそのまま動く。

- 配色は **ライトテーマ**で統一（クリーム地 `#f4f3ef` / 白カード / 黒文字、アクセント 青 `#378ADD`・緑 `#1D9E75`・橙 `#c47f1a`）。
  新しい画面を足すときもこの配色に合わせる。
- 一部ツールは Chart.js を CDN（cdnjs）から読み込む。

## UI の確認（スクリーンショット）

UI を変更したら、ヘッドレス Chromium で実画面を撮って確認する。

```bash
# 初回のみ（コンテナは使い捨てなので毎セッション必要）
npm install
npm run setup:browser            # = playwright install --with-deps chromium

# 撮影
node scripts/screenshot.mjs index.html shots/list.png
node scripts/screenshot.mjs index.html shots/calc.png --tab=calc --full
```

`scripts/screenshot.mjs` のオプションは `--tab=<name>` / `--full` / `--width` / `--height` / `--wait`。

### 環境メモ（Claude Code on the web）

- コンテナは ephemeral。ブラウザを常備したい場合は環境のセットアップスクリプトに
  `npx -y playwright@latest install --with-deps chromium` を入れる。
- 外向き通信は TLS 傍受プロキシ経由で、Chromium が外部CDNの証明書を信頼できない
  （`ERR_CERT_AUTHORITY_INVALID`）。`screenshot.mjs` は `ignoreHTTPSErrors: true` で回避済み。
