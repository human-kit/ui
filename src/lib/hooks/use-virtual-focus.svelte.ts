/**
 * useVirtualFocus - A reusable hook for virtual focus navigation.
 *
 * Implements the aria-activedescendant pattern for keyboard navigation
 * in composite widgets like ComboBox, Menu, Select, TreeView, etc.
 *
 * Features:
 * - Virtual focus state (focusedId)
 * - Item registration/unregistration
 * - Navigation (next, previous, first, last, pageUp, pageDown)
 * - DOM order caching for performance
 * - Scoped queries via containerRef
 *
 * @example
 * ```svelte
 * <script>
 *   import { useVirtualFocus } from '$lib/hooks/use-virtual-focus.svelte';
 *
 *   const nav = useVirtualFocus({
 *     instanceId: 'my-list',
 *     containerRef: () => listboxElement
 *   });
 *
 *   // Use nav.focusedId, nav.next(), nav.register(), etc.
 *   // PageSize is calculated automatically based on item count
 * </script>
 * ```
 */

export type VirtualFocusOptions = {
  /** Unique ID prefix for item identification */
  instanceId: string;
  /** Prefix for item IDs in the DOM (default: 'combobox-item') */
  itemPrefix?: string;
  /** Reference to container element for scoped DOM queries */
  containerRef?: () => HTMLElement | null;
};

export type VirtualFocusReturn = {
  // State (getters)
  readonly focusedId: string | number | null;
  readonly itemIds: (string | number)[];
  readonly itemLabels: Map<string | number, string>;
  readonly pendingFocusDirection: 'first' | 'last' | null;

  // Navigation
  next: () => void;
  previous: () => void;
  first: () => void;
  last: () => void;
  pageUp: () => void;
  pageDown: () => void;

  // Registration
  register: (id: string | number, label: string) => void;
  unregister: (id: string | number) => void;

  // Control
  setFocused: (id: string | number | null) => void;
  setPendingDirection: (direction: 'first' | 'last' | null) => void;
  reset: () => void;
  invalidateCache: () => void;
};

export function useVirtualFocus(options: VirtualFocusOptions): VirtualFocusReturn {
  const { instanceId, itemPrefix = 'combobox-item', containerRef } = options;

  // Internal state
  let focusedId: string | number | null = $state(null);
  let itemIds: (string | number)[] = $state([]);
  let itemLabels = $state(new Map<string | number, string>());
  let pendingFocusDirection: 'first' | 'last' | null = $state(null);
  let cachedItemOrder: (string | number)[] | null = $state(null);

  /**
   * Smart page size calculation based on number of registered items.
   * Ensures PageUp/PageDown jump a reasonable amount regardless of list size.
   */
  const pageSize = $derived(
    itemIds.length === 0
      ? 10
      : Math.max(5, Math.min(10, Math.ceil(itemIds.length / 3)))
  );

  /**
   * Get item IDs in DOM order.
   * Uses cache when available, queries DOM otherwise.
   */
  function getItemIdsInOrder(): (string | number)[] {
    if (cachedItemOrder !== null) {
      return cachedItemOrder;
    }

    const selector = `[id^="${itemPrefix}-${instanceId}-"]`;
    const queryRoot = containerRef?.() ?? document;
    const itemElements = queryRoot.querySelectorAll(selector);

    if (itemElements.length === 0) {
      cachedItemOrder = itemIds;
      return cachedItemOrder;
    }

    const orderedIds: (string | number)[] = [];
    const prefix = `${itemPrefix}-${instanceId}-`;

    itemElements.forEach((el) => {
      const fullId = el.getAttribute('id');
      if (fullId && fullId.startsWith(prefix)) {
        const itemId = fullId.substring(prefix.length);
        const numId = Number(itemId);
        orderedIds.push(isNaN(numId) ? itemId : numId);
      }
    });

    cachedItemOrder = orderedIds;
    return cachedItemOrder;
  }

  // Navigation functions
  function next() {
    const orderedIds = getItemIdsInOrder();
    if (orderedIds.length === 0) return;

    if (focusedId === null) {
      focusedId = orderedIds[0];
      return;
    }

    const currentIndex = orderedIds.indexOf(focusedId);
    if (currentIndex === -1) {
      focusedId = orderedIds[0];
    } else if (currentIndex < orderedIds.length - 1) {
      focusedId = orderedIds[currentIndex + 1];
    }
  }

  function previous() {
    const orderedIds = getItemIdsInOrder();
    if (orderedIds.length === 0) return;

    if (focusedId === null) {
      focusedId = orderedIds[orderedIds.length - 1];
      return;
    }

    const currentIndex = orderedIds.indexOf(focusedId);
    if (currentIndex === -1) {
      focusedId = orderedIds[orderedIds.length - 1];
    } else if (currentIndex > 0) {
      focusedId = orderedIds[currentIndex - 1];
    }
  }

  function first() {
    const orderedIds = getItemIdsInOrder();
    if (orderedIds.length > 0) {
      focusedId = orderedIds[0];
    }
  }

  function last() {
    const orderedIds = getItemIdsInOrder();
    if (orderedIds.length > 0) {
      focusedId = orderedIds[orderedIds.length - 1];
    }
  }

  function pageUp() {
    const orderedIds = getItemIdsInOrder();
    if (orderedIds.length === 0) return;

    const currentIndex = focusedId !== null ? orderedIds.indexOf(focusedId) : orderedIds.length - 1;
    const newIndex = Math.max(0, currentIndex - pageSize);
    focusedId = orderedIds[newIndex];
  }

  function pageDown() {
    const orderedIds = getItemIdsInOrder();
    if (orderedIds.length === 0) return;

    const currentIndex = focusedId !== null ? orderedIds.indexOf(focusedId) : 0;
    const newIndex = Math.min(orderedIds.length - 1, currentIndex + pageSize);
    focusedId = orderedIds[newIndex];
  }

  // Registration functions
  function register(id: string | number, label: string) {
    if (!itemIds.includes(id)) {
      itemIds = [...itemIds, id];
      cachedItemOrder = null; // Invalidate cache
    }
    itemLabels.set(id, label);

    // Apply pending focus if this is the target item
    if (pendingFocusDirection !== null && itemIds.length > 0) {
      if (pendingFocusDirection === 'first' && itemIds[0] === id) {
        focusedId = id;
        pendingFocusDirection = null;
      } else if (pendingFocusDirection === 'last') {
        focusedId = id;
      }
    }
  }

  function unregister(id: string | number) {
    itemIds = itemIds.filter((i) => i !== id);
    itemLabels.delete(id);
    cachedItemOrder = null; // Invalidate cache
    if (focusedId === id) {
      focusedId = null;
    }
  }

  // Control functions
  function setFocused(id: string | number | null) {
    focusedId = id;
  }

  function setPendingDirection(direction: 'first' | 'last' | null) {
    pendingFocusDirection = direction;
  }

  function reset() {
    focusedId = null;
    itemIds = [];
    itemLabels.clear();
    cachedItemOrder = null;
    pendingFocusDirection = null;
  }

  function invalidateCache() {
    cachedItemOrder = null;
  }

  return {
    get focusedId() {
      return focusedId;
    },
    get itemIds() {
      return itemIds;
    },
    get itemLabels() {
      return itemLabels;
    },
    get pendingFocusDirection() {
      return pendingFocusDirection;
    },
    next,
    previous,
    first,
    last,
    pageUp,
    pageDown,
    register,
    unregister,
    setFocused,
    setPendingDirection,
    reset,
    invalidateCache
  };
}
