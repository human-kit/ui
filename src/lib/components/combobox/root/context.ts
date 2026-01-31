import { setContext, getContext } from 'svelte';
import type { Snippet } from 'svelte';
import type { ListBoxContext } from '$lib/components/listbox/root/context';

/**
 * Context shared between ComboBox and its children.
 */
export type ComboBoxContext<T extends object = object> = {
  /** Unique instance ID for ARIA attributes */
  instanceId: string;
  /** Current input value (used for filtering, respects shouldFilter flag) */
  inputValue: string;
  /** Display value shown in the input element (always shows actual text) */
  displayValue: string;
  /** Whether the popover is open */
  isOpen: boolean;
  /** Reference to the input element for positioning */
  inputRef: HTMLElement | null;
  /** Reference to the wrapper for popover positioning */
  triggerRef: HTMLElement | null;
  /** Currently selected value(s) */
  selectedValue: Set<string | number>;
  /** Whether the combobox is disabled */
  isDisabled: boolean;
  /** Whether the combobox is read-only */
  isReadOnly: boolean;
  /** Selection mode */
  selectionMode: 'single' | 'multiple';
  /** How the popover opens: 'focus' | 'input' | 'press' */
  trigger: 'focus' | 'input' | 'press';
  /** Whether inputValue should be used for filtering (false = show all items) */
  shouldFilter: boolean;
  /** Currently focused item ID (virtual focus) */
  focusedItemId: string | number | null;
  /** Registered item IDs for navigation */
  itemIds: (string | number)[];
  /** Item labels map for selection display */
  itemLabels: Map<string | number, string>;
  /** Pending focus direction when opening with keyboard */
  pendingFocusDirection: 'first' | 'last' | null;
  /** Reference to the ListBox context for navigation delegation */
  listboxCtx: ListBoxContext | null;
  /** Reference to the ListBox DOM element for scoped queries */
  listboxRef: HTMLElement | null;
  /** Optional: Array of items for dynamic rendering */
  items?: T[];
  /** Optional: Snippet to render each item */
  renderItem?: Snippet<[T]>;

  // Methods
  /** Set the input ref */
  setInputRef: (el: HTMLElement | null) => void;
  /** Set the trigger ref (wrapper) */
  setTriggerRef: (el: HTMLElement | null) => void;
  /** Set the ListBox context reference */
  setListboxCtx: (ctx: ListBoxContext) => void;
  /** Set the ListBox DOM element reference */
  setListboxRef: (el: HTMLElement | null) => void;
  /** Update input value */
  setInputValue: (value: string) => void;
  /** Open the popover */
  open: () => void;
  /** Close the popover */
  close: () => void;
  /** Toggle the popover */
  toggle: () => void;
  /** Select an item */
  select: (id: string | number, label: string) => void;
  /** Called when popover open state changes */
  onOpenChange: (open: boolean) => void;
  /** Set focused item ID (virtual focus) */
  setFocusedItemId: (id: string | number | null) => void;
  /** Register an item for navigation */
  registerItem: (id: string | number, label: string) => void;
  /** Unregister an item */
  unregisterItem: (id: string | number) => void;
  /** Handle keyboard events (arrow navigation, enter, escape) */
  handleKeydown: (event: KeyboardEvent) => void;
  /** Handle input blur - restore selection or deselect if empty */
  handleInputBlur: () => void;
};

const COMBOBOX_KEY = Symbol('combobox');

export function setComboBoxContext<T extends object = object>(ctx: ComboBoxContext<T>) {
  setContext(COMBOBOX_KEY, ctx);
}

export function getComboBoxContext<T extends object = object>(): ComboBoxContext<T> | undefined {
  return getContext<ComboBoxContext<T>>(COMBOBOX_KEY);
}

export function useComboBoxContext<T extends object = object>(): ComboBoxContext<T> {
  const ctx = getComboBoxContext<T>();
  if (!ctx) {
    throw new Error('ComboBox components must be used within a ComboBox');
  }
  return ctx;
}
