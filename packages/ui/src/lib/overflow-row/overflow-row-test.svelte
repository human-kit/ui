<script lang="ts">
	import OverflowRow from './overflow-row.svelte';

	type Item = { id: string; label: string };

	interface Props {
		items?: Item[];
		/** Width of the measured parent, in px, so tests can force overflow deterministically. */
		width?: number;
		reserve?: number;
		/** Omit the overflow snippet to exercise the "render everything" mode. */
		withOverflow?: boolean;
	}

	let {
		items = [
			{ id: 'apple', label: 'Apple' },
			{ id: 'banana', label: 'Banana' },
			{ id: 'cherry', label: 'Cherry' },
			{ id: 'date', label: 'Date' },
			{ id: 'elderberry', label: 'Elderberry' }
		],
		width = 160,
		reserve = 0,
		withOverflow = true
	}: Props = $props();
</script>

<!-- Fixed-width parent: the overflow calc measures this, not the row itself. -->
<div class="measure-box" style={`width: ${width}px`}>
	{#if withOverflow}
		<OverflowRow
			{items}
			{reserve}
			getKey={(item) => item.id}
			class="row"
			role="list"
			aria-label="Selected values"
		>
			{#snippet children({ item })}
				<!-- The id exercises the mirror's duplicate-id stripping. -->
				<span id={`tag-${item.id}`} data-tag-id={item.id} class="tag">{item.label}</span>
			{/snippet}
			{#snippet overflow({ count, visible, total })}
				{#if visible === 0}
					<span data-testid="overflow" data-summary="true">{total} selected</span>
				{:else}
					<span data-testid="overflow">+{count}</span>
				{/if}
			{/snippet}
		</OverflowRow>
	{:else}
		<OverflowRow
			{items}
			getKey={(item) => item.id}
			class="row"
			role="list"
			aria-label="Selected values"
		>
			{#snippet children({ item })}
				<span data-tag-id={item.id} class="tag">{item.label}</span>
			{/snippet}
		</OverflowRow>
	{/if}
</div>

<style>
	.measure-box {
		padding: 0;
		border: 1px solid #ccc;
	}

	/* The visible row hugs its content; tags never wrap or shrink. */
	:global(.row) {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	:global(.row [data-tag-id]) {
		flex-shrink: 0;
		white-space: nowrap;
		padding: 0 6px;
	}
</style>
