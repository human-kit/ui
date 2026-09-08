<script lang="ts">
	import { RadioGroup } from '@human-kit/ui';

	const sizes = [
		{ value: 'small', label: 'Small' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'large', label: 'Large' }
	];

	let value = $state('medium');

	// `outline-none` sets `--tw-outline-style: none` on the element, and the width utilities
	// read the style back out of that variable — so a focus ring has to say `outline-solid`
	// as well, or it is applied with no style and never paints.
	const dotClass =
		'touch-target inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white outline-none transition-colors data-[checked=true]:border-neutral-900 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:data-[checked=true]:border-white dark:data-[focus-visible=true]:outline-white';
	const labelClass = 'cursor-pointer text-sm text-neutral-900 select-none dark:text-white';
	const groupLabelClass = 'text-sm font-medium text-neutral-900 dark:text-white';
</script>

<RadioGroup.Root
	bind:value
	name="size"
	class="flex flex-col gap-2 data-[orientation=horizontal]:flex-row"
>
	<RadioGroup.Label class={groupLabelClass}>Size</RadioGroup.Label>

	{#each sizes as size (size.value)}
		<div class="flex items-center gap-2">
			<RadioGroup.Item id="size-{size.value}" value={size.value} class={dotClass}>
				<RadioGroup.Indicator class="contents">
					<span class="size-2 rounded-full bg-neutral-900 dark:bg-white"></span>
				</RadioGroup.Indicator>
			</RadioGroup.Item>
			<label for="size-{size.value}" class={labelClass}>{size.label}</label>
		</div>
	{/each}
</RadioGroup.Root>
