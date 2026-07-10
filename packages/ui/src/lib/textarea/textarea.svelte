<script lang="ts">
	import { tick, untrack } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { shouldShowFocusVisible, trackInteractionModality } from '../primitives/input-modality';
	import { isAriaInvalidValue } from '../utils/aria-invalid';
	import type { ClassValue } from '../utils/cn';
	import { composeEventHandlers } from '../utils/compose-event-handlers';

	type AriaInvalidValue = HTMLTextareaAttributes['aria-invalid'];
	type TextAreaValue = HTMLTextareaAttributes['value'];

	type TextAreaProps = HTMLTextareaAttributes & {
		class?: ClassValue;
		disabled?: boolean | null;
		readonly?: boolean | null;
		invalid?: boolean;
		required?: boolean | null;
		value?: TextAreaValue;
		element?: HTMLTextAreaElement | null;
		autoResize?: boolean;
		minRows?: number;
		maxRows?: number;
	};

	function parsePixelValue(value: string): number {
		const parsed = Number.parseFloat(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	function resolveLineHeight(style: CSSStyleDeclaration): number {
		const lineHeight = parsePixelValue(style.lineHeight);
		if (lineHeight > 0) return lineHeight;

		const fontSize = parsePixelValue(style.fontSize);
		return fontSize > 0 ? fontSize * 1.2 : 19.2;
	}

	function resolveRowsHeight(
		rows: number | undefined,
		lineHeight: number,
		paddingSize: number,
		borderSize: number,
		isBorderBox: boolean
	): number | undefined {
		if (rows === undefined || !Number.isFinite(rows) || rows <= 0) return undefined;

		const rowHeight = Math.ceil(rows) * lineHeight;
		return isBorderBox ? rowHeight + paddingSize + borderSize : rowHeight;
	}

	const generatedId = $props.id();

	let {
		id,
		class: className,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		'aria-invalid': ariaInvalidProp,
		autofocus = false,
		value = $bindable<TextAreaValue>(),
		element = $bindable<HTMLTextAreaElement | null>(null),
		autoResize = false,
		minRows,
		maxRows,
		oninput: onInputExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		onpointerdown: onPointerDownExternal,
		onmouseenter: onMouseEnterExternal,
		onmouseleave: onMouseLeaveExternal,
		...restProps
	}: TextAreaProps = $props();

	const resolvedId = untrack(() => id) ?? generatedId;

	let textAreaRef: HTMLTextAreaElement | null = $state(null);
	let hovered = $state(false);
	let focused = $state(false);
	let focusVisible = $state(false);

	const resolvedInvalid = $derived(Boolean(invalid || isAriaInvalidValue(ariaInvalidProp)));
	const renderedAriaInvalid = $derived.by<AriaInvalidValue | undefined>(() => {
		if (!resolvedInvalid) return undefined;
		return ariaInvalidProp === 'grammar' || ariaInvalidProp === 'spelling'
			? ariaInvalidProp
			: 'true';
	});

	$effect(() => {
		element = textAreaRef;
		return () => {
			element = null;
		};
	});

	// Native `autofocus` only focuses the first autofocus element inserted per document, so it
	// silently fails for textareas that mount inside an already-open popover/dialog or remount as
	// a view swaps. Focus the element on mount instead so it works every time it appears.
	$effect(() => {
		if (autofocus && textAreaRef) {
			textAreaRef.focus();
		}
	});

	$effect(() => {
		if (!disabled) return;
		hovered = false;
		focused = false;
		focusVisible = false;
	});

	$effect(() => {
		const currentValue = value;
		const currentMinRows = minRows;
		const currentMaxRows = maxRows;

		if (!textAreaRef) return;

		if (!autoResize) {
			textAreaRef.style.height = '';
			textAreaRef.style.overflowY = '';
			return;
		}

		void currentValue;
		void currentMinRows;
		void currentMaxRows;

		void tick().then(resizeTextArea);
	});

	$effect(() => {
		if (!autoResize || !textAreaRef || typeof ResizeObserver === 'undefined') return;

		const observer = new ResizeObserver(() => {
			resizeTextArea();
		});

		observer.observe(textAreaRef);

		return () => {
			observer.disconnect();
		};
	});

	function resizeTextArea() {
		const textArea = textAreaRef;
		if (!autoResize || !textArea) return;

		const style = window.getComputedStyle(textArea);
		const paddingSize = parsePixelValue(style.paddingTop) + parsePixelValue(style.paddingBottom);
		const borderSize =
			parsePixelValue(style.borderTopWidth) + parsePixelValue(style.borderBottomWidth);
		const isBorderBox = style.boxSizing === 'border-box';
		const lineHeight = resolveLineHeight(style);
		const minHeight = resolveRowsHeight(minRows, lineHeight, paddingSize, borderSize, isBorderBox);
		const normalizedMaxRows =
			maxRows !== undefined && minRows !== undefined && maxRows < minRows ? minRows : maxRows;
		const maxHeight = resolveRowsHeight(
			normalizedMaxRows,
			lineHeight,
			paddingSize,
			borderSize,
			isBorderBox
		);

		textArea.style.height = 'auto';

		const scrollHeight = isBorderBox
			? textArea.scrollHeight + borderSize
			: textArea.scrollHeight - paddingSize;
		const desiredHeight = Math.max(scrollHeight, minHeight ?? 0);
		const resolvedHeight =
			maxHeight === undefined ? desiredHeight : Math.min(desiredHeight, maxHeight);

		textArea.style.height = `${resolvedHeight}px`;
		textArea.style.overflowY =
			maxHeight !== undefined && desiredHeight > maxHeight ? 'auto' : 'hidden';
	}

	function handleFocus() {
		if (disabled) return;
		focused = true;
		focusVisible = shouldShowFocusVisible(textAreaRef);
	}

	function handleBlur() {
		focused = false;
		focusVisible = false;
	}

	function handleInput(event: Event) {
		value = (event.currentTarget as HTMLTextAreaElement).value;
		resizeTextArea();
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, textAreaRef);
		focusVisible = focused ? true : shouldShowFocusVisible(textAreaRef);
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, textAreaRef);
		focusVisible = false;
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, textAreaRef);
		focusVisible = false;
	}

	function handleMouseEnter() {
		if (disabled) {
			hovered = false;
			return;
		}

		hovered = true;
	}

	function handleMouseLeave() {
		hovered = false;
	}
</script>

<textarea
	{...restProps}
	bind:this={textAreaRef}
	id={resolvedId}
	{value}
	{disabled}
	{readonly}
	{required}
	aria-invalid={renderedAriaInvalid}
	aria-readonly={readonly || undefined}
	aria-required={required || undefined}
	data-textarea-root="true"
	data-autoresize={autoResize || undefined}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-required={required || undefined}
	data-hovered={hovered || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	oninput={composeEventHandlers(handleInput, onInputExternal ?? undefined)}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined)}
	onmouseenter={composeEventHandlers(handleMouseEnter, onMouseEnterExternal ?? undefined)}
	onmouseleave={composeEventHandlers(handleMouseLeave, onMouseLeaveExternal ?? undefined)}
	class={className}
></textarea>
