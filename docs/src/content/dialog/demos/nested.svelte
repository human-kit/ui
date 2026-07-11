<script lang="ts">
	import { Dialog } from '@human-kit/svelte-components';
</script>

<Dialog.Root>
	{#snippet children({ close })}
		<Dialog.Trigger
			class="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-neutral-900"
		>
			Open first dialog
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content
				class="w-100 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-neutral-800"
			>
				<h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">First dialog</h3>
				<p class="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
					Open a second dialog on top. Escape and outside clicks only close the topmost one.
				</p>

				<Dialog.Root>
					{#snippet children({ close: closeNested })}
						<Dialog.Trigger
							class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
						>
							Open nested dialog
						</Dialog.Trigger>
						<Dialog.Portal>
							<Dialog.Overlay />
							<Dialog.Content
								class="w-87.5 max-w-[85vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-neutral-800"
							>
								<h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
									Nested dialog
								</h3>
								<p class="mb-6 text-sm text-neutral-600 dark:text-neutral-300">
									This dialog stacks above the first one.
								</p>
								<div class="flex justify-end">
									<button
										onclick={closeNested}
										class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
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
						class="rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
					>
						Close first
					</button>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
