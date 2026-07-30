<script lang="ts">
	import { Accordion } from '@human-kit/ui';
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

	// Uncontrolled with a default: a bound `value` with a defined array makes the
	// primitive controlled and freezes the triggers (it never writes back).
	// `defaultValue` seeds the open panels while the accordion owns its state.
</script>

<Accordion.Root
	defaultValue={['account', 'billing']}
	selectionMode="multiple"
	class="w-full max-w-md divide-y divide-neutral-200 overflow-hidden border border-neutral-200 bg-white [&_h3]:m-0 dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900"
>
	{#each sections as section (section.value)}
		<Accordion.Item
			value={section.value}
			disabled={section.disabled}
			class="data-disabled:opacity-50"
		>
			<Accordion.Header>
				<Accordion.Trigger
					class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-neutral-900 outline-none transition-colors hover:bg-neutral-50 data-disabled:cursor-not-allowed data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:data-focus-visible:outline-white"
				>
					{section.label}
					<ChevronDown
						class="size-4 shrink-0 text-neutral-500 transition-transform duration-200 group-data-open:rotate-180"
					/>
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Panel
				class="border-t border-neutral-200 px-4 py-3 text-sm leading-6 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
			>
				{section.body}
			</Accordion.Panel>
		</Accordion.Item>
	{/each}
</Accordion.Root>
