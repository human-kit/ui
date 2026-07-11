<script lang="ts">
	import { Accordion } from '@human-kit/svelte-components';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	const sections = [
		{
			value: 'shipping',
			label: 'Shipping & delivery',
			body: 'Orders ship within two business days. Tracking details are emailed as soon as the carrier scans your package.'
		},
		{
			value: 'returns',
			label: 'Returns & refunds',
			body: 'Unused items can be returned within 30 days. Refunds land on the original payment method within a week.'
		},
		{
			value: 'warranty',
			label: 'Warranty',
			body: 'Every product is covered by a one-year limited warranty against manufacturing defects.'
		}
	];
</script>

<Accordion.Root
	defaultValue={['shipping']}
	class="w-full max-w-md divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:divide-neutral-700 dark:border-neutral-700 dark:bg-neutral-900"
>
	{#each sections as section (section.value)}
		<Accordion.Item value={section.value}>
			<Accordion.Header>
				<Accordion.Trigger
					class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-neutral-900 outline-none transition-colors hover:bg-neutral-50 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-focus-visible:ring-inset dark:text-white dark:hover:bg-neutral-800"
				>
					{section.label}
					<ChevronDown
						class="size-4 shrink-0 text-neutral-500 transition-transform duration-200 group-data-open:rotate-180"
					/>
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Panel class="px-4 pb-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
				{section.body}
			</Accordion.Panel>
		</Accordion.Item>
	{/each}
</Accordion.Root>
