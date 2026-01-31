/**
 * Click outside primitive.
 * Detects clicks outside of an element.
 */

export type ClickOutsideOptions = {
  /** Callback when clicking outside. */
  handler: () => void;
  /** Whether the listener is enabled. */
  enabled?: boolean;
  /** Elements to ignore (clicks on these won't trigger). */
  ignore?: (HTMLElement | null)[];
};

/**
 * Check if an element is in a "top layer" (portal, dialog, popover, etc.)
 * that was spawned from within the reference node.
 * This prevents clicks on nested portals from triggering clickOutside.
 */
function isInTopLayer(target: Node): boolean {
  if (!(target instanceof Element)) return false;
  
  // Check if the element or any ancestor is marked as top-layer
  // This includes our popovers, nested dialogs, and other portaled content
  const topLayerElement = target.closest('[data-dialog-content], [role="dialog"]');
  return topLayerElement !== null;
}

/**
 * Svelte action that detects clicks outside of an element.
 * 
 * @example
 * ```svelte
 * <div use:clickOutside={{ handler: close, ignore: [triggerRef] }}>
 *   Popover content
 * </div>
 * ```
 */
export function clickOutside(node: HTMLElement, options: ClickOutsideOptions) {
  let { handler, enabled = true, ignore = [] } = options;

  function handleClick(event: MouseEvent) {
    if (!enabled) return;

    const target = event.target as Node;

    if (node.contains(target)) return;

    for (const el of ignore) {
      if (el && el.contains(target)) return;
    }

    // Don't trigger if clicking on a top-layer element (portal content)
    // This prevents closing when clicking on nested popovers/dialogs
    if (isInTopLayer(target)) return;

    handler();
  }

  if (enabled) {
    document.addEventListener('mousedown', handleClick, true);
  }

  return {
    update(newOptions: ClickOutsideOptions) {
      const wasEnabled = enabled;
      handler = newOptions.handler;
      enabled = newOptions.enabled ?? true;
      ignore = newOptions.ignore ?? [];

      if (enabled && !wasEnabled) {
        document.addEventListener('mousedown', handleClick, true);
      } else if (!enabled && wasEnabled) {
        document.removeEventListener('mousedown', handleClick, true);
      }
    },
    destroy() {
      document.removeEventListener('mousedown', handleClick, true);
    }
  };
}
