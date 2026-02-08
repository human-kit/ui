<script lang="ts">
	interface Props {
		label: string;
		value: string;
		options: { value: string; label: string }[];
		onchange?: (value: string) => void;
	}

	let { label, value = $bindable(), options, onchange }: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		value = target.value;
		onchange?.(value);
	}
</script>

<label class="block">
	<span class="mb-1 block text-sm text-gray-700 dark:text-gray-300">{label}</span>
	<select
		{value}
		onchange={handleChange}
		class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
	>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</label>
