<script lang="ts">
	import { Drawer } from '../index';
	import type { DrawerModal, DrawerSide, DrawerSnapPoint } from './types';

	type Props = {
		open?: boolean;
		defaultOpen?: boolean;
		controlledOpen?: boolean;
		side?: DrawerSide;
		modal?: DrawerModal;
		dismissible?: boolean;
		shouldCloseOnInteractOutside?: boolean;
		shouldCloseOnEscape?: boolean;
		onOpenChange?: (open: boolean) => void;
		/** Renders a scrollable body, to exercise the gesture's scroll deference. */
		scrollableBody?: boolean;
		withViewport?: boolean;
		snapPoints?: readonly DrawerSnapPoint[];
		defaultSnapPoint?: DrawerSnapPoint | null;
		snapToSequentialPoints?: boolean;
		onSnapPointChange?: (snapPoint: DrawerSnapPoint | null) => void;
	};

	let {
		open,
		defaultOpen = false,
		controlledOpen = false,
		side = 'bottom',
		modal = true,
		dismissible = true,
		shouldCloseOnInteractOutside = true,
		shouldCloseOnEscape = true,
		onOpenChange,
		scrollableBody = false,
		withViewport = false,
		snapPoints,
		defaultSnapPoint = null,
		snapToSequentialPoints = false,
		onSnapPointChange
	}: Props = $props();
</script>

<Drawer.Root
	{open}
	{defaultOpen}
	{controlledOpen}
	{side}
	{modal}
	{dismissible}
	{shouldCloseOnInteractOutside}
	{shouldCloseOnEscape}
	{onOpenChange}
	{snapPoints}
	{defaultSnapPoint}
	{snapToSequentialPoints}
	{onSnapPointChange}
>
	<Drawer.Trigger>Open Drawer</Drawer.Trigger>

	<Drawer.Portal>
		<Drawer.Overlay data-testid="drawer-overlay" />
		{#if withViewport}
			<Drawer.Viewport data-testid="drawer-viewport">
				{@render panel()}
			</Drawer.Viewport>
		{:else}
			{@render panel()}
		{/if}
	</Drawer.Portal>
</Drawer.Root>

{#snippet panel()}
	<!-- Explicit extent so the swipe thresholds are deterministic in tests. -->
	<Drawer.Content
		class="drawer-content"
		data-testid="drawer-content"
		style="height: 200px; width: 200px; background: white;"
	>
		<Drawer.Title>Drawer Title</Drawer.Title>
		<Drawer.Description>Drawer description text.</Drawer.Description>
		{#if scrollableBody}
			<Drawer.Body data-testid="drawer-body" style="height: 80px; overflow-y: auto;">
				<div style="height: 400px;">Scrollable region</div>
			</Drawer.Body>
		{/if}
		<Drawer.Close>Close</Drawer.Close>
	</Drawer.Content>
{/snippet}
