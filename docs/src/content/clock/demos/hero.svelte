<script lang="ts">
	import { Clock } from '@human-kit/ui';

	let value = $state<string | null>('14:30');
</script>

<Clock.Root
	bind:value
	granularity="minute"
	hourCycle={24}
	aria-label="Time"
	class="flex gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
>
	{#snippet column(col)}
		<Clock.WheelColumn type={col.type} class="z-20 h-44 w-16 rounded-md">
			{#snippet children(option)}
				<Clock.WheelItem
					type={col.type}
					{option}
					class="relative z-30 flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[selected=true]:bg-neutral-200 data-[selected=true]:font-medium data-[selected=true]:opacity-100 dark:data-[selected=true]:bg-neutral-700"
				/>
			{/snippet}
		</Clock.WheelColumn>
	{/snippet}
	<Clock.Axis
		class="z-10 h-6 bg-neutral-100 ring-neutral-300/80 dark:bg-neutral-700/35 dark:ring-neutral-600"
	/>
</Clock.Root>

<p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Value: {value ?? 'null'}</p>
