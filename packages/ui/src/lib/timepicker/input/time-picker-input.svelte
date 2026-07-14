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
		'children' | 'class' | 'id' | 'role' | 'tabindex'
	> & {
		children?: Snippet<[TimePickerSegmentPart]>;
		class?: string;
		'aria-label'?: string;
	};

	let {
		children,
		class: className = '',
		'aria-label': ariaLabel,
		onmousedown: onMouseDownExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeydownExternal,
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

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_role_supports_aria_props -->
<div
	id={inputId}
	class={className}
	{...restProps}
	role="group"
	aria-label={ariaLabel}
	aria-invalid={timePicker.isInvalidDraft || undefined}
	aria-required={timePicker.isRequired || undefined}
	tabindex={timePicker.isDisabled || timePicker.focusWithin ? -1 : 0}
	data-disabled={timePicker.isDisabled || undefined}
	data-readonly={timePicker.isReadOnly || undefined}
	data-open={timePicker.open || undefined}
	data-focus-visible={timePicker.focusVisible || undefined}
	data-focus-within={timePicker.focusWithin || undefined}
	data-invalid={timePicker.isInvalidDraft || undefined}
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
