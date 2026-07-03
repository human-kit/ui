<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { ButtonRoot } from '../../button/index.js';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { useTabsContext } from '../root/context';
	import type { TabsTabProps } from '../types.js';

	type TabsTabMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};
	type TabsTabFocusEvent = FocusEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};
	type TabsTabKeyboardEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		value,
		disabled: disabledProp = false,
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		...restProps
	}: TabsTabProps = $props();

	const tabs = useTabsContext();
	const stateVersion = tabs.stateVersion;
	const tabId = $derived(tabs.getTabId(value));
	const panelId = $derived(tabs.getPanelId(value));

	let buttonRef: HTMLButtonElement | null = $state(null);
	let registeredValue = untrack(() => value);

	untrack(() => {
		tabs.registerTab(registeredValue, { isDisabled: disabledProp });
	});

	const selected = $derived.by(() => {
		void $stateVersion;
		return tabs.isSelected(value);
	});
	const disabled = $derived.by(() => {
		void $stateVersion;
		return tabs.isTabDisabled(value);
	});
	const focused = $derived.by(() => {
		void $stateVersion;
		return tabs.isFocused(value);
	});
	const focusVisible = $derived.by(() => {
		void $stateVersion;
		return tabs.isFocusVisible(value);
	});
	const tabIndex = $derived.by(() => {
		void $stateVersion;
		return tabs.getTabIndex(value);
	});
	const orientation = $derived.by(() => {
		void $stateVersion;
		return tabs.orientation;
	});
	const activationDirection = $derived.by(() => {
		void $stateVersion;
		return tabs.activationDirection;
	});

	$effect(() => {
		if (!Object.is(registeredValue, value)) {
			tabs.unregisterTab(registeredValue);
			registeredValue = value;
		}
		element = buttonRef;
		tabs.registerTab(registeredValue, { isDisabled: disabledProp, element: buttonRef });
	});

	onDestroy(() => {
		tabs.unregisterTab(registeredValue);
	});

	function handleClick(event: TabsTabMouseEvent) {
		if (disabled) {
			event.preventDefault();
			onClickExternal?.(event);
			return;
		}

		tabs.setFocusVisible(false);
		tabs.setFocusedValue(value);
		tabs.activateTab(value);
		onClickExternal?.(event);
	}

	function handleFocus(event: TabsTabFocusEvent) {
		if (!disabled) {
			tabs.setFocusedValue(value);
			tabs.setFocusVisible(shouldShowFocusVisible(buttonRef));
		}
		onFocusExternal?.(event);
	}

	function handleBlur(event: TabsTabFocusEvent) {
		if (tabs.isFocused(value)) {
			tabs.setFocusedValue(null);
			tabs.setFocusVisible(false);
		}
		onBlurExternal?.(event);
	}

	function handleKeyDown(event: TabsTabKeyboardEvent) {
		trackInteractionModality(event, buttonRef);
		if (focused) {
			tabs.setFocusVisible(true);
		}
		onKeyDownExternal?.(event);
	}

	function handleMouseDown(event: TabsTabMouseEvent) {
		trackInteractionModality(event, buttonRef);
		tabs.setFocusVisible(false);
		onMouseDownExternal?.(event);
	}
</script>

<ButtonRoot
	{...restProps}
	bind:element={buttonRef}
	id={tabId}
	type="button"
	role="tab"
	aria-selected={selected ? 'true' : 'false'}
	aria-controls={panelId}
	tabindex={tabIndex}
	{disabled}
	class={className}
	data-tabs-tab="true"
	data-tabs-value={String(value)}
	data-tabs-value-type={typeof value}
	data-selected={selected || undefined}
	data-disabled={disabled || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	data-orientation={orientation}
	data-activation-direction={activationDirection ?? undefined}
	onclick={handleClick}
	onfocus={handleFocus}
	onblur={handleBlur}
	onkeydown={handleKeyDown}
	onmousedown={handleMouseDown}
>
	{@render children?.()}
</ButtonRoot>
