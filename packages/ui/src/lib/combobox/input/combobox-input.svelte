<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Input } from '../../input';
	import { useComboBoxContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type ComboBoxInputProps = HTMLInputAttributes & {
		/** Accessible label for the input */
		'aria-label'?: string;
		/** ID of element that labels this input */
		'aria-labelledby'?: string;
		/** ID of element that describes this input (e.g., usage instructions) */
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

	let {
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		'aria-describedby': ariaDescribedby,
		class: className,
		oninput: onInputExternal,
		onfocus: onFocusExternal,
		onmousedown: onMouseDownExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		...restProps
	}: ComboBoxInputProps = $props();

	let inputRef: HTMLInputElement | null = $state(null);
	const ctx = useComboBoxContext();

	$effect(() => {
		if (inputRef) {
			ctx.setInputRef(inputRef);
			ctx.setTriggerRef(inputRef);
		}
	});

	function handleInput(event: Event) {
		ctx.setFocusedTagId(null);
		const target = event.target as HTMLInputElement;
		ctx.setInputValue(target.value);
		// Open on input for all trigger modes when user types
		if (!ctx.isOpen && target.value.length > 0) {
			ctx.open({ reason: 'input' });
		}
	}

	let focusOpenRafId: number | null = null;

	function handleFocus() {
		ctx.setFocusVisible(shouldShowFocusVisible(inputRef));

		// Open on focus if trigger is 'focus'
		// Use a small delay to avoid opening immediately on programmatic focus
		// (e.g., from a focus trap). This gives time for refs to be set up.
		if (ctx.trigger === 'focus' && !ctx.isOpen) {
			if (focusOpenRafId !== null) {
				cancelAnimationFrame(focusOpenRafId);
			}
			focusOpenRafId = requestAnimationFrame(() => {
				focusOpenRafId = null;
				// Only open if focus is still on the input (it may have moved on
				// in the meantime, e.g. a focus trap passing through).
				if (ctx.trigger === 'focus' && !ctx.isOpen && document.activeElement === inputRef) {
					ctx.open();
				}
			});
		}
	}

	$effect(() => {
		return () => {
			if (focusOpenRafId !== null) {
				cancelAnimationFrame(focusOpenRafId);
				focusOpenRafId = null;
			}
		};
	});

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, inputRef);
		ctx.setFocusVisible(false);
		ctx.setFocusedTagId(null);
		// Open on press if trigger is 'press'
		if (ctx.trigger === 'press' && !ctx.isOpen && !ctx.isDisabled && !ctx.isReadOnly) {
			ctx.open();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, inputRef);
		ctx.setFocusVisible(shouldShowFocusVisible(inputRef));
		ctx.handleKeydown(event);
	}

	function handleBlur(event: FocusEvent) {
		ctx.setFocusVisible(false);
		// Restore selection label or deselect if empty
		ctx.handleInputBlur(event);
	}
</script>

<Input
	bind:element={inputRef}
	type="text"
	role="combobox"
	aria-autocomplete="list"
	aria-expanded={ctx.isOpen}
	aria-haspopup="listbox"
	aria-controls={`combobox-listbox-${ctx.instanceId}`}
	aria-activedescendant={ctx.focusedItemId !== null
		? `combobox-item-${ctx.instanceId}-${ctx.focusedItemId}`
		: undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	aria-describedby={ariaDescribedby}
	autocomplete="off"
	value={ctx.displayValue}
	disabled={ctx.isDisabled}
	readonly={ctx.isReadOnly}
	oninput={composeEventHandlers(handleInput, onInputExternal ?? undefined)}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	class={className}
	{...restProps}
/>
