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
