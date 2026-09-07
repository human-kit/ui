import { shouldShowFocusVisible, subscribeInputModality } from './input-modality.js';

/**
 * Keeps a `focusVisible` value honest while the element holds focus.
 *
 * `shouldShowFocusVisible` reads the modality at the moment it is called, so a component that
 * only calls it from its focus handler holds a snapshot. A pointer press seeds `false`, and a
 * key press after it flips the modality — and the `:focus-visible` of the browser — with nothing
 * to tell the component. This subscribes for as long as the element has focus, and it re-reads
 * on each change, which is what React Aria and Base UI do.
 */
export function watchFocusVisible(options: {
	isFocused: () => boolean;
	element: () => HTMLElement | null;
	set: (focusVisible: boolean) => void;
}) {
	$effect(() => {
		if (!options.isFocused()) return;

		return subscribeInputModality(() => {
			options.set(shouldShowFocusVisible(options.element()));
		});
	});
}
