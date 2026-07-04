<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setCheckboxContext, type CheckboxState } from '../../checkbox/root/context';

	type TableCheckboxBodyRootProps = Omit<
		HTMLAttributes<HTMLSpanElement>,
		| 'children'
		| 'class'
		| 'id'
		| 'role'
		| 'aria-checked'
		| 'aria-disabled'
		| 'aria-readonly'
		| 'aria-required'
	> & {
		id?: string;
		title?: string;
		element?: HTMLSpanElement | null;
		checked?: boolean;
		disabled?: boolean;
		pressed?: boolean;
		focused?: boolean;
		focusVisible?: boolean;
		onToggle?: (checked: boolean, event?: Event) => void;
		children?: Snippet;
		class?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
		tabindex?: number;
	};

	const generatedId = $props.id();

	let {
		id,
		title,
		element = $bindable(),
		checked = false,
		disabled = false,
		pressed = false,
		focused = false,
		focusVisible = false,
		onToggle,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		tabindex,
		...restProps
	}: TableCheckboxBodyRootProps = $props();

	let rootRef = $state<HTMLSpanElement | null>(null);

	function getRootId() {
		return id ?? generatedId;
	}

	$effect(() => {
		element = rootRef;
	});

	const checkboxState = $derived.by<CheckboxState>(() => (checked ? 'checked' : 'unchecked'));

	function setState(nextState: CheckboxState, event?: Event) {
		if (disabled) return;
		onToggle?.(nextState === 'checked', event);
	}

	setCheckboxContext({
		get id() {
			return getRootId();
		},
		get inputId() {
			return getRootId();
		},
		get inputRef() {
			return null;
		},
		setInputRef() {},
		get state() {
			return checkboxState;
		},
		get pressed() {
			return pressed;
		},
		get isChecked() {
			return checked;
		},
		get isIndeterminate() {
			return false;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return false;
		},
		get required() {
			return false;
		},
		get focused() {
			return focused;
		},
		get focusVisible() {
			return focusVisible;
		},
		toggle(event) {
			setState(checkboxState === 'checked' ? 'unchecked' : 'checked', event);
		},
		setState
	});
</script>

<span
	{...restProps}
	bind:this={rootRef}
	id={getRootId()}
	{title}
	role="checkbox"
	tabindex={disabled ? undefined : (tabindex ?? 0)}
	aria-checked={checked ? 'true' : 'false'}
	aria-disabled={disabled || undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	data-checkbox-root="true"
	data-checked={checked || undefined}
	data-unchecked={!checked || undefined}
	data-pressed={pressed || undefined}
	data-disabled={disabled || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	class={className}
	style:position="relative"
>
	{@render children?.()}
</span>
