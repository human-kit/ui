<script lang="ts">
	import { Menu } from '../index';

	type Props = {
		open?: boolean;
		defaultOpen?: boolean;
		overlayClass?: string;
	};

	let { open, defaultOpen = false, overlayClass = '' }: Props = $props();
</script>

<Menu.Root {open} {defaultOpen}>
	<Menu.Trigger>Open Menu</Menu.Trigger>

	<Menu.Overlay class={`menu-overlay ${overlayClass}`.trim()} />

	<Menu.Content class="menu-content">
		<Menu.Item>First</Menu.Item>
		<Menu.Item>Second</Menu.Item>
	</Menu.Content>
</Menu.Root>

<style>
	:global(.presence-overlay) {
		opacity: 1;
		transition: opacity 0.2s linear;
	}

	:global(.presence-overlay[data-entering]) {
		animation: overlay-enter 0.2s linear;
	}

	:global(.presence-overlay[data-exiting]) {
		opacity: 0;
	}

	@keyframes overlay-enter {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}
</style>
