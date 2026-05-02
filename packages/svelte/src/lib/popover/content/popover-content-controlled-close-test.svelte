<script lang="ts">
	import { Popover } from '../index';

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<button type="button">Open Popover</button>
	</Popover.Trigger>

	<Popover.Content class="popover-content presence-animation">
		<div class="popover-body">
			<h3>Popover Title</h3>
			<p>Popover content goes here.</p>
			<button type="button" class="apply-btn" onclick={() => (open = false)}>Apply</button>
		</div>
	</Popover.Content>
</Popover.Root>

<style>
	:global(.presence-animation) {
		opacity: 1;
		transition: opacity 0.2s linear;
	}

	:global(.presence-animation[data-exiting]) {
		opacity: 0;
	}
</style>
