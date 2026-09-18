<script lang="ts">
	import { Toast } from '@human-kit/ui';
	import type { ToastManager } from '@human-kit/ui';
	import Viewport from './viewport.svelte';

	let manager = $state<ToastManager>();
	let count = 0;

	const buttonClass =
		'border border-neutral-300 px-3 py-1 text-sm text-neutral-900 outline-none hover:bg-neutral-100 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white';
</script>

<!-- The viewport is a component of its own, thus each demo on this page shares its styles. -->
<Toast.Provider bind:manager>
	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			class={buttonClass}
			onclick={() => {
				count += 1;
				manager?.add({ title: `File ${count} saved`, description: 'The copy is on the server.' });
			}}
		>
			Add a toast
		</button>
		<button
			type="button"
			class={buttonClass}
			onclick={() =>
				manager?.add({
					title: 'Connection lost',
					description: 'The changes stay on this device until it is back.',
					priority: 'high',
					type: 'error'
				})}
		>
			Add a high priority toast
		</button>
	</div>
	<Viewport />
</Toast.Provider>
