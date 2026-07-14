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
			class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
		/>
		<Autocomplete.Status />
		<Autocomplete.List
			aria-label="Fruits"
			class="mt-1 max-h-60 overflow-auto rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800"
			onChange={(value) => (selected = Array.from(value)[0] ?? null)}
		>
			{#each fruits as fruit (fruit.id)}
				<Autocomplete.Item
					id={fruit.id}
					textValue={fruit.name}
					class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-neutral-900 data-[focus-visible=true]:bg-neutral-100 data-[hovered=true]:bg-neutral-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:data-[focus-visible=true]:bg-neutral-700 dark:data-[hovered=true]:bg-neutral-700"
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
	<p class="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Selected: {selected ?? 'none'}</p>
</div>
