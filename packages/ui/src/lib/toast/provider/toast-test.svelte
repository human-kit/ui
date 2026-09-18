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
		onManager?: (manager: ToastManager) => void;
	};

	let {
		timeout,
		limit,
		portal = false,
		swipeDirection,
		withAction = false,
		keepOpen = false,
		onManager
	}: Props = $props();

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
		data-testid="add-high"
		onclick={() =>
			manager?.add({ title: 'Lost', description: 'The connection is gone.', priority: 'high' })}
	>
		Add high
	</button>
	<Toast.Viewport data-testid="viewport" {portal}>
		{#snippet children(toast)}
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
	</Toast.Viewport>
</Toast.Provider>

<button type="button" data-testid="after">After</button>
