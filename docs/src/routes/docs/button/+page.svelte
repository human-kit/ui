<script lang="ts">
	import { DemoButtonShowcase } from '$lib/demo';
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-6xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Button</h1>
		<p class="mb-8 max-w-3xl text-gray-600 dark:text-gray-400">
			Headless native button with modality-aware focus attributes, pressed-state exposure, and
			RAC-style pending semantics that preserve focus while blocking activation.
		</p>

		<DemoButtonShowcase />
	</div>
</div>
