<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useDatePickerContext, type DatePickerSegmentPart } from '../root/context';
	import DatePickerSegment from '../segment/date-picker-segment.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type DatePickerInputProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		| 'children'
		| 'class'
		| 'id'
		| 'role'
		| 'tabindex'
		| 'onmousedown'
		| 'onfocus'
		| 'onblur'
		| 'onkeydown'
	> & {
		children?: Snippet<[DatePickerSegmentPart]>;
		class?: string;
		'aria-label'?: string;
	};

	let {
		children,
		class: className = '',
		'aria-label': ariaLabel,
		...restProps
	}: DatePickerInputProps = $props();

	const datePicker = useDatePickerContext();
	const segments = $derived(datePicker.getSegments());
	const inputId = $derived(`${datePicker.id}-input`);

	function handleMouseDown(event: MouseEvent) {
		if (datePicker.isDisabled) {
			event.preventDefault();
			return;
		}
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		datePicker.setFocusVisible(false);

		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-date-picker-segment="true"]')) {
			return;
		}

		event.preventDefault();
		datePicker.focusNextPlaceholderOrLastSegment();
	}

	function handleFocus(event: FocusEvent) {
		if (datePicker.isDisabled) {
			(event.currentTarget as HTMLElement | null)?.blur();
			datePicker.syncFocusWithin();
			datePicker.setFocusVisible(false);
			return;
		}
		datePicker.syncFocusWithin();
		datePicker.setFocusVisible(shouldShowFocusVisible(event.target as HTMLElement | null));
		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-date-picker-segment="true"]')) {
			return;
		}
		datePicker.focusNextPlaceholderOrLastSegment();
	}

	function handleBlur() {
		queueMicrotask(() => {
			datePicker.syncFocusWithin();
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (datePicker.isDisabled) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		datePicker.setFocusVisible(true);
		event.preventDefault();
		datePicker.focusNextPlaceholderOrLastSegment();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_role_supports_aria_props -->
<div
	id={inputId}
	class={className}
	{...restProps}
	role="group"
	aria-label={ariaLabel}
	aria-invalid={datePicker.isInvalidDraft || undefined}
	tabindex={datePicker.isDisabled ? -1 : 0}
	data-disabled={datePicker.isDisabled || undefined}
	data-readonly={datePicker.isReadOnly || undefined}
	data-open={datePicker.open || undefined}
	data-focus-visible={datePicker.focusVisible || undefined}
	data-focus-within={datePicker.focusWithin || undefined}
	data-invalid={datePicker.isInvalidDraft || undefined}
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
