<script lang="ts">
	import { Tabs } from '../index';
	import type { TabsKeyboardActivation, TabsOrientation, TabsValue } from './context.svelte';

	type TabsTestProps = {
		/** Render the `bind:value` variant instead of the `defaultValue` one. */
		controlled?: boolean;
		/**
		 * Opt the bound variant into fully controlled state. Separate from `controlled`
		 * on purpose: two-way binding and parent-owned state are different things, and
		 * some tests here exercise the binding while others exercise the rejection.
		 */
		controlledValue?: boolean;
		value?: TabsValue | null;
		defaultValue?: TabsValue | null;
		keyboardActivation?: TabsKeyboardActivation;
		orientation?: TabsOrientation;
		disabled?: boolean;
		disabledKeys?: TabsValue[];
		billingDisabled?: boolean;
		securityForceMount?: boolean;
		showControls?: boolean;
		cancelKeyDown?: boolean;
	};

	let {
		controlled = false,
		controlledValue = false,
		value,
		defaultValue,
		keyboardActivation = 'automatic',
		orientation = 'horizontal',
		disabled = false,
		disabledKeys = [],
		billingDisabled = false,
		securityForceMount = false,
		showControls = false,
		cancelKeyDown = false
	}: TabsTestProps = $props();

	let currentValue = $state<TabsValue | null | undefined>((() => value)());
	let currentDisabledKeys = $state<TabsValue[]>((() => [...disabledKeys])());
	let changeLog = $state<Array<TabsValue | null>>([]);

	function handleChange(nextValue: TabsValue | null) {
		currentValue = nextValue;
		changeLog = [...changeLog, nextValue];
	}

	function handleListKeyDown(event: KeyboardEvent) {
		if (cancelKeyDown) {
			event.preventDefault();
		}
	}
</script>

{#snippet tabParts()}
	<Tabs.List aria-label="Account sections" onkeydown={handleListKeyDown} data-testid="tabs-list">
		<Tabs.Tab value="overview" data-testid="tab-overview">Overview</Tabs.Tab>
		<Tabs.Tab value="billing" disabled={billingDisabled} data-testid="tab-billing">
			Billing
		</Tabs.Tab>
		<Tabs.Tab value="security" data-testid="tab-security">Security</Tabs.Tab>
		<Tabs.Indicator data-testid="tabs-indicator" />
	</Tabs.List>

	<Tabs.Panel value="overview" data-testid="panel-overview">Overview panel</Tabs.Panel>
	<Tabs.Panel value="billing" data-testid="panel-billing">Billing panel</Tabs.Panel>
	<Tabs.Panel value="security" forceMount={securityForceMount} data-testid="panel-security">
		Security panel
	</Tabs.Panel>
{/snippet}

{#if controlled}
	<Tabs.Root
		bind:value={currentValue}
		{controlledValue}
		{keyboardActivation}
		{orientation}
		{disabled}
		disabledKeys={currentDisabledKeys}
		onChange={handleChange}
		data-testid="tabs-root"
	>
		{@render tabParts()}
	</Tabs.Root>
{:else}
	<Tabs.Root
		{defaultValue}
		{keyboardActivation}
		{orientation}
		{disabled}
		disabledKeys={currentDisabledKeys}
		onChange={handleChange}
		data-testid="tabs-root"
	>
		{@render tabParts()}
	</Tabs.Root>
{/if}

{#if showControls}
	<button
		type="button"
		data-testid="set-value-security"
		onclick={() => (currentValue = 'security')}
	>
		Set security
	</button>
	<button type="button" data-testid="set-value-null" onclick={() => (currentValue = null)}>
		Set null
	</button>
	<button
		type="button"
		data-testid="disable-billing"
		onclick={() => (currentDisabledKeys = ['billing'])}
	>
		Disable billing
	</button>
{/if}

<output data-testid="selected-value">{String(currentValue)}</output>
<output data-testid="change-log">{JSON.stringify(changeLog)}</output>
<output data-testid="disabled-values">{JSON.stringify(currentDisabledKeys)}</output>
