<script lang="ts">
	import { Dialog } from '@human-kit/ui';
</script>

<Dialog.Root>
	{#snippet children({ close })}
		<Dialog.Trigger
			class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-gray-900"
		>
			Open dialog
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content
				class="w-100 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
			>
				<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Delete project</h3>
				<p class="mb-6 text-sm text-gray-600 dark:text-gray-300">
					This action cannot be undone. The project and all of its data will be permanently removed.
				</p>
				<div class="flex justify-end gap-3">
					<button
						onclick={close}
						class="rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Cancel
					</button>
					<button
						onclick={close}
						class="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
					>
						Delete
					</button>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
