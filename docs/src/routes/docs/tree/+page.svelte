<script lang="ts">
	import { DemoSection, DemoSelect, DemoState } from '$lib/demo';
	import { Tree } from '@human-kit/svelte-components';

	type TreeNode = {
		id: string;
		title: string;
		children?: TreeNode[];
	};

	const libraryTree: TreeNode[] = [
		{
			id: 'documents',
			title: 'Documents',
			children: [
				{
					id: 'reports',
					title: 'Reports',
					children: [
						{ id: 'weekly-report', title: 'Weekly report' },
						{ id: 'budget', title: 'Budget' }
					]
				},
				{ id: 'contracts', title: 'Contracts' }
			]
		},
		{
			id: 'photos',
			title: 'Photos',
			children: [
				{ id: 'vacation', title: 'Vacation' },
				{ id: 'family', title: 'Family' }
			]
		},
		{ id: 'archive', title: 'Archive' }
	];

	const inboxTree: TreeNode[] = [
		{ id: 'today', title: 'Today' },
		{ id: 'scheduled', title: 'Scheduled' },
		{ id: 'done', title: 'Done' }
	];

	const selectionModeOptions = [
		{ value: 'none', label: 'none' },
		{ value: 'single', label: 'single' },
		{ value: 'multiple', label: 'multiple' }
	];

	const selectionBehaviorOptions = [
		{ value: 'toggle', label: 'toggle' },
		{ value: 'replace', label: 'replace' }
	];

	const disabledBehaviorOptions = [
		{ value: 'all', label: 'all' },
		{ value: 'selection', label: 'selection' }
	];

	const selectionPropagationOptions = [
		{ value: 'none', label: 'none' },
		{ value: 'descendants', label: 'descendants' }
	];

	let selectionMode = $state<'none' | 'single' | 'multiple'>('multiple');
	let selectionBehavior = $state<'toggle' | 'replace'>('toggle');
	let disabledBehavior = $state<'selection' | 'all'>('all');
	let selectionPropagation = $state<'none' | 'descendants'>('none');
	let expandedKeys = $state<Set<string | number>>(new Set(['documents', 'reports']));
	let selectedKeys = $state<Set<string | number>>(new Set(['weekly-report']));
	let manualSelectedKeys = $state<Set<string | number>>(new Set(['manual-lib']));
	let actionLog = $state<string[]>([]);

	function handleAction(id: string | number) {
		actionLog = [String(id), ...actionLog].slice(0, 5);
	}

	function collapseAll() {
		expandedKeys = new Set();
	}

	function expandAll() {
		expandedKeys = new Set(['documents', 'reports', 'photos']);
	}

	function clearSelection() {
		selectedKeys = new Set();
	}

	function selectDocuments() {
		selectedKeys = new Set(['documents']);
	}

	function selectReportsBranch() {
		selectedKeys = new Set(['reports', 'weekly-report', 'budget']);
	}

	const panelClass =
		'w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900';
	const treeHeaderClass =
		'mb-3 pl-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400';
	const treeDemoClass = 'tree-demo';
	const controlButtonClass =
		'rounded-lg border px-3 py-2 text-sm text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-blue-500/50 dark:hover:text-blue-200';
</script>

