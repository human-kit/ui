<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { cn } from '../../utils/cn';
	import { useNumberFieldContext } from '../root/context';
	import { normalizeStep } from '../root/number-utils';

	type NumberFieldInputProps = Omit<
		HTMLInputAttributes,
		| 'class'
		| 'type'
		| 'value'
		| 'role'
		| 'disabled'
		| 'readonly'
		| 'required'
		| 'aria-valuemin'
		| 'aria-valuemax'
		| 'aria-valuenow'
		| 'aria-valuetext'
		| 'aria-disabled'
		| 'aria-readonly'
		| 'aria-required'
		| 'aria-invalid'
		| 'name'
	> & {
		class?: string;
		element?: HTMLInputElement | null;
	};

	type InputMouseEvent = MouseEvent & { currentTarget: EventTarget & HTMLInputElement };

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
		class: className,
		id,
		inputmode = 'decimal',
		autocomplete = 'off',
		element = $bindable<HTMLInputElement | null>(null),
		oninput: onInputExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		onpointerdown: onPointerDownExternal,
		onmouseenter: onMouseEnterExternal,
		onmouseleave: onMouseLeaveExternal,
		onwheel: onWheelExternal,
		...restProps
	}: NumberFieldInputProps = $props();

	const numberField = useNumberFieldContext();
	let inputRef: HTMLInputElement | null = $state(null);
	let hovered = $state(false);

	$effect(() => {
		element = inputRef;
		numberField.setInputRef(inputRef);
		return () => {
			numberField.setInputRef(null);
		};
	});

	$effect(() => {
		inputRef?.setCustomValidity(numberField.validationMessage);
	});

	function getInputElement(event: Event): HTMLInputElement {
		return event.currentTarget as HTMLInputElement;
	}

	function handleInput(event: Event) {
		numberField.setInputValue(getInputElement(event).value, 'input', event);
	}

	function handleFocus(event: FocusEvent) {
		if (numberField.isDisabled) return;
		numberField.setFocused(true);
		numberField.setFocusVisible(shouldShowFocusVisible(getInputElement(event)));
		numberField.syncFocusWithin();
	}

	function handleBlur(event: FocusEvent) {
		numberField.setFocused(false);
		numberField.commitInputValue('input-blur', event);
		queueMicrotask(() => {
			numberField.syncFocusWithin();
		});
	}

	function handlePointerModality(event: PointerEvent | MouseEvent) {
		trackInteractionModality(event, getInputElement(event));
		numberField.setFocusVisible(false);
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, getInputElement(event));
		numberField.setFocusVisible(true);

		if (numberField.isDisabled) return;

		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault();
			const direction = event.key === 'ArrowUp' ? 1 : -1;
			const baseStep = normalizeStep(numberField.step);
			const multiplier = event.shiftKey
				? numberField.largeStep / baseStep
				: event.metaKey || event.ctrlKey
					? numberField.smallStep / baseStep
					: 1;
			numberField.stepBy(direction, { reason: 'keyboard', event, multiplier });
			return;
		}

		if (event.key === 'PageUp' || event.key === 'PageDown') {
			event.preventDefault();
			numberField.stepBy(event.key === 'PageUp' ? 1 : -1, {
				reason: 'keyboard',
				event
			});
			return;
		}

		if (event.key === 'Home' && numberField.min !== undefined) {
			event.preventDefault();
			numberField.setInputValue(String(numberField.min), 'keyboard', event);
			numberField.commitInputValue('keyboard', event);
			return;
		}

		if (event.key === 'End' && numberField.max !== undefined) {
			event.preventDefault();
			numberField.setInputValue(String(numberField.max), 'keyboard', event);
			numberField.commitInputValue('keyboard', event);
			return;
		}

		if (event.key === 'Enter') {
			numberField.commitInputValue('keyboard', event);
		}
	}

	function handleMouseEnter(event: InputMouseEvent) {
		hovered = true;
		onMouseEnterExternal?.(event);
	}

	function handleMouseLeave(event: InputMouseEvent) {
		hovered = false;
		onMouseLeaveExternal?.(event);
	}

	function handleWheel(event: WheelEvent) {
		if (!numberField.allowWheelScrub || !numberField.focused || !hovered) return;
		if (numberField.isDisabled || numberField.isReadOnly) return;

		event.preventDefault();
		numberField.stepBy(event.deltaY < 0 ? 1 : -1, { reason: 'wheel', event });
	}
</script>

<input
	{...restProps}
	bind:this={inputRef}
	id={id ?? numberField.inputId}
	type="text"
	role="spinbutton"
	{inputmode}
	{autocomplete}
	value={numberField.inputValue}
	disabled={numberField.isDisabled}
	readonly={numberField.isReadOnly}
	required={numberField.isRequired}
	aria-valuemin={numberField.min}
	aria-valuemax={numberField.max}
	aria-valuenow={numberField.ariaValueNow}
	aria-valuetext={numberField.ariaValueText}
	aria-disabled={numberField.isDisabled || undefined}
	aria-readonly={numberField.isReadOnly || undefined}
	aria-required={numberField.isRequired || undefined}
	aria-invalid={numberField.isInvalid ? 'true' : undefined}
	data-number-field-input="true"
	data-disabled={numberField.isDisabled || undefined}
	data-readonly={numberField.isReadOnly || undefined}
	data-required={numberField.isRequired || undefined}
	data-invalid={numberField.isInvalid || undefined}
	data-out-of-range={numberField.isOutOfRange || undefined}
	data-input-state={numberField.inputState}
	data-focused={numberField.focused || undefined}
	data-focus-visible={numberField.focusVisible || undefined}
	data-scrubbing={numberField.scrubbing || undefined}
	oninput={composeEventHandlers(handleInput, onInputExternal ?? undefined)}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onmousedown={composeEventHandlers(handlePointerModality, onMouseDownExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerModality, onPointerDownExternal ?? undefined)}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onwheel={composeEventHandlers(handleWheel, onWheelExternal ?? undefined)}
	class={cn('outline-none', className)}
/>
