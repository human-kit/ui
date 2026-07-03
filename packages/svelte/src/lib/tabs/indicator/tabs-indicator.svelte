<script lang="ts">
	import type { TabsIndicatorProps } from '../types.js';
	import { useTabsContext } from '../root/context';

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
	const stateVersion = tabs.stateVersion;
	const layoutVersion = tabs.layoutVersion;

	let indicatorRef: HTMLSpanElement | null = $state(null);
	let measurement: IndicatorMeasurement | null = $state(null);

	const orientation = $derived.by(() => {
		void $stateVersion;
		return tabs.orientation;
	});
	const activationDirection = $derived.by(() => {
		void $stateVersion;
		return tabs.activationDirection;
	});
	const hasActiveTab = $derived.by(() => {
		void $stateVersion;
		return tabs.selectedValue !== null;
	});

	$effect(() => {
		element = indicatorRef;
	});

	$effect(() => {
		void $stateVersion;
		void $layoutVersion;

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
