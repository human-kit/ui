<script lang="ts">
	import { Tooltip } from '../index';
	import type { TooltipOpenChangeDetails } from '../types';

	type Props = {
		open?: boolean;
		defaultOpen?: boolean;
		controlledOpen?: boolean;
		onOpenChange?: (open: boolean, details: TooltipOpenChangeDetails) => void;
		delay?: number;
		closeDelay?: number;
		disabled?: boolean;
		openOnLongPress?: boolean;
		followPointer?: 'x' | 'y' | 'both';
		/** Makes the trigger 240px wide. */
		wide?: boolean;
		withArrow?: boolean;
		placement?: 'top' | 'bottom' | 'left' | 'right';
		/** Renders a second tooltip beside the first. */
		second?: boolean;
		onSecondOpenChange?: (open: boolean, details: TooltipOpenChangeDetails) => void;
		/** Renders a plain element as the trigger, through `triggerRef`. */
		customTrigger?: boolean;
	};

	let {
		open = $bindable(),
		defaultOpen = false,
		controlledOpen = false,
		onOpenChange,
		delay,
		closeDelay,
		disabled = false,
		openOnLongPress,
		followPointer,
		wide = false,
		withArrow = false,
		placement = 'top',
		second = false,
		onSecondOpenChange,
		customTrigger = false
	}: Props = $props();

	let customRef: HTMLElement | null = $state(null);
</script>

<button data-testid="before">Before</button>
<Tooltip.Root
	bind:open
	{defaultOpen}
	{controlledOpen}
	{onOpenChange}
	{delay}
	{closeDelay}
	{disabled}
	{openOnLongPress}
	triggerRef={customTrigger ? customRef : undefined}
>
	{#if customTrigger}
		<a href="#save" data-testid="custom" bind:this={customRef} aria-describedby="hint">Save</a>
	{:else}
		<Tooltip.Trigger
			data-testid="trigger"
			aria-label="Save"
			style={wide ? 'width: 240px; height: 32px;' : undefined}
		>
			S
		</Tooltip.Trigger>
	{/if}
	<Tooltip.Content data-testid="content" {placement} {followPointer}>
		Save the document
		{#if withArrow}
			<Tooltip.Arrow data-testid="arrow" style="width: 8px; height: 8px;" />
		{/if}
	</Tooltip.Content>
</Tooltip.Root>
{#if second}
	<Tooltip.Root {delay} {closeDelay} onOpenChange={onSecondOpenChange}>
		<Tooltip.Trigger data-testid="trigger-2" aria-label="Print">P</Tooltip.Trigger>
		<Tooltip.Content data-testid="content-2">Print the document</Tooltip.Content>
	</Tooltip.Root>
{/if}
<button data-testid="after">After</button>
<span id="hint">A hint</span>
<output data-testid="bound-open">{String(open)}</output>
