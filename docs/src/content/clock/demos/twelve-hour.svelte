<script lang="ts">
	import { Clock, LocaleProvider } from '@human-kit/ui';

	let value = $state<string | null>('14:45');
</script>

<div class="flex flex-col items-center gap-3">
	<LocaleProvider locale="en-US">
		<Clock.Root
			bind:value
			hourCycle={12}
			aria-label="Time"
			class="flex gap-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			{#snippet column(col)}
				<Clock.WheelColumn type={col.type} class="h-44 w-16 rounded-md">
					{#snippet children(option, selected)}
						<Clock.WheelItem
							type={col.type}
							{option}
							{selected}
							class="flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[selected=true]:font-medium data-[selected=true]:text-neutral-900 data-[selected=true]:opacity-100 dark:data-[selected=true]:text-white"
						/>
					{/snippet}
				</Clock.WheelColumn>
			{/snippet}
		</Clock.Root>
	</LocaleProvider>

	<p class="text-sm text-neutral-500 dark:text-neutral-400">
		Emitted value stays 24-hour: {value ?? 'null'}
	</p>
</div>
