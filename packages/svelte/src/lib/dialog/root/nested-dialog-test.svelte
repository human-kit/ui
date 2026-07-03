<script lang="ts">
	import { Dialog } from '../index';

	type Props = {
		onDialog1Close?: () => void;
		onDialog2Close?: () => void;
		onDialog3Close?: () => void;
	};

	let { onDialog1Close, onDialog2Close, onDialog3Close }: Props = $props();
</script>

<!-- Level 1 Dialog -->
<Dialog.Root onOpenChange={(open) => !open && onDialog1Close?.()}>
	{#snippet children({ close })}
		<Dialog.Trigger data-testid="trigger-1">Open Dialog 1</Dialog.Trigger>

		<Dialog.Portal>
			<Dialog.Overlay data-testid="overlay-1" />
			<Dialog.Content data-testid="content-1" class="dialog-1">
				<h3>Dialog 1</h3>
				<button type="button" data-testid="close-1" onclick={close}>Close 1</button>

				<!-- Level 2 Dialog (Nested) -->
				<Dialog.Root onOpenChange={(open) => !open && onDialog2Close?.()}>
					{#snippet children({ close: close2 })}
						<Dialog.Trigger data-testid="trigger-2">Open Dialog 2</Dialog.Trigger>

						<Dialog.Portal>
							<Dialog.Overlay data-testid="overlay-2" />
							<Dialog.Content data-testid="content-2" class="dialog-2">
								<h3>Dialog 2</h3>
								<button type="button" data-testid="close-2" onclick={close2}>Close 2</button>

								<!-- Level 3 Dialog (Double Nested) -->
								<Dialog.Root onOpenChange={(open) => !open && onDialog3Close?.()}>
									{#snippet children({ close: close3 })}
										<Dialog.Trigger data-testid="trigger-3">Open Dialog 3</Dialog.Trigger>

										<Dialog.Portal>
											<Dialog.Overlay data-testid="overlay-3" />
											<Dialog.Content data-testid="content-3" class="dialog-3">
												<h3>Dialog 3</h3>
												<button type="button" data-testid="close-3" onclick={close3}>Close 3</button
												>
											</Dialog.Content>
										</Dialog.Portal>
									{/snippet}
								</Dialog.Root>
							</Dialog.Content>
						</Dialog.Portal>
					{/snippet}
				</Dialog.Root>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
