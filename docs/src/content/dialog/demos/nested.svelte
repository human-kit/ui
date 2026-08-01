<script lang="ts">
	import { Dialog } from '@human-kit/ui';
</script>

<Dialog.Root>
	{#snippet children({ close })}
		<Dialog.Trigger
			class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
		>
			Open first dialog
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 bg-black/50" />
			<Dialog.Content
				class="w-100 max-w-[90vw] border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
			>
				<Dialog.Title class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
					First dialog
				</Dialog.Title>
				<Dialog.Description class="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
					Open a second dialog on top. Escape and outside clicks only close the topmost one.
				</Dialog.Description>

				<Dialog.Root>
					{#snippet children({ close: closeNested })}
						<Dialog.Trigger
							class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
						>
							Open nested dialog
						</Dialog.Trigger>
						<Dialog.Portal>
							<Dialog.Overlay class="fixed inset-0 bg-black/50" />
							<Dialog.Content
								class="w-87.5 max-w-[85vw] border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
							>
								<Dialog.Title class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
									Nested dialog
								</Dialog.Title>
								<Dialog.Description class="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
									This dialog stacks above the first one.
								</Dialog.Description>
								<div class="flex justify-end">
									<button
										onclick={closeNested}
										class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
									>
										Close nested
									</button>
								</div>
							</Dialog.Content>
						</Dialog.Portal>
					{/snippet}
				</Dialog.Root>

				<div class="mt-4 flex justify-end">
					<button
						onclick={close}
						class="inline-flex h-8 items-center justify-center border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
					>
						Close first
					</button>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
