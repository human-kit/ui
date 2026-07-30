<script lang="ts">
	import { untrack } from 'svelte';
	import type { ToggleGroupRootProps } from '../types.js';
	import { createToggleGroupContext, setToggleGroupContext } from './context.svelte';
	import { trackInteractionModality } from '../../primitives/input-modality';
	import { isRtl } from '../../internal/rtl';

	type ToggleGroupKeyboardEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLDivElement;
	};
	type ToggleGroupMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLDivElement;
	};

	const generatedId = $props.id();

	let {
		id,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		selectionMode = 'single',
		disabled: disabledProp = false,
		orientation = 'horizontal',
		disallowEmptySelection = false,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		...restProps
	}: ToggleGroupRootProps = $props();

	// Controlled-ness is opt-in, not inferred from `value` being defined: `bind:value` and
	// `value={...}` are indistinguishable at runtime. It used to be inferred here, and the
	// write-back below ignored the result anyway, so a controlled parent could not reject
	// a change — the selection moved regardless of what `onChange` decided.
	const isControlled = untrack(() => controlledValue);
	const instanceId = untrack(() => id) ?? generatedId;

	let rootRef: HTMLDivElement | null = $state(null);

	const toggleGroup = setToggleGroupContext(
		createToggleGroupContext({
			isControlled,
			// `value` seeds the initial selection whenever it is supplied, bound or not.
			initialValue: untrack(() => value) ?? untrack(() => defaultValue),
			selectionMode: (() => selectionMode)(),
			isDisabled: (() => disabledProp)(),
			orientation: (() => orientation)(),
			disallowEmptySelection: (() => disallowEmptySelection)(),
			onValueChange: (nextValue) => {
				if (!isControlled) {
					value = nextValue;
				}
				onChange?.(nextValue);
			}
		})
	);

	context = toggleGroup;

	const disabled = $derived(toggleGroup.isDisabled);
	const multiple = $derived(toggleGroup.selectionMode === 'multiple');
	const currentOrientation = $derived(toggleGroup.orientation);

	$effect(() => {
		element = rootRef;
	});

	$effect(() => {
		toggleGroup.setSelectionMode(selectionMode);
	});

	$effect(() => {
		toggleGroup.setDisabled(disabledProp);
	});

	$effect(() => {
		toggleGroup.setOrientation(orientation);
	});

	$effect(() => {
		toggleGroup.setDisallowEmptySelection(disallowEmptySelection);
	});

	// Whether to adopt an incoming `value` is a separate question from who owns the state,
	// so it is latched at init off the prop rather than off `controlledValue`: a parent
	// that supplies `value` drives the selection, bound or not. Latched, not reactive —
	// re-checking `value !== undefined` would switch this on the moment our own write-back
	// defines it, and the component would then re-adopt the echo of its own change.
	const adoptsValueProp = untrack(() => value !== undefined);

	$effect(() => {
		if (!adoptsValueProp) return;
		toggleGroup.setSelectedValues(value);
	});

	function getCurrentValue() {
		return toggleGroup.focusedValue ?? toggleGroup.getFirstEnabledValue();
	}

	function moveFocus(value: ReturnType<typeof toggleGroup.getFirstEnabledValue>) {
		if (value === null) return;
		toggleGroup.setFocusVisible(true);
		toggleGroup.focusValue(value);
	}

	function getEventToggleTarget(event: KeyboardEvent | MouseEvent) {
		const target = event.target;
		if (!(target instanceof Element)) return target;
		return target.closest('[data-toggle-root="true"]') ?? target;
	}

	function handleKeyDown(event: ToggleGroupKeyboardEvent) {
		onKeyDownExternal?.(event);
		if (event.defaultPrevented) return;

		const toggleTarget = getEventToggleTarget(event);
		if (!toggleGroup.isRegisteredElement(toggleTarget)) return;

		trackInteractionModality(event, toggleTarget as HTMLElement | null);

		if (toggleGroup.isDisabled) return;

		const currentValue = getCurrentValue();
		// In horizontal orientation the arrows are physical: under RTL the
		// visual "next" toggle is the previous one in DOM order (APG).
		const horizontal = toggleGroup.orientation === 'horizontal';
		const rtl = horizontal && isRtl(event.currentTarget);
		const nextKeys = horizontal ? [rtl ? 'ArrowLeft' : 'ArrowRight'] : ['ArrowDown'];
		const previousKeys = horizontal ? [rtl ? 'ArrowRight' : 'ArrowLeft'] : ['ArrowUp'];

		if (nextKeys.includes(event.key)) {
			event.preventDefault();
			moveFocus(toggleGroup.getNextEnabledValue(currentValue, 1));
			return;
		}

		if (previousKeys.includes(event.key)) {
			event.preventDefault();
			moveFocus(toggleGroup.getNextEnabledValue(currentValue, -1));
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			moveFocus(toggleGroup.getFirstEnabledValue());
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			moveFocus(toggleGroup.getLastEnabledValue());
		}
	}

	function handleMouseDown(event: ToggleGroupMouseEvent) {
		const toggleTarget = getEventToggleTarget(event);
		trackInteractionModality(event, toggleTarget as HTMLElement | null);
		toggleGroup.setFocusVisible(false);
		onMouseDownExternal?.(event);
	}
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={instanceId}
	role="group"
	class={className}
	data-toggle-group-root="true"
	data-orientation={currentOrientation}
	data-disabled={disabled || undefined}
	data-multiple={multiple || undefined}
	onkeydown={handleKeyDown}
	onmousedown={handleMouseDown}
>
	{@render children?.()}
</div>
