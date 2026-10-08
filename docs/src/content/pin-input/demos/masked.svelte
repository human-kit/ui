<script lang="ts">
	import { PinInput } from '@human-kit/ui';

	let unlocked = $state(false);
	let wrong = $state(false);

	function check(code: string) {
		unlocked = code === '2468';
		wrong = !unlocked;
	}
</script>

<PinInput.Root
	length={4}
	mask
	placeholder="•"
	invalid={wrong}
	onChange={() => {
		wrong = false;
		unlocked = false;
	}}
	onComplete={check}
	class="flex flex-col gap-2"
>
	<PinInput.Label class="text-sm font-medium text-neutral-900 dark:text-white">PIN</PinInput.Label>
	<div class="flex gap-2">
		{#each { length: 4 } as _, index (index)}
			<PinInput.Cell
				class="size-11 rounded-md border border-neutral-300 bg-white text-center text-lg text-neutral-900 outline-none data-[invalid=true]:border-red-500 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-1 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:data-[focus-visible=true]:outline-white"
			/>
		{/each}
	</div>
	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		{#if unlocked}
			The PIN is correct.
		{:else if wrong}
			The PIN is not correct. Try 2468.
		{:else}
			Write the four digits of your PIN.
		{/if}
	</p>
</PinInput.Root>
