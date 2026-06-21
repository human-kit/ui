<script lang="ts">
	import { Menu } from '../index';

	// Mirrors the centralized filter menu: content hosts a focusable input and an "Apply"
	// button that closes the menu by flipping the bound `open` (no internal close handler).
	// The menu must release the focused input before it becomes `aria-hidden` on close.
	let open = $state(false);
</script>

<Menu.Root bind:open closeOnSelect={false}>
	<Menu.Trigger>Open Menu</Menu.Trigger>

	<Menu.Content class="menu-content presence-animation">
		<input data-testid="menu-input" placeholder="Type here" />
		<button type="button" class="apply-btn" onclick={() => (open = false)}>Apply</button>
	</Menu.Content>
</Menu.Root>

<style>
	:global(.presence-animation) {
		opacity: 1;
		transition: opacity 0.2s linear;
	}

	:global(.presence-animation[data-exiting]) {
		opacity: 0;
	}
</style>
