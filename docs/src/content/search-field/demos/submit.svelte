<script lang="ts">
	import { SearchField } from '@human-kit/ui';

	let log = $state<string[]>([]);

	function record(entry: string) {
		log = [entry, ...log].slice(0, 4);
	}
</script>

<div class="flex w-full max-w-xs flex-col gap-2">
	<SearchField.Root
		onSubmit={(value) => record(`Submit: "${value}"`)}
		onClear={() => record('Clear')}
		class="flex h-8 items-center gap-2 border border-neutral-300 bg-white px-2 data-[focus-within=true]:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:data-[focus-within=true]:border-white"
	>
		<SearchField.Input
			aria-label="Search the docs"
			placeholder="Type, then press Enter or Escape"
			class="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500 [&::-webkit-search-cancel-button]:hidden"
		/>
		<SearchField.Clear
			class="flex size-5 items-center justify-center text-neutral-500 data-[empty=true]:invisible"
		/>
	</SearchField.Root>
	<ul class="min-h-20 text-xs text-neutral-500">
		{#each log as entry, index (index)}
			<li>{entry}</li>
		{/each}
	</ul>
</div>
