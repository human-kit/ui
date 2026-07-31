<script lang="ts">
	import { Drawer } from '../index';
</script>

<Drawer.Root side="bottom">
	<!-- Outside the portal on purpose: the strip has to exist while the drawer is
	     closed, and the portal only mounts once it opens. -->
	<Drawer.SwipeArea data-testid="swipe-area" size="40px" />
	<Drawer.Trigger>Open</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Overlay />
		<Drawer.Content
			data-testid="swipe-open-content"
			style="height: 200px; width: 200px; background: white;"
		>
			<Drawer.Title>Swipe to open</Drawer.Title>
			<Drawer.Close>Close</Drawer.Close>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
