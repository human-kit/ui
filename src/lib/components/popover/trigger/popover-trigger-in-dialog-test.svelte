<script lang="ts">
	import { Dialog } from '$lib/components/dialog';
	import { Popover } from '$lib/components/popover';
</script>

<Dialog.Root>
	{#snippet children({ close })}
		<Dialog.Trigger>
			<button type="button">Open Dialog</button>
		</Dialog.Trigger>

		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content>
				<Popover.Root>
					<Popover.Trigger>
						<button type="button">Open Nested Popover</button>
					</Popover.Trigger>

					<Popover.Content isNonModal={true} class="nested-popover-content">
						<p>Nested popover content</p>
					</Popover.Content>
				</Popover.Root>

				<button type="button" onclick={close}>Close Dialog</button>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
