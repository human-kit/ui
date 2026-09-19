<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';
	import { Toast } from '@human-kit/ui';
	import type { ToastManager } from '@human-kit/ui';

	let manager = $state<ToastManager>();
	let deleted = $state(false);

	const buttonClass =
		'border border-neutral-300 px-3 py-1 text-sm text-neutral-900 outline-none hover:bg-neutral-100 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white';
</script>

<Toast.Provider bind:manager>
	<button
		type="button"
		class={buttonClass}
		disabled={deleted}
		onclick={() => {
			deleted = true;
			manager?.add({ title: 'Message deleted', timeout: 8000 });
		}}
	>
		{deleted ? 'Deleted' : 'Delete the message'}
	</button>
	<!-- The action closes the toast on the press: the offer is taken. -->
	<Toast.Viewport class="toast-viewport">
		{#snippet children(toast)}
			<Toast.Root {toast} class="toast flex items-center gap-3">
				<Toast.Content class="toast-content flex-1">
					<Toast.Title class="text-sm text-neutral-900 dark:text-white" />
				</Toast.Content>
				<Toast.Action
					onclick={() => (deleted = false)}
					class="text-sm font-medium text-neutral-900 underline outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-neutral-900 dark:text-white dark:focus-visible:outline-white"
				>
					Undo
				</Toast.Action>
				<Toast.Close
					aria-label="Close"
					class="inline-flex size-6 items-center justify-center text-neutral-500 outline-none hover:text-neutral-900 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-neutral-900 dark:hover:text-white dark:focus-visible:outline-white"
				>
					<XIcon class="size-4" />
				</Toast.Close>
			</Toast.Root>
		{/snippet}
	</Toast.Viewport>
</Toast.Provider>
