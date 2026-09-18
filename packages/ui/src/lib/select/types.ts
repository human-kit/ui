import type { Snippet } from 'svelte';
import type {
	FullAutoFill,
	HTMLAttributes,
	HTMLButtonAttributes,
	HTMLLabelAttributes
} from 'svelte/elements';
import type { SelectContext, SelectOpenChangeDetails, SelectKey } from './root/context';

export type { SelectOpenChangeDetails, SelectKey };

export type SelectRootProps<T extends object = object> = {
	/** A stable id, from which the component makes its internal ARIA ids. Give one on a server. */
	id?: string;
	/**
	 * The selected key or keys: one key in the single mode, and an array in the multiple mode. You
	 * can bind it with `bind:value`.
	 */
	value?: SelectKey | null | SelectKey[];
	/** The selection at the start, for when you give no `value`. */
	defaultValue?: SelectKey | null | SelectKey[];
	/**
	 * Give your own code full control of the selection. The component stops to write back to
	 * `value`, and it reports only through `onChange`. Thus the parent can refuse a change: the
	 * parent does not send the new value down. The default is off, because `bind:value` is the usual
	 * case and it needs the write-back.
	 */
	controlledValue?: boolean;
	/** The component calls it when the selection changes. */
	onChange?: (value: SelectKey | null | SelectKey[]) => void;
	/** The open state of the popover. You can bind it with `bind:open`. */
	open?: boolean;
	/** The open state at the start, for when you give no `open`. */
	defaultOpen?: boolean;
	/** Give your own code full control of the open state. Read `controlledValue`. */
	controlledOpen?: boolean;
	/** The component calls it when the open state changes. `details.cancel()` refuses the change. */
	onOpenChange?: (open: boolean, details: SelectOpenChangeDetails) => void;
	/** The selection mode: 'single' permits one key, and 'multiple' permits more than one. */
	selectionMode?: 'single' | 'multiple';
	/**
	 * Closes the popover after a selection. The default is true in the single mode, and false in the
	 * multiple mode.
	 */
	closeOnSelect?: boolean;
	/** The keys of the options that the user cannot select. */
	disabledKeys?: Iterable<SelectKey>;
	/**
	 * At the last option, the arrow keys move the focus to the first option, and at the first
	 * option, to the last one.
	 */
	loop?: boolean;
	/** Disables the select. The trigger is disabled natively. */
	disabled?: boolean;
	/** Keeps the trigger in the tab order, but the popover does not open and the value does not change. */
	readonly?: boolean;
	/** Tells a form that it must have a value. The hidden control gets the native `required`. */
	required?: boolean;
	/** Marks the value as invalid. The trigger gets `aria-invalid`. */
	invalid?: boolean;
	/** The name of the hidden form control. Without it, the form does not send the value. */
	name?: string;
	/** The id of the form that the hidden control belongs to, when the select is outside it. */
	form?: string;
	/** The `autocomplete` of the hidden form control, for the browser autofill. */
	autocomplete?: FullAutoFill | null;
	/**
	 * The array of the items. The component reads the text of a selected key from it. Thus the
	 * trigger shows the text while the popover is closed and the options are not in the DOM.
	 *
	 * Each item needs a key in `id` or `value`, and a text in `textValue`, `label` or `name`.
	 */
	items?: T[];
	/** The text of the trigger while nothing is selected. */
	placeholder?: string;
	/** The accessible name of the select, for when there is no `Select.Label`. */
	'aria-label'?: string;
	/** The id of the element that gives the select its name, in place of `Select.Label`. */
	'aria-labelledby'?: string;
	/** The id of the element that describes the select, for example an error message. */
	'aria-describedby'?: string;
	/** The content: the label, the trigger and the popover. */
	children?: Snippet;
	/** The CSS class names of the root element. */
	class?: string;
	/** A bindable reference to the root element. */
	element?: HTMLDivElement | null;
	/** A bindable reference to the context, for a composition of your own. */
	context?: SelectContext;
} & Omit<
	HTMLAttributes<HTMLDivElement>,
	| 'class'
	| 'children'
	| 'id'
	| 'aria-label'
	| 'aria-labelledby'
	| 'aria-describedby'
	| 'onchange'
	| 'placeholder'
	| 'autocomplete'
>;

export type SelectTriggerRenderState = {
	/** Whether the popover is open. */
	open: boolean;
	/** Whether nothing is selected. */
	placeholder: boolean;
	/** Whether the select is disabled. */
	disabled: boolean;
};

export type SelectTriggerProps = Omit<
	HTMLButtonAttributes,
	| 'type'
	| 'class'
	| 'children'
	| 'disabled'
	| 'role'
	| 'aria-haspopup'
	| 'aria-expanded'
	| 'aria-controls'
	| 'aria-labelledby'
	| 'aria-required'
	| 'aria-readonly'
	| 'aria-invalid'
	| 'aria-describedby'
> & {
	/**
	 * The content. As a snippet with one argument, it receives the render state: `open`,
	 * `placeholder` and `disabled`. Put a `Select.Value` inside it.
	 */
	children?: Snippet<[SelectTriggerRenderState]> | Snippet;
	/** The CSS class names of the trigger. */
	class?: string;
	/** A bindable reference to the button element. */
	element?: HTMLButtonElement | null;
};

export type SelectValueRenderState = {
	/** The selected key, or the selected keys in the multiple mode. */
	value: SelectKey | null | SelectKey[];
	/** The text of the selection, or the placeholder while nothing is selected. */
	label: string;
	/** Whether the component shows the placeholder. */
	placeholder: boolean;
};

export type SelectValueProps = Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'> & {
	/**
	 * The content. As a snippet with one argument, it receives the render state: `value`, `label` and
	 * `placeholder`. Without it, the component shows the text of the selection.
	 */
	children?: Snippet<[SelectValueRenderState]>;
	/** The text while nothing is selected. It replaces the placeholder of the root. */
	placeholder?: string;
	/** The CSS class names of the element. */
	class?: string;
};

export type SelectLabelProps = Omit<HTMLLabelAttributes, 'class' | 'for'> & {
	/** The CSS class names of the label. */
	class?: string;
};

export type SelectItemIndicatorProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	'class' | 'children'
> & {
	/** The content while the option is selected. The default is a check mark icon. */
	children?: Snippet;
	/** Keeps the indicator in the DOM, for each selection state. */
	forceMount?: boolean;
	/** The CSS class names of the element. */
	class?: string;
};
