<script lang="ts">
	import type { TabsIndicatorProps } from '../types.js';
	import { useTabsContext } from '../root/context.svelte';

	type IndicatorMeasurement = {
		left: number;
		top: number;
		width: number;
		height: number;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLSpanElement | null>(null),
		...restProps
	}: TabsIndicatorProps = $props();

	const tabs = useTabsContext();

	let indicatorRef: HTMLSpanElement | null = $state(null);
	let measurement: IndicatorMeasurement | null = $state(null);

	const orientation = $derived(tabs.orientation);
	const activationDirection = $derived(tabs.activationDirection);
	const hasActiveTab = $derived(tabs.selectedValue !== null);

	$effect(() => {
		element = indicatorRef;
	});

	// Scoped to what the measurement actually depends on: the list and selected
	// tab elements (fine-grained context state), the orientation (geometry
	// flips without necessarily resizing either element), and `layoutEpoch`
	// (explicit re-measure requests via `notifyLayoutChange`). Observers are no
	// longer torn down on unrelated state changes (focus, keyboard mode, ...).
	$effect(() => {
		void tabs.layoutEpoch;
		void tabs.orientation;

		const listElement = tabs.listElement;
		const tabElement = tabs.getSelectedTab()?.element ?? null;

		if (!indicatorRef || !listElement || !tabElement) {
			measurement = null;
			return;
		}

		let frame = 0;
		const measure = () => {
			frame = 0;
			const listRect = listElement.getBoundingClientRect();
			const tabRect = tabElement.getBoundingClientRect();
			measurement = {
				left: tabRect.left - listRect.left + listElement.scrollLeft,
				top: tabRect.top - listRect.top + listElement.scrollTop,
				width: tabRect.width,
				height: tabRect.height
			};
		};
		const scheduleMeasure = () => {
			if (frame !== 0) return;
			frame = window.requestAnimationFrame(measure);
		};

		scheduleMeasure();
		window.addEventListener('resize', scheduleMeasure);
		listElement.addEventListener('scroll', scheduleMeasure, { passive: true });
		const observer =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleMeasure) : null;
		observer?.observe(listElement);
		observer?.observe(tabElement);

		return () => {
			if (frame !== 0) {
				window.cancelAnimationFrame(frame);
			}
			window.removeEventListener('resize', scheduleMeasure);
			listElement.removeEventListener('scroll', scheduleMeasure);
			observer?.disconnect();
		};
	});
</script>

<span
	{...restProps}
	bind:this={indicatorRef}
	class={className}
	aria-hidden="true"
	data-tabs-indicator="true"
	data-orientation={orientation}
	data-activation-direction={activationDirection ?? undefined}
	data-hidden={!hasActiveTab || undefined}
	style:--active-tab-left={measurement ? `${measurement.left}px` : undefined}
	style:--active-tab-top={measurement ? `${measurement.top}px` : undefined}
	style:--active-tab-width={measurement ? `${measurement.width}px` : undefined}
	style:--active-tab-height={measurement ? `${measurement.height}px` : undefined}
>
	{@render children?.()}
</span>
