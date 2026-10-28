<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { useDatePickerContext } from '../root/context';
	import { Popover } from '../../popover';
	import type { PopoverOpenChangeDetails } from '../../popover/root/context';
	import { composeEventHandlers, sanitizeDatePickerProps } from '../internal/strict-props';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { trackInteractionModality } from '../../primitives/input-modality';

	type ForbiddenPopoverProp = 'open' | 'triggerRef' | 'onOpenChange' | 'id';

	type DatePickerPopoverProps = Omit<ComponentProps<typeof Popover.Content>, ForbiddenPopoverProp>;

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
	}: DatePickerPopoverProps = $props();

	const datePicker = useDatePickerContext();
	const dialogId = `${datePicker.id}-popover`;
	const resolvedAriaLabel = $derived(
		ariaLabel ?? resolveLocalizedString(datePicker.locale, 'datePicker.calendar')
	);
	const restProps = $derived.by(
		() =>
			sanitizeDatePickerProps(
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
		datePicker.onOpenChange(nextOpen, details);
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
	open={datePicker.open}
	triggerRef={datePicker.triggerRef}
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
