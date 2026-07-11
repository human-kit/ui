<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import { Checkbox } from '@human-kit/svelte-components';

	const examples = [
		{ label: 'Unchecked', checked: false, indeterminate: false, disabled: false, readonly: false },
		{ label: 'Checked', checked: true, indeterminate: false, disabled: false, readonly: false },
		{
			label: 'Indeterminate',
			checked: false,
			indeterminate: true,
			disabled: false,
			readonly: false
		},
		{ label: 'Disabled', checked: true, indeterminate: false, disabled: true, readonly: false },
		{ label: 'ReadOnly', checked: true, indeterminate: false, disabled: false, readonly: true }
	];
</script>

<div class="flex flex-wrap items-start justify-center gap-6">
	{#each examples as example (example.label)}
		<div class="flex flex-col items-center gap-2">
			<Checkbox.Root
				checked={example.checked}
				indeterminate={example.indeterminate}
				disabled={example.disabled}
				readonly={example.readonly}
				aria-label={example.label}
				class="inline-flex h-6 w-6 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-900 shadow-sm data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[indeterminate=true]:border-amber-500 data-[indeterminate=true]:bg-amber-500 data-[indeterminate=true]:text-white data-[readonly=true]:border-teal-500 data-[readonly=true]:bg-teal-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:data-[readonly=true]:bg-teal-950/40"
			>
				<Checkbox.Indicator class="contents">
					{#if example.indeterminate}
						<MinusIcon class="h-3.5 w-3.5" />
					{:else}
						<CheckIcon class="h-3.5 w-3.5" />
					{/if}
				</Checkbox.Indicator>
			</Checkbox.Root>
			<span class="text-xs text-neutral-500 dark:text-neutral-400">{example.label}</span>
		</div>
	{/each}
</div>
