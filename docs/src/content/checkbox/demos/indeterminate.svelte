<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import { Checkbox } from '@human-kit/ui';

	let checked = $state(false);
	let indeterminate = $state(true);

	const buttonClass =
		'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800';

	function set(nextChecked: boolean, nextIndeterminate: boolean) {
		checked = nextChecked;
		indeterminate = nextIndeterminate;
	}
</script>

<div class="flex flex-col items-center gap-4">
	<label class="flex items-center gap-3">
		<Checkbox.Root
			bind:checked
			bind:indeterminate
			aria-label="Select all rows"
			class="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm outline-none transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[indeterminate=true]:border-amber-500 data-[indeterminate=true]:bg-amber-500 data-[indeterminate=true]:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
		>
			<Checkbox.Indicator class="contents">
				{#if indeterminate}
					<MinusIcon class="h-3.5 w-3.5" />
				{:else}
					<CheckIcon class="h-3.5 w-3.5" />
				{/if}
			</Checkbox.Indicator>
		</Checkbox.Root>
		<span class="text-sm font-medium text-gray-900 dark:text-white">Select all rows</span>
	</label>

	<div class="grid grid-cols-3 gap-2">
		<button onclick={() => set(false, false)} class={buttonClass}>Unchecked</button>
		<button onclick={() => set(true, false)} class={buttonClass}>Checked</button>
		<button onclick={() => set(false, true)} class={buttonClass}>Mixed</button>
	</div>
</div>
