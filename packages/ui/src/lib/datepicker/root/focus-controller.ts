import { focusWithModality, type InputModality } from '../../primitives/input-modality';

export function applyTriggerSelectionCloseState(
	triggerRef: HTMLElement | null,
	modality: InputModality
) {
	if (!triggerRef) return;
	requestAnimationFrame(() => {
		if (!triggerRef || !triggerRef.isConnected) return;
		focusWithModality(triggerRef, modality);
	});
}

export function computeDatePickerFocusWithin(rootId: string): boolean {
	const root = document.getElementById(rootId);
	const activeElement = document.activeElement;
	return !!root && !!activeElement && root.contains(activeElement);
}
