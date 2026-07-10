<script lang="ts">
	import { Collapsible } from '../index';

	type CollapsibleTestProps = {
		controlled?: boolean;
		open?: boolean;
		defaultOpen?: boolean;
		disabled?: boolean;
		forceMount?: boolean;
		showControls?: boolean;
		applyChanges?: boolean;
	};

	let {
		controlled = false,
		open = false,
		defaultOpen = false,
		disabled = false,
		forceMount = false,
		showControls = false,
		applyChanges = true
	}: CollapsibleTestProps = $props();

	let currentOpen = $state((() => open)());
	let changeLog = $state<boolean[]>([]);

	function handleOpenChange(next: boolean) {
		if (applyChanges) {
			currentOpen = next;
		}
		changeLog = [...changeLog, next];
	}
</script>

{#snippet collapsibleParts()}
	<Collapsible.Trigger data-testid="trigger">Details</Collapsible.Trigger>
	<Collapsible.Panel {forceMount} data-testid="panel">Panel content</Collapsible.Panel>
{/snippet}

{#if controlled}
	<Collapsible.Root
		bind:open={currentOpen}
		{disabled}
		onOpenChange={handleOpenChange}
		data-testid="root"
	>
		{@render collapsibleParts()}
	</Collapsible.Root>
{:else}
	<Collapsible.Root {defaultOpen} {disabled} onOpenChange={handleOpenChange} data-testid="root">
		{@render collapsibleParts()}
	</Collapsible.Root>
{/if}

{#if showControls}
	<button type="button" data-testid="set-open" onclick={() => (currentOpen = true)}>Set open</button
	>
	<button type="button" data-testid="set-closed" onclick={() => (currentOpen = false)}>
		Set closed
	</button>
{/if}

<output data-testid="open-state">{String(currentOpen)}</output>
<output data-testid="change-log">{JSON.stringify(changeLog)}</output>
