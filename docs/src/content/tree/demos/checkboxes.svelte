<script lang="ts">
	import { Tree } from '@human-kit/svelte-components';
	import Check from '@lucide/svelte/icons/check';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Minus from '@lucide/svelte/icons/minus';

	let selectedKeys = $state<Set<string | number>>(new Set(['weekly']));

	const itemClass =
		'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-neutral-100 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-selected:text-blue-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-selected:text-blue-200';
	const checkboxClass =
		'group inline-flex size-5 shrink-0 items-center justify-center rounded border border-neutral-300 bg-white text-white transition-colors data-checked:border-blue-600 data-checked:bg-blue-600 data-indeterminate:border-blue-600 data-indeterminate:bg-blue-600 dark:border-neutral-600 dark:bg-neutral-900';
</script>

{#snippet checkbox(title: string)}
	<Tree.Checkbox aria-label={`Select ${title}`} class={checkboxClass}>
		<Tree.CheckboxIndicator>
			<Check class="size-3.5 group-data-indeterminate:hidden" />
			<Minus class="size-3.5 group-data-checked:hidden" />
		</Tree.CheckboxIndicator>
	</Tree.Checkbox>
{/snippet}

<div class="w-full max-w-sm space-y-3">
	<Tree.Root
		aria-label="Report files"
		selectionMode="multiple"
		selectionPropagation="descendants"
		bind:selectedKeys
		defaultExpandedKeys={['reports']}
		class="space-y-1"
	>
		<Tree.Item id="reports" title="Reports" class={itemClass}>
			<Tree.Trigger
				aria-label="Toggle Reports"
				class="group inline-flex size-6 shrink-0 items-center justify-center rounded text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400"
			>
				<ChevronRight class="size-4 transition-transform group-data-expanded:rotate-90" />
			</Tree.Trigger>
			{@render checkbox('Reports')}
			<Tree.Label>Reports</Tree.Label>
			<Tree.Children class="mt-1 space-y-1">
				<Tree.Item id="weekly" title="Weekly report" class={itemClass}>
					{@render checkbox('Weekly report')}
					<Tree.Label>Weekly report</Tree.Label>
				</Tree.Item>
				<Tree.Item id="budget" title="Budget" class={itemClass}>
					{@render checkbox('Budget')}
					<Tree.Label>Budget</Tree.Label>
				</Tree.Item>
			</Tree.Children>
		</Tree.Item>
	</Tree.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">
		selected: {[...selectedKeys].join(', ') || 'none'}
	</p>
</div>
