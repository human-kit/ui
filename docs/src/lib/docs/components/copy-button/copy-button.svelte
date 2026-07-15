<script lang="ts">
	import Button from '../button/button.svelte';
	import Check from '../icons/check.svelte';
	import Copy from '../icons/copy.svelte';
	import type { ButtonSize, ButtonVariant } from '../button/recipe';

	// Reusable copy-to-clipboard button built on the docs Button component. Shows a
	// check for a moment after copying (and disables itself so it can't re-fire).
	interface Props {
		text: string;
		label?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
	}

	let {
		text,
		label = 'Copy',
		variant = 'ghost',
		size = 'icon-sm',
		class: className = ''
	}: Props = $props();

	let copied = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;
		clearTimeout(timeout);
		timeout = setTimeout(() => (copied = false), 1500);
	}
</script>

<Button {variant} {size} class={className} onclick={copy} aria-label={copied ? 'Copied' : label}>
	{#if copied}
		<Check />
	{:else}
		<Copy />
	{/if}
</Button>
