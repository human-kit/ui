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
			class="flex h-8 items-center gap-0.5 border border-neutral-300 bg-white pr-1 pl-2 transition-colors focus-within:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-within:border-white"
		>
			<ComboBox.Input
				placeholder="Select fruits..."
				class="min-w-0 flex-1 border-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
			/>
			<ComboBox.Trigger
				class="inline-flex size-6 shrink-0 items-center justify-center text-neutral-500 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
			>
				<ChevronDown class="size-4" />
			</ComboBox.Trigger>
		</div>

		<!-- Selected values live BELOW the field as removable chips, not inside it. -->
		<ComboBox.Tags class="mt-2 flex flex-wrap gap-1 empty:hidden">
			{#snippet children({ item })}
				<ComboBox.Tag
					class="inline-flex items-center gap-1 bg-neutral-100 py-0.5 pr-1 pl-2 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
				>
					{item.label}
					<ComboBox.TagRemove class="hover:bg-neutral-200 dark:hover:bg-neutral-700">
						<X class="size-3.5" />
					</ComboBox.TagRemove>
				</ComboBox.Tag>
			{/snippet}
		</ComboBox.Tags>

		<ComboBox.Popover
			class="mt-1 max-h-60 w-(--trigger-width) overflow-auto border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			<ComboBox.List emptyPlaceholder="No fruits found">
				{#each filtered as fruit (fruit.id)}
					<ComboBox.Item
						id={fruit.id}
						textValue={fruit.name}
						class="flex cursor-default items-center justify-between gap-2 px-2 py-1 text-sm text-neutral-900 outline-none hover:bg-neutral-100 data-[focused=true]:bg-neutral-100 data-[selected=true]:font-medium dark:text-white dark:hover:bg-neutral-800 dark:data-[focused=true]:bg-neutral-800"
					>
						{fruit.name}
						<ComboBox.ItemIndicator class="text-current" />
					</ComboBox.Item>
				{/each}
			</ComboBox.List>
		</ComboBox.Popover>
	</ComboBox.Root>
</div>
