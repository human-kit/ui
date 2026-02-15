<script lang="ts">
	import { Popover } from '../index';
	import type { PopoverOpenChangeDetails } from '../root/context';

	let open = $state(true);
	let triggerRef = $state<HTMLElement | null>(null);

	function handleOpenChange(nextOpen: boolean, details: PopoverOpenChangeDetails) {
		if (!nextOpen) {
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
