<script lang="ts">
	import { Select } from '@human-kit/ui';

	const toppings = [
		{ id: 'cheese', label: 'Cheese' },
		{ id: 'ham', label: 'Ham' },
		{ id: 'mushroom', label: 'Mushroom' },
		{ id: 'olive', label: 'Olive' },
		{ id: 'onion', label: 'Onion' },
		{ id: 'pepper', label: 'Pepper' }
	];

	let value = $state<(string | number)[]>(['cheese']);

	const triggerClass =
		'flex h-8 w-full items-center justify-between gap-2 border border-neutral-300 bg-white px-2 text-sm text-neutral-900 outline-none transition-colors data-[placeholder=true]:text-neutral-400 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:data-[placeholder=true]:text-neutral-500 dark:data-[focus-visible=true]:outline-white';
	const itemClass =
		'flex cursor-default items-center gap-2 px-2 py-1 text-sm text-neutral-900 outline-none data-[focused=true]:bg-neutral-100 dark:text-white dark:data-[focused=true]:bg-neutral-800';
</script>

<div class="flex w-full max-w-xs flex-col gap-1">
	<Select.Root bind:value selectionMode="multiple" items={toppings}>
		<Select.Label class="text-sm font-medium text-neutral-900 dark:text-white"
			>Toppings</Select.Label
		>
		<Select.Trigger class={triggerClass}>
			<Select.Value class="truncate">
				{#snippet children({ value, label, placeholder })}
					{placeholder ? label : `${label} (${(value as unknown[]).length})`}
				{/snippet}
			</Select.Value>
		</Select.Trigger>
		<Select.Popover
			class="mt-1 w-(--trigger-width) border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			<Select.List class="outline-none">
				{#each toppings as topping (topping.id)}
					<Select.Item id={topping.id} class={itemClass}>
						<Select.ItemIndicator forceMount class="w-4 data-[state=unchecked]:invisible" />
						{topping.label}
					</Select.Item>
				{/each}
			</Select.List>
		</Select.Popover>
	</Select.Root>
</div>
