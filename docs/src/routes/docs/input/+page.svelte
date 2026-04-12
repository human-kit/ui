<script lang="ts">
	import { DemoInputShowcase } from '$lib/demo';
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-6xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Input</h1>
		<p class="mb-8 max-w-3xl text-gray-600 dark:text-gray-400">
			Focus-aware native input primitive with RAC-style disabled, read-only, invalid, and required
			state props. The component is intentionally unstyled; the examples below style it via its data
			attributes.
		</p>

		<DemoInputShowcase />
	</div>
</div>
