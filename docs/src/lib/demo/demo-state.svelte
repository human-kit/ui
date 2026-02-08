<script lang="ts">
	interface Props {
		label: string;
		value: unknown;
	}

	let { label, value }: Props = $props();
</script>

<div class="rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800">
	<span class="text-xs text-gray-500 dark:text-gray-400">{label}</span>
	<div class="mt-1 font-mono text-sm text-gray-900 dark:text-white">
		{JSON.stringify(value)}
	</div>
</div>
