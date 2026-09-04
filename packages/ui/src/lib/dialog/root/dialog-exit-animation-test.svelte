<script lang="ts">
	import { Dialog } from '../index';
</script>

<!--
	A dialog whose panel fades out on close. The exit animation keeps the content
	mounted past the state change, and with it the `inert` that `ariaHideOutside`
	put on the rest of the page — which is what made the focus return to the
	trigger fail silently.
-->
<Dialog.Root>
	<Dialog.Trigger>Open Dialog</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content class="exit-animation">
			<Dialog.Title>Dialog Title</Dialog.Title>
			<Dialog.Close>Dismiss</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	:global(.exit-animation) {
		opacity: 1;
		transition: opacity 0.2s linear;
	}

	:global(.exit-animation[data-exiting]) {
		opacity: 0;
	}
</style>
