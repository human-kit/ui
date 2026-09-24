<script lang="ts">
	import { untrack } from 'svelte';
	import { isRtl } from '../../internal/rtl';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { usePinInputContext } from '../root/context';
	import type { PinInputCellProps } from '../types';

	/**
	 * PinInput.Cell — one character of the value.
	 *
	 * The cell is a real `<input>`: the telephone shows the correct keyboard, the password
	 * manager sees a field, and a code from a message fills each cell with one touch. A code
	 * that arrives in one cell, from a message or from the clipboard, goes across the cells from
	 * this one.
	 */
	let {
		index: indexProp,
		'aria-label': ariaLabel,
		class: className = '',
		element = $bindable<HTMLInputElement | null>(null),
		oninput,
		onkeydown,
		onpaste,
		onfocus,
		onblur,
		onpointerdown,
		...restProps
	}: PinInputCellProps = $props();

	const ctx = usePinInputContext('PinInput.Cell');

	let inputRef: HTMLInputElement | null = $state(null);

	const registration = ctx.registerCell({
		index: untrack(() => indexProp),
		inputRef: () => inputRef
	});
	const index = registration.index;

	$effect(() => {
		element = inputRef;
		return () => {
			element = null;
		};
	});

	$effect(() => registration.unregister);

	const character = $derived(ctx.getCellCharacter(index));
	const filled = $derived(character !== '');
	const focused = $derived(ctx.focusedIndex === index);
	const focusVisible = $derived(focused && ctx.isFocusVisible);
	/** The cell that takes the next character: the first empty one. */
	const active = $derived(focused || (ctx.focusedIndex === null && ctx.value.length === index));

	// The input holds one character, and the context holds the value. A key that the value
	// refuses leaves the character of the DOM ahead of it, thus the two are made equal again
	// after each change.
	$effect(() => {
		const node = inputRef;
		if (!node) return;
		if (node.value !== character) node.value = character;
	});

	watchFocusVisible({
		isFocused: () => focused,
		element: () => inputRef,
		set: (visible) => ctx.setFocusVisible(visible)
	});

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event as never);
		const node = event.currentTarget;
		const raw = node.value;
		// A browser that fills a code from a message writes it whole into one cell. What the user
		// typed is what the cell has past the character it had.
		const inserted =
			character && raw.startsWith(character) && raw.length > character.length
				? raw.slice(character.length)
				: raw;

		// The value is the source of the character: put back what the value says, and let the
		// context answer the text. A refused character then leaves no trace.
		node.value = character;
		if (!inserted) return;
		ctx.insertText(index, inserted, { reason: 'input', event });
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onkeydown?.(event as never);
		if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;

		const forward = isRtl(inputRef) ? 'ArrowLeft' : 'ArrowRight';
		const backward = isRtl(inputRef) ? 'ArrowRight' : 'ArrowLeft';

		switch (event.key) {
			case 'Backspace':
				event.preventDefault();
				if (filled) {
					ctx.deleteCharacter(index, { reason: 'delete', event });
					ctx.focusCell(index);
				} else if (index > 0) {
					ctx.deleteCharacter(index - 1, { reason: 'delete', event });
					ctx.focusCell(index - 1);
				}
				break;
			case 'Delete':
				event.preventDefault();
				ctx.deleteCharacter(index, { reason: 'delete', event });
				break;
			case forward:
				event.preventDefault();
				ctx.focusCell(index + 1);
				break;
			case backward:
				event.preventDefault();
				ctx.focusCell(index - 1);
				break;
			case 'Home':
				event.preventDefault();
				ctx.focusCell(0);
				break;
			case 'End':
				event.preventDefault();
				ctx.focusCell(ctx.length - 1);
				break;
			default:
				break;
		}
	}

	function handlePaste(event: ClipboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onpaste?.(event as never);
		if (event.defaultPrevented) return;
		// The paste goes across the cells, thus the browser must not put it all in this one.
		event.preventDefault();
		const text = event.clipboardData?.getData('text') ?? '';
		ctx.insertText(index, text, { reason: 'paste', event });
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onfocus?.(event as never);
		trackInteractionModality(event, inputRef);
		// The value has no holes: a press on a cell past the first empty one goes to that one.
		if (index > ctx.value.length) {
			ctx.focusCell(ctx.value.length);
			return;
		}
		ctx.setCellFocus(index, true);
		ctx.setFocusVisible(shouldShowFocusVisible(inputRef));
		// The character is selected, thus the next key replaces it instead of a second one.
		event.currentTarget.select();
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onblur?.(event as never);
		ctx.setCellFocus(index, false);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLInputElement }
	) {
		onpointerdown?.(event as never);
		if (event.defaultPrevented || ctx.isDisabled) return;
		if (index <= ctx.value.length) return;
		// A press on a cell past the first empty one must not put the caret there.
		event.preventDefault();
		ctx.focusCell(ctx.value.length, 'pointer');
	}
</script>

<input
	{...restProps}
	bind:this={inputRef}
	id={ctx.getCellId(index)}
	type={ctx.mask ? 'password' : 'text'}
	inputmode={ctx.type === 'numeric' ? 'numeric' : 'text'}
	autocomplete={ctx.otp ? 'one-time-code' : 'off'}
	autocorrect="off"
	autocapitalize="off"
	spellcheck="false"
	value={character}
	placeholder={ctx.placeholder}
	disabled={ctx.isDisabled}
	readonly={ctx.isReadOnly}
	required={ctx.isRequired}
	aria-label={ariaLabel ?? ctx.getCellLabel(index)}
	aria-describedby={ctx.ariaDescribedBy}
	aria-invalid={ctx.isInvalid || undefined}
	class={className}
	data-pin-input-cell="true"
	data-index={index}
	data-filled={filled || undefined}
	data-active={active || undefined}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-invalid={ctx.isInvalid || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	oninput={handleInput}
	onkeydown={handleKeyDown}
	onpaste={handlePaste}
	onfocus={handleFocus}
	onblur={handleBlur}
	onpointerdown={handlePointerDown}
/>
