<script lang="ts">
	import { Progress } from '@human-kit/ui';
</script>

<Progress.Root
	value={512}
	max={2048}
	format={{ style: 'unit', unit: 'megabyte' }}
	getValueText={(formattedValue) => `${formattedValue} of 2,048 MB`}
	class="flex w-64 flex-col gap-1.5"
>
	<div class="flex items-baseline justify-between text-sm text-neutral-900 dark:text-white">
		<Progress.Label>Download</Progress.Label>
		<Progress.Value class="tabular-nums text-neutral-500 dark:text-neutral-400">
			{#snippet children({ formattedValue })}
				{formattedValue} / 2,048 MB
			{/snippet}
		</Progress.Value>
	</div>
	<Progress.Track class="h-2 w-full bg-neutral-200 dark:bg-neutral-800">
		<Progress.Indicator class="bg-neutral-900 dark:bg-white" />
	</Progress.Track>
</Progress.Root>
