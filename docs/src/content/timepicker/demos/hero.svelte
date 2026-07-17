<script lang="ts">
	import { LocaleProvider } from '@human-kit/ui';
	import { TimePicker } from '@human-kit/ui/timepicker';
	import ClockIcon from '@lucide/svelte/icons/clock';

	let value = $state<string | null>(null);
</script>

<div class="w-full max-w-xs">
	<LocaleProvider locale="es-AR">
		<TimePicker.Root bind:value class="group space-y-2">
			<div
				class="corner-squircle flex h-8 items-center gap-1 rounded-md border border-neutral-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:group-data-[focus-within=true]:border-white"
			>
				<TimePicker.Input
					aria-label="Time input"
					class="flex min-w-0 flex-1 items-center gap-0.5 text-sm text-neutral-900 dark:text-white"
				>
					{#snippet children(segment)}
						<TimePicker.Segment
							{segment}
							class="inline rounded px-0.5 caret-transparent outline-hidden transition-colors data-disabled:cursor-not-allowed data-focused:bg-neutral-900 data-focused:text-white data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400 dark:data-focused:bg-white dark:data-focused:text-neutral-900"
						/>
					{/snippet}
				</TimePicker.Input>
				<TimePicker.Trigger
					class="corner-squircle inline-flex size-5 items-center justify-center rounded-md text-neutral-500 outline-none transition-colors hover:bg-neutral-100 data-[focus-visible=true]:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
				>
					<ClockIcon class="size-3.5" />
				</TimePicker.Trigger>
			</div>
			<TimePicker.Popover
				placement="bottom"
				class="rounded-lg border border-neutral-200 bg-white p-2 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
			>
				<TimePicker.Clock class="flex gap-2">
					{#snippet column(col)}
						<TimePicker.WheelColumn type={col.type} class="h-44 w-16 rounded-md">
							{#snippet children(option, selected)}
								<TimePicker.WheelItem
									type={col.type}
									{option}
									{selected}
									class="flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[selected=true]:font-medium data-[selected=true]:text-neutral-900 data-[selected=true]:opacity-100 dark:data-[selected=true]:text-white"
								/>
							{/snippet}
						</TimePicker.WheelColumn>
					{/snippet}
				</TimePicker.Clock>
			</TimePicker.Popover>
		</TimePicker.Root>
	</LocaleProvider>

	<p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Value: {value ?? 'null'}</p>
</div>
