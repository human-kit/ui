<script lang="ts">
	import { Dialog } from '../index';

	// `bind:open` seeded with `false` — the shape that used to be misread as "controlled"
	// and left the dialog impossible to dismiss. The rendered state text lets a test assert
	// that a close travels back out to the consumer's own variable, not just to the DOM.
	let open = $state(false);
</script>

<button type="button" onclick={() => (open = true)}>Open Dialog</button>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content class="dialog-content">
			<h3>Dialog Title</h3>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<p data-testid="bound-state">{open ? 'open' : 'closed'}</p>
