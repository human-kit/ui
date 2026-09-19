<script lang="ts">
	import { Toast } from '../index';
	import type { ToastManager } from '../index';
	import type { SwipeSide } from '../../primitives/swipe-gesture';

	type Props = {
		timeout?: number;
		limit?: number;
		portal?: boolean;
		swipeDirection?: SwipeSide[];
		withAction?: boolean;
		keepOpen?: boolean;
		withPositioner?: boolean;
		onManager?: (manager: ToastManager) => void;
	};

	let {
		timeout,
		limit,
		portal = false,
		swipeDirection,
		withAction = false,
		keepOpen = false,
		withPositioner = false,
		onManager
	}: Props = $props();

	let anchorRef = $state<HTMLButtonElement | null>(null);

	let manager = $state<ToastManager>();

	$effect(() => {
		if (manager) onManager?.(manager);
	});
</script>

<button type="button" data-testid="before">Before</button>

<Toast.Provider {timeout} {limit} bind:manager>
	<button
		type="button"
		data-testid="add"
		onclick={() => manager?.add({ title: 'Saved', description: 'The file is on the server.' })}
	>
		Add
	</button>
	<button
		type="button"
		bind:this={anchorRef}
		data-testid="add-anchored"
		onclick={() =>
			manager?.add({ title: 'Copied', anchor: anchorRef, placement: 'bottom', offset: 4 })}
	>
		Add anchored
	</button>
	<button
		type="button"
		data-testid="add-high"
		onclick={() =>
			manager?.add({ title: 'Lost', description: 'The connection is gone.', priority: 'high' })}
	>
		Add high
	</button>
	<Toast.Viewport data-testid="viewport" {portal}>
		{#snippet children(toast)}
			{#snippet root()}
				<Toast.Root {toast} {swipeDirection} data-testid="toast-{toast.id}" style="width: 200px;">
					<Toast.Content data-testid="content">
						<Toast.Title data-testid="title" />
						<Toast.Description data-testid="description" />
					</Toast.Content>
					{#if withAction}
						<Toast.Action data-testid="action" {keepOpen}>Undo</Toast.Action>
					{/if}
					<Toast.Close data-testid="close" aria-label="Close">x</Toast.Close>
				</Toast.Root>
			{/snippet}
			{#if withPositioner}
				<Toast.Positioner {toast} data-testid="positioner-{toast.id}">
					{@render root()}
				</Toast.Positioner>
			{:else}
				{@render root()}
			{/if}
		{/snippet}
	</Toast.Viewport>
</Toast.Provider>

<button type="button" data-testid="after">After</button>
