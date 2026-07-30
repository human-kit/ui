#!/usr/bin/env node
/**
 * Table benchmark runner.
 *
 * Drives the /bench/table page in headed-quality Chromium, collects the
 * in-page symptom metrics (frame pacing, blank viewport, long tasks) and — via
 * CDP — a sampling CPU profile per scenario so slow frames can be attributed to
 * actual functions instead of guesses.
 *
 * Usage
 *   node scripts/bench-table.mjs --label baseline
 *   node scripts/bench-table.mjs --label after --mode preview --throttle 4
 *   node scripts/bench-table.mjs --compare bench-results/baseline.json bench-results/after.json
 *
 * Options
 *   --label <name>       Output file name (default: run)
 *   --mode dev|preview   Server to measure against (default: dev)
 *   --url <url>          Use an already-running server instead of spawning one
 *   --throttle <n>       CDP CPU throttling multiplier (default: 4)
 *   --repeat <n>         Runs per scenario; the best run is reported (default: 5)
 *   --scenarios <a,b>    Subset of scenarios to run
 *   --rows <n>           Row count (default: 500)
 *   --columns <n>        Column count (default: 8)
 *   --no-profile         Skip the CPU profile (faster, no attribution)
 *   --headed             Show the browser
 */

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { measureBlankBand } from './bench-screencast.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RESULTS_DIR = path.join(ROOT, 'bench-results');

const ALL_SCENARIOS = [
	'mount',
	'scroll-smooth',
	'scroll-fast',
	'scroll-wheel',
	'scroll-jump',
	'resize-column',
	'select-all',
	'sort-toggle'
];

/** Driven by real wheel input from the runner, not by the page's own `run()`. */
const WHEEL_SCENARIO = 'scroll-wheel';

/**
 * Flicks the wheel over the table while the page samples every frame. Real
 * input lets the compositor scroll ahead of the main thread, so this is the
 * only scenario that can observe unpainted rows.
 */
async function runWheelScenario(page, cdp, analyzer, saveFramesTo) {
	const viewport = page.locator('.bench-viewport');
	const box = await viewport.boundingBox();
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

	const region = await page.evaluate(() => {
		const container = document.querySelector('.bench-viewport');
		const header = container.querySelector('thead');
		const containerRect = container.getBoundingClientRect();
		const headerHeight = header ? header.getBoundingClientRect().height : 0;
		// Inset past the container's own 1px border and rounded corners. Without
		// this the bottom-most scanline is the grey border, which never reads as
		// background, so the scan stops instantly and reports no gap at all.
		const INSET = 4;
		return {
			left: containerRect.left + INSET,
			width: containerRect.width - INSET * 2,
			// The band that rows must cover: below the sticky header, down to the
			// bottom edge of the scroll viewport.
			top: containerRect.top + headerHeight,
			bottom: containerRect.bottom - INSET,
			viewportWidth: window.innerWidth
		};
	});

	const drive = async () => {
		await page.evaluate(() => window.__tableBench.startWatch());
		for (let burst = 0; burst < 12; burst += 1) {
			// Six fast notches back-to-back, then a short pause — the shape of a
			// real flick, and the pattern that produces the blank bands.
			for (let notch = 0; notch < 6; notch += 1) {
				await page.mouse.wheel(0, 240);
			}
			await page.waitForTimeout(60);
		}
		await page.waitForTimeout(200);
	};

	let blank;
	if (analyzer) {
		blank = await measureBlankBand({ page, cdp, analyzer, region, drive });
	} else {
		await drive();
	}

	const result = await page.evaluate(() => window.__tableBench.stopWatch());
	if (blank?.worstFrameJpegBase64 && saveFramesTo) {
		await mkdir(RESULTS_DIR, { recursive: true });
		await writeFile(
			path.join(RESULTS_DIR, `${saveFramesTo}-worst-frame.jpg`),
			Buffer.from(blank.worstFrameJpegBase64, 'base64')
		);
	}
	if (blank) delete blank.worstFrameJpegBase64;
	return { ...result, scenario: WHEEL_SCENARIO, blankBand: blank };
}

