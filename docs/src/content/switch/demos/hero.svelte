<script lang="ts">
	import { Switch } from '@human-kit/ui';

	let checked = $state(true);
</script>

<label class="flex items-center gap-3">
	<Switch.Root
		bind:checked
		aria-label="Enable notifications"
		class="group inline-flex h-7 w-12 rounded-full border border-gray-300 bg-gray-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:data-[checked=true]:bg-blue-500"
	>
		<Switch.Thumb
			class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-gray-100"
		/>
	</Switch.Root>
	<span class="text-sm font-medium text-gray-900 dark:text-white">Enable notifications</span>
</label>
