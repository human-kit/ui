<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { useDateRangePickerContext } from '../root/context';
	import { Popover } from '../../popover';
	import type { PopoverOpenChangeDetails } from '../../popover/root/context';
	import { composeEventHandlers, sanitizeDateRangePickerProps } from '../internal/strict-props';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { trackInteractionModality } from '../../primitives/input-modality';

	type ForbiddenPopoverProp = 'open' | 'triggerRef' | 'onOpenChange' | 'id';

	type DateRangePickerPopoverProps = Omit<
		ComponentProps<typeof Popover.Content>,
		ForbiddenPopoverProp
	>;

	const forbiddenPopoverProps: ForbiddenPopoverProp[] = [
		'open',
		'triggerRef',
		'onOpenChange',
		'id'
	];

	let {
		class: className = '',
		children,
		'aria-label': ariaLabel,
		initialFocus,
		onmousedown: onMouseDownExternal,
		onkeydowncapture: onKeydownCaptureExternal,
		...unsafeRestProps
	}: DateRangePickerPopoverProps = $props();

	const dateRangePicker = useDateRangePickerContext();
	const dialogId = `${dateRangePicker.id}-popover`;
	const resolvedAriaLabel = $derived(
		ariaLabel ?? resolveLocalizedString(dateRangePicker.locale, 'datePicker.calendar')
	);
	const restProps = $derived.by(
		() =>
			sanitizeDateRangePickerProps(
				'Popover',
				unsafeRestProps as Record<string, unknown>,
				forbiddenPopoverProps
			) as Omit<ComponentProps<typeof Popover.Content>, ForbiddenPopoverProp>
	);
	const resolvedInitialFocus = $derived.by(() => {
		if (typeof initialFocus === 'function') {
			return () => initialFocus() ?? resolveInitialCalendarFocus();
		}
		if (initialFocus !== undefined) {
			return initialFocus;
		}
		return resolveInitialCalendarFocus;
	});

	function handleOpenChange(nextOpen: boolean, details: PopoverOpenChangeDetails) {
		dateRangePicker.onOpenChange(nextOpen, details);
	}

	function resolveInitialCalendarFocus(): HTMLElement | null {
		const dialog = document.getElementById(dialogId);
		const activeDayCell = dialog?.querySelector<HTMLElement>(
			'[role="button"][data-date][tabindex="0"]'
		);
		return activeDayCell ?? null;
	}

	function handlePointerDown(event: MouseEvent) {
		trackInteractionModality(event);
	}

	function handleKeydown(event: KeyboardEvent) {
		trackInteractionModality(event);
	}
</script>

<Popover.Root
	open={dateRangePicker.open}
	triggerRef={dateRangePicker.triggerRef}
	onOpenChange={handleOpenChange}
>
	<Popover.Content
		id={dialogId}
		class={className}
		aria-label={resolvedAriaLabel}
		onmousedown={composeEventHandlers(handlePointerDown, onMouseDownExternal ?? undefined)}
		onkeydowncapture={composeEventHandlers(handleKeydown, onKeydownCaptureExternal ?? undefined)}
		initialFocus={resolvedInitialFocus}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</Popover.Content>
</Popover.Root>
