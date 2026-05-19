<script lang="ts">
	import { Dialog } from '../../dialog';
</script>

<Dialog.Root>
	<Dialog.Trigger>Dialog Trigger</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content>
			<p>Dialog body</p>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
