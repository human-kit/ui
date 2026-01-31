/**
 * Focus trap primitive.
 * Traps keyboard focus within a container element.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(el => el.offsetParent !== null);
}

/**
 * Svelte action that traps focus within an element.
 * 
 * @example
 * ```svelte
 * <div use:focusTrap={isOpen}>
 *   <button>First</button>
 *   <button>Last</button>
 * </div>
 * ```
 */
export function focusTrap(node: HTMLElement, enabled: boolean = true) {
  let previousActiveElement: HTMLElement | null = null;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements(node);

    if (focusableElements.length === 0) {
      event.preventDefault();
      node.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const focusIsInside = node.contains(document.activeElement);

    if (!focusIsInside) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === firstElement || document.activeElement === node) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement || document.activeElement === node) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  function activate() {
    previousActiveElement = document.activeElement as HTMLElement;

    if (!node.hasAttribute('tabindex')) {
      node.setAttribute('tabindex', '-1');
    }

    // Focus first focusable element, or the container if none
    requestAnimationFrame(() => {
      const focusableElements = getFocusableElements(node);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        node.focus();
      }
    });

    document.addEventListener('keydown', handleKeydown, true);
  }

  function deactivate() {
    document.removeEventListener('keydown', handleKeydown, true);

    if (previousActiveElement && previousActiveElement.focus) {
      previousActiveElement.focus();
    }
  }

  if (enabled) {
    activate();
  }

  return {
    update(newEnabled: boolean) {
      if (newEnabled && !enabled) {
        activate();
      } else if (!newEnabled && enabled) {
        deactivate();
      }
      enabled = newEnabled;
    },
    destroy() {
      if (enabled) {
        deactivate();
      }
    }
  };
}
