<script lang="ts">
	import { Popover } from '../index';

	type Props = {
		open?: boolean;
		defaultOpen?: boolean;
		overlayClass?: string;
	};

	let { open, defaultOpen = false, overlayClass = '' }: Props = $props();
</script>

<Popover.Root {open} {defaultOpen}>
	<Popover.Trigger>Open Popover</Popover.Trigger>

	<Popover.Overlay class={`popover-overlay ${overlayClass}`.trim()} />

	<Popover.Content class="popover-content">
		<div class="popover-body">
			<h3>Popover Title</h3>
			<p>Popover content goes here.</p>
		</div>
	</Popover.Content>
</Popover.Root>

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
