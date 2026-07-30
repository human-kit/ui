/**
 * Measurement primitives for the component benchmarks.
 *
 * The philosophy here: this module only measures *user-visible symptoms* —
 * frame pacing, long tasks, and how much of the viewport is left blank. It
 * deliberately does not instrument component internals, so the numbers stay
 * comparable across refactors. Attribution ("which function burned the time")
 * comes from the CPU profile the Playwright runner collects over CDP.
 */

/** Assumed display frame budget. Everything slower than this is visible jank. */
export const FRAME_BUDGET_MS = 1000 / 60;

/** A frame delta above this is counted as dropped. */
const DROPPED_FRAME_FACTOR = 1.5;

export type Distribution = {
	count: number;
	mean: number;
	p50: number;
	p95: number;
	p99: number;
	max: number;
};

export type FrameStats = Distribution & {
	/** Frames whose delta exceeded `FRAME_BUDGET_MS * 1.5`. */
	dropped: number;
	/** Share of frames that were dropped, 0..1. */
	droppedRatio: number;
	/** Total time spent beyond the frame budget, in ms. */
	jankMs: number;
};

export type LongTaskStats = {
	count: number;
	totalMs: number;
	maxMs: number;
	/** False when the browser has no `longtask` PerformanceObserver support. */
	supported: boolean;
};

/**
 * How much of the scrollable viewport is showing nothing because the
 * virtualizer has not caught up. This is the direct measurement of the
 * "white gaps while scrolling fast" symptom.
 */
export type CoverageSample = {
	/** Height of the band that should be covered by rows, in px. */
	bandPx: number;
	/** Uncovered px inside that band (above the first row + below the last). */
	blankPx: number;
	/** `blankPx / bandPx`, 0..1. */
	ratio: number;
};

export type CoverageStats = {
	samples: number;
	/** Share of samples that had any blank area at all, 0..1. */
	blankFrameRatio: number;
	meanRatio: number;
	maxRatio: number;
	maxBlankPx: number;
};

export function percentile(sortedValues: number[], fraction: number): number {
	if (sortedValues.length === 0) return 0;
	const index = Math.min(
		sortedValues.length - 1,
		Math.max(0, Math.ceil(fraction * sortedValues.length) - 1)
	);
	return sortedValues[index];
}

export function describe(values: number[]): Distribution {
	if (values.length === 0) {
		return { count: 0, mean: 0, p50: 0, p95: 0, p99: 0, max: 0 };
	}

	const sorted = [...values].sort((left, right) => left - right);
	const total = sorted.reduce((sum, value) => sum + value, 0);

	return {
		count: sorted.length,
		mean: total / sorted.length,
		p50: percentile(sorted, 0.5),
		p95: percentile(sorted, 0.95),
		p99: percentile(sorted, 0.99),
		max: sorted[sorted.length - 1]
	};
}

export function describeFrames(deltas: number[]): FrameStats {
	const distribution = describe(deltas);
	const threshold = FRAME_BUDGET_MS * DROPPED_FRAME_FACTOR;
	let dropped = 0;
	let jankMs = 0;

	for (const delta of deltas) {
		if (delta > threshold) {
			dropped += 1;
		}
		if (delta > FRAME_BUDGET_MS) {
			jankMs += delta - FRAME_BUDGET_MS;
		}
	}

	return {
		...distribution,
		dropped,
		droppedRatio: deltas.length > 0 ? dropped / deltas.length : 0,
		jankMs
	};
}

export function describeCoverage(samples: CoverageSample[]): CoverageStats {
	if (samples.length === 0) {
		return { samples: 0, blankFrameRatio: 0, meanRatio: 0, maxRatio: 0, maxBlankPx: 0 };
	}

	let blankFrames = 0;
	let ratioTotal = 0;
	let maxRatio = 0;
	let maxBlankPx = 0;

	for (const sample of samples) {
		if (sample.blankPx > 0.5) blankFrames += 1;
		ratioTotal += sample.ratio;
		if (sample.ratio > maxRatio) maxRatio = sample.ratio;
		if (sample.blankPx > maxBlankPx) maxBlankPx = sample.blankPx;
	}

	return {
		samples: samples.length,
		blankFrameRatio: blankFrames / samples.length,
		meanRatio: ratioTotal / samples.length,
		maxRatio,
		maxBlankPx
	};
}

/** Resolves on the next animation frame, with that frame's timestamp. */
export function nextFrame(): Promise<number> {
	return new Promise((resolve) => requestAnimationFrame(resolve));
}

/**
 * Waits until the main thread has been quiet for two consecutive frames, so a
 * scenario never measures the tail of the previous one.
 */
