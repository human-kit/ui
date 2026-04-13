<script lang="ts">
	import type { ClassValue } from 'class-variance-authority/types';
	import { untrack } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { shouldShowFocusVisible, trackInteractionModality } from '../primitives/input-modality';
	import { cn } from '../utils/cn';

	type AriaInvalidValue = HTMLInputAttributes['aria-invalid'];

	type InputProps = HTMLInputAttributes & {
		class?: ClassValue;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		isInvalid?: boolean;
		isRequired?: boolean;
		element?: HTMLInputElement | null;
	};

	function composeEventHandlers<TEvent extends Event>(
		internalHandler: ((event: TEvent) => void) | undefined,
		externalHandler: ((event: TEvent) => void) | undefined
	): (event: TEvent) => void {
		return (event: TEvent) => {
			internalHandler?.(event);
			externalHandler?.(event);
		};
	}

	function isAriaInvalidValue(value: AriaInvalidValue | undefined): boolean {
		return value === true || value === 'true' || value === 'grammar' || value === 'spelling';
	}

	const generatedId = $props.id();

	let {
		id,
		type = 'text',
		class: className,
		disabled: disabledProp = false,
		readonly: readOnlyProp = false,
		required: requiredProp = false,
		'aria-invalid': ariaInvalidProp,
		isDisabled = false,
		isReadOnly = false,
		isInvalid = false,
		isRequired = false,
		element = $bindable<HTMLInputElement | null>(null),
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

	const resolvedDisabled = $derived(Boolean(isDisabled || disabledProp));
	const resolvedReadOnly = $derived(Boolean(isReadOnly || readOnlyProp));
	const resolvedRequired = $derived(Boolean(isRequired || requiredProp));
	const resolvedInvalid = $derived(Boolean(isInvalid || isAriaInvalidValue(ariaInvalidProp)));
	const renderedAriaInvalid = $derived.by<AriaInvalidValue | undefined>(() => {
		if (!resolvedInvalid) return undefined;
		return ariaInvalidProp === 'grammar' || ariaInvalidProp === 'spelling'
			? ariaInvalidProp
			: 'true';
	});

	$effect(() => {
		element = inputRef;
	});

	$effect(() => {
		if (!resolvedDisabled) return;
		hovered = false;
		focused = false;
		focusVisible = false;
	});

	function handleFocus() {
		if (resolvedDisabled) return;
		focused = true;
		focusVisible = shouldShowFocusVisible(inputRef);
	}

	function handleBlur() {
		focused = false;
		focusVisible = false;
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
		if (resolvedDisabled) {
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
	disabled={resolvedDisabled}
	readonly={resolvedReadOnly}
	required={resolvedRequired}
	aria-invalid={renderedAriaInvalid}
	aria-readonly={resolvedReadOnly || undefined}
	aria-required={resolvedRequired || undefined}
	data-input-root="true"
	data-disabled={resolvedDisabled || undefined}
	data-readonly={resolvedReadOnly || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-required={resolvedRequired || undefined}
	data-hovered={hovered || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined)}
	onmouseenter={composeEventHandlers(handleMouseEnter, onMouseEnterExternal ?? undefined)}
	onmouseleave={composeEventHandlers(handleMouseLeave, onMouseLeaveExternal ?? undefined)}
	class={cn('outline-none', className)}
/>
