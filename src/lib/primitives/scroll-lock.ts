/**
 * Scroll lock primitive.
 * Prevents scrolling of the document body.
 */

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

function lock() {
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = getScrollbarWidth();

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount++;
}

function unlock() {
  lockCount--;
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }
  lockCount = Math.max(0, lockCount);
}

/**
 * Svelte action that locks scrolling on the document body.
 * Handles multiple nested scroll locks correctly.
 * 
 * @example
 * ```svelte
 * <div use:scrollLock={isOpen}>
 *   Modal content
 * </div>
 * ```
 */
export function scrollLock(node: HTMLElement, enabled: boolean = true) {
  if (enabled) {
    lock();
  }

  return {
    update(newEnabled: boolean) {
      if (newEnabled && !enabled) {
        lock();
      } else if (!newEnabled && enabled) {
        unlock();
      }
      enabled = newEnabled;
    },
    destroy() {
      if (enabled) {
        unlock();
      }
    }
  };
}
