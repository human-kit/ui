<script lang="ts">
	import { Accordion, type AccordionValue } from '@human-kit/ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	const sections = [
		{ value: 'account', label: 'Account', body: 'Profile, password, and login sessions.' },
		{ value: 'billing', label: 'Billing', body: 'Payment methods, invoices, and tax details.' },
		{
			value: 'team',
			label: 'Team',
			body: 'Members, roles, and pending invitations.',
			disabled: true
		}
	];

	let value = $state<AccordionValue[]>(['account', 'billing']);
</script>

<Accordion.Root
	bind:value
	selectionMode="multiple"
	class="w-full max-w-md divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900"
>
	{#each sections as section (section.value)}
		<Accordion.Item
			value={section.value}
			disabled={section.disabled}
			class="data-disabled:opacity-50"
		>
			<Accordion.Header>
				<Accordion.Trigger
					class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-gray-900 outline-none transition-colors hover:bg-gray-50 data-disabled:cursor-not-allowed data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-focus-visible:ring-inset dark:text-white dark:hover:bg-gray-800"
				>
					{section.label}
					<ChevronDown
						class="size-4 shrink-0 text-gray-500 transition-transform duration-200 group-data-open:rotate-180"
					/>
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Panel class="px-4 pb-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
				{section.body}
			</Accordion.Panel>
		</Accordion.Item>
	{/each}
</Accordion.Root>
