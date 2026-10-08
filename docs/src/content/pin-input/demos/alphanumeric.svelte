<script lang="ts">
	import { PinInput } from '@human-kit/ui';

	let value = $state('');
</script>

<PinInput.Root bind:value length={5} type="alphanumeric" class="flex flex-col gap-2">
	<PinInput.Label class="text-sm font-medium text-neutral-900 dark:text-white">
		Invitation code
	</PinInput.Label>
	<div class="flex items-center gap-2">
		{#each { length: 5 } as _, index (index)}
			{#if index === 2}
				<span aria-hidden="true" class="text-neutral-400 dark:text-neutral-600">–</span>
			{/if}
			<PinInput.Cell
				class="size-11 rounded-md border border-neutral-300 bg-white text-center text-lg text-neutral-900 uppercase outline-none data-[filled=true]:border-neutral-900 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-1 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:data-[filled=true]:border-white dark:data-[focus-visible=true]:outline-white"
			/>
		{/each}
	</div>
	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		The cells take the letters and the digits. Paste a code to fill each cell.
	</p>
</PinInput.Root>
