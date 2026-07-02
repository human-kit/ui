<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Collapsible } from '@human-kit/svelte-components/collapsible';

	let open = $state(false);
	let isDisabled = $state(false);
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Collapsible</h1>
		<p class="mb-8 max-w-3xl text-gray-600 dark:text-gray-400">
			A single disclosure: a trigger that shows and hides an associated panel, with controlled or
			uncontrolled open state.
		</p>

		<div class="space-y-8">
			<DemoSection
				title="Interactive Playground"
				description="Toggle the panel, drive it with controlled state, or disable the trigger."
			>
				<div class="w-full max-w-xl">
					<Collapsible.Root
						bind:open
						disabled={isDisabled}
						class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
					>
						<Collapsible.Trigger
							class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-gray-900 outline-none transition-colors hover:bg-gray-50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-visible:ring-2 data-focus-visible:ring-inset data-focus-visible:ring-blue-500 dark:text-white dark:hover:bg-gray-800"
						>
							Recovery keys
							<svg
								class="size-4 shrink-0 text-gray-500 transition-transform duration-200 group-data-open:rotate-180"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
									clip-rule="evenodd"
								/>
							</svg>
						</Collapsible.Trigger>
						<Collapsible.Panel
							class="border-t border-gray-200 px-4 py-3 text-sm leading-6 text-gray-600 dark:border-gray-700 dark:text-gray-300"
						>
							Store these one-time recovery keys somewhere safe. Each key can be used a single time
							to regain access if you lose your authenticator.
						</Collapsible.Panel>
					</Collapsible.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
							<input
								type="checkbox"
								bind:checked={isDisabled}
								class="size-4 rounded border-gray-300 text-blue-600"
							/>
							disabled
						</label>

						<div class="flex flex-wrap gap-2">
							<button
								type="button"
								onclick={() => (open = true)}
								class="rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
							>
								Open
							</button>
							<button
								type="button"
								onclick={() => (open = false)}
								class="rounded-md bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
							>
								Close
							</button>
						</div>

						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="open" value={open} />
					</div>
				{/snippet}
			</DemoSection>
		</div>
	</div>
</div>
