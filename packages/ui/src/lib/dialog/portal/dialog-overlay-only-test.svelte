<script lang="ts">
	import { Dialog } from '../index';
</script>

<!-- Portal with only an Overlay (no Dialog.Content): there is no motion target,
     so the portal must resolve its exit phase immediately on close. -->
<Dialog.Root>
	{#snippet children({ close })}
		<Dialog.Trigger>Open Dialog</Dialog.Trigger>
		<button type="button" class="close-overlay-btn" onclick={() => close()}>Close Overlay</button>

		<Dialog.Portal>
			<Dialog.Overlay data-testid="overlay-only" />
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
