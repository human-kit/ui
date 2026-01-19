/**
 * Hides all elements in the DOM tree outside of the given targets from screen readers
 * and makes them inert. Based on React Aria's ariaHideOutside implementation.
 * 
 * This works by walking the DOM from the body and marking all siblings
 * of ancestors of the target elements as inert.
 */

interface HideOutsideResult {
  /** Call this to restore the original state */
  restore: () => void;
}

/**
 * Hides all content outside of the target elements from assistive technologies
 * and makes it non-interactive.
 * 
 * @example
 * ```typescript
 * const { restore } = hideOutside([popoverRef]);
 * // Later, when popover closes:
 * restore();
 * ```
 */
export function hideOutside(targets: HTMLElement[]): HideOutsideResult {
  const hiddenElements: Map<Element, { hadInert: boolean; ariaHidden: string | null }> = new Map();

  const targetSet = new Set<Element>(targets);

  const targetAncestors = new Set<Element>();
  for (const target of targets) {
    let current: Element | null = target.parentElement;
    while (current) {
      targetAncestors.add(current);
      current = current.parentElement;
    }
  }

  function walk(root: Element): void {
    const children = root.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      const tagName = child.tagName;
      if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'LINK') {
        continue;
      }

      if (targetSet.has(child)) {
        continue;
      }

      if (targetAncestors.has(child)) {
        walk(child);
      } else {
        hiddenElements.set(child, {
          hadInert: child.hasAttribute('inert'),
          ariaHidden: child.getAttribute('aria-hidden')
        });

        child.setAttribute('inert', '');
        child.setAttribute('aria-hidden', 'true');
      }
    }
  }

  if (document.body) {
    walk(document.body);
  }

  return {
    restore(): void {
      hiddenElements.forEach((original, element) => {
        if (!original.hadInert) {
          element.removeAttribute('inert');
        }

        if (original.ariaHidden === null) {
          element.removeAttribute('aria-hidden');
        } else {
          element.setAttribute('aria-hidden', original.ariaHidden);
        }
      });
      hiddenElements.clear();
    }
  };
}

/**
 * Svelte action that hides all content outside of the element.
 * 
 * @example
 * ```svelte
 * <div use:ariaHideOutside={enabled}>
 *   Modal content
 * </div>
 * ```
 */
export function ariaHideOutside(node: HTMLElement, enabled: boolean = true) {
  let result: HideOutsideResult | null = null;

  function activate(): void {
    requestAnimationFrame(() => {
      if (node.isConnected) {
        result = hideOutside([node]);
      }
    });
  }

  function deactivate(): void {
    if (result) {
      result.restore();
      result = null;
    }
  }

  if (enabled) {
    activate();
  }

  return {
    update(newEnabled: boolean): void {
      if (newEnabled && !enabled) {
        activate();
      } else if (!newEnabled && enabled) {
        deactivate();
      }
      enabled = newEnabled;
    },
    destroy(): void {
      deactivate();
    }
  };
}
