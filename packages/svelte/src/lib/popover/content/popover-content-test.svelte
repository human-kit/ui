<script lang="ts">
	import { Popover } from '../index';
	import type { PopoverOpenChangeDetails } from '../root/context';

	type Props = {
		open?: boolean;
		defaultOpen?: boolean;
		isNonModal?: boolean;
		shouldCloseOnInteractOutside?: boolean;
		shouldCloseOnEscape?: boolean;
		shouldCloseOnBlur?: boolean;
		class?: string;
		onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
	};

	let {
		open,
		defaultOpen = false,
		isNonModal = false,
		shouldCloseOnInteractOutside = true,
		shouldCloseOnEscape = true,
		shouldCloseOnBlur,
		class: className = '',
		onOpenChange
	}: Props = $props();
</script>

<Popover.Root {open} {defaultOpen} {onOpenChange}>
	<Popover.Trigger>
		<button type="button">Open Popover</button>
	</Popover.Trigger>

	<Popover.Content
		class={`popover-content ${className}`.trim()}
		{isNonModal}
		{shouldCloseOnInteractOutside}
		{shouldCloseOnEscape}
		{shouldCloseOnBlur}
	>
		<div class="popover-body">
			<h3>Popover Title</h3>
			<p>Popover content goes here.</p>
			<button type="button" class="close-btn">Close</button>
		</div>
	</Popover.Content>
</Popover.Root>

<style>
	:global(.presence-animation) {
		opacity: 1;
		transition: opacity 0.2s linear;
	}

	:global(.presence-animation[data-entering]) {
		animation: popover-enter 0.2s linear;
	}

	:global(.presence-animation[data-exiting]) {
		opacity: 0;
	}

	@keyframes popover-enter {
		from {
			opacity: 0;
			transform: scale(0.96);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
