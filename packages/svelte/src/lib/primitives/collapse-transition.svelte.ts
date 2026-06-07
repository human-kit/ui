import { trackMotionEnd, type MotionTracker } from './motion';

export type CollapseTransitionStatus = 'starting' | 'ending' | undefined;

export type CollapseTransition = {
	/** Whether the panel content should be in the DOM (true through the whole exit animation). */
	readonly mounted: boolean;
	/** Enter/exit phase for the `data-starting-style` / `data-ending-style` hooks. */
	readonly status: CollapseTransitionStatus;
	/** Measured content size (px) for the `--*-panel-height` / `--*-panel-width` CSS vars. */
	readonly height: number | undefined;
	readonly width: number | undefined;
	/** Wire up measurement once the panel element exists (call from a `$effect`). */
	setPanel: (element: HTMLElement | null) => void;
};

/**
 * Drives a collapsible panel's enter/exit transitions the way Base UI's Collapsible does:
 * - keeps the content mounted for the full exit animation, then unmounts it (or, with
 *   `forceMount`, leaves it mounted to be `hidden` at rest);
 * - exposes `status` so the panel can paint `data-starting-style` / `data-ending-style`;
 * - measures the content so the panel can transition to a real `height`/`width` instead of relying
 *   on a CSS trick that fights `[hidden] { display: none }`.
 *
 * Pass reactive getters for `open` and `forceMount`.
 */
export function createCollapseTransition(
	open: () => boolean,
	forceMount: () => boolean
): CollapseTransition {
	let mounted = $state(open() || forceMount());
	let status = $state<CollapseTransitionStatus>(undefined);
	let height = $state<number | undefined>(undefined);
	let width = $state<number | undefined>(undefined);

	let panel: HTMLElement | null = null;
	let resizeObserver: ResizeObserver | undefined;
	let tracker: MotionTracker | undefined;
	let releaseFrame: number | undefined;
	let previousOpen = open();

	function measure() {
		// Freeze the size while collapsing so the exit animates from the open height, not from 0.
		if (!panel || status === 'ending') return;
		height = panel.scrollHeight;
		width = panel.scrollWidth;
	}

	function cancelRelease() {
		if (releaseFrame !== undefined) {
			cancelAnimationFrame(releaseFrame);
			releaseFrame = undefined;
		}
	}

	function cancelTracker() {
		tracker?.cancel();
		tracker = undefined;
	}

	function finishExit() {
		status = undefined;
		if (!forceMount()) mounted = false;
	}

	$effect(() => {
		const isOpen = open();
		// Re-runs that aren't an open/close transition (e.g. `mounted` settling) must neither restart
		// nor abort an in-flight animation.
		if (isOpen === previousOpen) {
			if (isOpen) mounted = true;
			return;
		}
		previousOpen = isOpen;
		cancelRelease();
		cancelTracker();

		if (isOpen) {
			mounted = true;
			status = 'starting';
			// Measure the now-rendered content, let the collapsed "starting" state paint, then release
			// so the panel transitions to the open size.
			releaseFrame = requestAnimationFrame(() => {
				measure();
				releaseFrame = requestAnimationFrame(() => {
					if (open()) status = undefined;
				});
			});
			return;
		}

		if (!mounted) {
			status = undefined;
			return;
		}
		status = 'ending';
		if (panel) {
			tracker = trackMotionEnd(panel, finishExit);
		} else {
			finishExit();
		}
	});

	$effect(() => () => {
		cancelRelease();
		cancelTracker();
		resizeObserver?.disconnect();
	});

	return {
		get mounted() {
			return mounted;
		},
		get status() {
			return status;
		},
		get height() {
			return height;
		},
		get width() {
			return width;
		},
		setPanel(element) {
			const next = element ?? null;
			if (next === panel) return;
			resizeObserver?.disconnect();
			panel = next;
			if (!panel) return;
			measure();
			resizeObserver = new ResizeObserver(() => measure());
			resizeObserver.observe(panel);
		}
	};
}
