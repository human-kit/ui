<script lang="ts">
	import { Select } from '../index';

	type Props = {
		required?: boolean;
		selectionMode?: 'single' | 'multiple';
		defaultValue?: string | string[] | null;
	};

	let { required = false, selectionMode = 'single', defaultValue = null }: Props = $props();

	let submitted = $state<string>('');
	let submitCount = $state(0);
	let invalidCount = $state(0);

	const items = [
		{ id: 'apple', label: 'Apple' },
		{ id: 'banana', label: 'Banana' },
		{ id: 'cherry', label: 'Cherry' }
	];

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitCount += 1;
		const data = new FormData(event.currentTarget as HTMLFormElement);
		submitted = JSON.stringify(data.getAll('fruit'));
	}
</script>

<form onsubmit={handleSubmit} oninvalidcapture={() => (invalidCount += 1)}>
	<Select.Root name="fruit" {required} {selectionMode} {defaultValue} {items}>
		<Select.Label>Fruit</Select.Label>
		<Select.Trigger>
			<Select.Value />
		</Select.Trigger>
		<Select.Popover>
			<Select.List>
				{#each items as item (item.id)}
					<Select.Item id={item.id}>{item.label}</Select.Item>
				{/each}
			</Select.List>
		</Select.Popover>
	</Select.Root>
	<button type="submit" data-testid="submit">Submit</button>
</form>

<p data-testid="submitted">{submitted}</p>
<p data-testid="submit-count">{submitCount}</p>
<p data-testid="invalid-count">{invalidCount}</p>
