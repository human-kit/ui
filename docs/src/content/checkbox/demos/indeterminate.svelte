<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import { Checkbox } from '@human-kit/ui';

	let checked = $state(false);
	let indeterminate = $state(true);

	const buttonClass =
		'inline-flex h-8 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white';

	function set(nextChecked: boolean, nextIndeterminate: boolean) {
		checked = nextChecked;
		indeterminate = nextIndeterminate;
	}
</script>

<div class="flex flex-col items-center gap-4">
	<div class="flex items-center gap-2">
		<Checkbox.Root
			id="select-all"
			{checked}
			{indeterminate}
			onCheckedChange={(next) => (checked = next)}
			onIndeterminateChange={(next) => (indeterminate = next)}
			class="inline-flex size-4 shrink-0 items-center justify-center border border-neutral-300 bg-white text-white outline-none transition-colors data-[checked=true]:border-neutral-900 data-[checked=true]:bg-neutral-900 data-[indeterminate=true]:border-neutral-900 data-[indeterminate=true]:bg-neutral-900 data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-900 dark:data-[checked=true]:border-white dark:data-[checked=true]:bg-white dark:data-[indeterminate=true]:border-white dark:data-[indeterminate=true]:bg-white dark:data-[focus-visible=true]:outline-white"
		>
			<Checkbox.Indicator class="contents">
				{#if indeterminate}
					<MinusIcon class="size-3" />
				{:else}
					<CheckIcon class="size-3" />
				{/if}
			</Checkbox.Indicator>
		</Checkbox.Root>
		<label
			for="select-all"
			class="cursor-pointer text-sm text-neutral-900 select-none dark:text-white"
			>Select all rows</label
		>
	</div>

	<div class="grid grid-cols-3 gap-2">
		<button onclick={() => set(false, false)} class={buttonClass}>Unchecked</button>
		<button onclick={() => set(true, false)} class={buttonClass}>Checked</button>
		<button onclick={() => set(false, true)} class={buttonClass}>Mixed</button>
	</div>
</div>
