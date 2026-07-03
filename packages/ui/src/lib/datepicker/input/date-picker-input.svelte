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
		| 'onfocusout'
		| 'onkeydown'
		| 'aria-invalid'
	> & {
		id?: string;
		name?: string;
		children?: Snippet<[DatePickerSegmentPart]>;
		class?: string;
		'aria-label'?: string;
		'aria-invalid'?: HTMLAttributes<HTMLDivElement>['aria-invalid'];
		onblur?: (event: FocusEvent) => void;
	};

	let {
		id,
		name,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-invalid': ariaInvalid,
		onblur,
		...restProps
	}: DatePickerInputProps = $props();

	const datePicker = useDatePickerContext();
	const segments = $derived(datePicker.getSegments());
	const groupId = $derived(id ? `${id}-group` : `${datePicker.id}-input`);
	const proxyValue = $derived(datePicker.value ?? '');
	const isInvalid = $derived(ariaInvalid === true || ariaInvalid === 'true');
	const shouldRenderProxyInput = $derived(Boolean(id || name));
	const proxyInputStyle =
		'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

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

	function handleProxyFocus(event: FocusEvent) {
		if (datePicker.isDisabled) {
			(event.currentTarget as HTMLElement | null)?.blur();
			datePicker.syncFocusWithin();
			datePicker.setFocusVisible(false);
			return;
		}
		datePicker.setFocusVisible(shouldShowFocusVisible(event.currentTarget as HTMLElement));
		datePicker.focusNextPlaceholderOrLastSegment();
	}

	function handleBlur() {
		queueMicrotask(() => {
			datePicker.syncFocusWithin();
		});
	}

	function handleFocusOut(event: FocusEvent) {
		queueMicrotask(() => {
			datePicker.syncFocusWithin();
			const root = document.getElementById(datePicker.id);
			const activeElement = document.activeElement;
			if (root && activeElement && root.contains(activeElement)) return;
			onblur?.(event);
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

{#if shouldRenderProxyInput}
	<input
		{id}
		{name}
		value={proxyValue}
		readonly
		tabindex="-1"
		disabled={datePicker.isDisabled || undefined}
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
	tabindex={datePicker.isDisabled ? -1 : 0}
	data-disabled={datePicker.isDisabled || undefined}
	data-readonly={datePicker.isReadOnly || undefined}
	data-open={datePicker.open || undefined}
	data-focus-visible={datePicker.focusVisible || undefined}
	data-focus-within={datePicker.focusWithin || undefined}
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
			<DatePickerSegment {segment} />
		{/if}
	{/each}
</div>
