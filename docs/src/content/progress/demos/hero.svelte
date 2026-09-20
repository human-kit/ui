<script lang="ts">
	import { Progress } from '@human-kit/ui';

	let value = $state(31);

	// A fake export that moves the bar, so the demo shows the states.
	function start() {
		value = 0;
		const timer = setInterval(() => {
			value = Math.min(100, value + 7);
			if (value >= 100) clearInterval(timer);
		}, 300);
	}
</script>

<div class="flex w-64 flex-col gap-3">
	<Progress.Root {value} class="flex flex-col gap-1.5">
		<div class="flex items-baseline justify-between text-sm text-neutral-900 dark:text-white">
			<Progress.Label>Export data</Progress.Label>
			<Progress.Value class="tabular-nums text-neutral-500 dark:text-neutral-400" />
		</div>
		<Progress.Track class="h-2 w-full bg-neutral-200 dark:bg-neutral-800">
			<Progress.Indicator
				class="bg-neutral-900 transition-[width] duration-300 data-[complete=true]:bg-green-600 dark:bg-white dark:data-[complete=true]:bg-green-400"
			/>
		</Progress.Track>
	</Progress.Root>

	<button
		type="button"
		onclick={start}
		class="self-start border border-neutral-300 px-3 py-1 text-sm text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
	>
		Start
	</button>
</div>
