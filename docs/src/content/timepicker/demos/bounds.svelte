<script lang="ts">
	import { TimePicker } from '@human-kit/ui/timepicker';
	import ClockIcon from '@lucide/svelte/icons/clock';

	let value = $state<string | null>('09:30');
	const minValue = '09:00';
	const maxValue = '17:00';
</script>

<div class="w-full max-w-xs">
	<TimePicker.Root bind:value {minValue} {maxValue} class="group space-y-2">
		<div
			class="flex h-8 items-center gap-1 border border-neutral-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:group-data-[focus-within=true]:border-white"
		>
			<TimePicker.Input
				aria-label="Bounded time input"
				class="flex min-w-0 flex-1 items-center gap-0.5 text-sm text-neutral-900 dark:text-white"
			>
				{#snippet children(segment)}
					<TimePicker.Segment
						{segment}
						class="inline px-0.5 caret-transparent outline-hidden transition-colors data-disabled:cursor-not-allowed data-focused:bg-neutral-900 data-focused:text-white data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400 dark:data-focused:bg-white dark:data-focused:text-neutral-900"
					/>
				{/snippet}
			</TimePicker.Input>
			<TimePicker.Trigger
				class="inline-flex size-5 items-center justify-center text-neutral-500 outline-none transition-colors hover:bg-neutral-100 data-[focus-visible=true]:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
			>
				<ClockIcon class="size-3.5" />
			</TimePicker.Trigger>
		</div>
		<TimePicker.Popover
			placement="bottom"
			class="mt-1 border border-neutral-200 bg-white p-2 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			<TimePicker.Clock class="flex gap-2">
				{#snippet column(col)}
					<TimePicker.WheelColumn type={col.type} class="h-44 w-16">
						{#snippet children(option, selected)}
							<TimePicker.WheelItem
								type={col.type}
								{option}
								{selected}
								class="flex min-h-8 items-center justify-center px-2 text-sm opacity-50 transition-opacity data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[selected=true]:font-medium data-[selected=true]:text-neutral-900 data-[selected=true]:opacity-100 dark:data-[selected=true]:text-white"
							/>
						{/snippet}
					</TimePicker.WheelColumn>
				{/snippet}
			</TimePicker.Clock>
		</TimePicker.Popover>
	</TimePicker.Root>

	<p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
		Time constrained between {minValue} and {maxValue} — value: {value ?? 'null'}
	</p>
</div>
