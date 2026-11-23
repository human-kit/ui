/**
 * The input modality, for the focus contract of `@human-kit/ui`: a focus that a pointer gave
 * does not show `data-focus-visible`. This is the subset of the ui primitive that a chart needs.
 */
export type Modality = 'keyboard' | 'pointer' | 'virtual';

let modality: Modality = 'virtual';
let lastInput = Number.NEGATIVE_INFINITY;
const listeners = new Set<() => void>();
let installed = false;

function set(next: Modality) {
	if (modality === next) return;
	modality = next;
	for (const listener of [...listeners]) listener();
}

function install() {
	if (installed || typeof window === 'undefined') return;
	installed = true;
	window.addEventListener(
		'keydown',
		(event) => {
			lastInput = Date.now();
			if (!event.ctrlKey && !event.metaKey && !event.altKey) set('keyboard');
		},
		true
	);
	window.addEventListener(
		'pointerdown',
		() => {
			lastInput = Date.now();
			set('pointer');
		},
		true
	);
	// A focus move without a recent input came from assistive technology or a script.
	window.addEventListener('focusin', () => Date.now() - lastInput > 50 && set('virtual'), true);
}

/** Calls `listener` at each change of the modality. Returns the function that stops it. */
export function onModalityChange(listener: () => void): () => void {
	install();
	listeners.add(listener);
	return () => listeners.delete(listener);
}

/** Whether the element must show `data-focus-visible`. */
export function isFocusVisible(element: Element | null): boolean {
	install();
	return !!element && modality !== 'pointer' && element.matches(':focus-visible');
}

/** Focuses the element without a focus ring, as a pointer press does. */
export function focusFromPointer(element: HTMLElement | SVGElement) {
	install();
	set('pointer');
	element.focus({ focusVisible: false } as FocusOptions);
}
