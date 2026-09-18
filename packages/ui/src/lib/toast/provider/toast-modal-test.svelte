<script lang="ts">
	import { Dialog } from '../../dialog/index';
	import { Toast } from '../index';
	import type { ToastManager } from '../index';

	let manager = $state<ToastManager>();
</script>

<Toast.Provider bind:manager>
	<button type="button" data-testid="add" onclick={() => manager?.add({ title: 'Saved' })}
		>Add</button
	>
	<Dialog.Root defaultOpen>
		<Dialog.Portal>
			<Dialog.Content data-testid="dialog">
				<Dialog.Title>A modal</Dialog.Title>
				<Dialog.Close>Dismiss</Dialog.Close>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
	<Toast.Viewport data-testid="viewport">
		{#snippet children(toast)}
			<Toast.Root {toast}>
				<Toast.Content>
					<Toast.Title />
				</Toast.Content>
				<Toast.Close data-testid="close" aria-label="Close">x</Toast.Close>
			</Toast.Root>
		{/snippet}
	</Toast.Viewport>
</Toast.Provider>
