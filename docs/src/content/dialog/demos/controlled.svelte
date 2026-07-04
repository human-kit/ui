<script lang="ts">
	import { Dialog } from '@human-kit/ui';

	let open = $state(false);
</script>

<div class="flex flex-col items-center gap-3">
	<button
		onclick={() => (open = true)}
		class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-gray-900"
	>
		Open externally
	</button>
	<p class="text-sm text-gray-500 dark:text-gray-400">open: <code>{open}</code></p>

	<Dialog.Root bind:open>
		{#snippet children({ close })}
			<Dialog.Portal>
				<Dialog.Overlay />
				<Dialog.Content
					class="w-100 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
				>
					<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
						Controlled dialog
					</h3>
					<p class="mb-6 text-sm text-gray-600 dark:text-gray-300">
						This dialog has no trigger — its open state lives outside and is wired up with
						<code>bind:open</code>.
					</p>
					<div class="flex justify-end">
						<button
							onclick={close}
							class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-gray-900"
						>
							Close
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		{/snippet}
	</Dialog.Root>
</div>
