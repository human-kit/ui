<script lang="ts">
	import { Accordion } from '../index';
	import type {
		AccordionOrientation,
		AccordionSelectionMode,
		AccordionValue
	} from './context.svelte';

	type AccordionTestProps = {
		controlled?: boolean;
		value?: AccordionValue[];
		defaultValue?: AccordionValue[];
		selectionMode?: AccordionSelectionMode;
		orientation?: AccordionOrientation;
		disabled?: boolean;
		disallowEmptySelection?: boolean;
		loop?: boolean;
		billingDisabled?: boolean;
		securityForceMount?: boolean;
		panelRegion?: boolean;
		showControls?: boolean;
		applyChanges?: boolean;
	};

	let {
		controlled = false,
		value = ['overview'],
		defaultValue,
		selectionMode = 'single',
		orientation = 'vertical',
		disabled = false,
		disallowEmptySelection = false,
		loop = true,
		billingDisabled = false,
		securityForceMount = false,
		panelRegion = true,
		showControls = false,
		applyChanges = true
	}: AccordionTestProps = $props();

	let currentValue = $state<AccordionValue[]>((() => [...value])());
	let changeLog = $state<Array<AccordionValue[]>>([]);

	function handleChange(nextValue: AccordionValue[]) {
		if (applyChanges) {
			currentValue = nextValue;
		}
		changeLog = [...changeLog, nextValue];
	}
</script>

{#snippet accordionParts()}
	<Accordion.Item value="overview" data-testid="item-overview">
		<Accordion.Header data-testid="header-overview">
			<Accordion.Trigger data-testid="trigger-overview">Overview</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel region={panelRegion} data-testid="panel-overview"
			>Overview panel</Accordion.Panel
		>
	</Accordion.Item>

	<Accordion.Item value="billing" disabled={billingDisabled} data-testid="item-billing">
		<Accordion.Header data-testid="header-billing">
			<Accordion.Trigger data-testid="trigger-billing">Billing</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel data-testid="panel-billing">Billing panel</Accordion.Panel>
	</Accordion.Item>

	<Accordion.Item value="security" data-testid="item-security">
		<Accordion.Header data-testid="header-security">
			<Accordion.Trigger data-testid="trigger-security">Security</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel forceMount={securityForceMount} data-testid="panel-security">
			Security panel
		</Accordion.Panel>
	</Accordion.Item>
{/snippet}

{#if controlled}
	<Accordion.Root
		bind:value={currentValue}
		{selectionMode}
		{orientation}
		{disabled}
		{disallowEmptySelection}
		{loop}
		onChange={handleChange}
		data-testid="accordion-root"
	>
		{@render accordionParts()}
	</Accordion.Root>
{:else}
	<Accordion.Root
		{defaultValue}
		{selectionMode}
		{orientation}
		{disabled}
		{disallowEmptySelection}
		{loop}
		onChange={handleChange}
		data-testid="accordion-root"
	>
		{@render accordionParts()}
	</Accordion.Root>
{/if}

{#if showControls}
	<button
		type="button"
		data-testid="set-value-security"
		onclick={() => (currentValue = ['security'])}
	>
		Set security
	</button>
	<button type="button" data-testid="set-value-empty" onclick={() => (currentValue = [])}>
		Set empty
	</button>
{/if}

<output data-testid="open-values">{JSON.stringify(currentValue)}</output>
<output data-testid="change-log">{JSON.stringify(changeLog)}</output>
