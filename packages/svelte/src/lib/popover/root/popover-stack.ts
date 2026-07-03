/**
 * Global stack of open popover layers. Ensures only the topmost open popover
 * reacts to Escape and outside-press, so dismissing a nested popover (e.g. a
 * date picker calendar inside a filter popover) doesn't also close its ancestors.
 */
type PopoverLayer = { id: symbol };

const stack: PopoverLayer[] = [];

export function pushPopoverLayer(): symbol {
	const id = Symbol('popover-layer');
	stack.push({ id });
	return id;
}

export function removePopoverLayer(id: symbol): void {
	const index = stack.findIndex((layer) => layer.id === id);
	if (index !== -1) {
		stack.splice(index, 1);
	}
}

export function isTopmostPopover(id: symbol): boolean {
	if (stack.length === 0) return false;
	return stack[stack.length - 1].id === id;
}
