<script lang="ts">
	interface Props {
		label: string;
		checked: boolean;
		onchange?: (checked: boolean) => void;
	}

	let { label, checked = $bindable(), onchange }: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		checked = target.checked;
		onchange?.(checked);
	}
</script>

<label class="flex cursor-pointer items-center gap-3">
	<input
		type="checkbox"
		{checked}
		onchange={handleChange}
		class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
	/>
	<span class="text-sm text-gray-700 dark:text-gray-300">{label}</span>
</label>