function parseArgs(argv) {
	const args = {
		label: 'run',
		mode: 'dev',
		url: undefined,
		throttle: 4,
		repeat: 5,
		scenarios: ALL_SCENARIOS,
		rows: 500,
		columns: 8,
		overscan: undefined,
		profile: true,
		headed: false,
		compare: undefined
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		const next = () => argv[(index += 1)];

		switch (arg) {
			case '--label':
				args.label = next();
				break;
			case '--mode':
				args.mode = next();
				break;
			case '--url':
				args.url = next();
				break;
			case '--throttle':
				args.throttle = Number(next());
				break;
			case '--repeat':
				args.repeat = Number(next());
				break;
			case '--scenarios':
				args.scenarios = next().split(',').map((value) => value.trim()).filter(Boolean);
				break;
			case '--rows':
				args.rows = Number(next());
				break;
			case '--columns':
				args.columns = Number(next());
				break;
			case '--overscan':
				args.overscan = Number(next());
				break;
			case '--no-profile':
				args.profile = false;
				break;
			case '--headed':
				args.headed = true;
				break;
			case '--compare':
				args.compare = [next(), next()];
				break;
			default:
				if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
		}
	}

	return args;
}

function findFreePort() {
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.unref();
		server.on('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const { port } = server.address();
			server.close(() => resolve(port));
		});
	});
}

async function waitForServer(url, timeoutMs = 120_000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(url, { method: 'GET' });
			if (response.ok || response.status === 404) return;
		} catch {
			/* not up yet */
		}
		await new Promise((resolve) => setTimeout(resolve, 300));
	}
	throw new Error(`Server at ${url} did not start in time`);
}

function run(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { cwd: ROOT, shell: true, stdio: 'inherit', ...options });
		child.on('error', reject);
		child.on('exit', (code) =>
			code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))
		);
	});
}

async function startServer(mode) {
	const port = await findFreePort();

	if (mode === 'preview') {
		console.log('› building docs (production mode)…');
		await run('pnpm', ['--filter', 'docs', 'build']);
	}

	const script = mode === 'preview' ? 'preview' : 'dev';
	console.log(`› starting docs ${script} server on :${port}`);
	// Spawned through the docs workspace directly: routing the flags through
	// `pnpm --filter` swallows them on some pnpm versions.
	const child = spawn('pnpm', ['exec', 'vite', script, '--port', String(port), '--strictPort'], {
		cwd: path.join(ROOT, 'docs'),
		shell: true,
		stdio: 'ignore'
	});

	const baseUrl = `http://localhost:${port}`;
	await waitForServer(baseUrl);

	return {
		baseUrl,
		stop: () => {
			child.kill();
		}
	};
}

/**
 * Folds a CDP sampling profile into per-function self time.
 * Returns the heaviest frames, which is where an optimisation actually pays.
 */
function summarizeProfile(profile, limit = 18) {
	const nodesById = new Map();
	for (const node of profile.nodes) nodesById.set(node.id, node);

	const selfTimeByNode = new Map();
	const { samples = [], timeDeltas = [] } = profile;
	for (let index = 0; index < samples.length; index += 1) {
		const nodeId = samples[index];
		const delta = timeDeltas[index] ?? 0;
		selfTimeByNode.set(nodeId, (selfTimeByNode.get(nodeId) ?? 0) + delta);
	}

	const byFrame = new Map();
	let totalUs = 0;
	for (const [nodeId, selfUs] of selfTimeByNode) {
		const node = nodesById.get(nodeId);
		if (!node) continue;
		const frame = node.callFrame;
		const file = frame.url ? frame.url.split('/').slice(-2).join('/').split('?')[0] : '';
		const name = frame.functionName || '(anonymous)';
		const key = `${name} @ ${file}`;
		byFrame.set(key, (byFrame.get(key) ?? 0) + selfUs);
		totalUs += selfUs;
	}

	const top = [...byFrame.entries()]
		.sort((left, right) => right[1] - left[1])
		.slice(0, limit)
		.map(([frame, selfUs]) => ({
			frame,
			selfMs: Number((selfUs / 1000).toFixed(2)),
			share: totalUs > 0 ? Number((selfUs / totalUs).toFixed(4)) : 0
		}));

	return { totalMs: Number((totalUs / 1000).toFixed(2)), top };
}

/** The single number a scenario is judged on. */
function primaryMetric(result) {
	return result.frames ? result.frames.p50 : (result.syncMs ?? result.durationMs);
}

/**
 * Summarises repeated runs.
 *
 * Reports the **best** run as the headline, not the median. Background load on
 * a developer machine only ever makes a run slower, so the minimum is the
 * cleanest estimate of the code's own cost; the median drifts with whatever
 * else the machine happened to be doing. `spread` exposes how noisy the
 * session was — when it is large, small deltas mean nothing.
 */
