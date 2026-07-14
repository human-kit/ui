<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';
	import { useAutocompleteContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type AutocompleteInputProps = HTMLInputAttributes & {
		/** Accessible label for the input. */
		'aria-label'?: string;
		/** ID of element that labels this input. */
		'aria-labelledby'?: string;
		/** ID of element that describes this input (e.g. usage instructions). */
		'aria-describedby'?: string;
		class?: string;
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

	const generatedId = $props.id();

	let {
		id,
		class: className,
		oninput: onInputExternal,
		onfocus: onFocusExternal,
		onmousedown: onMouseDownExternal,
		onpointerdown: onPointerDownExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		element = $bindable<HTMLInputElement | null>(null),
		...restProps
	}: AutocompleteInputProps & { element?: HTMLInputElement | null } = $props();

	const resolvedId = untrack(() => id) ?? generatedId;

	let inputRef = $state<HTMLInputElement | null>(null);
	const ctx = useAutocompleteContext();

	let isFocused = $state(false);
	let isFocusVisible = $state(false);

	// Single source of "focus": when an option is virtually active, the option owns
	// the focused presentation and the input must NOT appear focused (RAC parity).
	const hasActiveOption = $derived(ctx.focusedItemId !== null);
	const showFocused = $derived(isFocused && !hasActiveOption);
	const showFocusVisible = $derived(showFocused && isFocusVisible);

	$effect(() => {
		element = inputRef;
		ctx.setInputRef(inputRef);
	});

	function handleInput(event: Event) {
		ctx.setInputValue((event.target as HTMLInputElement).value);
	}

	function handleFocus() {
		isFocused = true;
		isFocusVisible = shouldShowFocusVisible(inputRef);
	}

	function handleBlur() {
		isFocused = false;
		isFocusVisible = false;
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, inputRef);
		isFocusVisible = false;
		ctx.setFocusVisible(false);
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, inputRef);
		isFocusVisible = false;
		ctx.setFocusVisible(false);
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, inputRef);
		isFocusVisible = isFocused ? true : shouldShowFocusVisible(inputRef);
		ctx.handleKeydown(event);
	}
</script>

<input
	bind:this={inputRef}
	id={resolvedId}
	type="text"
	role="searchbox"
	aria-autocomplete="list"
	aria-controls={`autocomplete-listbox-${ctx.instanceId}`}
	aria-activedescendant={ctx.focusedItemId !== null
		? `autocomplete-item-${ctx.instanceId}-${ctx.focusedItemId}`
		: undefined}
	autocomplete="off"
	value={ctx.inputValue}
	disabled={ctx.isDisabled}
	readonly={ctx.isReadOnly}
	aria-disabled={ctx.isDisabled || undefined}
	aria-readonly={ctx.isReadOnly || undefined}
	data-input-root="true"
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-focused={showFocused || undefined}
	data-focus-visible={showFocusVisible || undefined}
	oninput={composeEventHandlers(handleInput, onInputExternal ?? undefined)}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	class={className}
	{...restProps}
/>
