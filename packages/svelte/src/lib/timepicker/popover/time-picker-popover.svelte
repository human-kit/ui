<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { useTimePickerContext } from '../root/context';
	import { Popover } from '../../popover';
	import type { PopoverOpenChangeDetails } from '../../popover/root/context';
	import { composeEventHandlers, sanitizeTimePickerProps } from '../internal/strict-props';
	import { trackInteractionModality } from '../../primitives/input-modality';

	type ForbiddenPopoverProp = 'open' | 'triggerRef' | 'onOpenChange' | 'id';
	type TimePickerPopoverProps = Omit<ComponentProps<typeof Popover.Content>, ForbiddenPopoverProp>;

	const forbiddenPopoverProps: ForbiddenPopoverProp[] = [
		'open',
		'triggerRef',
		'onOpenChange',
		'id'
	];

	let {
		class: className = '',
		children,
		'aria-label': ariaLabel = 'Time picker',
		initialFocus,
		onmousedown: onMouseDownExternal,
		onkeydowncapture: onKeydownCaptureExternal,
		...unsafeRestProps
	}: TimePickerPopoverProps = $props();

	const timePicker = useTimePickerContext();
	const dialogId = `${timePicker.id}-popover`;
	const restProps = $derived.by(
		() =>
			sanitizeTimePickerProps(
				'Popover',
				unsafeRestProps as Record<string, unknown>,
				forbiddenPopoverProps
			) as Omit<ComponentProps<typeof Popover.Content>, ForbiddenPopoverProp>
	);

	const resolvedInitialFocus = $derived.by(() => {
		if (typeof initialFocus === 'function') {
			return () => initialFocus() ?? resolveInitialColumnFocus();
		}
		if (initialFocus !== undefined) {
			return initialFocus;
		}
		return resolveInitialColumnFocus;
	});

	function resolveInitialColumnFocus(): HTMLElement | null {
		const dialog = document.getElementById(dialogId);
		const selectedOption = dialog?.querySelector<HTMLElement>(
			'[role="option"][aria-selected="true"]'
		);
		if (selectedOption) return selectedOption;
		const firstOption = dialog?.querySelector<HTMLElement>('[role="option"]');
		return firstOption ?? null;
	}

	function handleOpenChange(nextOpen: boolean, details: PopoverOpenChangeDetails) {
		timePicker.onOpenChange(nextOpen, details);
	}

	function handlePointerDown(event: MouseEvent) {
		trackInteractionModality(event);
	}

	function handleKeydown(event: KeyboardEvent) {
		trackInteractionModality(event);
	}
</script>

<Popover.Root
	open={timePicker.open}
	triggerRef={timePicker.triggerRef}
	onOpenChange={handleOpenChange}
>
	<Popover.Content
		id={dialogId}
		class={className}
		aria-label={ariaLabel}
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
