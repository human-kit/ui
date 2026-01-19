<script lang="ts">
	import { Popover } from '../index';

	type Props = {
		open?: boolean;
		defaultOpen?: boolean;
		isNonModal?: boolean;
		shouldCloseOnInteractOutside?: boolean;
		shouldCloseOnEscape?: boolean;
		shouldCloseOnBlur?: boolean;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		open,
		defaultOpen = false,
		isNonModal = false,
		shouldCloseOnInteractOutside = true,
		shouldCloseOnEscape = true,
		shouldCloseOnBlur,
		onOpenChange
	}: Props = $props();
</script>

<Popover.Root {open} {defaultOpen} {onOpenChange}>
	<Popover.Trigger>
		<button type="button">Open Popover</button>
	</Popover.Trigger>

	<Popover.Content
		class="popover-content"
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
