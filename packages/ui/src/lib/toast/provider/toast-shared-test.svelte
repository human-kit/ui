<script lang="ts">
	import { Toast } from '../index';
	import ToastHookTest from './toast-hook-test.svelte';
	import type { ToastManager } from '../index';

	let manager = $state<ToastManager>();
</script>

<Toast.Provider bind:manager>
	<ToastHookTest />
	<Toast.Viewport data-testid="viewport">
		{#snippet children(toast)}
			<Toast.Root {toast}>
				<Toast.Content>
					<Toast.Title />
				</Toast.Content>
			</Toast.Root>
		{/snippet}
	</Toast.Viewport>
</Toast.Provider>

{#if manager}
	<!-- A second provider with the same manager: a dialog that shows the toasts of the app. -->
	<Toast.Provider {manager}>
		<ToastHookTest />
	</Toast.Provider>
{/if}
