<script lang="ts">
	import { Dialog } from '../index';
</script>

<!--
	A panel that leaves with a keyframe animation and no fill mode, as tw-animate-css's
	`animate-out` does: once the animation ends, the panel paints whole again, so it has to leave
	the DOM on the end event and not later.
-->
<Dialog.Root>
	<Dialog.Trigger>Open Dialog</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content class="keyframes-exit">
			<Dialog.Title>Dialog Title</Dialog.Title>
			<Dialog.Close>Dismiss</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	@keyframes -global-keyframes-exit-fade {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	:global(.keyframes-exit[data-exiting]) {
		animation: keyframes-exit-fade 100ms linear;
	}
</style>
