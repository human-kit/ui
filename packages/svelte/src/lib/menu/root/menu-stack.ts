/**
 * Global stack of open menu layers (root menu + submenus). Ensures only the
 * topmost open menu reacts to Escape and outside-press, so closing a submenu
 * doesn't also close its ancestors.
 */
type MenuLayer = { id: symbol };

const stack: MenuLayer[] = [];

export function pushMenuLayer(): symbol {
	const id = Symbol('menu-layer');
	stack.push({ id });
	return id;
}

export function removeMenuLayer(id: symbol): void {
	const index = stack.findIndex((layer) => layer.id === id);
	if (index !== -1) {
		stack.splice(index, 1);
	}
}

export function isTopmostMenu(id: symbol): boolean {
	if (stack.length === 0) return false;
	return stack[stack.length - 1].id === id;
}
