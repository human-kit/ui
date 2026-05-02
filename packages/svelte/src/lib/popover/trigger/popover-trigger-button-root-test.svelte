<script lang="ts">
	import { Button } from '../../button';
	import { Popover } from '../index';
</script>

<Popover.Root>
	<Popover.Trigger>
		<Button.Root>Open Button Root Popover</Button.Root>
	</Popover.Trigger>

	<Popover.Content class="popover-content">
		<div class="popover-body">
			<h3>Popover Title</h3>
			<p>Popover content goes here.</p>
		</div>
	</Popover.Content>
</Popover.Root>
