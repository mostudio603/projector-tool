// HTML ファイル(またはURL)をヘッドレス Chromium で開いてPNGに保存するヘルパー。
//
// 使い方:
//   node scripts/screenshot.mjs <input.html|url> [output.png] [options]
//
// オプション:
//   --tab=<name>   data-tab="<name>" のタブをクリックしてから撮影 (例: --tab=calc)
//   --full         ページ全体を撮影 (デフォルトはビューポートのみ)
//   --width=<px>   ビューポート幅 (デフォルト 1200)
//   --height=<px>  ビューポート高 (デフォルト 900)
//   --wait=<ms>    描画待ち時間 (デフォルト 1200)
//
// 例:
//   node scripts/screenshot.mjs index.html shots/list.png
//   node scripts/screenshot.mjs index.html shots/calc.png --tab=calc --full
//
// 注: この実行環境は TLS 傍受プロキシ経由のため、Chromium が外部CDNの証明書を
//     信頼できない。CDN(Chart.js 等)を読み込めるよう ignoreHTTPSErrors を有効化している。

import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, basename, extname } from 'node:path';

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const input = positional[0];
if (!input) {
  console.error('Usage: node scripts/screenshot.mjs <input.html|url> [output.png] [--tab=name] [--full] [--width=px] [--height=px] [--wait=ms]');
  process.exit(1);
}

const url = /^https?:\/\/|^file:\/\//.test(input) ? input : pathToFileURL(resolve(input)).href;
const out = positional[1] || `${basename(input, extname(input))}.png`;
const width = Number(flags.width) || 1200;
const height = Number(flags.height) || 900;
const wait = Number(flags.wait) || 1200;

mkdirSync(dirname(resolve(out)) || '.', { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 2,
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();

const problems = [];
page.on('pageerror', e => problems.push('pageerror: ' + e.message));
page.on('requestfailed', r => problems.push('requestfailed: ' + r.url() + ' ' + (r.failure()?.errorText || '')));

await page.goto(url, { waitUntil: 'load' });
if (flags.tab) {
  await page.click(`.tab[data-tab="${flags.tab}"]`);
}
await page.waitForTimeout(wait);
await page.screenshot({ path: out, fullPage: Boolean(flags.full) });
await browser.close();

console.log(`saved: ${out}`);
if (problems.length) {
  console.log('warnings:');
  for (const p of problems) console.log('  - ' + p);
}
