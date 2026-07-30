<script lang="ts">
	import { Clock } from '@human-kit/ui';

	let value = $state<string | null>('14:30');
</script>

<!-- Column wrapper so the caption sits BELOW the wheel: the demo stage centers its
     children in a row, so a bare sibling <p> would land beside the clock instead. -->
<div class="flex flex-col items-center gap-3">
	<Clock.Root
		bind:value
		granularity="minute"
		hourCycle={24}
		aria-label="Time"
		class="flex gap-2 border border-neutral-200 bg-white p-2 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
	>
		{#snippet column(col)}
			<Clock.WheelColumn type={col.type} class="z-20 h-44 w-16">
				{#snippet children(option, selected)}
					<Clock.WheelItem
						type={col.type}
						{option}
						{selected}
						class="relative z-30 flex min-h-8 items-center justify-center px-2 text-sm opacity-50 transition-opacity data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[selected=true]:font-medium data-[selected=true]:text-neutral-900 data-[selected=true]:opacity-100 dark:data-[selected=true]:text-white"
					/>
				{/snippet}
			</Clock.WheelColumn>
		{/snippet}
		<!-- The Axis draws the centre slot; the selected item (passed `selected` from the
		     column snippet) renders at full foreground on top of it. -->
		<Clock.Axis
			class="z-10 h-8 bg-neutral-100 ring-1 ring-neutral-300 ring-inset dark:bg-neutral-800 dark:ring-neutral-600"
		/>
	</Clock.Root>

	<p class="text-sm text-neutral-500 dark:text-neutral-400">Value: {value ?? 'null'}</p>
</div>
