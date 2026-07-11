<script lang="ts">
	import { Clock, LocaleProvider } from '@human-kit/svelte-components';

	let value = $state<string | null>('14:45');
</script>

<LocaleProvider locale="en-US">
	<Clock.Root
		bind:value
		hourCycle={12}
		aria-label="Time"
		class="flex gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
	>
		{#snippet column(col)}
			<Clock.WheelColumn type={col.type} class="h-44 w-16 rounded-md">
				{#snippet children(option)}
					<Clock.WheelItem
						type={col.type}
						{option}
						class="flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[selected=true]:bg-neutral-200 data-[selected=true]:font-medium data-[selected=true]:opacity-100 dark:data-[selected=true]:bg-neutral-700"
					/>
				{/snippet}
			</Clock.WheelColumn>
		{/snippet}
	</Clock.Root>
</LocaleProvider>

<p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
	Emitted value stays 24-hour: {value ?? 'null'}
</p>
