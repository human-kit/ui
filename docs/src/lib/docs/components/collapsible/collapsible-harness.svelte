<script lang="ts">
	// Minimal consumer of the wrapper, used by the test to exercise Root/Trigger/Panel.
	import { Collapsible } from './index.js';
</script>

<Collapsible.Root>
	<Collapsible.Trigger>Toggle</Collapsible.Trigger>
	<Collapsible.Panel class="extra-class">
		<p data-testid="content">Panel body</p>
	</Collapsible.Panel>
</Collapsible.Root>
