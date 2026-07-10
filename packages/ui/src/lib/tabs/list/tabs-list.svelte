<script lang="ts">
	import type { TabsListProps, TabsValue } from '../types.js';
	import { useTabsContext } from '../root/context';
	import { trackInteractionModality } from '../../primitives/input-modality';
	import { isRtl } from '../../internal/rtl';

	type TabsListKeyboardEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLDivElement;
	};
	type TabsListMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLDivElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		...restProps
	}: TabsListProps = $props();

	const tabs = useTabsContext();
	const stateVersion = tabs.stateVersion;

	let listRef: HTMLDivElement | null = $state(null);

	const orientation = $derived.by(() => {
		void $stateVersion;
		return tabs.orientation;
	});
	const isDisabled = $derived.by(() => {
		void $stateVersion;
		return tabs.isDisabled;
	});

	$effect(() => {
		element = listRef;
		tabs.setListElement(listRef);
		return () => {
			if (tabs.listElement === listRef) {
				tabs.setListElement(null);
			}
		};
	});

	function moveFocus(value: TabsValue | null) {
		if (value === null) return;
		tabs.setFocusVisible(true);
		tabs.focusValue(value, { activate: tabs.keyboardActivation === 'automatic' });
	}

	function getCurrentValue() {
		return tabs.focusedValue ?? tabs.selectedValue ?? tabs.getFirstEnabledValue();
	}

	function handleKeyDown(event: TabsListKeyboardEvent) {
		onKeyDownExternal?.(event);
		if (event.defaultPrevented) return;

		trackInteractionModality(event, event.target as HTMLElement | null);

		if (tabs.isDisabled) return;

		const currentValue = getCurrentValue();
		// In horizontal orientation the arrows are physical: under RTL the
		// visual "next" tab is the previous one in DOM order (APG).
		const rtl = orientation === 'horizontal' && isRtl(event.currentTarget);
		const nextKeys =
			orientation === 'horizontal' ? [rtl ? 'ArrowLeft' : 'ArrowRight'] : ['ArrowDown'];
		const previousKeys =
			orientation === 'horizontal' ? [rtl ? 'ArrowRight' : 'ArrowLeft'] : ['ArrowUp'];

		if (nextKeys.includes(event.key)) {
			event.preventDefault();
			moveFocus(tabs.getNextEnabledValue(currentValue, 1));
			return;
		}

		if (previousKeys.includes(event.key)) {
			event.preventDefault();
			moveFocus(tabs.getNextEnabledValue(currentValue, -1));
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			moveFocus(tabs.getFirstEnabledValue());
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			moveFocus(tabs.getLastEnabledValue());
			return;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			const target = event.target;
			if (target instanceof HTMLElement && target.getAttribute('role') === 'tab') {
				event.preventDefault();
				const rawValue = target.dataset.tabsValue;
				const valueType = target.dataset.tabsValueType;
				const value =
					valueType === 'number' && rawValue !== undefined && !Number.isNaN(Number(rawValue))
						? Number(rawValue)
						: rawValue;
				if (value !== undefined) {
					tabs.activateTab(value);
				}
			}
		}
	}

	function handleMouseDown(event: TabsListMouseEvent) {
		trackInteractionModality(event, event.target as HTMLElement | null);
		tabs.setFocusVisible(false);
		onMouseDownExternal?.(event);
	}
</script>

<div
	{...restProps}
	bind:this={listRef}
	role="tablist"
	aria-orientation={orientation}
	class={className}
	data-tabs-list="true"
	data-orientation={orientation}
	data-disabled={isDisabled || undefined}
	onkeydown={handleKeyDown}
	onmousedown={handleMouseDown}
>
	{@render children?.()}
</div>
