<script lang="ts">
	import { Select } from '@human-kit/ui';

	const fruits = [
		{ id: 'apple', label: 'Apple' },
		{ id: 'banana', label: 'Banana' },
		{ id: 'cherry', label: 'Cherry' },
		{ id: 'grape', label: 'Grape' },
		{ id: 'kiwi', label: 'Kiwi' },
		{ id: 'mango', label: 'Mango' },
		{ id: 'orange', label: 'Orange' },
		{ id: 'peach', label: 'Peach' }
	];

	let value = $state<string | number | null>('cherry');

	// `outline-none` sets `--tw-outline-style: none`, and the width utilities read the style
	// back out of that variable — so a focus ring has to say `outline-solid` as well.
	const triggerClass =
		'flex h-8 w-full items-center justify-between gap-2 border border-neutral-300 bg-white px-2 text-sm text-neutral-900 outline-none transition-colors data-[placeholder=true]:text-neutral-400 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:data-[placeholder=true]:text-neutral-500 dark:data-[focus-visible=true]:outline-white';
	const itemClass =
		'flex cursor-default items-center justify-between px-2 py-1 text-sm text-neutral-900 outline-none data-[disabled=true]:opacity-50 data-[focused=true]:bg-neutral-100 data-[selected=true]:font-medium dark:text-white dark:data-[focused=true]:bg-neutral-800';
</script>

<div class="flex w-full max-w-xs flex-col gap-1">
	<Select.Root bind:value name="fruit" items={fruits}>
		<Select.Label class="text-sm font-medium text-neutral-900 dark:text-white">Fruit</Select.Label>
		<Select.Trigger class={triggerClass}>
			{#snippet children({ open })}
				<Select.Value class="truncate" />
				<span class="text-neutral-500 transition-transform" class:rotate-180={open}>▾</span>
			{/snippet}
		</Select.Trigger>
		<Select.Popover
			class="mt-1 w-(--trigger-width) border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			<Select.List class="max-h-60 overflow-auto outline-none">
				{#each fruits as fruit (fruit.id)}
					<Select.Item id={fruit.id} class={itemClass}>
						{fruit.label}
						<Select.ItemIndicator class="text-neutral-900 dark:text-white" />
					</Select.Item>
				{/each}
			</Select.List>
		</Select.Popover>
	</Select.Root>
</div>
