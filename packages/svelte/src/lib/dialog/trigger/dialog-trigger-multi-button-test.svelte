<script lang="ts">
	import { Dialog } from '../../dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<div>
			<button type="button">First Dialog Trigger</button>
			<button type="button">Second Dialog Trigger</button>
		</div>
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content>
			<p>Dialog body</p>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
