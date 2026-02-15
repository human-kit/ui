<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useDatePickerContext, type DatePickerSegmentPart } from '../root/context';
	import DatePickerSegment from '../segment/date-picker-segment.svelte';

	type DatePickerInputProps = {
		children?: Snippet<[DatePickerSegmentPart]>;
		class?: string;
		'aria-label'?: string;
	};

	let { children, class: className = '', 'aria-label': ariaLabel }: DatePickerInputProps = $props();

	const datePicker = useDatePickerContext();
	const segments = $derived(datePicker.getSegments());
	const inputId = $derived(`${datePicker.id}-input`);
	let inputRef: HTMLDivElement | null = $state(null);

	function focusNextAvailableSegment() {
		if (!inputRef || datePicker.isDisabled) return;

		const segmentElements = Array.from(
			inputRef.querySelectorAll<HTMLElement>('[data-date-picker-segment="true"]')
		);
		if (segmentElements.length === 0) return;

		const nextAvailable =
			segmentElements.find((segment) => segment.getAttribute('data-placeholder') === 'true') ??
			segmentElements[segmentElements.length - 1];

		nextAvailable?.focus();
	}

	function handleMouseDown(event: MouseEvent) {
		if (datePicker.isDisabled) return;
		datePicker.setFocusVisible(false);

		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-date-picker-segment="true"]')) {
			return;
		}

		event.preventDefault();
		focusNextAvailableSegment();
	}

	function handleFocus(event: FocusEvent) {
		if (datePicker.isDisabled) return;
		datePicker.syncFocusWithin();
		datePicker.setFocusVisible(
			(event.target as HTMLElement | null)?.matches(':focus-visible') ?? false
		);
		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-date-picker-segment="true"]')) {
			return;
		}
		focusNextAvailableSegment();
	}

	function handleBlur() {
		queueMicrotask(() => {
			datePicker.syncFocusWithin();
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (datePicker.isDisabled) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		focusNextAvailableSegment();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex: Group container is intentionally focusable to forward focus into segmented field. -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions: Pointer/keyboard handlers are required to delegate focus to date segments. -->
<div
	bind:this={inputRef}
	id={inputId}
	class={className}
	role="group"
	aria-label={ariaLabel}
	tabindex={datePicker.isDisabled ? -1 : 0}
	data-disabled={datePicker.isDisabled || undefined}
	data-readonly={datePicker.isReadOnly || undefined}
	data-open={datePicker.open || undefined}
	data-focus-visible={datePicker.focusVisible || undefined}
	data-focus-within={datePicker.focusWithin || undefined}
	onmousedown={handleMouseDown}
	onfocus={handleFocus}
	onblur={handleBlur}
	onkeydown={handleKeydown}
>
	{#each segments as segment, index (index)}
		{#if children}
			{@render children(segment)}
		{:else}
			<DatePickerSegment {segment} />
		{/if}
	{/each}
</div>
