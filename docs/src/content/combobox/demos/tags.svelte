<script lang="ts">
	import { ComboBox } from '@human-kit/ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import X from '@lucide/svelte/icons/x';

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'mango', name: 'Mango' },
		{ id: 'orange', name: 'Orange' }
	];

	let value = $state<(string | number)[]>([]);
	let inputValue = $state('');

	const filtered = $derived(
		inputValue
			? fruits.filter((f) => f.name.toLowerCase().includes(inputValue.toLowerCase()))
			: fruits
	);
</script>

<div class="w-full max-w-sm">
	<ComboBox.Root selectionMode="multiple" bind:value bind:inputValue>
		<div
			class="flex flex-wrap items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700"
		>
			<ComboBox.Tags class="contents">
				{#snippet children({ item })}
					<ComboBox.Tag
						class="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>
						{item.label}
						<ComboBox.TagRemove class="ml-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800">
							<X class="size-3.5" />
						</ComboBox.TagRemove>
					</ComboBox.Tag>
				{/snippet}
			</ComboBox.Tags>
			<ComboBox.Input
				placeholder={value.length === 0 ? 'Select fruits...' : ''}
				class="min-w-20 flex-1 border-0 bg-transparent px-1 py-0.5 text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-white dark:placeholder:text-neutral-400"
			/>
			<ComboBox.Trigger class="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
				<ChevronDown class="size-4" />
			</ComboBox.Trigger>
		</div>

		<ComboBox.Popover
			class="mt-1 max-h-60 w-(--trigger-width) overflow-auto rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
		>
			<ComboBox.List emptyPlaceholder="No fruits found">
				{#each filtered as fruit (fruit.id)}
					<ComboBox.Item
						id={fruit.id}
						textValue={fruit.name}
						class="flex cursor-pointer items-center justify-between px-3 py-2 text-neutral-900 hover:bg-neutral-100 data-[focused=true]:bg-neutral-100 data-[selected=true]:bg-blue-50 dark:text-white dark:hover:bg-neutral-700 dark:data-[focused=true]:bg-neutral-700 dark:data-[selected=true]:bg-blue-900/30"
					>
						{fruit.name}
						<ComboBox.ItemIndicator class="text-blue-600 dark:text-blue-400" />
					</ComboBox.Item>
				{/each}
			</ComboBox.List>
		</ComboBox.Popover>
	</ComboBox.Root>
</div>
