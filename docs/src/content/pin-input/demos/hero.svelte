<script lang="ts">
	import { PinInput } from '@human-kit/ui';

	let value = $state('');
</script>

<PinInput.Root bind:value length={6} otp class="flex flex-col gap-2">
	<PinInput.Label class="text-sm font-medium text-neutral-900 dark:text-white">
		Verification code
	</PinInput.Label>
	<div class="flex gap-2">
		{#each { length: 6 } as _, index (index)}
			<PinInput.Cell
				class="size-11 rounded-md border border-neutral-300 bg-white text-center text-lg text-neutral-900 caret-neutral-900 outline-none data-[focus-visible=true]:border-neutral-900 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-1 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:caret-white dark:data-[focus-visible=true]:border-white dark:data-[focus-visible=true]:outline-white"
			/>
		{/each}
	</div>
	<p class="text-sm text-neutral-600 dark:text-neutral-400">Code: {value || '—'}</p>
</PinInput.Root>
