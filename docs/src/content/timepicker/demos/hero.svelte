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
				class="corner-squircle flex h-8 items-center gap-1 rounded-xl border border-gray-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
			>
				<TimePicker.Input
					aria-label="Time input"
					class="flex min-w-0 flex-1 items-center gap-0.5 text-sm text-gray-900 dark:text-white"
				>
					{#snippet children(segment)}
						<TimePicker.Segment
							{segment}
							class="inline rounded px-0.5 caret-transparent outline-hidden transition-all data-disabled:cursor-not-allowed data-focused:scale-115 data-focused:ring data-focused:ring-white data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400"
						/>
					{/snippet}
				</TimePicker.Input>
				<TimePicker.Trigger
					class="corner-squircle inline-flex size-5 items-center justify-center rounded-md text-gray-500 outline-none hover:bg-gray-100 data-[focus-visible=true]:ring-1 data-[focus-visible=true]:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-600"
				>
					<ClockIcon class="size-3.5" />
				</TimePicker.Trigger>
			</div>
			<TimePicker.Popover
				placement="bottom"
				class="rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
			>
				<TimePicker.Clock class="flex gap-2">
					{#snippet column(col)}
						<TimePicker.WheelColumn type={col.type} class="h-44 w-16 rounded-md">
							{#snippet children(option)}
								<TimePicker.WheelItem
									type={col.type}
									{option}
									class="flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[selected=true]:bg-neutral-200 data-[selected=true]:font-medium data-[selected=true]:opacity-100 dark:data-[selected=true]:bg-neutral-700"
								/>
							{/snippet}
						</TimePicker.WheelColumn>
					{/snippet}
				</TimePicker.Clock>
			</TimePicker.Popover>
		</TimePicker.Root>
	</LocaleProvider>

	<p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Value: {value ?? 'null'}</p>
</div>
