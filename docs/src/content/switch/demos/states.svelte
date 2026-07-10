<script lang="ts">
	import { Switch } from '@human-kit/ui';

	const examples = [
		{ label: 'Off', checked: false, disabled: false, readonly: false },
		{ label: 'On', checked: true, disabled: false, readonly: false },
		{ label: 'Disabled', checked: true, disabled: true, readonly: false },
		{ label: 'ReadOnly', checked: true, disabled: false, readonly: true }
	];
</script>

<div class="flex flex-wrap items-center gap-6">
	{#each examples as example (example.label)}
		<div class="flex flex-col items-center gap-2">
			<Switch.Root
				checked={example.checked}
				disabled={example.disabled}
				readonly={example.readonly}
				aria-label={example.label}
				class="group inline-flex h-7 w-12 rounded-full border border-neutral-300 bg-neutral-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[readonly=true]:border-teal-500 data-[readonly=true]:bg-teal-100 dark:border-neutral-600 dark:bg-neutral-800 dark:data-[checked=true]:bg-blue-500 dark:data-[readonly=true]:bg-teal-950"
			>
				<Switch.Thumb
					class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-neutral-100"
				/>
			</Switch.Root>
			<span class="text-xs text-neutral-500 dark:text-neutral-400">{example.label}</span>
		</div>
	{/each}
</div>
