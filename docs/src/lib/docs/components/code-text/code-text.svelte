<script lang="ts">
	interface Props {
		/** A text in which the parts between backticks are code, as in Markdown and JSDoc. */
		text: string;
	}

	let { text }: Props = $props();

	// The parts at an odd index were between two backticks. A backtick without a pair stays text.
	const parts = $derived.by(() => {
		const out = text.split('`');
		if (out.length % 2 === 0) out.splice(-2, 2, `${out.at(-2)}\`${out.at(-1)}`);
		return out;
	});
</script>

{#each parts as part, i (i)}{#if i % 2}<code
			class="rounded bg-accent px-1 py-0.5 font-mono text-[0.85em] text-foreground">{part}</code
		>{:else}{part}{/if}{/each}
