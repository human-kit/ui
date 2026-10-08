<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { composeEventHandlers } from '../../utils/compose-event-handlers';
	import { useSearchFieldContext } from '../root/context';

	type SearchFieldInputProps = Omit<
		HTMLInputAttributes,
		| 'class'
		| 'id'
		| 'value'
		| 'defaultValue'
		| 'name'
		| 'disabled'
		| 'readonly'
		| 'required'
		| 'aria-disabled'
		| 'aria-readonly'
		| 'aria-required'
		| 'aria-invalid'
	> & {
		class?: string;
		/**
		 * The type of the input. Keep `search`, because it gives the input the `searchbox` role.
		 * Change it only when the field holds a different kind of text, for example an email.
		 */
		type?: HTMLInputAttributes['type'];
		/** A bindable reference to the input element. */
		element?: HTMLInputElement | null;
	};

	let {
		class: className,
		type = 'search',
		enterkeyhint = 'search',
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
	}: SearchFieldInputProps = $props();

	const ctx = useSearchFieldContext('SearchField.Input');
	let inputRef: HTMLInputElement | null = $state(null);
	let hovered = $state(false);

	$effect(() => {
		element = inputRef;
		ctx.setInputRef(inputRef);
		return () => {
			element = null;
			ctx.setInputRef(null);
		};
	});

	$effect(() => {
		if (ctx.isDisabled) hovered = false;
	});

	watchFocusVisible({
		isFocused: () => ctx.focused,
		element: () => inputRef,
		set: (visible) => ctx.setFocusVisible(visible)
	});

	function handleInput(event: Event) {
		ctx.setValue((event.currentTarget as HTMLInputElement).value, 'input');
	}

	function handleFocus() {
		if (ctx.isDisabled) return;
		ctx.setFocused(true);
		ctx.setFocusVisible(shouldShowFocusVisible(inputRef));
	}

	function handleBlur() {
		ctx.setFocused(false);
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, inputRef);
		ctx.setFocusVisible(ctx.focused ? true : shouldShowFocusVisible(inputRef));

		// A key in an IME composition belongs to the composition: `Escape` cancels the candidate
		// text and `Enter` accepts it.
		if (event.isComposing || ctx.isDisabled || ctx.isReadOnly) return;

		if (event.key === 'Escape') {
			// An empty field lets the key go on, thus a dialog or a popover around it can close.
			if (!ctx.clear('escape-key')) return;
			// The native search input also empties itself on `Escape`. Stop it, and stop the key
			// before it closes a dialog that contains the field.
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		// `Enter` keeps its native action, thus the field also submits the form that contains it.
		if (event.key === 'Enter') ctx.submit();
	}

	function handlePointerModality(event: MouseEvent | PointerEvent) {
		trackInteractionModality(event, inputRef);
		ctx.setFocusVisible(false);
	}

	function handleMouseEnter() {
		hovered = !ctx.isDisabled;
	}

	function handleMouseLeave() {
		hovered = false;
	}
</script>

<input
	{...restProps}
	bind:this={inputRef}
	id={ctx.inputId}
	{type}
	{enterkeyhint}
	name={ctx.name}
	value={ctx.value}
	defaultValue={ctx.defaultValue}
	disabled={ctx.isDisabled}
	readonly={ctx.isReadOnly}
	required={ctx.isRequired}
	aria-invalid={ctx.isInvalid ? 'true' : undefined}
	aria-readonly={ctx.isReadOnly || undefined}
	aria-required={ctx.isRequired || undefined}
	data-search-field-input="true"
	data-empty={ctx.isEmpty || undefined}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-required={ctx.isRequired || undefined}
	data-invalid={ctx.isInvalid || undefined}
	data-hovered={hovered || undefined}
	data-focused={ctx.focused || undefined}
	data-focus-visible={ctx.focusVisible || undefined}
	oninput={composeEventHandlers(handleInput, onInputExternal ?? undefined)}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onmousedown={composeEventHandlers(handlePointerModality, onMouseDownExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerModality, onPointerDownExternal ?? undefined)}
	onmouseenter={composeEventHandlers(handleMouseEnter, onMouseEnterExternal ?? undefined)}
	onmouseleave={composeEventHandlers(handleMouseLeave, onMouseLeaveExternal ?? undefined)}
	class={className}
/>
