<script lang="ts">
	import { Popover } from '../index';

	// `bind:open` seeded with `false` — the shape that used to be misread as "controlled",
	// which made the popover never open at all: the trigger reported the change and the
	// component then refused to write it back.
	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>Open Popover</Popover.Trigger>
	<Popover.Content class="popover-content">
		<h3>Popover Title</h3>
	</Popover.Content>
</Popover.Root>

<p data-testid="bound-state">{open ? 'open' : 'closed'}</p>
