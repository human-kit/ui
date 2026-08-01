<script lang="ts">
	import ComboBox from '../index';

	type Props = {
		/** How many options the list holds. Big enough that rendering them all would show. */
		count?: number;
		overscan?: number;
		/** Constrain the scroller only after opening, the way a popover does. */
		constrainLate?: boolean;
	};

	let { count = 500, overscan = 2, constrainLate = false }: Props = $props();

	// Reproduces what a popover does: the scroller gets its max height *after* it opens, so
	// on the first pass the list is as tall as its own content.
	let lateConstraintApplied = $state(false);
	const constrained = $derived(!constrainLate || lateConstraintApplied);

	$effect(() => {
		if (constrainLate) {
			setTimeout(() => (lateConstraintApplied = true), 50);
		}
	});

	const items = $derived(
		Array.from({ length: count }, (_, index) => ({
			id: index,
			name: `Opción ${String(index).padStart(4, '0')}`
		}))
	);

	let value = $state<string | number | null>(null);
</script>

<!-- The listbox is the scroller and every row is the same height, which is what the
	virtualizer assumes. -->
<ComboBox.Root {items} bind:value trigger="focus">
	<ComboBox.Input aria-label="Opciones" />
	<ComboBox.Popover>
		<ComboBox.List
			virtualizer={{ overscan }}
			class="virtual-list {constrained ? 'virtual-list-constrained' : ''}"
		>
			{#snippet children(item: { id: number; name: string })}
				<ComboBox.Item id={item.id} textValue={item.name}>
					{item.name}
				</ComboBox.Item>
			{/snippet}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>

<style>
	:global(.virtual-list) {
		display: flex;
		flex-direction: column;
		gap: 2px;
		overflow-y: auto;
	}

	:global(.virtual-list-constrained) {
		max-height: 200px;
	}

	:global(.virtual-list [role='option']) {
		height: 30px;
		box-sizing: border-box;
		flex-shrink: 0;
	}
</style>
