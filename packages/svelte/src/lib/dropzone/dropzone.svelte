<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { shouldShowFocusVisible, trackInteractionModality } from '../primitives/input-modality';
	import { cn } from '../utils/cn';

	export type DropzoneRenderState = {
		/** A drag is currently hovering the zone with droppable file content. */
		dragging: boolean;
		focused: boolean;
		focusVisible: boolean;
		disabled: boolean;
	};

	type DropzoneProps = Omit<
		HTMLButtonAttributes,
		'children' | 'class' | 'disabled' | 'aria-disabled' | 'type'
	> & {
		children?: Snippet<[DropzoneRenderState]> | Snippet;
		class?: string;
		disabled?: boolean;
		/** Forwarded to the hidden file input's `accept` and used to filter dropped files. */
		accept?: string;
		/** Allow selecting or dropping more than one file. */
		multiple?: boolean;
		/** Emitted with the accepted files picked via click or drop. */
		onFilesPicked?: (files: File[]) => void;
		/** Visually-hidden polite live-region message (announce results or errors after a pick). */
		announcement?: string;
		element?: HTMLButtonElement | null;
	};

	function composeEventHandlers<TEvent extends Event>(
		internalHandler: ((event: TEvent) => void) | undefined,
		externalHandler: ((event: TEvent) => void) | undefined
	): (event: TEvent) => void {
		return (event: TEvent) => {
			internalHandler?.(event);
			externalHandler?.(event);
		};
	}

	function parseAccept(accept: string | undefined): string[] {
		if (!accept) return [];
		return accept
			.split(',')
			.map((token) => token.trim().toLowerCase())
			.filter(Boolean);
	}

	function fileMatchesAccept(file: File, tokens: string[]): boolean {
		if (tokens.length === 0) return true;
		const name = file.name.toLowerCase();
		const type = file.type.toLowerCase();
		return tokens.some((token) => {
			if (token.startsWith('.')) return name.endsWith(token);
			if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
			return type === token;
		});
	}

	const generatedId = $props.id();

	let {
		id,
		children,
		class: className = '',
		disabled = false,
		accept,
		multiple = false,
		onFilesPicked,
		announcement = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		onpointerdown: onPointerDownExternal,
		onmouseenter: onMouseEnterExternal,
		onmouseleave: onMouseLeaveExternal,
		ondragover: onDragOverExternal,
		ondragenter: onDragEnterExternal,
		ondragleave: onDragLeaveExternal,
		ondrop: onDropExternal,
		'aria-label': ariaLabel,
		...restProps
	}: DropzoneProps = $props();

	const resolvedId = untrack(() => id) ?? generatedId;

	let buttonRef: HTMLButtonElement | null = $state(null);
	let inputRef: HTMLInputElement | null = $state(null);
	let dragging = $state(false);
	let hovered = $state(false);
	let focused = $state(false);
	let focusVisible = $state(false);

	const acceptTokens = $derived(parseAccept(accept));
	const renderState = $derived.by<DropzoneRenderState>(() => ({
		dragging,
		focused,
		focusVisible,
		disabled
	}));

	$effect(() => {
		element = buttonRef;
	});

	$effect(() => {
		if (!disabled) return;
		dragging = false;
		hovered = false;
		focused = false;
		focusVisible = false;
	});

	function emitFiles(fileList: FileList | null) {
		if (!fileList) return;
		let files = Array.from(fileList).filter((file) => fileMatchesAccept(file, acceptTokens));
		if (!multiple) files = files.slice(0, 1);
		if (files.length === 0) return;
		onFilesPicked?.(files);
	}

	function dragHasFiles(event: DragEvent): boolean {
		const items = event.dataTransfer?.items;
		if (!items || items.length === 0) return Boolean(event.dataTransfer?.types.includes('Files'));
		return Array.from(items).some((item) => item.kind === 'file');
	}

	function openPicker() {
		inputRef?.click();
	}

	function handleClick() {
		if (disabled) return;
		openPicker();
	}

	function handleInputChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		emitFiles(input.files);
		// Reset so picking the same file again still fires `change`.
		input.value = '';
	}

	function handleDragOver(event: DragEvent) {
		if (disabled || !dragHasFiles(event)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
		dragging = true;
	}

	function handleDragEnter(event: DragEvent) {
		if (disabled || !dragHasFiles(event)) return;
		event.preventDefault();
		dragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		// Ignore leaves into a child element so the highlight doesn't flicker.
		if (event.currentTarget instanceof Node && event.relatedTarget instanceof Node) {
			if (event.currentTarget.contains(event.relatedTarget)) return;
		}
		dragging = false;
	}

	function handleDrop(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		dragging = false;
		emitFiles(event.dataTransfer?.files ?? null);
	}

	function handleFocus() {
		if (disabled) return;
		focused = true;
		focusVisible = shouldShowFocusVisible(buttonRef);
	}

	function handleBlur() {
		focused = false;
		focusVisible = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, buttonRef);
		focusVisible = focused ? true : shouldShowFocusVisible(buttonRef);
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, buttonRef);
		focusVisible = false;
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, buttonRef);
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

<button
	{...restProps}
	bind:this={buttonRef}
	id={resolvedId}
	type="button"
	{disabled}
	aria-label={ariaLabel}
	data-dropzone-root="true"
	data-disabled={disabled || undefined}
	data-drop-target={dragging || undefined}
	data-hovered={hovered || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	class={cn('outline-none', className)}
	onclick={composeEventHandlers(handleClick, onClickExternal ?? undefined)}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined)}
	onmouseenter={composeEventHandlers(handleMouseEnter, onMouseEnterExternal ?? undefined)}
	onmouseleave={composeEventHandlers(handleMouseLeave, onMouseLeaveExternal ?? undefined)}
	ondragover={composeEventHandlers(handleDragOver, onDragOverExternal ?? undefined)}
	ondragenter={composeEventHandlers(handleDragEnter, onDragEnterExternal ?? undefined)}
	ondragleave={composeEventHandlers(handleDragLeave, onDragLeaveExternal ?? undefined)}
	ondrop={composeEventHandlers(handleDrop, onDropExternal ?? undefined)}
>
	{#if children}
		{@render (children as Snippet<[DropzoneRenderState]>)(renderState)}
	{/if}
</button>

<input
	bind:this={inputRef}
	type="file"
	{accept}
	{multiple}
	tabindex={-1}
	aria-hidden="true"
	style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
	onchange={handleInputChange}
/>

<span
	role="status"
	aria-live="polite"
	aria-atomic="true"
	style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
	>{announcement}</span
>
