<script lang="ts">
	import { Dialog } from '@human-kit/ui';

	let open = $state(false);
</script>

<div class="flex flex-col items-center gap-3">
	<button
		onclick={() => (open = true)}
		class="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
	>
		Open externally
	</button>
	<p class="text-sm text-neutral-500 dark:text-neutral-400">open: <code>{open}</code></p>

	<Dialog.Root bind:open>
		{#snippet children({ close })}
			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 bg-black/50" />
				<Dialog.Content
					class="w-100 max-w-[90vw] rounded-xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
				>
					<h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
						Controlled dialog
					</h3>
					<p class="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
						This dialog has no trigger — its open state lives outside and is wired up with
						<code>bind:open</code>.
					</p>
					<div class="flex justify-end">
						<button
							onclick={close}
							class="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
						>
							Close
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		{/snippet}
	</Dialog.Root>
</div>
