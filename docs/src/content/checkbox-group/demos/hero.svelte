<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import { Checkbox, CheckboxGroup } from '@human-kit/ui';
	import type { CheckboxGroupContext } from '@human-kit/ui';

	const colors = [
		{ value: 'red', label: 'Red' },
		{ value: 'green', label: 'Green' },
		{ value: 'blue', label: 'Blue' }
	];

	let value = $state(['red']);
	// The parent checkbox commands the group, so it stays outside it. Inside, it would
	// register as one more value of the group.
	let group = $state<CheckboxGroupContext>();

	// `outline-none` sets `--tw-outline-style: none` on the element, and the width utilities
	// read the style back out of that variable — so a focus ring has to say `outline-solid`
	// as well, or it is applied with no style and never paints.
	const boxClass =
		'touch-target inline-flex size-4 shrink-0 items-center justify-center border border-neutral-300 bg-white text-white outline-none transition-colors data-[checked=true]:border-neutral-900 data-[checked=true]:bg-neutral-900 data-[indeterminate=true]:border-neutral-900 data-[indeterminate=true]:bg-neutral-900 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-900 dark:data-[checked=true]:border-white dark:data-[checked=true]:bg-white dark:data-[indeterminate=true]:border-white dark:data-[indeterminate=true]:bg-white dark:data-[focus-visible=true]:outline-white';
	const labelClass = 'cursor-pointer text-sm text-neutral-900 select-none dark:text-white';
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center gap-2">
		<Checkbox.Root
			id="colors-all"
			checked={Boolean(group?.allSelected)}
			indeterminate={Boolean(group?.someSelected)}
			controlledChecked
			controlledIndeterminate
			onCheckedChange={(checked) => (checked ? group?.selectAll() : group?.clearAll())}
			class={boxClass}
		>
			<Checkbox.Indicator class="contents">
				{#if group?.someSelected}
					<MinusIcon class="size-3" />
				{:else}
					<CheckIcon class="size-3" />
				{/if}
			</Checkbox.Indicator>
		</Checkbox.Root>
		<label for="colors-all" class={labelClass}>All colors</label>
	</div>

	<CheckboxGroup.Root
		bind:value
		bind:context={group}
		name="colors"
		aria-label="Colors"
		class="flex flex-col gap-2 border-l border-neutral-200 pl-4 data-[orientation=horizontal]:flex-row dark:border-neutral-800"
	>
		{#each colors as color (color.value)}
			<div class="flex items-center gap-2">
				<CheckboxGroup.Item id="color-{color.value}" value={color.value} class={boxClass}>
					<CheckboxGroup.Indicator class="contents">
						<CheckIcon class="size-3" />
					</CheckboxGroup.Indicator>
				</CheckboxGroup.Item>
				<label for="color-{color.value}" class={labelClass}>{color.label}</label>
			</div>
		{/each}
	</CheckboxGroup.Root>
</div>
