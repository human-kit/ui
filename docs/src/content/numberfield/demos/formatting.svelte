<script lang="ts">
	import { LocaleProvider, NumberField } from '@human-kit/ui';

	let amount = $state<number | null>(1234.5);

	const groupClass =
		'inline-flex h-10 items-stretch overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-colors data-[focus-within=true]:border-blue-500 dark:border-gray-700 dark:bg-gray-900';
	const inputClass =
		'w-36 border-0 bg-transparent px-3 text-center text-sm tabular-nums text-gray-900 outline-none dark:text-white';
	const buttonClass =
		'flex w-10 items-center justify-center border-gray-200 text-gray-600 outline-none transition-colors hover:bg-gray-100 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800';
</script>

<div class="flex flex-col items-center gap-3">
	<LocaleProvider locale="en-US">
		<NumberField.Root
			bind:value={amount}
			min={0}
			step={0.01}
			formatOptions={{ style: 'currency', currency: 'USD' }}
			class="space-y-2"
		>
			<NumberField.Group class={groupClass}>
				<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
				<NumberField.Input aria-label="Amount" class={inputClass} />
				<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
			</NumberField.Group>
		</NumberField.Root>
	</LocaleProvider>

	<p class="text-xs text-gray-500 dark:text-gray-400">
		raw value: {amount === null ? 'null' : amount}
	</p>
</div>
