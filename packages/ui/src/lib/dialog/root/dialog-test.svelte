<script lang="ts">
	import { Dialog } from '../index';

	type Props = {
		open?: boolean;
		defaultOpen?: boolean;
		controlledOpen?: boolean;
		shouldCloseOnInteractOutside?: boolean;
		shouldCloseOnEscape?: boolean;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		open,
		defaultOpen = false,
		controlledOpen = false,
		shouldCloseOnInteractOutside = true,
		shouldCloseOnEscape = true,
		onOpenChange
	}: Props = $props();
</script>

<Dialog.Root {open} {defaultOpen} {controlledOpen} {onOpenChange}>
	{#snippet children({ close })}
		<Dialog.Trigger>Open Dialog</Dialog.Trigger>

		<Dialog.Portal>
			<Dialog.Overlay data-testid="dialog-overlay" />
			<Dialog.Content class="dialog-content" {shouldCloseOnInteractOutside} {shouldCloseOnEscape}>
				<div class="dialog-body">
					<Dialog.Title>Dialog Title</Dialog.Title>
					<Dialog.Description>Dialog content goes here.</Dialog.Description>
					<button type="button" class="close-btn" onclick={close}>Close</button>
					<Dialog.Close>Dismiss</Dialog.Close>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
