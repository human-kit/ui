<script lang="ts">
	import { Dialog } from '../../dialog';
	import { Popover } from '../../popover';
</script>

<Dialog.Root>
	{#snippet children({ close })}
		<Dialog.Trigger>Open Dialog</Dialog.Trigger>

		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content>
				<Popover.Root>
					<Popover.Trigger>Open Nested Popover</Popover.Trigger>

					<Popover.Content nonModal={true} class="nested-popover-content">
						<p>Nested popover content</p>
					</Popover.Content>
				</Popover.Root>

				<button type="button" onclick={close}>Close Dialog</button>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