export async function settle(frames = 6): Promise<void> {
	for (let index = 0; index < frames; index += 1) {
		await nextFrame();
	}
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

type PerformanceEntryWithDuration = { duration: number };

/** Collects `longtask` entries for the duration of a scenario. */
export class LongTaskRecorder {
	#observer: PerformanceObserver | undefined;
	#durations: number[] = [];
	#supported = false;

	start(): void {
		this.#durations = [];
		this.#supported = false;

		if (typeof PerformanceObserver === 'undefined') return;
		const supportedTypes = PerformanceObserver.supportedEntryTypes;
		if (!supportedTypes || !supportedTypes.includes('longtask')) return;

		this.#observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries() as PerformanceEntryWithDuration[]) {
				this.#durations.push(entry.duration);
			}
		});
		this.#observer.observe({ type: 'longtask', buffered: false });
		this.#supported = true;
	}

	stop(): LongTaskStats {
		this.#observer?.disconnect();
		this.#observer = undefined;

		let totalMs = 0;
		let maxMs = 0;
		for (const duration of this.#durations) {
			totalMs += duration;
			if (duration > maxMs) maxMs = duration;
		}

		return {
			count: this.#durations.length,
			totalMs,
			maxMs,
			supported: this.#supported
		};
	}
}

export type CoverageGeometry = {
	/** Fixed row height the virtualizer was configured with. */
	rowHeight: number;
	/** Height of the sticky header overlaying the top of the scroll viewport. */
	headerHeight: number;
};

/** Reads a spacer's height from its inline style — no layout is forced. */
function readSpacerHeight(body: HTMLElement, side: 'top' | 'bottom'): number | null {
	const spacer = body.querySelector<HTMLElement>(`[data-virtual-spacer="${side}"] > div`);
	if (!spacer) return null;
	const height = Number.parseFloat(spacer.style.height);
	return Number.isFinite(height) ? height : null;
}

/**
 * Measures how much of the scroll viewport the table body currently paints.
 *
 * Deliberately arithmetic rather than geometric: an earlier version called
 * `getBoundingClientRect` on the container, header and edge rows every frame,
 * which forced a synchronous layout per sample and showed up as ~13% of self
 * time in the profile — the probe was measuring itself. Everything here comes
 * from the scroll offset plus the spacer heights the virtualizer already wrote
 * as inline styles, so sampling costs one `scrollTop` read.
 */
export function sampleCoverage(
	container: HTMLElement,
	geometry: CoverageGeometry
): CoverageSample | null {
	const body = container.querySelector<HTMLElement>('[data-table-body]');
	if (!body) return null;

	const renderedRows = body.querySelectorAll('tr:not([data-virtual-spacer])').length;
	if (renderedRows === 0) return null;

	const viewportTop = container.scrollTop;
	const bandPx = Math.max(0, container.clientHeight - geometry.headerHeight);
	if (bandPx <= 0) return null;
	const viewportBottom = viewportTop + bandPx;

	const topSpacerPx = readSpacerHeight(body, 'top');
	const bottomSpacerPx = readSpacerHeight(body, 'bottom');

	const renderedTop = topSpacerPx ?? 0;
	const renderedBottom = renderedTop + renderedRows * geometry.rowHeight;

	// Only count a gap when the virtualizer claims there is more list on that
	// side; the natural empty space under a short list is not a symptom.
	const blankTop =
		topSpacerPx === null ? 0 : Math.max(0, Math.min(renderedTop, viewportBottom) - viewportTop);
	const blankBottom =
		bottomSpacerPx === null
			? 0
			: Math.max(0, viewportBottom - Math.max(renderedBottom, viewportTop));
	const blankPx = blankTop + blankBottom;

	return { bandPx, blankPx, ratio: blankPx / bandPx };
}

export type FrameRecording = {
	deltas: number[];
	coverage: CoverageSample[];
	durationMs: number;
};

export type FrameDriver = (frame: number) => void;

/**
 * Runs `drive` once per animation frame for `frames` frames, recording the
 * frame-to-frame delta and (optionally) how much of `coverageTarget` was blank
 * at the start of each frame.
 *
 * The driver mutates state at the top of the frame; the delta to the *next*
 * frame is what that mutation cost, since the browser cannot present until the
 * main thread is free again.
 */
export function recordFrames(
	frames: number,
	drive: FrameDriver,
	coverage?: { target: HTMLElement; geometry: CoverageGeometry }
): Promise<FrameRecording> {
	return new Promise((resolve) => {
		const deltas: number[] = [];
		const samples: CoverageSample[] = [];
		let previousTimestamp: number | undefined;
		let frame = 0;
		const startedAt = performance.now();

		const step = (timestamp: number) => {
			if (previousTimestamp !== undefined) {
				deltas.push(timestamp - previousTimestamp);
			}
			previousTimestamp = timestamp;

			if (coverage) {
				const sample = sampleCoverage(coverage.target, coverage.geometry);
				if (sample) samples.push(sample);
			}

			if (frame >= frames) {
				resolve({ deltas, coverage: samples, durationMs: performance.now() - startedAt });
				return;
			}

			drive(frame);
			frame += 1;
			requestAnimationFrame(step);
		};

		requestAnimationFrame(step);
	});
}

/**
 * Times a synchronous state change including the framework work it triggers.
 * `flush` must force the framework to process the update (Svelte's `flushSync`).
 */
export function timeSyncUpdate(apply: () => void, flush: () => void): number {
	const startedAt = performance.now();
	apply();
	flush();
	return performance.now() - startedAt;
}
