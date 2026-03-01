<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTimePickerContext, type TimePickerSegmentPart } from '../root/context';
	import TimePickerSegment from '../segment/time-picker-segment.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type TimePickerInputProps = Omit<
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
		children?: Snippet<[TimePickerSegmentPart]>;
		class?: string;
		'aria-label'?: string;
	};

	let {
		children,
		class: className = '',
		'aria-label': ariaLabel,
		...restProps
	}: TimePickerInputProps = $props();

	const timePicker = useTimePickerContext();
	const segments = $derived(timePicker.getSegments());
	const inputId = $derived(`${timePicker.id}-input`);

	function handleMouseDown(event: MouseEvent) {
		if (timePicker.isDisabled) return;
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		timePicker.setFocusVisible(false);

		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-time-picker-segment="true"]')) {
			return;
		}

		event.preventDefault();
		timePicker.focusNextPlaceholderOrLastSegment();
	}

	function handleFocus(event: FocusEvent) {
		if (timePicker.isDisabled) return;
		timePicker.syncFocusWithin();
		timePicker.setFocusVisible(shouldShowFocusVisible(event.target as HTMLElement | null));
		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-time-picker-segment="true"]')) {
			return;
		}
		timePicker.focusNextPlaceholderOrLastSegment();
	}

	function handleBlur() {
		queueMicrotask(() => {
			timePicker.syncFocusWithin();
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (timePicker.isDisabled) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		timePicker.setFocusVisible(true);
		event.preventDefault();
		timePicker.focusNextPlaceholderOrLastSegment();
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
	aria-invalid={timePicker.isInvalidDraft || undefined}
	tabindex={timePicker.isDisabled ? -1 : 0}
	data-disabled={timePicker.isDisabled || undefined}
	data-readonly={timePicker.isReadOnly || undefined}
	data-open={timePicker.open || undefined}
	data-focus-visible={timePicker.focusVisible || undefined}
	data-focus-within={timePicker.focusWithin || undefined}
	data-invalid={timePicker.isInvalidDraft || undefined}
	onmousedown={handleMouseDown}
	onfocus={handleFocus}
	onblur={handleBlur}
	onkeydown={handleKeydown}
>
	{#each segments as segment, index (index)}
		{#if children}
			{@render children(segment)}
		{:else}
			<TimePickerSegment {segment} />
		{/if}
	{/each}
</div>
