<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTimePickerContext, type TimePickerEditableSegmentType } from '../root/context';
	import {
		focusWithModality,
		shouldShowFocusVisible,
		trackInteractionModality,
		type InputModality
	} from '../../primitives/input-modality';

	type TimePickerColumnOption = {
		value: string;
		label: string;
		disabled: boolean;
		selected: boolean;
	};

	type TimePickerColumnCellProps = Omit<
		HTMLAttributes<HTMLButtonElement>,
		'class' | 'role' | 'type' | 'aria-selected' | 'aria-disabled' | 'onclick' | 'onkeydown'
	> & {
		type: TimePickerEditableSegmentType;
		option: TimePickerColumnOption;
		class?: string;
	};

	let { type, option, class: className = '', ...restProps }: TimePickerColumnCellProps = $props();

	const timePicker = useTimePickerContext();
	let isFocused = $state(false);
	let focusVisible = $state(false);

	function focusColumnRelative(
		currentTarget: HTMLElement,
		direction: 1 | -1,
		modality: InputModality = 'virtual'
	): boolean {
		const panel = currentTarget.closest<HTMLElement>('[data-time-picker-time-panel="true"]');
		if (!panel) return false;

		const columns = Array.from(panel.querySelectorAll<HTMLElement>('[role="listbox"]'));
		if (columns.length === 0) return false;

		const currentColumn = currentTarget.closest<HTMLElement>('[role="listbox"]');
		if (!currentColumn) return false;

		const currentIndex = columns.findIndex((column) => column === currentColumn);
		if (currentIndex < 0) return false;

		const nextIndex = currentIndex + direction;
		if (nextIndex < 0 || nextIndex >= columns.length) return false;

		const nextColumn = columns[nextIndex];
		const preferredOption =
			nextColumn.querySelector<HTMLElement>(
				'[role="option"][aria-selected="true"]:not([disabled])'
			) ??
			nextColumn.querySelector<HTMLElement>('[role="option"]:not([disabled])') ??
			nextColumn.querySelector<HTMLElement>('[role="option"]');

		if (!preferredOption) return false;
		focusWithModality(preferredOption, modality);
		return true;
	}

	function handleFocus(event: FocusEvent) {
		isFocused = true;
		focusVisible = shouldShowFocusVisible(event.currentTarget as HTMLElement | null);
	}

	function handleBlur() {
		isFocused = false;
		focusVisible = false;
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, event.currentTarget as HTMLElement | null);
		focusVisible = false;
	}

	function selectOption(event?: Event): boolean {
		if (option.disabled || timePicker.isDisabled || timePicker.isReadOnly) {
			event?.preventDefault();
			return false;
		}
		timePicker.selectColumnOption(type, option.value);
		return true;
	}

	function handleClick(event: MouseEvent) {
		const currentTarget = event.currentTarget as HTMLElement;
		trackInteractionModality(event, currentTarget);
		const didSelect = selectOption(event);
		if (!didSelect) return;
		focusColumnRelative(currentTarget, 1, 'pointer');
	}

	function handleKeydown(event: KeyboardEvent) {
		const currentTarget = event.currentTarget as HTMLElement;
		trackInteractionModality(event, currentTarget);
		if (isFocused) {
			focusVisible = true;
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			focusColumnRelative(currentTarget, 1, 'keyboard');
			return;
		}
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			focusColumnRelative(currentTarget, -1, 'keyboard');
			return;
		}
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		const didSelect = selectOption(event);
		if (!didSelect) return;
		focusColumnRelative(currentTarget, 1, 'keyboard');
	}
</script>

<button
	type="button"
	class={className}
	role="option"
	aria-selected={option.selected}
	aria-disabled={option.disabled || undefined}
	disabled={option.disabled || undefined}
	data-focused={isFocused || undefined}
	data-focus-visible={focusVisible || undefined}
	onfocus={handleFocus}
	onblur={handleBlur}
	onmousedown={handleMouseDown}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...restProps}
>
	{option.label}
</button>
