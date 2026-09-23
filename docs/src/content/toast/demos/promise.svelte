<script lang="ts">
	import { Toast } from '@human-kit/ui';
	import type { ToastManager } from '@human-kit/ui';
	import Viewport from './viewport.svelte';

	let manager = $state<ToastManager>();

	// A fake upload that fails one time in three, thus the demo shows both ends.
	function upload() {
		const task = new Promise<string>((resolve, reject) => {
			setTimeout(() => {
				if (Math.random() > 0.3) resolve('photo.png');
				else reject(new Error('Timeout'));
			}, 1500);
		});
		manager
			?.promise(task, {
				loading: 'Uploading photo.png',
				success: (name) => `${name} is on the server`,
				error: (error) => `The upload failed: ${(error as Error).message}`
			})
			.catch(() => {});
	}
</script>

<Toast.Provider bind:manager>
	<button
		type="button"
		onclick={upload}
		class="border border-neutral-300 px-3 py-1 text-sm text-neutral-900 outline-none hover:bg-neutral-100 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
	>
		Upload
	</button>
	<Viewport />
</Toast.Provider>
