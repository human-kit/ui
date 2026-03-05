<script lang="ts">
	import { DemoClock } from '$lib/demo';
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Clock</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			Standalone wheel-based time picker. Can be used independently or composed inside TimePicker.
		</p>

		<div class="space-y-8">
			<DemoClock />
		</div>
	</div>
</div>
