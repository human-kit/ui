<script lang="ts">
	import { Dialog } from '../index';

	type Props = {
		open?: boolean;
		defaultOpen?: boolean;
		shouldCloseOnInteractOutside?: boolean;
		shouldCloseOnEscape?: boolean;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		open,
		defaultOpen = false,
		shouldCloseOnInteractOutside = true,
		shouldCloseOnEscape = true,
		onOpenChange
	}: Props = $props();
</script>

<Dialog.Root {open} {defaultOpen} {onOpenChange}>
	{#snippet children({ close })}
		<Dialog.Trigger>
			<button type="button">Open Dialog</button>
		</Dialog.Trigger>

		<Dialog.Portal>
			<Dialog.Overlay data-testid="dialog-overlay" />
			<Dialog.Content class="dialog-content" {shouldCloseOnInteractOutside} {shouldCloseOnEscape}>
				<div class="dialog-body">
					<h3>Dialog Title</h3>
					<p>Dialog content goes here.</p>
					<button type="button" class="close-btn" onclick={close}>Close</button>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
