<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Checkbox } from '@human-kit/ui';

	let checked = $state(true);
</script>

<label class="flex items-center gap-3">
	<Checkbox.Root
		bind:checked
		aria-label="Accept terms"
		class="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm outline-none transition-all hover:border-blue-400 data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
	>
		<Checkbox.Indicator class="contents">
			<CheckIcon class="h-3.5 w-3.5" />
		</Checkbox.Indicator>
	</Checkbox.Root>
	<span class="text-sm font-medium text-gray-900 dark:text-white">Accept terms and conditions</span>
</label>
