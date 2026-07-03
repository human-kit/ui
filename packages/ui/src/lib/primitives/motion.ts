/**
 * Motion helpers for presence (enter/exit) animations.
 *
 * Components that keep a node mounted across an exit animation need to know when that animation has
 * actually finished. Rather than hard-coding a duration, these helpers read the element's computed
 * CSS so timing follows whatever the consumer styled — including 0ms under prefers-reduced-motion.
 */

function parseTimeList(value: string): number[] {
	return value
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			if (entry.endsWith('ms')) return Number.parseFloat(entry);
			if (entry.endsWith('s')) return Number.parseFloat(entry) * 1000;
			return Number.parseFloat(entry) || 0;
		});
}

function getMaxTime(duration: string, delay: string): number {
	const durations = parseTimeList(duration);
	const delays = parseTimeList(delay);
	const length = Math.max(durations.length, delays.length);

	let maxTime = 0;
	for (let index = 0; index < length; index += 1) {
		const total =
			(durations[index] ?? durations[durations.length - 1] ?? 0) +
			(delays[index] ?? delays[delays.length - 1] ?? 0);
		maxTime = Math.max(maxTime, total);
	}

	return maxTime;
}

/** Total time (ms) the element's longest transition or animation will take, including delay. */
export function getMotionTime(element: HTMLElement): number {
	const styles = getComputedStyle(element);
	const transitionTime = getMaxTime(styles.transitionDuration, styles.transitionDelay);
	const animationTime = getMaxTime(styles.animationDuration, styles.animationDelay);
	return Math.max(transitionTime, animationTime);
}

export type MotionTracker = {
	/** Tear down all listeners/timers without invoking the completion callback. */
	cancel: () => void;
};

/**
 * Call `onComplete` once the element's current transition/animation finishes. Resolves on the next
 * frame when there is no motion (e.g. prefers-reduced-motion), listens for animation/transition end
 * otherwise, and falls back to a timer in case the end event never fires.
 */
export function trackMotionEnd(element: HTMLElement, onComplete: () => void): MotionTracker {
	let cleanupListeners: (() => void) | undefined;
	let timer: number | undefined;
	let frame: number | undefined;
	let done = false;

	function finish() {
		if (done) return;
		done = true;
		if (timer !== undefined) window.clearTimeout(timer);
		cleanupListeners?.();
		onComplete();
	}

	frame = requestAnimationFrame(() => {
		frame = undefined;
		if (!element.isConnected) {
			finish();
			return;
		}

		const total = getMotionTime(element);
		if (total <= 0) {
			finish();
			return;
		}

		const handleMotionEnd = (event: Event) => {
			if (event.target !== element) return;
			finish();
		};

		element.addEventListener('animationend', handleMotionEnd);
		element.addEventListener('transitionend', handleMotionEnd);
		cleanupListeners = () => {
			element.removeEventListener('animationend', handleMotionEnd);
			element.removeEventListener('transitionend', handleMotionEnd);
		};

		timer = window.setTimeout(finish, total + 50);
	});

	return {
		cancel() {
			if (done) return;
			done = true;
			if (frame !== undefined) cancelAnimationFrame(frame);
			if (timer !== undefined) window.clearTimeout(timer);
			cleanupListeners?.();
		}
	};
}
