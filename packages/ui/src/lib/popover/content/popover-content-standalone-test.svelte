<script lang="ts">
	import { Popover } from '../index';
	import type { PopoverOpenChangeDetails } from '../root/context';

	type Props = {
		preventClose?: boolean;
	};

	let { preventClose = true }: Props = $props();

	let open = $state(true);
	let triggerRef = $state<HTMLElement | null>(null);

	function handleOpenChange(nextOpen: boolean, details: PopoverOpenChangeDetails) {
		if (!nextOpen && preventClose) {
			details.cancel();
		}
		if (!details.isCanceled) {
			open = nextOpen;
		}
	}
</script>

<button bind:this={triggerRef} type="button">Standalone Trigger</button>

<Popover.Content {open} {triggerRef} onOpenChange={handleOpenChange}>
	<div>Standalone content</div>
</Popover.Content>
