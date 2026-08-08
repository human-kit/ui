<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTimePickerContext, type TimePickerSegmentPart } from '../root/context';
	import TimePickerSegment from '../segment/time-picker-segment.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	import { composeEventHandlers } from '../internal/strict-props';

	type TimePickerInputProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'class' | 'id' | 'role' | 'tabindex' | 'aria-invalid'
	> & {
		id?: string;
		/**
		 * Name of the hidden proxy input used for form submission. The proxy only
		 * mirrors the committed value: autofill is NOT supported (it renders with
		 * `autocomplete="off"` so browsers and password managers do not write
		 * into it) — times are entered through the editable segments.
		 */
		name?: string;
		children?: Snippet<[TimePickerSegmentPart]>;
		class?: string;
		'aria-label'?: string;
		'aria-invalid'?: HTMLAttributes<HTMLDivElement>['aria-invalid'];
	};

	let {
		id,
		name,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-invalid': ariaInvalid,
		onmousedown: onMouseDownExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeydownExternal,
		...restProps
	}: TimePickerInputProps = $props();

	const timePicker = useTimePickerContext();
	const segments = $derived(timePicker.getSegments());
	// With an `id` the group keeps a derived one: the id itself belongs to the proxy input, so
	// a `<label for>` points at something focusable. Mirrors `DatePicker.Input`.
	const groupId = $derived(id ? `${id}-group` : `${timePicker.id}-input`);
	const proxyValue = $derived(timePicker.value ?? '');
	// Invalid is either half: the consumer's (a form rule) or an uncommittable segment draft.
	const isInvalid = $derived(
		ariaInvalid === true || ariaInvalid === 'true' || timePicker.isInvalidDraft
	);
	const shouldRenderProxyInput = $derived(Boolean(id || name));
	const proxyInputStyle =
		'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

	function handleProxyFocus(event: FocusEvent) {
		if (timePicker.isDisabled) {
			(event.currentTarget as HTMLElement | null)?.blur();
			timePicker.syncFocusWithin();
			timePicker.setFocusVisible(false);
			return;
		}
		timePicker.setFocusVisible(shouldShowFocusVisible(event.currentTarget as HTMLElement));
		timePicker.focusNextPlaceholderOrLastSegment();
	}

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
		// Focus arriving FROM a segment (Shift+Tab moving backwards) must not be
		// recaptured — redirecting here trapped keyboard users inside the group.
		const related = event.relatedTarget as Node | null;
		const group = event.currentTarget as HTMLElement | null;
		if (related && group && group.contains(related)) {
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
		// Keys bubbling up from a segment already got handled (or deliberately
		// ignored) there — re-focusing another segment on Space/Enter inside a
		// spinbutton was surprising and non-standard.
		if (event.defaultPrevented) return;
		if ((event.target as HTMLElement | null)?.closest('[data-time-picker-segment="true"]')) return;
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		timePicker.setFocusVisible(true);
		event.preventDefault();
		timePicker.focusNextPlaceholderOrLastSegment();
	}
</script>

{#if shouldRenderProxyInput}
	<!--
		A focusable stand-in for the segmented group: it carries the `id` a `<label for>` points
		at and the `name` a native form submit reads, and hands focus straight to the segments.
	-->
	<input
		{id}
		{name}
		value={proxyValue}
		readonly
		tabindex="-1"
		autocomplete="off"
		disabled={timePicker.isDisabled || undefined}
		aria-hidden="true"
		aria-invalid={ariaInvalid}
		style={proxyInputStyle}
		onfocus={handleProxyFocus}
	/>
{/if}

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_role_supports_aria_props -->
<div
	id={groupId}
	class={className}
	{...restProps}
	role="group"
	aria-label={ariaLabel}
	aria-invalid={isInvalid || undefined}
	aria-required={timePicker.isRequired || undefined}
	tabindex={timePicker.isDisabled || timePicker.focusWithin ? -1 : 0}
	data-disabled={timePicker.isDisabled || undefined}
	data-readonly={timePicker.isReadOnly || undefined}
	data-open={timePicker.open || undefined}
	data-focus-visible={timePicker.focusVisible || undefined}
	data-focus-within={timePicker.focusWithin || undefined}
	data-invalid={isInvalid || undefined}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeydown, onKeydownExternal ?? undefined, {
		skipExternalOnDefaultPrevented: true
	})}
>
	{#each segments as segment, index (segment.type === 'literal' ? `literal-${index}` : segment.type)}
		{#if children}
			{@render children(segment)}
		{:else}
			<TimePickerSegment {segment} />
		{/if}
	{/each}
</div>
