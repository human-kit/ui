<script lang="ts">
	import { Autocomplete } from '@human-kit/ui';

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'lemon', name: 'Lemon' },
		{ id: 'mango', name: 'Mango' },
		{ id: 'orange', name: 'Orange' },
		{ id: 'peach', name: 'Peach' }
	];

	let selected = $state<string | number | null>(null);
</script>

<div class="w-full max-w-xs">
	<Autocomplete.Root aria-label="Fruits">
		<Autocomplete.Input
			placeholder="Search fruits..."
			aria-label="Search fruits"
			class="h-8 w-full rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:outline-white"
		/>
		<Autocomplete.Status />
		<Autocomplete.List
			aria-label="Fruits"
			class="mt-1 max-h-60 overflow-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
			onChange={(value) => (selected = Array.from(value)[0] ?? null)}
		>
			{#each fruits as fruit (fruit.id)}
				<Autocomplete.Item
					id={fruit.id}
					textValue={fruit.name}
					class="flex cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm text-neutral-900 outline-none data-[hovered=true]:bg-neutral-100 data-[focus-visible=true]:bg-neutral-100 data-[selected=true]:font-medium dark:text-white dark:data-[hovered=true]:bg-neutral-800 dark:data-[focus-visible=true]:bg-neutral-800"
				>
					{fruit.name}
					<Autocomplete.ItemIndicator class="text-current" />
				</Autocomplete.Item>
			{/each}
			<Autocomplete.Empty
				class="px-3 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400"
			>
				No fruits found
			</Autocomplete.Empty>
		</Autocomplete.List>
	</Autocomplete.Root>
	<p class="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Selected: {selected ?? 'none'}</p>
</div>