function summarizeRuns(runs) {
	const scored = runs
		.map((result) => ({ result, score: primaryMetric(result) }))
		.sort((left, right) => left.score - right.score);

	const best = scored[0];
	const median = scored[Math.floor(scored.length / 2)];
	const worst = scored[scored.length - 1];

	return {
		...best.result,
		samples: scored.map((entry) => Number(entry.score.toFixed(2))),
		bestMs: Number(best.score.toFixed(2)),
		medianMs: Number(median.score.toFixed(2)),
		spread: best.score > 0 ? Number(((worst.score - best.score) / best.score).toFixed(3)) : 0
	};
}

async function runBenchmark(args) {
	const server = args.url ? null : await startServer(args.mode);
	const baseUrl = args.url ?? server.baseUrl;
	const query = new URLSearchParams({ rows: String(args.rows), columns: String(args.columns) });
	if (args.overscan !== undefined) query.set('overscan', String(args.overscan));
	const pageUrl = `${baseUrl}/bench/table?${query}`;

	const browser = await chromium.launch({
		headless: !args.headed,
		args: ['--disable-frame-rate-limit', '--force-device-scale-factor=1']
	});

	try {
		const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
		const page = await context.newPage();
		const cdp = await context.newCDPSession(page);

		// Scratch page used only to decode screencast frames and count pixels; it
		// never runs while the measured page is being driven.
		const analyzer = args.scenarios.includes(WHEEL_SCENARIO) ? await context.newPage() : null;

		await page.bringToFront();
		await page.goto(pageUrl, { waitUntil: 'load' });
		await page.waitForFunction(() => window.__tableBench !== undefined, undefined, {
			timeout: 30_000
		});

		if (args.throttle > 1) {
			await cdp.send('Emulation.setCPUThrottlingRate', { rate: args.throttle });
		}
		if (args.profile) {
			await cdp.send('Profiler.enable');
			// 100 µs sampling: fine enough to separate the table's own frames.
			await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
		}

		// One throwaway pass so JIT warm-up doesn't land in the first measurement.
		await page.evaluate(() => window.__tableBench.run('scroll-fast'));
		await page.evaluate(() => window.__tableBench.run('mount'));

		const scenarios = {};
		for (const scenario of args.scenarios) {
			process.stdout.write(`› ${scenario} `);
			const invoke =
				scenario === WHEEL_SCENARIO
					? () => runWheelScenario(page, cdp, analyzer, args.label)
					: () => page.evaluate((name) => window.__tableBench.run(name), scenario);

			// A dev-server HMR reload mid-run destroys the execution context. Wait
			// for the page to come back and retry rather than losing the whole run.
			const execute = async () => {
				try {
					return await invoke();
				} catch (error) {
					if (!String(error.message).includes('Execution context was destroyed')) throw error;
					process.stdout.write('r');
					await page.waitForFunction(() => window.__tableBench !== undefined, undefined, {
						timeout: 30_000
					});
					return invoke();
				}
			};

			const runs = [];
			for (let attempt = 0; attempt < args.repeat; attempt += 1) {
				runs.push(await execute());
				process.stdout.write('.');
			}

			const summary = summarizeRuns(runs);

			let profile;
			if (args.profile) {
				await cdp.send('Profiler.start');
				await execute();
				const { profile: raw } = await cdp.send('Profiler.stop');
				profile = summarizeProfile(raw);
			}

			scenarios[scenario] = { ...summary, profile };
			const headline = summary.frames
				? `p50 ${summary.bestMs.toFixed(1)}ms  p95 ${summary.frames.p95.toFixed(1)}ms  dropped ${(summary.frames.droppedRatio * 100).toFixed(0)}%`
				: `sync ${summary.bestMs.toFixed(1)}ms`;
			// The screencast measurement supersedes the in-page probe: the probe
			// samples from the main thread and structurally cannot observe a gap
			// that only exists while the main thread is blocked.
			const blank = summary.blankBand
				? `  BLANK ${(summary.blankBand.blankFrameRatio * 100).toFixed(0)}% of frames (max ${summary.blankBand.maxBlankPx}px, mean ${summary.blankBand.meanBlankPx}px)`
				: '';
			console.log(` ${headline}  [spread ${(summary.spread * 100).toFixed(0)}%]${blank}`);
		}

		const report = {
			label: args.label,
			createdAt: new Date().toISOString(),
			mode: args.mode,
			url: pageUrl,
			throttle: args.throttle,
			repeat: args.repeat,
			scenarios
		};

		await mkdir(RESULTS_DIR, { recursive: true });
		const outFile = path.join(RESULTS_DIR, `${args.label}.json`);
		await writeFile(outFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
		console.log(`\n› wrote ${path.relative(ROOT, outFile)}`);

		printProfileHighlights(report);
	} finally {
		await browser.close();
		server?.stop();
	}
}

function printProfileHighlights(report) {
	for (const [scenario, result] of Object.entries(report.scenarios)) {
		if (!result.profile) continue;
		console.log(`\n  ${scenario} — top self time (${result.profile.totalMs}ms sampled)`);
		for (const entry of result.profile.top.slice(0, 8)) {
			console.log(
				`    ${(entry.share * 100).toFixed(1).padStart(5)}%  ${entry.selfMs.toFixed(1).padStart(7)}ms  ${entry.frame}`
			);
		}
	}
}

function formatDelta(before, after, lowerIsBetter = true) {
	if (before === 0) return after === 0 ? '  0%' : '  n/a';
	const change = ((after - before) / before) * 100;
	const better = lowerIsBetter ? change < 0 : change > 0;
	const sign = change > 0 ? '+' : '';
	return `${sign}${change.toFixed(0)}% ${better ? '✔' : '✘'}`;
}

async function compare([beforePath, afterPath]) {
	const before = JSON.parse(await readFile(beforePath, 'utf8'));
	const after = JSON.parse(await readFile(afterPath, 'utf8'));

	console.log(`\n${before.label} → ${after.label}\n`);
	const header = ['scenario', 'metric', before.label, after.label, 'delta', 'noise'];
	const rows = [header];

	for (const scenario of Object.keys(after.scenarios)) {
		const left = before.scenarios[scenario];
		const right = after.scenarios[scenario];
		if (!left || !right) continue;

		// A delta smaller than the worse run's own spread is indistinguishable
		// from background load, so say so instead of implying a result.
		const noise = Math.max(left.spread ?? 0, right.spread ?? 0);
		const verdict = (beforeValue, afterValue) => {
			if (beforeValue === 0) return '';
			const change = Math.abs((afterValue - beforeValue) / beforeValue);
			return change < noise ? `±${(noise * 100).toFixed(0)}% — inconclusive` : '';
		};

		if (left.bestMs !== undefined && right.bestMs !== undefined) {
			rows.push([
				scenario,
				left.frames ? 'frame p50 (ms, best)' : 'sync (ms, best)',
				left.bestMs.toFixed(1),
				right.bestMs.toFixed(1),
				formatDelta(left.bestMs, right.bestMs),
				verdict(left.bestMs, right.bestMs)
			]);
		}
		if (left.frames && right.frames) {
			rows.push([
				scenario,
				'dropped frames',
				`${(left.frames.droppedRatio * 100).toFixed(0)}%`,
				`${(right.frames.droppedRatio * 100).toFixed(0)}%`,
				formatDelta(left.frames.droppedRatio, right.frames.droppedRatio),
				verdict(left.frames.droppedRatio, right.frames.droppedRatio)
			]);
		}
		if (left.coverage && right.coverage) {
			rows.push([
				scenario,
				'blank frames',
				`${(left.coverage.blankFrameRatio * 100).toFixed(0)}%`,
				`${(right.coverage.blankFrameRatio * 100).toFixed(0)}%`,
				formatDelta(left.coverage.blankFrameRatio, right.coverage.blankFrameRatio),
				verdict(left.coverage.blankFrameRatio, right.coverage.blankFrameRatio)
			]);
		}
	}

	const widths = header.map((_, column) =>
		Math.max(...rows.map((row) => String(row[column] ?? '').length))
	);
	for (const [index, row] of rows.entries()) {
		console.log(row.map((cell, column) => String(cell).padEnd(widths[column])).join('  '));
		if (index === 0) console.log(widths.map((width) => '-'.repeat(width)).join('  '));
	}
	console.log('');
}

const args = parseArgs(process.argv.slice(2));
if (args.compare) {
	await compare(args.compare);
} else {
	await runBenchmark(args);
}
