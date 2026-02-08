<script lang="ts">
	interface Props {
		label: string;
		value: string | number;
		type?: 'text' | 'number';
		placeholder?: string;
		onchange?: (value: string | number) => void;
	}

	let { label, value = $bindable(), type = 'text', placeholder, onchange }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = type === 'number' ? Number(target.value) : target.value;
		onchange?.(value);
	}
</script>

<label class="block">
	<span class="mb-1 block text-sm text-gray-700 dark:text-gray-300">{label}</span>
	<input
		{type}
		{value}
		{placeholder}
		oninput={handleInput}
		class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
	/>
</label>
