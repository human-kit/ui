<script lang="ts">
	import { DemoTextAreaShowcase } from '$lib/demo';
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-6xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">TextArea</h1>
		<p class="mb-8 max-w-3xl text-gray-600 dark:text-gray-400">
			Focus-aware native textarea primitive with RAC-style disabled, read-only, invalid, and
			required state props. Auto-resize is opt-in and can be bounded with minimum and maximum rows.
		</p>

		<DemoTextAreaShowcase />
	</div>
</div>
