<script lang="ts">
	import { Popover } from '../index';
</script>

<Popover.Root>
	<Popover.Trigger>Open Outer</Popover.Trigger>

	<Popover.Content class="outer-popover">
		<div>
			<p>Outer content</p>

			<Popover.Root>
				<Popover.Trigger>Open Inner</Popover.Trigger>

				<Popover.Content class="inner-popover">
					<p>Inner content</p>
				</Popover.Content>
			</Popover.Root>
		</div>
	</Popover.Content>
</Popover.Root>
