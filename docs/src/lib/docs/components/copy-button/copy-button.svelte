<script lang="ts">
	import Button from '../button/button.svelte';
	import Check from '../icons/check.svelte';
	import Copy from '../icons/copy.svelte';
	import { track } from '$lib/docs/telemetry';
	import type { ButtonSize, ButtonVariant } from '../button/recipe';

	// Reusable copy-to-clipboard button built on the docs Button component. Shows a
	// check for a moment after copying (and disables itself so it can't re-fire).
	//
	// Every copy on the site goes through this button, so the `copy` event is sent
	// from here: one place, and no call site can forget it.
	interface Props {
		text: string;
		label?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		/**
		 * What the reader copied, for the telemetry: a code block of a guide, the
		 * source of a demo, an install command. A button with no source sends no
		 * event.
		 */
		source?: 'code-block' | 'demo-source' | 'install-command';
		/** More about the copy, e.g. which package manager the command was for. */
		detail?: string;
	}

	let {
		text,
		label = 'Copy',
		variant = 'ghost',
		size = 'icon-sm',
		class: className = '',
		source,
		detail
	}: Props = $props();

	let copied = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;
		clearTimeout(timeout);
		timeout = setTimeout(() => (copied = false), 1500);
		// After the write: a copy that the browser refused is not a copy.
		if (source) track('copy', { source, detail: detail ?? null });
	}
</script>

<Button {variant} {size} class={className} onclick={copy} aria-label={copied ? 'Copied' : label}>
	{#if copied}
		<Check />
	{:else}
		<Copy />
	{/if}
</Button>
