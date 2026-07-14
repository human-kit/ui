<script lang="ts">
	import { Tabs } from '../index';

	let value = $state<string | number>(1);
</script>

<Tabs.Root bind:value>
	<Tabs.List aria-label="Numeric string tabs">
		<Tabs.Tab value={1} data-testid="tab-number">Number</Tabs.Tab>
		<Tabs.Tab value="1" data-testid="tab-string">String</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value={1} data-testid="panel-number">Number panel</Tabs.Panel>
	<Tabs.Panel value="1" data-testid="panel-string">String panel</Tabs.Panel>
</Tabs.Root>

<output data-testid="numeric-string-value">{typeof value}:{String(value)}</output>
