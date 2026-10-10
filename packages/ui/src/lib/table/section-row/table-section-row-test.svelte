<script lang="ts">
	import { Table } from '../index';
	import type {
		TableKeyboardNavigation,
		TableSelectionKey,
		TableSelectionMode
	} from '../root/context.svelte';
	import type { TableBodyVirtualizer } from '../types.js';

	type GroupItem = { id: string; kind: 'group'; label: string; count: number };
	type UserItem = { id: string; kind: 'user'; email: string; group: string };
	type ListItem = GroupItem | UserItem;

	const defaultItems: ListItem[] = [
		{ id: 'group-developer', kind: 'group', label: 'Developer', count: 2 },
		{ id: 'danilo', kind: 'user', email: 'danilo@example.com', group: 'Developer' },
		{ id: 'jasper', kind: 'user', email: 'jasper@example.com', group: 'Developer' },
		{ id: 'group-admin', kind: 'group', label: 'Admin', count: 1 },
		{ id: 'zahra', kind: 'user', email: 'zahra@example.com', group: 'Admin' }
	];

	type SectionRowTestProps = {
		items?: ListItem[];
		selectionMode?: TableSelectionMode;
		keyboardNavigation?: TableKeyboardNavigation;
		hiddenColumns?: string[];
		declareSections?: boolean;
		virtualizer?: TableBodyVirtualizer;
		onRowAction?: (id: TableSelectionKey) => void;
		onSectionAction?: (id: string) => void;
	};

	let {
		items = defaultItems,
		selectionMode = 'multiple',
		keyboardNavigation = 'grid',
		hiddenColumns,
		declareSections = false,
		virtualizer,
		onRowAction,
		onSectionAction
	}: SectionRowTestProps = $props();

	let selectedKeys = $state<Set<TableSelectionKey>>(new Set());
	let collapsed = $state<Set<string>>(new Set());

	function toggleGroup(id: string) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- replaced whole, never mutated after assignment.
		const next = new Set(collapsed);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		collapsed = next;
		onSectionAction?.(id);
	}

	const isSectionItem = (item: ListItem) => item.kind === 'group';
	const checkboxStyle = 'display:inline-flex;height:20px;width:20px;border:1px solid currentColor;';
</script>

<div style={virtualizer ? 'max-height:200px;overflow:auto;' : undefined}>
	<Table.Root
		aria-label="Grouped users"
		{selectionMode}
		{keyboardNavigation}
		{hiddenColumns}
		{onRowAction}
		bind:selectedKeys
	>
		<Table.Header>
			<Table.Row>
				<Table.Column id="selection" textValue="Selection">
					<Table.ColumnHeaderCell>
						<Table.Checkbox style={checkboxStyle} data-testid="header-checkbox" />
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="email" rowHeader textValue="Email">
					<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="group" textValue="Group">
					<Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
				</Table.Column>
			</Table.Row>
		</Table.Header>

		<Table.Body {items} {virtualizer} isSectionItem={declareSections ? isSectionItem : undefined}>
			{#snippet children(item)}
				{#if item.kind === 'group'}
					<Table.SectionRow
						id={item.id}
						aria-expanded={!collapsed.has(item.id)}
						data-testid={`section-${item.id}`}
						style={virtualizer?.sectionRowHeight
							? `height:${virtualizer.sectionRowHeight}px;`
							: undefined}
						onAction={() => toggleGroup(item.id)}
					>
						<span>{item.label}</span>
						<span>{item.count}</span>
					</Table.SectionRow>
				{:else}
					<Table.Row
						id={item.id}
						data-testid={`row-${item.id}`}
						style={virtualizer ? `height:${virtualizer.rowHeight}px;` : undefined}
					>
						<Table.Cell>
							<Table.Checkbox style={checkboxStyle} data-testid={`row-checkbox-${item.id}`} />
						</Table.Cell>
						<Table.Cell data-testid={`email-cell-${item.id}`}>{item.email}</Table.Cell>
						<Table.Cell>{item.group}</Table.Cell>
					</Table.Row>
				{/if}
			{/snippet}
		</Table.Body>
	</Table.Root>
</div>

<output data-testid="selected-keys">{JSON.stringify([...selectedKeys])}</output>
<output data-testid="collapsed">{JSON.stringify([...collapsed])}</output>
