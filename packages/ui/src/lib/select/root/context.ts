import { setContext, getContext } from 'svelte';
import type { ListBoxContext } from '../../listbox/root/context';
import type { PopoverCloseReason } from '../../popover/root/context';

export type SelectKey = string | number;

/**
 * The reasons of Popover, less its close button, plus the two of a select: a press on the open
 * trigger, and a selection.
 */
export type SelectCloseReason =
	Exclude<PopoverCloseReason, 'close-press'> | 'trigger-press' | 'item-select';

export type SelectOpenReason = 'trigger-press' | 'imperative-action' | 'none';

export type SelectChangeReason = SelectOpenReason | SelectCloseReason;

export type SelectOpenChangeDetails = {
	reason: SelectChangeReason;
	event?: Event;
	cancel: () => void;
	isCanceled: boolean;
};

/** Where the focus lands in the list when the popover opens. */
export type SelectOpenFocusIntent = 'selected' | 'first' | 'last';

/**
 * Context shared between Select.Root and its parts.
 */
export type SelectContext = {
	/** The instance id. Every ARIA id of the parts is made from it. */
	instanceId: string;
	/** The id of the trigger element. */
	triggerId: string;
	/** The id of the listbox element. */
	listboxId: string;
	/** The id of the `Select.Value` element, when one is in the DOM. */
	valueId: string | null;
	/** The id of the `Select.Label` element, when one is in the DOM. */
	labelId: string | null;
	/** Whether the popover is open. */
	isOpen: boolean;
	/** The selected keys. One key at most in the single mode. */
	selectedKeys: Set<SelectKey>;
	/** The selection mode. */
	selectionMode: 'single' | 'multiple';
	/** Whether the whole select is disabled. */
	isDisabled: boolean;
	/** Whether the select is read-only: it keeps the focus, and it refuses to open. */
	isReadOnly: boolean;
	/** Whether a form must have a value here. */
	isRequired: boolean;
	/** Whether the value failed a validation. */
	isInvalid: boolean;
	/** The `name` of the hidden form control. */
	name: string | undefined;
	/** The keys the user cannot select. */
	disabledKeys: Set<SelectKey>;
	/** Whether the arrow keys wrap at the ends of the list. */
	loop: boolean;
	/** The reference to the trigger element. */
	triggerRef: HTMLElement | null;
	/** The reference to the listbox element. */
	listboxRef: HTMLElement | null;
	/** The context of the inner ListBox, once it is in the DOM. */
	listboxCtx: ListBoxContext | null;
	/** The text of a key, from `items` or from an option that registered it. */
	getLabel: (key: SelectKey) => string;
	/** The keys in list order, when the root knows them from `items`. */
	orderedKeys: SelectKey[];
	/** The placeholder text, from the prop or from the locale. */
	placeholder: string;
	/** The `aria-label` given to the root. The trigger carries it. */
	ariaLabel: string | undefined;
	/** The `aria-labelledby` given to the root. The trigger carries it. */
	ariaLabelledBy: string | undefined;
	/** The `aria-describedby` given to the root. The trigger carries it. */
	ariaDescribedBy: string | undefined;

	setTriggerRef: (el: HTMLElement | null) => void;
	setListboxRef: (el: HTMLElement | null) => void;
	setListboxCtx: (ctx: ListBoxContext | null) => void;
	/** Registers the id of `Select.Value`. Returns the unregister function. */
	registerValue: (id: string) => () => void;
	/** Registers the id of `Select.Label`. Returns the unregister function. */
	registerLabel: (id: string) => () => void;
	/** Registers the text of an option, so the trigger can show it after the option leaves the DOM. */
	registerItemLabel: (key: SelectKey, label: string) => void;

	open: (reason?: SelectOpenReason, event?: Event, focus?: SelectOpenFocusIntent) => void;
	/** Closes the popover. Returns false when it was closed already, or when the consumer refused. */
	close: (reason?: SelectCloseReason, event?: Event) => boolean;
	toggle: (reason?: SelectOpenReason, event?: Event) => void;
	/** Opens the popover with a character for the list to search with. */
	openWithTypeahead: (char: string, event?: Event) => void;
	/** Applies a selection that the list reports, and closes the popover when the mode asks for it. */
	commitSelection: (keys: Set<SelectKey>) => void;
	/** Reads and clears where the focus must land at the next open. */
	consumeOpenFocus: () => SelectOpenFocusIntent;
	/** Reads and clears a character typed on the closed trigger, for the list to search with. */
	consumePendingTypeahead: () => string | null;
	/** Whether the focus is on the trigger or in the list. */
	isFocusWithin: boolean;
	/** Whether the focus in the select must show as keyboard focus. */
	isFocusVisible: boolean;
	setFocusWithin: (within: boolean) => void;
	setFocusVisible: (visible: boolean) => void;
};

const SELECT_KEY = Symbol('select');

export function setSelectContext(ctx: SelectContext) {
	setContext(SELECT_KEY, ctx);
}

export function getSelectContext(): SelectContext | undefined {
	return getContext<SelectContext>(SELECT_KEY);
}

export function useSelectContext(part: string): SelectContext {
	const ctx = getSelectContext();
	if (!ctx) {
		throw new Error(`${part} must be used inside a Select.Root`);
	}
	return ctx;
}

/**
 * A deterministic DOM id for an option. A key can hold characters that are not safe in an id
 * reference, so it is sanitized first.
 */
export function getSelectItemDomId(instanceId: string, key: SelectKey): string {
	return `select-item-${instanceId}-${String(key).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}
