<script lang="ts">
	import { Toast } from '@human-kit/ui';
	import type { ToastManager } from '@human-kit/ui';

	let manager = $state<ToastManager>();
	let copyButton = $state<HTMLButtonElement | null>(null);

	const buttonClass =
		'border border-neutral-300 px-3 py-1 text-sm text-neutral-900 outline-none hover:bg-neutral-100 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white';
</script>

<Toast.Provider bind:manager>
	<button
		type="button"
		bind:this={copyButton}
		class={buttonClass}
		onclick={() =>
			manager?.add({
				id: 'copied',
				title: 'Link copied',
				anchor: copyButton,
				placement: 'top',
				timeout: 2000
			})}
	>
		Copy link
	</button>
	<!-- The positioner puts a toast with an anchor against it. The same id keeps one toast on a
	     second press: `add` updates it, and the timer starts again. -->
	<Toast.Viewport>
		{#snippet children(toast)}
			<Toast.Positioner {toast}>
				<Toast.Root
					{toast}
					swipeDirection={[]}
					class="anchored-toast border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 shadow-lg outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus-visible:outline-white"
				>
					<Toast.Content>
						<Toast.Title />
					</Toast.Content>
				</Toast.Root>
			</Toast.Positioner>
		{/snippet}
	</Toast.Viewport>
</Toast.Provider>

<style>
	:global(.anchored-toast) {
		transition:
			opacity 0.2s,
			transform 0.2s;
	}

	:global(.anchored-toast[data-entering]),
	:global(.anchored-toast[data-exiting]) {
		opacity: 0;
		transform: translateY(4px);
	}
</style>
