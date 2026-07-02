<script lang="ts">
	import { Menu } from '../index';

	type Props = {
		closeOnSelect?: boolean;
		onAction?: (value: string) => void;
		withSubmenu?: boolean;
		loop?: boolean;
		typeahead?: boolean;
	};

	let {
		closeOnSelect = true,
		onAction,
		withSubmenu = false,
		loop = true,
		typeahead = true
	}: Props = $props();
</script>

<Menu.Root {closeOnSelect} {loop} {typeahead}>
	<Menu.Trigger>Open Menu</Menu.Trigger>
	<Menu.Content>
		<Menu.Item value="edit" onAction={() => onAction?.('edit')}>Edit</Menu.Item>
		<Menu.Item value="duplicate" disabled onAction={() => onAction?.('duplicate')}>
			Duplicate
		</Menu.Item>
		<Menu.Separator />
		<Menu.Group>
			<Menu.GroupLabel>Share</Menu.GroupLabel>
			<Menu.Item value="copy-link" onAction={() => onAction?.('copy-link')}>Copy link</Menu.Item>
		</Menu.Group>

		{#if withSubmenu}
			<Menu.SubmenuRoot>
				<Menu.SubmenuTrigger value="more">More actions</Menu.SubmenuTrigger>
				<Menu.Content>
					<Menu.Item value="archive" onAction={() => onAction?.('archive')}>Archive</Menu.Item>
					<Menu.Item value="rename" onAction={() => onAction?.('rename')}>Rename</Menu.Item>
				</Menu.Content>
			</Menu.SubmenuRoot>
		{/if}

		<Menu.Item value="delete" onAction={() => onAction?.('delete')}>Delete</Menu.Item>
	</Menu.Content>
</Menu.Root>
