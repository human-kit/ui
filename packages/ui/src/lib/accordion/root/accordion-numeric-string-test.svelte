<script lang="ts">
	import { Accordion } from '../index';

	let value = $state<Array<string | number>>([1]);
</script>

<Accordion.Root {value} selectionMode="multiple" onChange={(next) => (value = next)}>
	<Accordion.Item value={1} data-testid="item-number">
		<Accordion.Header>
			<Accordion.Trigger data-testid="trigger-number">Number</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel data-testid="panel-number">Number panel</Accordion.Panel>
	</Accordion.Item>
	<Accordion.Item value="1" data-testid="item-string">
		<Accordion.Header>
			<Accordion.Trigger data-testid="trigger-string">String</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel data-testid="panel-string">String panel</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>

<output data-testid="numeric-string-value"
	>{JSON.stringify(value.map((entry) => `${typeof entry}:${entry}`))}</output
>
