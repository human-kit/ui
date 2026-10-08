<script lang="ts">
	import { SearchField } from '@human-kit/ui';

	let value = $state('');
</script>

<div class="flex w-full max-w-xs flex-col gap-2">
	<SearchField.Root bind:value class="group flex flex-col gap-2">
		<SearchField.Label class="text-sm text-neutral-900 dark:text-white">Search</SearchField.Label>
		<div
			class="flex h-8 items-center gap-2 border border-neutral-300 bg-white px-2 transition-colors group-data-[focus-within=true]:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:group-data-[focus-within=true]:border-white"
		>
			<svg viewBox="0 0 24 24" class="size-4 shrink-0 text-neutral-400" aria-hidden="true">
				<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
				<path d="m20 20-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" />
			</svg>
			<SearchField.Input
				placeholder="Components"
				class="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500 [&::-webkit-search-cancel-button]:hidden"
			/>
			<SearchField.Clear
				class="flex size-5 items-center justify-center text-neutral-500 data-[empty=true]:invisible data-[hovered=true]:text-neutral-900 dark:data-[hovered=true]:text-white"
			/>
		</div>
	</SearchField.Root>
	<p class="text-xs text-neutral-500">Value: {JSON.stringify(value)}</p>
</div>
