<script lang="ts">
	import { Popover } from '../index';
	import type { PopoverOpenChangeDetails } from './context';

	type Props = {
		open?: boolean;
		defaultOpen?: boolean;
		controlledOpen?: boolean;
		nonModal?: boolean;
		shouldCloseOnInteractOutside?: boolean;
		shouldCloseOnEscape?: boolean;
		onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
	};

	let {
		open,
		defaultOpen = false,
		controlledOpen = false,
		nonModal = false,
		shouldCloseOnInteractOutside = true,
		shouldCloseOnEscape = true,
		onOpenChange
	}: Props = $props();
</script>

<Popover.Root {open} {defaultOpen} {controlledOpen} {onOpenChange}>
	<Popover.Trigger>Open Popover</Popover.Trigger>

	<Popover.Content
		class="popover-content"
		{nonModal}
		{shouldCloseOnInteractOutside}
		{shouldCloseOnEscape}
	>
		<div class="popover-body">
			<h3>Popover Title</h3>
			<p>Popover content goes here.</p>
			<button type="button" class="close-btn">Close</button>
		</div>
	</Popover.Content>
</Popover.Root>
