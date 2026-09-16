<script lang="ts" generics="T extends object = object">
	import { untrack } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { readable } from 'svelte/store';
	import type { ListBoxContext } from '../../listbox/root/context';
	import { dev } from '../../internal/environment';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { getLocaleContext } from '../../locale-provider/context';
	import {
		focusWithModality,
		getInteractionModality,
		type InputModality
	} from '../../primitives/input-modality';
	import type { SelectRootProps } from '../types';
	import {
		setSelectContext,
		type SelectChangeReason,
		type SelectCloseReason,
		type SelectContext,
		type SelectOpenChangeDetails,
		type SelectOpenFocusIntent,
		type SelectOpenReason,
		type SelectKey
	} from './context';

	const generatedId = $props.id();

	let {
		id: idProp,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		open: openProp = $bindable(),
		defaultOpen = false,
		controlledOpen = false,
		onOpenChange,
		selectionMode = 'single',
		closeOnSelect,
		disabledKeys,
		loop = false,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		name,
		form,
		autocomplete,
		items,
		placeholder,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		'aria-describedby': ariaDescribedBy,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		...restProps
	}: SelectRootProps<T> = $props();

	const localeContext = getLocaleContext();
	const localeStore = localeContext?.locale ?? readable<string | undefined>(undefined);

	const instanceId = untrack(() => idProp) ?? generatedId;
	const triggerId = `select-trigger-${instanceId}`;
	const listboxId = `select-listbox-${instanceId}`;

	let rootRef: HTMLDivElement | null = $state(null);
	let triggerRef: HTMLElement | null = $state(null);
	let listboxRef: HTMLElement | null = $state(null);
	let listboxCtx: ListBoxContext | null = $state(null);
	let valueId: string | null = $state(null);
	let labelId: string | null = $state(null);
	let focusWithin = $state(false);
	let focusVisible = $state(false);

	// The text of every option that was ever in the DOM. A closed popover has no options in
	// it, and the trigger still has to show what is selected.
	const itemLabels = new SvelteMap<SelectKey, string>();
	const resolvedDisabledKeys = new SvelteSet<SelectKey>();

	$effect(() => {
		element = rootRef;
	});

	$effect(() => {
		const keys = disabledKeys ? Array.from(disabledKeys) : [];
		untrack(() => {
			resolvedDisabledKeys.clear();
			for (const key of keys) resolvedDisabledKeys.add(key);
		});
	});

	const effectiveCloseOnSelect = $derived(closeOnSelect ?? selectionMode === 'single');
	const resolvedPlaceholder = $derived(
		placeholder ?? resolveLocalizedString($localeStore, 'select.placeholder')
	);

	if (dev) {
		$effect(() => {
			if (value !== undefined && defaultValue !== undefined) {
				console.warn(
					'[Select]: Both "value" and "defaultValue" are provided. ' +
						'Use "value" for controlled mode or "defaultValue" for uncontrolled mode, not both.'
				);
			}
		});
	}

	// --- Selection ---------------------------------------------------------------------------

	function parseSelection(val: SelectKey | null | SelectKey[] | undefined): Set<SelectKey> {
		if (val == null) return new Set();
		if (Array.isArray(val)) return new Set(val);
		return new Set([val]);
	}

	function toExternalValue(keys: Set<SelectKey>): SelectKey | null | SelectKey[] {
		if (selectionMode === 'single') {
			const [first] = keys;
			return first ?? null;
		}
		return Array.from(keys);
	}

	let selectedInternal = $state<Set<SelectKey>>(parseSelection(untrack(() => defaultValue)));

	// Controlled-ness is opt-in, not inferred: `bind:value` and `value={...}` are the same thing
	// at runtime. The prop wins whenever it is supplied, and the internal state carries only the
	// fully uncontrolled case.
	const currentSelection = $derived(
		controlledValue || value !== undefined ? parseSelection(value) : selectedInternal
	);

	// A `bind:value` that starts undefined gets the selection at mount, thus the parent reads
	// the default without a first change: `null` in the single mode, `[]` in the multiple mode.
	$effect(() => {
		if (controlledValue) return;
		untrack(() => {
			if (value === undefined) value = toExternalValue(selectedInternal);
		});
	});

	function isItemRecord(item: unknown): item is Record<string, unknown> {
		return typeof item === 'object' && item !== null;
	}

	function getItemKey(item: T): SelectKey | undefined {
		if (!isItemRecord(item)) return undefined;
		const id = item.id;
		if (typeof id === 'string' || typeof id === 'number') return id;
		const itemValue = item.value;
		if (typeof itemValue === 'string' || typeof itemValue === 'number') return itemValue;
		return undefined;
	}

	function getItemText(item: T): string | undefined {
		if (!isItemRecord(item)) return undefined;
		for (const field of ['textValue', 'label', 'name']) {
			const text = item[field];
			if (typeof text === 'string') return text;
		}
		const key = getItemKey(item);
		return key === undefined ? undefined : String(key);
	}

	const orderedKeys = $derived(
		(items ?? [])
			.map((item) => getItemKey(item))
			.filter((key): key is SelectKey => key !== undefined)
	);

	function getLabel(key: SelectKey): string {
		const registered = itemLabels.get(key);
		if (registered) return registered;
		const item = items?.find((candidate) => getItemKey(candidate) === key);
		const text = item ? getItemText(item) : undefined;
		return text ?? String(key);
	}

	function applySelection(keys: Set<SelectKey>) {
		if (!controlledValue) {
			selectedInternal = keys;
			value = toExternalValue(keys);
		}
		onChange?.(toExternalValue(keys));
	}

	function sameSelection(a: Set<SelectKey>, b: Set<SelectKey>) {
		if (a.size !== b.size) return false;
		for (const key of a) if (!b.has(key)) return false;
		return true;
	}

	function commitSelection(keys: Set<SelectKey>) {
		if (disabled || readonly) return;
		// The modality is read before the close moves the focus: a pointer selection returns
		// the focus to the trigger without a ring, a keyboard selection with one.
		const modality = getInteractionModality();
		const changed = !sameSelection(keys, currentSelection);
		if (changed) {
			applySelection(keys);
		}
		// A second press on the selected option changes nothing, and the popover closes the
		// same as a native select does.
		if (effectiveCloseOnSelect && currentIsOpen) {
			closePopover('item-select', undefined, modality);
		}
	}

	// --- Open state --------------------------------------------------------------------------

	let isOpenInternal = $state(untrack(() => defaultOpen));
	const currentIsOpen = $derived(controlledOpen ? Boolean(openProp) : (openProp ?? isOpenInternal));

	let openFocusIntent: SelectOpenFocusIntent = 'selected';
	let pendingTypeahead: string | null = null;

	function createDetails(reason: SelectChangeReason, event?: Event): SelectOpenChangeDetails {
		let canceled = false;
		return {
			reason,
			event,
			cancel: () => {
				canceled = true;
			},
			get isCanceled() {
				return canceled;
			}
		};
	}

	function setOpen(next: boolean, reason: SelectChangeReason, event?: Event): boolean {
		if (next === currentIsOpen) return false;
		const details = createDetails(reason, event);
		onOpenChange?.(next, details);
		if (details.isCanceled) return false;
		if (!controlledOpen) {
			isOpenInternal = next;
			openProp = next;
		}
		return true;
	}

	function openPopover(
		reason: SelectOpenReason = 'imperative-action',
		event?: Event,
		focus: SelectOpenFocusIntent = 'selected'
	) {
		if (disabled || readonly) return;
		openFocusIntent = focus;
		setOpen(true, reason, event);
	}

	const TRIGGER_REFOCUS_REASONS: ReadonlySet<SelectCloseReason> = new Set([
		'escape-key',
		'item-select',
		'imperative-action'
	]);

	function focusIsInList() {
		const active = document.activeElement;
		return !!listboxRef && !!active && (active === listboxRef || listboxRef.contains(active));
	}

	function closePopover(
		reason: SelectCloseReason = 'imperative-action',
		event?: Event,
		modality?: InputModality
	) {
		if (!currentIsOpen) return;
		const wasInList = focusIsInList();
		if (!setOpen(false, reason, event)) return;
		pendingTypeahead = null;
		// The focus goes back to the trigger only after a deliberate close. After an outside
		// press, a scroll, or a Tab, it stays where the user put it. It moves before the list
		// leaves the DOM, thus the focus never falls on the body in between.
		if (!triggerRef || !wasInList || !TRIGGER_REFOCUS_REASONS.has(reason)) return;
		const closeModality =
			modality ??
			(reason === 'escape-key' || event instanceof KeyboardEvent
				? 'keyboard'
				: event instanceof MouseEvent
					? 'pointer'
					: 'virtual');
		focusWithModality(triggerRef, closeModality);
	}

	// A printable character on the closed trigger opens the list, and the list searches with
	// it. This is what the APG select-only combobox does.
	function openWithTypeahead(char: string, event?: Event) {
		if (disabled || readonly) return;
		pendingTypeahead = char;
		openPopover('trigger-press', event, 'selected');
	}

	function togglePopover(reason: SelectOpenReason = 'trigger-press', event?: Event) {
		if (currentIsOpen) {
			closePopover('imperative-action', event);
		} else {
			openPopover(reason, event, 'selected');
		}
	}

	// --- Focus state -------------------------------------------------------------------------

	function setFocusWithin(within: boolean) {
		focusWithin = within;
		if (!within) focusVisible = false;
	}

	function setFocusVisible(visible: boolean) {
		focusVisible = visible && focusWithin;
	}

	// --- Hidden form control -----------------------------------------------------------------

	const formOptions = $derived.by(() => {
		if (items && items.length > 0) {
			return orderedKeys.map((key) => ({ key, label: getLabel(key) }));
		}
		return Array.from(currentSelection).map((key) => ({ key, label: getLabel(key) }));
	});

	// The browser autofill writes to the native control. That value has to reach the
	// component, or the form sends one thing and the trigger shows another.
	function handleNativeChange(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		const keys = Array.from(select.selectedOptions)
			.map((option) => option.value)
			.filter((raw) => raw !== '')
			.map((raw) => {
				const known = orderedKeys.find((key) => String(key) === raw);
				return known ?? raw;
			});
		if (disabled || readonly) return;
		applySelection(new Set(keys));
	}

	// A form that reports its validity focuses the first invalid control. The native select
	// is that control, and it is not the one the user can operate.
	function handleNativeFocus() {
		triggerRef?.focus();
	}

	const ctx: SelectContext = {
		get instanceId() {
			return instanceId;
		},
		get triggerId() {
			return triggerId;
		},
		get listboxId() {
			return listboxId;
		},
		get valueId() {
			return valueId;
		},
		get labelId() {
			return labelId;
		},
		get isOpen() {
			return currentIsOpen;
		},
		get selectedKeys() {
			return currentSelection;
		},
		get selectionMode() {
			return selectionMode;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get isRequired() {
			return required;
		},
		get isInvalid() {
			return invalid;
		},
		get name() {
			return name;
		},
		get disabledKeys() {
			return resolvedDisabledKeys;
		},
		get loop() {
			return loop;
		},
		get triggerRef() {
			return triggerRef;
		},
		get listboxRef() {
			return listboxRef;
		},
		get listboxCtx() {
			return listboxCtx;
		},
		get orderedKeys() {
			return orderedKeys;
		},
		get placeholder() {
			return resolvedPlaceholder;
		},
		get ariaLabel() {
			return ariaLabel;
		},
		get ariaLabelledBy() {
			return ariaLabelledBy;
		},
		get ariaDescribedBy() {
			return ariaDescribedBy;
		},
		get isFocusWithin() {
			return focusWithin;
		},
		get isFocusVisible() {
			return focusVisible;
		},
		getLabel,
		setTriggerRef: (el) => {
			triggerRef = el;
		},
		setListboxRef: (el) => {
			listboxRef = el;
		},
		setListboxCtx: (next) => {
			listboxCtx = next;
		},
		registerValue: (id) => {
			valueId = id;
			return () => {
				if (valueId === id) valueId = null;
			};
		},
		registerLabel: (id) => {
			labelId = id;
			return () => {
				if (labelId === id) labelId = null;
			};
		},
		registerItemLabel: (key, label) => {
			if (label) itemLabels.set(key, label);
		},
		open: openPopover,
		close: closePopover,
		toggle: togglePopover,
		openWithTypeahead,
		commitSelection,
		consumeOpenFocus: () => {
			const intent = openFocusIntent;
			openFocusIntent = 'selected';
			return intent;
		},
		consumePendingTypeahead: () => {
			const char = pendingTypeahead;
			pendingTypeahead = null;
			return char;
		},
		setFocusWithin,
		setFocusVisible
	};

	setSelectContext(ctx);
	context = ctx;
</script>

<div
	{...restProps}
	bind:this={rootRef}
	class={className}
	data-select
	data-state={currentIsOpen ? 'open' : 'closed'}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-required={required || undefined}
	data-invalid={invalid || undefined}
	data-focus-within={focusWithin || undefined}
	data-focus-visible={focusVisible || undefined}
>
	{#if children}
		{@render children()}
	{/if}
	<!-- The native control that a form sends, and that the browser autofill writes to. It is
	     out of the tab order and out of the accessibility tree: the trigger is the control the
	     user operates, and this one must not be announced a second time. -->
	<div
		aria-hidden="true"
		data-select-hidden
		style="position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap;"
	>
		<!-- Two elements rather than one with a dynamic `multiple`: the attribute has to be on
		     the element before its options are, or the browser keeps only the last selected one. -->
		{#if selectionMode === 'multiple'}
			<select
				multiple
				tabindex="-1"
				{name}
				{form}
				{autocomplete}
				{required}
				{disabled}
				onchange={handleNativeChange}
				onfocus={handleNativeFocus}
			>
				{#each formOptions as option (option.key)}
					<option value={String(option.key)} selected={currentSelection.has(option.key)}>
						{option.label}
					</option>
				{/each}
			</select>
		{:else}
			<select
				tabindex="-1"
				{name}
				{form}
				{autocomplete}
				{required}
				{disabled}
				onchange={handleNativeChange}
				onfocus={handleNativeFocus}
			>
				<!-- The empty option is what makes `required` fail while nothing is selected. -->
				<option value="" selected={currentSelection.size === 0}></option>
				{#each formOptions as option (option.key)}
					<option value={String(option.key)} selected={currentSelection.has(option.key)}>
						{option.label}
					</option>
				{/each}
			</select>
		{/if}
	</div>
</div>
