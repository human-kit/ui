<script lang="ts">
	import ComboBox from '../index.js';

	interface Props {
		items?: { id: string; name: string }[];
		value?: (string | number)[];
		/** Width of the measured parent, in px, so tests can force overflow deterministically. */
		width?: number;
	}

	let {
		items = [
			{ id: 'apple', name: 'Apple' },
			{ id: 'banana', name: 'Banana' },
			{ id: 'cherry', name: 'Cherry' },
			{ id: 'date', name: 'Date' },
			{ id: 'elderberry', name: 'Elderberry' }
		],
		value = $bindable([]),
		width = 160
	}: Props = $props();
</script>

<ComboBox.Root bind:value selectionMode="multiple" trigger="press" closeOnSelect={false}>
	<!-- Fixed-width parent: the overflow calc measures this, not the row itself. -->
	<div class="measure-box" style={`width: ${width}px`}>
		<ComboBox.Tags class="tags-row">
			{#snippet children({ item })}
				<ComboBox.Tag>
					{item.label}
					<ComboBox.TagRemove />
				</ComboBox.Tag>
			{/snippet}
			{#snippet overflow({ count, visible, total })}
				{#if visible === 0}
					<span data-testid="overflow" data-summary="true">{total} selected</span>
				{:else}
					<span data-testid="overflow">+{count}</span>
				{/if}
			{/snippet}
		</ComboBox.Tags>
	</div>
	<ComboBox.Input placeholder="Search fruits..." />
	<ComboBox.Trigger>▼</ComboBox.Trigger>

	<ComboBox.Popover>
		<ComboBox.List>
			{#each items as item (item.id)}
				<ComboBox.Item id={item.id} textValue={item.name}>
					{item.name}
					<ComboBox.ItemIndicator />
				</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>

<style>
	.measure-box {
		padding: 0;
		border: 1px solid #ccc;
	}

	/* The visible row hugs its content; tags never wrap or shrink. The library is
	   headless (ships no default font-size), so the fixture pins one — as a real
	   consumer would — to keep the overflow measurement deterministic. */
	:global(.tags-row) {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.875rem;
	}

	/* Fixed tag width so the overflow math is deterministic regardless of font
	   rendering (the headless library no longer ships a default tag size). */
	:global(.tags-row [data-tag-id]) {
		box-sizing: border-box;
		flex-shrink: 0;
		width: 40px;
		white-space: nowrap;
		overflow: hidden;
		padding: 0 6px;
	}
</style>
