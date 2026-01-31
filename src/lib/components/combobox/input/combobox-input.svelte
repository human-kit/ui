<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { useComboBoxContext } from '../root/context';
	import { cn } from '$lib/utils/cn';

	type ComboBoxInputProps = HTMLInputAttributes & {
		class?: string;
	};

	let { class: className, ...restProps }: ComboBoxInputProps = $props();

	let inputRef: HTMLInputElement | null = $state(null);
	const ctx = useComboBoxContext();

	$effect(() => {
		if (inputRef) {
			ctx.setInputRef(inputRef);
			ctx.setTriggerRef(inputRef);
		}
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		ctx.setInputValue(target.value);
		// Open on input if trigger is 'input' (default) or 'focus'
		if (!ctx.isOpen && target.value.length > 0 && ctx.trigger !== 'press') {
			ctx.open();
		}
	}

	function handleFocus() {
		// Open on focus if trigger is 'focus'
		// Use a small delay to avoid opening immediately on programmatic focus
		// (e.g., from a focus trap). This gives time for refs to be set up.
		if (ctx.trigger === 'focus' && !ctx.isOpen) {
			requestAnimationFrame(() => {
				if (ctx.trigger === 'focus' && !ctx.isOpen) {
					ctx.open();
				}
			});
		}
	}

	function handleMouseDown() {
		// Open on press if trigger is 'press'
		if (ctx.trigger === 'press' && !ctx.isOpen && !ctx.isDisabled && !ctx.isReadOnly) {
			ctx.open();
		}
	}

	function handleBlur() {
		// Restore selection label or deselect if empty
		ctx.handleInputBlur();
	}
</script>

<input
	bind:this={inputRef}
	type="text"
	role="combobox"
	aria-autocomplete="list"
	aria-expanded={ctx.isOpen}
	aria-haspopup="listbox"
	aria-controls={`combobox-listbox-${ctx.instanceId}`}
	aria-activedescendant={ctx.focusedItemId !== null
		? `combobox-item-${ctx.instanceId}-${ctx.focusedItemId}`
		: undefined}
	value={ctx.displayValue}
	disabled={ctx.isDisabled}
	readonly={ctx.isReadOnly}
	oninput={handleInput}
	onfocus={handleFocus}
	onmousedown={handleMouseDown}
	onblur={handleBlur}
	onkeydown={ctx.handleKeydown}
	class={cn(
		'bg-depth-2 sunken placeholder:text-muted-foreground hover:bg-depth-1 focus:ring-border h-8 w-full rounded-xs border px-2 text-sm shadow-xs transition-all ease-out outline-none focus:ring focus:ring-offset-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
/>
