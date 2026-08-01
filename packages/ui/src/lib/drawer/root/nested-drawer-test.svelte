<script lang="ts">
	import { Drawer } from '../index';
</script>

<Drawer.Indent data-testid="indent">
	<Drawer.Root side="bottom">
		<Drawer.Trigger>Open outer</Drawer.Trigger>
		<Drawer.Portal>
			<Drawer.Overlay />
			<Drawer.Content
				data-testid="outer-content"
				style="height: 200px; width: 200px; background: white;"
			>
				<Drawer.Title>Outer</Drawer.Title>

				<Drawer.Root side="bottom">
					<Drawer.Trigger>Open inner</Drawer.Trigger>
					<Drawer.Portal>
						<Drawer.Overlay />
						<Drawer.Content
							data-testid="inner-content"
							style="height: 120px; width: 200px; background: white;"
						>
							<Drawer.Title>Inner</Drawer.Title>
							<Drawer.Close>Close inner</Drawer.Close>
						</Drawer.Content>
					</Drawer.Portal>
				</Drawer.Root>
			</Drawer.Content>
		</Drawer.Portal>
	</Drawer.Root>
</Drawer.Indent>
