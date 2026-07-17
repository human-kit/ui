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
				class="group inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border border-neutral-300 bg-neutral-200 p-0.5 outline-none transition-colors data-[checked=true]:border-neutral-900 data-[checked=true]:bg-neutral-900 data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 data-[readonly=true]:border-neutral-300 data-[readonly=true]:bg-neutral-400 dark:border-neutral-700 dark:bg-neutral-700 dark:data-[checked=true]:border-white dark:data-[checked=true]:bg-white dark:data-[focus-visible=true]:outline-white dark:data-[readonly=true]:bg-neutral-600"
			>
				<Switch.Thumb
					class="block size-3 rounded-full bg-white transition-transform group-data-[checked=true]:translate-x-3 dark:bg-neutral-900"
				/>
			</Switch.Root>
			<span class="text-xs text-neutral-500 dark:text-neutral-400">{example.label}</span>
		</div>
	{/each}
</div>
