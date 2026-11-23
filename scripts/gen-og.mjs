/**
 * Renders the site's social card to `docs/static/og.png`.
 *
 * Run it with `pnpm docs:og` after changing the logo or the tagline; the PNG
 * is committed, so nothing generates at build or request time and the card works
 * on every crawler regardless of what it can execute.
 *
 * The logo is read out of the real `logo.svelte` rather than copied here, so
 * the card cannot drift from the header. The faces are loaded from the same
 * @fontsource packages the site uses — without them Chromium falls back to whatever
 * the machine happens to have, and the committed image would differ per author.
 *
 * The card is set as the site is: the sheet of a plan, with its frame, its grid
 * and its label.
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
// The first drawing in the file is the whole form: the symbol and the logo of the family.
const svg = logo.match(/<svg[\s\S]*?<\/svg>/)?.[0].replace('class={className}', '');
if (!svg) throw new Error('Could not find the logo <svg> in logo.svelte');

const version = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8')).version;

// Resolved from the docs workspace, which is what depends on the fonts — pnpm
// does not hoist them to the repo root.
const requireFromDocs = createRequire(resolve(root, 'docs/package.json'));
const embed = (specifier) => readFileSync(requireFromDocs.resolve(specifier)).toString('base64');

const mono = embed('@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2');

const fields = [
	['Project', 'human-kit / ui'],
	['Content', 'Primitives for Svelte 5'],
	['Site', DOMAIN],
	['License', 'MIT']
];

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Geist Mono';
    src: url(data:font/woff2;base64,${mono}) format('woff2-variations');
    font-weight: 100 900;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: #0a0a0a;
    color: #fff;
    font-family: 'Geist Mono', monospace;
    padding: 40px;
  }
  /* The sheet: one frame, the grid behind, and the label along its foot. */
  .sheet {
    height: 100%;
    border: 1px solid #fff;
    display: flex;
    flex-direction: column;
    background-image:
      linear-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgb(255 255 255 / 0.07) 1px, transparent 1px);
    background-size: 20px 20px;
    background-position: -1px -1px;
  }
  .body { flex: 1; padding: 48px 56px; display: flex; flex-direction: column; justify-content: space-between; }
  .mark svg { height: 72px; width: auto; display: block; }
  h1 {
    font-size: 58px;
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    max-width: 20ch;
    text-wrap: balance;
  }
  .label { display: grid; grid-template-columns: 1.1fr 1.5fr 1.1fr 0.5fr; border-top: 1px solid #fff; background: #0a0a0a; }
  .label div { padding: 14px 20px; border-left: 1px solid #fff; }
  .label div:first-child { border-left: 0; padding-left: 56px; }
  .label dt { font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #a3a3a3; }
  .label dd { margin-top: 8px; font-size: 19px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }
  .rev { position: absolute; top: 88px; right: 96px; font-size: 16px; letter-spacing: 0.14em; color: #a3a3a3; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="body">
      <div class="mark">${svg}</div>
      <span class="rev">REV ${version}</span>
      <h1>${TAGLINE}</h1>
    </div>
    <dl class="label">
      ${fields.map(([name, value]) => `<div><dt>${name}</dt><dd>${value}</dd></div>`).join('')}
    </dl>
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
