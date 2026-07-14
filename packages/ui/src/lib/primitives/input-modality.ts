export type InputModality = 'keyboard' | 'pointer' | 'virtual';

let currentModality: InputModality = 'virtual';

/**
 * Timestamp of the last real user input (keydown/pointerdown/mousedown). A focus move with no
 * recent input event was not produced by the keyboard or a pointer — it came from a script or
 * an assistive technology (screen-reader virtual cursor), so it re-classifies as 'virtual'.
 * `Date.now()` (not `performance.now()`) so fake-timer test environments can advance it.
 */
const RECENT_INPUT_WINDOW_MS = 50;
let lastInputEventTime = Number.NEGATIVE_INFINITY;

const listenedWindows = new WeakSet<Window>();

let forcedFocusTarget: HTMLElement | null = null;
let forcedFocusModality: InputModality | null = null;

function isModifierOnlyKey(event: KeyboardEvent): boolean {
	return (
		event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt' || event.key === 'Meta'
	);
}

function isKeyboardModalityKey(event: KeyboardEvent): boolean {
	if (event.ctrlKey || event.metaKey || event.altKey) return false;
	if (isModifierOnlyKey(event)) return false;
	return true;
}

function ensureWindowListeners(win: Window | null | undefined) {
	if (!win) return;
	if (listenedWindows.has(win)) return;

	const onKeyDown = (event: KeyboardEvent) => {
		lastInputEventTime = Date.now();
		if (!isKeyboardModalityKey(event)) return;
		currentModality = 'keyboard';
	};

	const onPointerDown = () => {
		lastInputEventTime = Date.now();
		currentModality = 'pointer';
	};

	const onFocusIn = (event: FocusEvent) => {
		// A programmatic focus with an explicit modality (`focusWithModality`) must keep it —
		// its focusin fires synchronously, before the forced pair is consumed/cleared.
		if (forcedFocusTarget !== null && event.target === forcedFocusTarget) return;
		// Focus that follows real input keeps the modality that input established.
		if (Date.now() - lastInputEventTime <= RECENT_INPUT_WINDOW_MS) return;
		// No recent keyboard/pointer input: this focus move came from an assistive technology
		// (or a script), so focus rings must show again.
		currentModality = 'virtual';
	};

	win.addEventListener('keydown', onKeyDown, true);
	win.addEventListener('pointerdown', onPointerDown, true);
	win.addEventListener('mousedown', onPointerDown, true);
	win.addEventListener('focusin', onFocusIn, true);

	listenedWindows.add(win);
}

export function initInputModality(target?: HTMLElement | null) {
	const ownerWindow = target?.ownerDocument?.defaultView;
	if (ownerWindow) {
		ensureWindowListeners(ownerWindow);
		return;
	}
	if (typeof window !== 'undefined') {
		ensureWindowListeners(window);
	}
}

function inferModalityFromEvent(event: Event | undefined): InputModality | undefined {
	if (!event) return undefined;
	if (event instanceof KeyboardEvent) {
		return isKeyboardModalityKey(event) ? 'keyboard' : undefined;
	}
	if (event instanceof MouseEvent && event.type === 'click' && event.detail === 0) {
		return 'keyboard';
	}
	if (event instanceof PointerEvent || event instanceof MouseEvent) {
		return 'pointer';
	}
	return undefined;
}

function resolveModalityForTarget(target: HTMLElement | null): InputModality {
	if (target && forcedFocusTarget === target && forcedFocusModality) {
		const modality = forcedFocusModality;
		forcedFocusTarget = null;
		forcedFocusModality = null;
		return modality;
	}

	return currentModality;
}

export function trackInteractionModality(event?: Event, target?: HTMLElement | null): void {
	initInputModality(target);

	const inferred = inferModalityFromEvent(event);
	if (inferred) {
		currentModality = inferred;
	}
}

export function getInteractionModality(): InputModality {
	return currentModality;
}

export function shouldShowFocusVisible(target: HTMLElement | null): boolean {
	if (!target) return false;

	const modality = resolveModalityForTarget(target);
	if (modality === 'pointer') return false;

	return target.matches(':focus-visible');
}

export function focusWithModality(
	target: HTMLElement,
	modality: InputModality,
	options?: FocusOptions
) {
	initInputModality(target);
	// The forced target/modality pair is a synchronous safety net so a focus handler that runs
	// immediately after target.focus() can resolve the intended modality without racing async timing.
	// If it is consumed later, currentModality still preserves the same modality as fallback.
	forcedFocusTarget = target;
	forcedFocusModality = modality;
	currentModality = modality;

	if (modality === 'pointer') {
		const pointerFocusOptions = {
			...(options ?? {}),
			focusVisible: false
		} as FocusOptions & { focusVisible?: boolean };
		target.focus(pointerFocusOptions);
	} else {
		target.focus(options);
	}

	queueMicrotask(() => {
		if (forcedFocusTarget !== target) return;
		forcedFocusTarget = null;
		forcedFocusModality = null;
	});
}

export function resolveCloseInteractionModality(reason: string, event?: Event): InputModality {
	if (reason === 'escape-key') return 'keyboard';
	if (event instanceof KeyboardEvent) return 'keyboard';
	if (event instanceof PointerEvent || event instanceof MouseEvent) return 'pointer';
	if (reason === 'outside-press') return 'pointer';
	return 'virtual';
}
