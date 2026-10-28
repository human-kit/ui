<script lang="ts">
	import { Popover } from '../index';

	let triggerRef = $state<HTMLElement | null>(null);
	let anchorRef = $state<HTMLElement | null>(null);
</script>

<!-- A field 40px tall with a small button centred in it, as a picker draws one. -->
<div
	bind:this={anchorRef}
	data-testid="anchor"
	style="position: relative; width: 240px; height: 40px; margin-top: 20px"
>
	<button
		bind:this={triggerRef}
		type="button"
		style="position: absolute; right: 4px; top: 11px; width: 18px; height: 18px"
		aria-label="Open"
	></button>
</div>

<Popover.Content open {triggerRef} {anchorRef} placement="bottom-end" offset={4} nonModal>
	<div style="width: 120px; height: 60px">Panel</div>
</Popover.Content>
