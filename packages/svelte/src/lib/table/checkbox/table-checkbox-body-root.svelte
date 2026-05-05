<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../../utils/cn';
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
		isChecked?: boolean;
		isDisabled?: boolean;
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
		isChecked = false,
		isDisabled = false,
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

	const checkboxState = $derived.by<CheckboxState>(() => (isChecked ? 'checked' : 'unchecked'));

	function setState(nextState: CheckboxState, event?: Event) {
		if (isDisabled) return;
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
			return isChecked;
		},
		get isIndeterminate() {
			return false;
		},
		get isDisabled() {
			return isDisabled;
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
	tabindex={isDisabled ? undefined : (tabindex ?? 0)}
	aria-checked={isChecked ? 'true' : 'false'}
	aria-disabled={isDisabled || undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	data-checkbox-root="true"
	data-checked={isChecked || undefined}
	data-unchecked={!isChecked || undefined}
	data-pressed={pressed || undefined}
	data-disabled={isDisabled || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	class={cn(
		'relative inline-flex shrink-0 items-center justify-center align-middle outline-none',
		className
	)}
>
	{@render children?.()}
</span>
