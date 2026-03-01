<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTimePickerContext, type TimePickerEditableSegmentType } from '../root/context';
	import TimePickerColumnCell from '../column-cell/time-picker-column-cell.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type TimePickerColumnOption = {
		value: string;
		label: string;
		disabled: boolean;
		selected: boolean;
	};

	type TimePickerColumnProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'class' | 'role' | 'onkeydown' | 'aria-label'
	> & {
		type: TimePickerEditableSegmentType;
		children?: Snippet<[TimePickerColumnOption]>;
		class?: string;
		'aria-label'?: string;
	};

	let {
		type,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		...restProps
	}: TimePickerColumnProps = $props();

	const timePicker = useTimePickerContext();
	const options = $derived.by(() => timePicker.getColumnOptions(type));
	const label = $derived(
		ariaLabel ?? (type === 'dayPeriod' ? 'Day period' : timePicker.getSegmentLabel(type))
	);

	let focusWithin = $state(false);
	let focusVisible = $state(false);

	function syncFocusWithin(currentTarget: HTMLElement) {
		focusWithin =
			!!document.activeElement &&
			(currentTarget === document.activeElement || currentTarget.contains(document.activeElement));
		if (!focusWithin) {
			focusVisible = false;
		}
	}

	function handleFocusIn(event: FocusEvent) {
		focusWithin = true;
		focusVisible = shouldShowFocusVisible(event.target as HTMLElement | null);
	}

	function handleFocusOut(event: FocusEvent) {
		const currentTarget = event.currentTarget as HTMLElement;
		queueMicrotask(() => syncFocusWithin(currentTarget));
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, event.target as HTMLElement | null);
		focusVisible = false;
	}

	function focusRelativeOption(currentTarget: HTMLElement, direction: 1 | -1) {
		const optionElements = Array.from(
			currentTarget.querySelectorAll<HTMLElement>('[role="option"]')
		);
		if (optionElements.length === 0) return;
		const activeElement = document.activeElement as HTMLElement | null;
		let index = optionElements.findIndex((element) => element === activeElement);
		if (index < 0) {
			index = optionElements.findIndex(
				(element) => element.getAttribute('aria-selected') === 'true'
			);
		}
		if (index < 0) {
			index = 0;
		}

		let nextIndex = index + direction;
		if (nextIndex < 0) nextIndex = optionElements.length - 1;
		if (nextIndex >= optionElements.length) nextIndex = 0;

		optionElements[nextIndex]?.focus();
	}

	function handleKeydown(event: KeyboardEvent) {
		trackInteractionModality(event, event.target as HTMLElement | null);
		if (focusWithin) {
			focusVisible = true;
		}

		const currentTarget = event.currentTarget as HTMLElement;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			focusRelativeOption(currentTarget, 1);
			return;
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			focusRelativeOption(currentTarget, -1);
			return;
		}
	}
</script>

<div
	role="listbox"
	aria-label={label}
	class={className}
	data-focus-within={focusWithin || undefined}
	data-focus-visible={focusVisible || undefined}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onmousedown={handleMouseDown}
	onkeydown={handleKeydown}
	{...restProps}
>
	{#each options as option (option.value)}
		{#if children}
			{@render children(option)}
		{:else}
			<TimePickerColumnCell {option} {type} />
		{/if}
	{/each}
</div>
