<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Collapsible } from '../collapsible';
	import CopyButton from '../copy-button/copy-button.svelte';
	import { buttonVariants } from '../button/recipe';
	import Surface from '../surface/surface.svelte';
	import Code from '../icons/code.svelte';
	import { track } from '$lib/docs/telemetry';

	interface Props {
		source: { code: string; html: string };
		children: Snippet;
	}

	let { source, children }: Props = $props();

	let expanded = $state(false);

	// One event for each demo, not one for each click: the question is whether the
	// reader tried the component, and the answer does not become more true with
	// the second press. A plain variable, because no markup reads it.
	let interacted = false;

	// In the capture phase: a primitive inside the demo can stop a press from
	// going up, and the read of this signal must not depend on which one does.
	function onPreviewInteraction() {
		if (interacted) return;
		interacted = true;
		track('demo_interact');
	}
</script>

<div class="not-prose my-4 overflow-hidden rounded-xl border border-border">
	<!-- Preview -->
	<div
		class="flex min-h-48 items-center justify-center bg-surface p-4 sm:p-8"
		onpointerdowncapture={onPreviewInteraction}
		onkeydowncapture={onPreviewInteraction}
	>
		{@render children()}
	</div>

	<Collapsible.Root open={expanded} onOpenChange={(next) => (expanded = next)}>
		<!-- Toolbar: a Surface so its buttons elevate relative to it (no hand-picked bg). -->
		<Surface level={1} class="flex items-center justify-end gap-1 border-t p-1">
			<CopyButton text={source.code} label="Copy source code" source="demo-source" />
			<Collapsible.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
				<Code />
				{expanded ? 'Hide code' : 'Show code'}
			</Collapsible.Trigger>
		</Surface>

		<!-- Source. Open/close animation: animate the measured panel height (the
		     primitive exposes it as `--collapsible-panel-height`) plus a fade, driven
		     by `data-starting-style` / `data-ending-style`. The scroll cap lives on the
		     inner content (see the style block) so the measured height stays bounded. -->
		<!-- The height+fade animation is baked into the wrapper's Panel; only the
		     demo-specific type + border are added here. -->
		<Collapsible.Panel class="demo-source border-t text-[0.8125rem] leading-relaxed">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time shiki output, not user input -->
			{@html source.html}
		</Collapsible.Panel>
	</Collapsible.Root>
</div>

<style>
	/* The code block is the scroll container (both axes) and carries the height
	   cap, so long lines scroll horizontally and tall code scrolls vertically. This
	   also bounds the measured height the collapse animates to. */
	:global(.demo-source pre.shiki) {
		margin: 0;
		padding: 1rem;
		max-height: 24rem;
		overflow: auto;
		/* The demo card already provides the border + rounded corners; the code
		   fills the panel flush, with no border or radius of its own. */
		border: 0;
		border-radius: 0;
	}
</style>
