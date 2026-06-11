<script lang="ts">
	import { Menu } from '../index';
	import { Popover } from '../../popover';

	// Exercises a Menu whose content hosts interactive, non-menuitem widgets (an editable
	// input, panels that swap on click, and a nested popover/dialog). These must keep their
	// native keyboard behaviour and not close the menu when focus moves transiently to
	// <body> (panel swap) or into a portalled top layer (the nested popover).
	let showSecondPanel = $state(false);
	let inputValue = $state('');
</script>

<Menu.Root>
	<Menu.Trigger>Open Menu</Menu.Trigger>
	<Menu.Content>
		{#if showSecondPanel}
			<div data-testid="second-panel">
				<button type="button" onclick={() => (showSecondPanel = false)}>Back</button>
			</div>
		{:else}
			<input data-testid="menu-input" placeholder="Type here" bind:value={inputValue} />
			<button type="button" data-testid="go-second" onclick={() => (showSecondPanel = true)}>
				Go to panel
			</button>

			<Popover.Root>
				<Popover.Trigger>Open nested</Popover.Trigger>
				<Popover.Content>
					<input data-testid="nested-input" placeholder="Nested" />
				</Popover.Content>
			</Popover.Root>
		{/if}
	</Menu.Content>
</Menu.Root>
