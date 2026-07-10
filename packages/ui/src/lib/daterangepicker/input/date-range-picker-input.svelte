<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		useDateRangePickerContext,
		type DateRangePickerRangePart,
		type DatePickerSegmentPart
	} from '../root/context';
	import DateRangePickerSegment from '../segment/date-range-picker-segment.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type DateRangePickerInputProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		| 'children'
		| 'class'
		| 'id'
		| 'role'
		| 'tabindex'
		| 'onmousedown'
		| 'onfocus'
		| 'onblur'
		| 'onfocusout'
		| 'onkeydown'
		| 'aria-invalid'
	> & {
		part: DateRangePickerRangePart;
		id?: string;
		name?: string;
		children?: Snippet<[DatePickerSegmentPart]>;
		class?: string;
		'aria-label'?: string;
		'aria-invalid'?: HTMLAttributes<HTMLDivElement>['aria-invalid'];
		onblur?: (event: FocusEvent) => void;
	};

	let {
		part,
		id,
		name,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-invalid': ariaInvalid,
		onblur,
		...restProps
	}: DateRangePickerInputProps = $props();

	const dateRangePicker = useDateRangePickerContext();
	const segments = $derived(dateRangePicker.getSegments(part));
	const groupId = $derived(id ? `${id}-group` : `${dateRangePicker.id}-${part}-input`);
	const proxyValue = $derived(dateRangePicker.value?.[part] ?? '');
	const isInvalid = $derived(
		ariaInvalid === true || ariaInvalid === 'true' || dateRangePicker.isPartInvalid(part)
	);
	const shouldRenderProxyInput = $derived(Boolean(id || name));
	const proxyInputStyle =
		'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

	function handleMouseDown(event: MouseEvent) {
		if (dateRangePicker.isDisabled) {
			event.preventDefault();
			return;
		}
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		dateRangePicker.setFocusVisible(false);

		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-date-range-picker-segment="true"]')) {
			return;
		}

		event.preventDefault();
		dateRangePicker.focusNextPlaceholderOrLastSegment(part);
	}

	function handleFocus(event: FocusEvent) {
		if (dateRangePicker.isDisabled) {
			(event.currentTarget as HTMLElement | null)?.blur();
			dateRangePicker.syncFocusWithin();
			dateRangePicker.setFocusVisible(false);
			return;
		}
		dateRangePicker.syncFocusWithin();
		dateRangePicker.setFocusVisible(shouldShowFocusVisible(event.target as HTMLElement | null));
		// Focus arriving FROM a segment (Shift+Tab moving backwards) must not be
		// recaptured — redirecting here trapped keyboard users inside the group.
		const related = event.relatedTarget as Node | null;
		const group = event.currentTarget as HTMLElement | null;
		if (related && group && group.contains(related)) {
			return;
		}
		dateRangePicker.focusNextPlaceholderOrLastSegment(part);
	}

	function handleProxyFocus(event: FocusEvent) {
		if (dateRangePicker.isDisabled) {
			(event.currentTarget as HTMLElement | null)?.blur();
			dateRangePicker.syncFocusWithin();
			dateRangePicker.setFocusVisible(false);
			return;
		}
		dateRangePicker.setFocusVisible(shouldShowFocusVisible(event.currentTarget as HTMLElement));
		dateRangePicker.focusNextPlaceholderOrLastSegment(part);
	}

	function handleBlur() {
		queueMicrotask(() => {
			dateRangePicker.syncFocusWithin();
		});
	}

	function handleFocusOut(event: FocusEvent) {
		queueMicrotask(() => {
			dateRangePicker.syncFocusWithin();
			const root = document.getElementById(dateRangePicker.id);
			const activeElement = document.activeElement;
			if (root && activeElement && root.contains(activeElement)) return;
			onblur?.(event);
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (dateRangePicker.isDisabled) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		// Keys bubbling up from a segment already got handled (or deliberately
		// ignored) there — re-focusing another segment on Space/Enter inside a
		// spinbutton was surprising and non-standard.
		if (event.defaultPrevented) return;
		if ((event.target as HTMLElement | null)?.closest('[data-date-range-picker-segment="true"]')) {
			return;
		}
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		dateRangePicker.setFocusVisible(true);
		event.preventDefault();
		dateRangePicker.focusNextPlaceholderOrLastSegment(part);
	}
</script>

{#if shouldRenderProxyInput}
	<input
		{id}
		{name}
		value={proxyValue}
		readonly
		tabindex="-1"
		disabled={dateRangePicker.isDisabled || undefined}
		aria-hidden="true"
		aria-invalid={ariaInvalid}
		style={proxyInputStyle}
		onfocus={handleProxyFocus}
	/>
{/if}

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	id={groupId}
	class={className}
	{...restProps}
	role="group"
	aria-label={ariaLabel}
	tabindex={dateRangePicker.isDisabled || dateRangePicker.focusWithin ? -1 : 0}
	data-date-range-picker-input={part}
	data-disabled={dateRangePicker.isDisabled || undefined}
	data-readonly={dateRangePicker.isReadOnly || undefined}
	data-open={dateRangePicker.open || undefined}
	data-focus-visible={dateRangePicker.focusVisible || undefined}
	data-focus-within={dateRangePicker.focusWithin || undefined}
	data-invalid={isInvalid || undefined}
	onmousedown={handleMouseDown}
	onfocus={handleFocus}
	onblur={handleBlur}
	onfocusout={handleFocusOut}
	onkeydown={handleKeydown}
>
	{#each segments as segment, index (index)}
		{#if children}
			{@render children(segment)}
		{:else}
			<DateRangePickerSegment {part} {segment} />
		{/if}
	{/each}
</div>
