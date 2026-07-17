<script lang="ts">
	import { Dialog } from '@human-kit/ui';
</script>

<Dialog.Root>
	{#snippet children({ close })}
		<Dialog.Trigger
			class="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
		>
			Open dialog
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 bg-black/50" />
			<Dialog.Content
				class="w-100 max-w-[90vw] rounded-xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
			>
				<h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Delete project</h3>
				<p class="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
					This action cannot be undone. The project and all of its data will be permanently removed.
				</p>
				<div class="flex justify-end gap-3">
					<button
						onclick={close}
						class="inline-flex h-8 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
					>
						Cancel
					</button>
					<button
						onclick={close}
						class="inline-flex h-8 items-center justify-center rounded-md bg-red-600 px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
					>
						Delete
					</button>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
