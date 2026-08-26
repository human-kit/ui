<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { shouldShowFocusVisible, trackInteractionModality } from '../primitives/input-modality';
	import { isAriaInvalidValue } from '../utils/aria-invalid';
	import type { ClassValue } from '../utils/cn';
	import { composeEventHandlers } from '../utils/compose-event-handlers';

	type AriaInvalidValue = HTMLInputAttributes['aria-invalid'];

	type InputProps = HTMLInputAttributes & {
		class?: ClassValue;
		/** Disables the input, with the native attribute. */
		disabled?: boolean | null;
		/** The native `readonly` attribute. The component also sets `aria-readonly`. */
		readonly?: boolean | null;
		/** Marks the value as not valid. The component sets `aria-invalid` and `data-invalid`. */
		invalid?: boolean;
		/** The native `required` attribute. The component also sets `aria-required`. */
		required?: boolean | null;
		/** The value. You can bind it. */
		value?: HTMLInputAttributes['value'];
		/** A bindable reference to the input element. */
		element?: HTMLInputElement | null;
	};

	const generatedId = $props.id();

	let {
		id,
		type = 'text',
		class: className,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		'aria-invalid': ariaInvalidProp,
		autofocus = false,
		value = $bindable<HTMLInputElement['value']>(),
		element = $bindable<HTMLInputElement | null>(null),
		oninput: onInputExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		onpointerdown: onPointerDownExternal,
		onmouseenter: onMouseEnterExternal,
		onmouseleave: onMouseLeaveExternal,
		...restProps
	}: InputProps = $props();

	const resolvedId = untrack(() => id) ?? generatedId;

	let inputRef: HTMLInputElement | null = $state(null);
	let hovered = $state(false);
	let focused = $state(false);
	let focusVisible = $state(false);

	const resolvedInvalid = $derived(Boolean(invalid || isAriaInvalidValue(ariaInvalidProp)));
	const renderedAriaInvalid = $derived.by<AriaInvalidValue | undefined>(() => {
		if (!resolvedInvalid) return undefined;
		return ariaInvalidProp === 'grammar' || ariaInvalidProp === 'spelling'
			? ariaInvalidProp
			: 'true';
	});

	$effect(() => {
		element = inputRef;
		return () => {
			element = null;
		};
	});

	// Native `autofocus` only focuses the first autofocus element inserted per document, so it
	// silently fails for inputs that mount inside an already-open popover/dialog or remount as a
	// view swaps. Focus the element on mount instead so it works every time it appears.
	$effect(() => {
		if (autofocus && inputRef) {
			inputRef.focus();
		}
	});

	$effect(() => {
		if (!disabled) return;
		hovered = false;
		focused = false;
		focusVisible = false;
	});

	function handleFocus() {
		if (disabled) return;
		focused = true;
		focusVisible = shouldShowFocusVisible(inputRef);
	}

	function handleBlur() {
		focused = false;
		focusVisible = false;
	}

	function handleInput(event: Event) {
		value = (event.currentTarget as HTMLInputElement).value;
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, inputRef);
		focusVisible = focused ? true : shouldShowFocusVisible(inputRef);
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, inputRef);
		focusVisible = false;
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, inputRef);
		focusVisible = false;
	}

	function handleMouseEnter() {
		if (disabled) {
			hovered = false;
			return;
		}

		hovered = true;
	}

	function handleMouseLeave() {
		hovered = false;
	}
</script>

<input
	{...restProps}
	bind:this={inputRef}
	id={resolvedId}
	{type}
	{value}
	{disabled}
	{readonly}
	{required}
	aria-invalid={renderedAriaInvalid}
	aria-readonly={readonly || undefined}
	aria-required={required || undefined}
	data-input-root="true"
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-required={required || undefined}
	data-hovered={hovered || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	oninput={composeEventHandlers(handleInput, onInputExternal ?? undefined)}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined)}
	onmouseenter={composeEventHandlers(handleMouseEnter, onMouseEnterExternal ?? undefined)}
	onmouseleave={composeEventHandlers(handleMouseLeave, onMouseLeaveExternal ?? undefined)}
	class={className}
/>
