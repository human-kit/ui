<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import { Checkbox } from '@human-kit/ui';

	// Reactive so the interactive states (Unchecked / Checked / Indeterminate) toggle
	// on click. Disabled and ReadOnly stay put on their own: the primitive ignores
	// changes in those states, so the same handlers are safe to wire everywhere.
	let examples = $state([
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
	]);
</script>

<div class="flex flex-wrap items-start justify-center gap-6">
	{#each examples as example (example.label)}
		<div class="flex flex-col items-center gap-2">
			<Checkbox.Root
				checked={example.checked}
				indeterminate={example.indeterminate}
				disabled={example.disabled}
				readonly={example.readonly}
				onCheckedChange={(next) => (example.checked = next)}
				onIndeterminateChange={(next) => (example.indeterminate = next)}
				aria-label={example.label}
				class="inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-neutral-300 bg-white text-white outline-none transition-colors data-[checked=true]:border-neutral-900 data-[checked=true]:bg-neutral-900 data-[indeterminate=true]:border-neutral-900 data-[indeterminate=true]:bg-neutral-900 data-[disabled=true]:opacity-50 data-[readonly=true]:border-neutral-300 data-[readonly=true]:bg-neutral-400 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-900 dark:data-[checked=true]:border-white dark:data-[checked=true]:bg-white dark:data-[indeterminate=true]:border-white dark:data-[indeterminate=true]:bg-white dark:data-[readonly=true]:bg-neutral-600 dark:data-[focus-visible=true]:outline-white"
			>
				<Checkbox.Indicator class="contents">
					{#if example.indeterminate}
						<MinusIcon class="size-3" />
					{:else}
						<CheckIcon class="size-3" />
					{/if}
				</Checkbox.Indicator>
			</Checkbox.Root>
			<span class="text-xs text-neutral-500 dark:text-neutral-400">{example.label}</span>
		</div>
	{/each}
</div>
