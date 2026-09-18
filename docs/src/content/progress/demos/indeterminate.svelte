<script lang="ts">
	import { Progress } from '@human-kit/ui';
</script>

<Progress.Root value={null} class="flex w-64 flex-col gap-1.5">
	<Progress.Label class="text-sm text-neutral-900 dark:text-white">Connecting</Progress.Label>
	<Progress.Track class="h-2 w-full bg-neutral-200 dark:bg-neutral-800">
		<Progress.Indicator class="slide absolute inset-y-0 w-1/3 bg-neutral-900 dark:bg-white" />
	</Progress.Track>
</Progress.Root>

<style>
	/* The indicator has no size while the progress is indeterminate: the CSS moves it. */
	:global(.slide) {
		animation: slide 1.4s ease-in-out infinite;
	}

	@keyframes slide {
		from {
			inset-inline-start: -33%;
		}
		to {
			inset-inline-start: 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.slide) {
			animation-duration: 3s;
		}
	}
</style>
