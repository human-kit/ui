<script lang="ts">
	import { Progress } from '@human-kit/ui';
	import type { ProgressContext } from '@human-kit/ui';

	let progress = $state<ProgressContext>();
	// The ring reads the percentage from the context. The root stays the progressbar, with the
	// same name and numbers as a bar.
	const dashOffset = $derived(100 - (progress?.percent ?? 0));
</script>

<Progress.Root value={72} bind:context={progress} aria-label="Upload" class="relative size-16">
	<svg viewBox="0 0 32 32" class="size-full -rotate-90" aria-hidden="true">
		<circle
			cx="16"
			cy="16"
			r="14"
			class="fill-none stroke-neutral-200 stroke-[3] dark:stroke-neutral-800"
		/>
		<circle
			cx="16"
			cy="16"
			r="14"
			pathLength="100"
			stroke-dasharray="100"
			stroke-dashoffset={dashOffset}
			stroke-linecap="round"
			class="fill-none stroke-neutral-900 stroke-[3] transition-[stroke-dashoffset] dark:stroke-white"
		/>
	</svg>
	<Progress.Value
		class="absolute inset-0 flex items-center justify-center text-sm tabular-nums text-neutral-900 dark:text-white"
	/>
</Progress.Root>
