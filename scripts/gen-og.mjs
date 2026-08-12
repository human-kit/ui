/**
 * Renders the site's social card to `docs/static/og.png`.
 *
 * Run it with `pnpm docs:og` after changing the wordmark or the tagline; the PNG
 * is committed, so nothing generates at build or request time and the card works
 * on every crawler regardless of what it can execute.
 *
 * The wordmark is read out of the real `logo.svelte` rather than copied here, so
 * the card cannot drift from the header. Geist is loaded from the same
 * @fontsource package the site uses — without it Chromium falls back to whatever
 * the machine happens to have, and the committed image would differ per author.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const WIDTH = 1200;
const HEIGHT = 630;
const OUT = resolve(root, 'docs/static/og.png');

const TAGLINE = 'Headless, accessible UI components for Svelte 5';
const DOMAIN = 'ui.human-kit.com';

const logo = readFileSync(resolve(root, 'docs/src/lib/docs/components/icons/logo.svelte'), 'utf8');
const svg = logo.match(/<svg[\s\S]*<\/svg>/)?.[0];
if (!svg) throw new Error('Could not find the wordmark <svg> in logo.svelte');

// Resolved from the docs workspace, which is what depends on the font — pnpm
// does not hoist it to the repo root.
const requireFromDocs = createRequire(resolve(root, 'docs/package.json'));
const font = readFileSync(
	requireFromDocs.resolve('@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')
).toString('base64');

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Geist';
    src: url(data:font/woff2;base64,${font}) format('woff2-variations');
    font-weight: 100 900;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: #0a0a0a;
    color: #fafafa;
    font-family: 'Geist', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 72px 80px;
    /* A single hairline frame inset from the edge: enough structure that the card
       reads as a deliberate object in a feed, without competing with the type. */
    box-shadow: inset 0 0 0 1px #262626;
  }
  .mark { width: 300px; color: #fafafa; }
  .mark svg { width: 100%; height: auto; display: block; }
  h1 {
    font-size: 60px;
    font-weight: 500;
    line-height: 1.15;
    letter-spacing: -0.02em;
    max-width: 15ch;
  }
  .foot {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 24px;
    color: #a3a3a3;
  }
  .dot { width: 5px; height: 5px; border-radius: 50%; background: #525252; }
</style>
</head>
<body>
  <div class="mark">${svg}</div>
  <h1>${TAGLINE}</h1>
  <div class="foot">
    <span>${DOMAIN}</span>
    <span class="dot"></span>
    <span>MIT</span>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: WIDTH, height: HEIGHT },
	deviceScaleFactor: 1
});
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, png);
console.log(`og image → ${OUT} (${WIDTH}×${HEIGHT}, ${(png.length / 1024).toFixed(0)} KB)`);