{#snippet rowContent(title: string, hasChildren: boolean)}
	{#if hasChildren}
		<Tree.Trigger
			class="inline-flex h-7 w-7 shrink-0 items-center justify-center"
			aria-label={`Toggle ${title}`}
		>
			<svg aria-hidden="true" viewBox="0 0 16 16" class="h-4 w-4">
				<path
					d="m5.5 3.75 5 4.25-5 4.25"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.75"
				/>
			</svg>
		</Tree.Trigger>
	{/if}

	<Tree.Checkbox
		aria-label={`Select ${title}`}
		class="inline-flex h-6 w-6 shrink-0 items-center justify-center"
	>
		<Tree.CheckboxIndicator>
			<svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5">
				<path
					d="M3.75 8.5 6.75 11.5 12.25 5.5"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
				/>
			</svg>
		</Tree.CheckboxIndicator>
	</Tree.Checkbox>

	<Tree.Label>{title}</Tree.Label>
{/snippet}

{#snippet renderNode(node: TreeNode)}
	{#if node.children?.length}
		<Tree.Item id={node.id} title={node.title}>
			{@render rowContent(node.title, true)}
			<Tree.Children>
				{#each node.children as child (child.id)}
					{@render renderNode(child)}
				{/each}
			</Tree.Children>
		</Tree.Item>
	{:else}
		<Tree.Item id={node.id} title={node.title}>
			{@render rowContent(node.title, false)}
		</Tree.Item>
	{/if}
{/snippet}

{#snippet emptyState()}
	<div
		class="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
	>
		No items available.
	</div>
{/snippet}
<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<div class="space-y-8">
			<div>
				<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Tree</h1>
				<p class="max-w-3xl text-gray-600 dark:text-gray-400">
					Headless hierarchical tree with branch expansion on row click, roving focus, selection
					affordances, and labeled sections.
				</p>
			</div>

			<DemoSection
				title="Interactive Playground"
				description="Drive expansion, selection, actions, and disabled behavior from one place."
			>
				<div class="w-full max-w-3xl space-y-4">
					<p class="text-sm text-gray-600 dark:text-gray-300">
						Use Space to select when selection is enabled. Click or Enter run actions when
						available, and the dedicated trigger button expands or collapses branches.
					</p>
					<div class={panelClass}>
						<Tree.Root
							aria-label="Project files"
							{selectionMode}
							{selectionBehavior}
							{disabledBehavior}
							{selectionPropagation}
							bind:expandedKeys
							bind:selectedKeys
							disabledKeys={['contracts']}
							onAction={handleAction}
							class={treeDemoClass}
						>
							<Tree.Section aria-label="Primary files">
								<Tree.Header class={treeHeaderClass}>Library</Tree.Header>
								{#each libraryTree as node (node.id)}
									{@render renderNode(node)}
								{/each}
							</Tree.Section>
						</Tree.Root>
					</div>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoSelect
							label="selectionMode"
							bind:value={selectionMode}
							options={selectionModeOptions}
						/>
						<DemoSelect
							label="selectionBehavior"
							bind:value={selectionBehavior}
							options={selectionBehaviorOptions}
						/>
						<DemoSelect
							label="disabledBehavior"
							bind:value={disabledBehavior}
							options={disabledBehaviorOptions}
						/>
						<DemoSelect
							label="selectionPropagation"
							bind:value={selectionPropagation}
							options={selectionPropagationOptions}
						/>
						<div class="grid grid-cols-1 gap-2">
							<button type="button" onclick={expandAll} class={controlButtonClass}
								>Expand all</button
							>
							<button type="button" onclick={collapseAll} class={controlButtonClass}
								>Collapse all</button
							>
							<button type="button" onclick={selectDocuments} class={controlButtonClass}
								>Select documents</button
							>
							<button type="button" onclick={selectReportsBranch} class={controlButtonClass}
								>Select reports branch</button
							>
							<button type="button" onclick={clearSelection} class={controlButtonClass}
								>Clear selection</button
							>
						</div>
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="expandedKeys" value={[...expandedKeys]} />
						<DemoState label="selectedKeys" value={[...selectedKeys]} />
						<DemoState label="actionLog" value={actionLog} />
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection
				title="Hand-written markup"
				description="Fully inlined rows with trigger, checkbox selection, and onAction (logged to the browser console). Space selects the row; Enter runs the action."
			>
				<div class="w-full max-w-3xl space-y-3">
					<p class="text-sm text-gray-600 dark:text-gray-300">
						<code class="rounded bg-gray-200 px-1 py-0.5 text-xs dark:bg-gray-800">Tree.Item</code>
						declares each node and
						<code class="rounded bg-gray-200 px-1 py-0.5 text-xs dark:bg-gray-800"
							>Tree.Children</code
						>
						marks the nested subtree explicitly. Open DevTools to see
						<code class="rounded bg-gray-200 px-1 py-0.5 text-xs dark:bg-gray-800">console.log</code
						>
						from
						<code class="rounded bg-gray-200 px-1 py-0.5 text-xs dark:bg-gray-800">onAction</code>.
					</p>
					<div class={panelClass}>
						<Tree.Root
							aria-label="Manual file tree"
							selectionMode="multiple"
							selectionPropagation="none"
							bind:selectedKeys={manualSelectedKeys}
							defaultExpandedKeys={['manual-src', 'manual-routes']}
							onAction={(id) => console.log('[Tree manual onAction]', id)}
							class={treeDemoClass}
						>
							<Tree.Item id="manual-src" title="src">
								{@render rowContent('src', true)}
								<Tree.Children>
									<Tree.Item id="manual-lib" title="lib">
										{@render rowContent('lib', false)}
									</Tree.Item>
									<Tree.Item id="manual-routes" title="routes">
										{@render rowContent('routes', true)}
										<Tree.Children>
											<Tree.Item id="manual-page" title="+page.svelte">
												{@render rowContent('+page.svelte', false)}
											</Tree.Item>
										</Tree.Children>
									</Tree.Item>
								</Tree.Children>
							</Tree.Item>
						</Tree.Root>
					</div>
				</div>
			</DemoSection>

			<DemoSection
				title="Dynamic Collection"
				description="Recursive rendering from `items` data using the same Tree parts."
			>
				<div class={panelClass}>
					<Tree.Root
						aria-label="Dynamic project files"
						items={libraryTree}
						children={renderNode}
						defaultExpandedKeys={['documents', 'reports']}
						selectionMode="multiple"
						selectionPropagation="descendants"
						class={treeDemoClass}
					/>
				</div>
			</DemoSection>

			<DemoSection
				title="Sections And Headers"
				description="Multiple labeled sections with independent top-level roots."
			>
				<div class="grid gap-6 lg:grid-cols-2">
					<div class={panelClass}>
						<Tree.Root
							aria-label="Workspace tree"
							defaultExpandedKeys={['documents']}
							class={treeDemoClass}
						>
							<Tree.Section aria-label="Files section">
								<Tree.Header class={treeHeaderClass}>Files</Tree.Header>
								{#each libraryTree as node (node.id)}
									{@render renderNode(node)}
								{/each}
							</Tree.Section>
							<Tree.Section aria-label="Inbox section">
								<Tree.Header class={`${treeHeaderClass} mt-4`}>Inbox</Tree.Header>
								{#each inboxTree as node (node.id)}
									{@render renderNode(node)}
								{/each}
							</Tree.Section>
						</Tree.Root>
					</div>

					<div class={panelClass}>
						<Tree.Root
							aria-label="Unsectioned tree"
							defaultExpandedKeys={['photos']}
							class={treeDemoClass}
						>
							{#each libraryTree as node (node.id)}
								{@render renderNode(node)}
							{/each}
						</Tree.Root>
					</div>
				</div>
			</DemoSection>

			<DemoSection
				title="Selection States"
				description="Compare flat selection, descendant propagation, disabled items, and no-selection mode."
			>
				<div class="grid gap-6 xl:grid-cols-3">
					<div class={panelClass}>
						<h2 class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
							Flat selection
						</h2>
						<Tree.Root
							aria-label="Flat selection tree"
							selectionMode="multiple"
							selectionPropagation="none"
							defaultExpandedKeys={['documents']}
							defaultSelectedKeys={['documents']}
							class={treeDemoClass}
						>
							{#each libraryTree as node (node.id)}
								{@render renderNode(node)}
							{/each}
						</Tree.Root>
					</div>

					<div class={panelClass}>
						<h2 class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
							Descendant propagation
						</h2>
						<Tree.Root
							aria-label="Descendant selection tree"
							selectionMode="multiple"
							selectionPropagation="descendants"
							defaultExpandedKeys={['documents']}
							defaultSelectedKeys={['documents']}
							class={treeDemoClass}
						>
							{#each libraryTree as node (node.id)}
								{@render renderNode(node)}
							{/each}
						</Tree.Root>
					</div>

					<div class={panelClass}>
						<h2 class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
							Disabled and readonly
						</h2>
						<Tree.Root
							aria-label="Disabled tree"
							selectionMode="multiple"
							disabledBehavior="selection"
							disabledKeys={['contracts', 'photos']}
							defaultExpandedKeys={['documents', 'photos']}
							class={treeDemoClass}
						>
							{#each libraryTree as node (node.id)}
								{@render renderNode(node)}
							{/each}
						</Tree.Root>
					</div>
				</div>
			</DemoSection>

			<DemoSection
				title="Single And Action Modes"
				description="Single selection, replace behavior, and action handling without checkbox-style propagation."
			>
				<div class="grid gap-6 lg:grid-cols-2">
					<div class={panelClass}>
						<Tree.Root
							aria-label="Single selection tree"
							selectionMode="single"
							selectionBehavior="replace"
							defaultExpandedKeys={['photos']}
							defaultSelectedKeys={['vacation']}
							class={treeDemoClass}
						>
							{#each libraryTree as node (node.id)}
								{@render renderNode(node)}
							{/each}
						</Tree.Root>
					</div>

					<div class={panelClass}>
						<Tree.Root
							aria-label="Action-only tree"
							selectionMode="none"
							defaultExpandedKeys={['documents']}
							onAction={handleAction}
							class={treeDemoClass}
						>
							{#each libraryTree as node (node.id)}
								{@render renderNode(node)}
							{/each}
						</Tree.Root>
					</div>
				</div>
			</DemoSection>

			<DemoSection
				title="Empty State"
				description="Use `renderEmptyState` to render empty collection feedback."
			>
				<div class={panelClass}>
					<Tree.Root aria-label="Empty tree" renderEmptyState={emptyState} class={treeDemoClass} />
				</div>
			</DemoSection>

			<DemoSection
				title="Keyboard Support"
				description="Core keyboard behaviors expected from the tree."
			>
				<div
					class="grid grid-cols-2 gap-4 text-sm text-slate-700 dark:text-gray-300 md:grid-cols-4"
				>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-gray-700">↑ / ↓</kbd><span
							>Move visible focus</span
						>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-gray-700">← / →</kbd><span
							>Collapse, expand, parent, child</span
						>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-gray-700">Space</kbd><span
							>Select when selection is enabled</span
						>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-gray-700">Enter</kbd><span
							>Action, selection, or expansion by mode</span
						>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-gray-700">Home / End</kbd
						><span>Jump to first / last visible item</span>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-gray-700">Typeahead</kbd
						><span>Move by text value</span>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-gray-700">Ctrl/Cmd + A</kbd
						><span>Select all in multiple mode</span>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-gray-700">Tab</kbd><span
							>Enter tree and delegate focus</span
						>
					</div>
				</div>
			</DemoSection>
		</div>
	</div>
</div>

<style>
	:global(.tree-demo) {
		--tree-indent-size: 1rem;
		display: grid;
		gap: 0.45rem;
		width: 100%;
	}

	:global(.tree-demo [role='group']) {
		display: grid;
		gap: 0.45rem;
		margin-top: 0.45rem;
		width: 100%;
	}

	:global(.tree-demo [role='treeitem']) {
		outline: none;
		width: 100%;
	}

	:global(.tree-demo [data-tree-item]) {
		display: grid;
		grid-template-columns: auto auto minmax(0, 1fr);
		align-items: center;
		gap: 0.65rem;
		width: 100%;
		border-radius: 0.9rem;
		border: 1px solid rgb(229 231 235);
		background: rgb(255 255 255);
		padding-block: 0.65rem;
		padding-inline-end: 0.85rem;
		font-size: 0.95rem;
		font-weight: 500;
		line-height: 1.35;
		color: rgb(55 65 81);
		transition:
			transform 120ms ease,
			background-color 120ms ease,
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	:global(.tree-demo [data-tree-item]:not([data-has-child-items])) {
		grid-template-columns: auto minmax(0, 1fr);
	}

	:global(.tree-demo [data-tree-item]:hover) {
		border-color: rgb(96 165 250);
		background: rgb(239 246 255);
	}

	:global(.tree-demo [data-tree-item][data-focused]) {
		border-color: rgb(156 163 175);
	}

	:global(.tree-demo [data-tree-item][data-focus-visible]) {
		border-color: rgb(59 130 246);
		box-shadow:
			0 0 0 3px rgba(59, 130, 246, 0.22),
			inset 0 0 0 1px rgba(59, 130, 246, 0.18);
	}

	:global(.tree-demo [data-tree-item][data-selected]) {
		border-color: rgb(147 197 253);
		background: rgb(239 246 255);
		color: rgb(30 64 175);
	}

	:global(.tree-demo [data-tree-item][data-pressed]) {
		transform: scale(0.995);
	}

	:global(.tree-demo [data-tree-item][data-disabled]) {
		opacity: 0.5;
	}

	:global(.tree-demo [data-tree-trigger]) {
		display: inline-flex;
		height: 1.75rem;
		width: 1.75rem;
		align-items: center;
		justify-content: center;
		border-radius: 0.6rem;
		border: 1px solid rgb(209 213 219);
		background: rgb(255 255 255);
		color: rgb(107 114 128);
		transition:
			transform 120ms ease,
			border-color 120ms ease,
			color 120ms ease,
			background-color 120ms ease;
	}

	:global(.tree-demo [data-tree-trigger] svg) {
		transition: transform 120ms ease;
	}

	:global(.tree-demo [data-tree-trigger][data-expanded='true'] svg) {
		transform: rotate(90deg);
	}

	:global(.tree-demo [data-tree-item]:hover [data-tree-trigger]),
	:global(.tree-demo [data-tree-item][data-focus-visible] [data-tree-trigger]) {
		border-color: rgb(96 165 250);
		color: rgb(37 99 235);
	}

	:global(.tree-demo [data-tree-trigger]:focus-visible) {
		outline: 2px solid rgb(59 130 246);
		outline-offset: 2px;
		border-color: rgb(96 165 250);
		color: rgb(37 99 235);
	}

	:global(.tree-demo [data-tree-checkbox='true']) {
		display: inline-flex;
		height: 1.5rem;
		width: 1.5rem;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		border: 1px solid rgb(209 213 219);
		background: rgb(255 255 255);
		color: rgb(17 24 39);
		box-shadow: 0 1px 2px rgba(17, 24, 39, 0.08);
	}

	:global(.tree-demo [data-tree-checkbox-indicator]) {
		display: inline-flex;
		height: 0.875rem;
		width: 0.875rem;
		align-items: center;
		justify-content: center;
	}

	:global(.tree-demo [data-tree-checkbox='true'][data-checked='true']) {
		border-color: rgb(37 99 235);
		background: rgb(37 99 235);
		color: rgb(255 255 255);
	}

	:global(.tree-demo [data-tree-checkbox='true'][data-indeterminate='true']) {
		border-color: rgb(245 158 11);
		background: rgb(245 158 11);
		color: rgb(255 255 255);
	}

	:global(.tree-demo [data-tree-item][data-selected] [data-tree-checkbox='true']) {
		border-color: rgb(37 99 235);
	}

	:global(.tree-demo [data-tree-checkbox='true'][data-disabled='true']) {
		border-color: rgb(229 231 235);
		background: rgb(243 244 246);
		color: rgb(156 163 175);
		box-shadow: none;
	}

	:global(.tree-demo [data-tree-checkbox='true'][data-focus-visible='true']) {
		outline: 2px solid rgb(59 130 246);
		outline-offset: 2px;
		border-color: rgb(96 165 250);
	}

	:global(.tree-demo [data-tree-checkbox='true'][data-indeterminate='true'] svg path) {
		d: path('M3.5 8h9');
	}

	:global(.tree-demo [data-tree-label]) {
		min-width: 0;
		overflow-wrap: anywhere;
	}
</style>
