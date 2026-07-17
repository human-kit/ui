<script lang="ts">
	import { onMount } from 'svelte';
	import { Tabs } from '@human-kit/ui';
	import CopyButton from '../copy-button/copy-button.svelte';
	import { buttonVariants } from '../button/recipe';
	import Surface from '../surface/surface.svelte';
	import Terminal from '../icons/terminal.svelte';
	import { pm, loadStoredPm, persistPm } from './package-manager.svelte';
	import commands from '$lib/docs/install-commands.json';

	// Renders a package-manager tabbed install snippet (pnpm / npm / yarn / bun).
	// The commands are pre-highlighted with shiki (see scripts/gen-install.mjs), so
	// they read exactly like the code blocks — no hand-picked colours. The selected
	// manager is shared across every InstallCommand on the page.
	//
	// Unlike the docs <Tabs>, this is a single <Surface> card: the managers are a
	// row of buttons in its header (terminal glyph left, copy right) rather than
	// folder tabs, so the snippet reads as one object instead of a tab + a panel.
	// Tabs.Root is only the context/spacing wrapper — the Surface is the card, so
	// its shade comes from the nesting depth and never from a `bg-depth-N` here.
	let { pkg }: { pkg: string } = $props();

	const MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const;
	const table = commands as Record<string, Record<string, { cmd: string; html: string }>>;

	// Fall back to a plain command if the data hasn't been regenerated for this pkg.
	const entries = $derived(
		MANAGERS.map((id) => {
			const hit = table[pkg]?.[id];
			const sub = id === 'npm' ? 'install' : 'add';
			return { id, cmd: hit?.cmd ?? `${id} ${sub} ${pkg}`, html: hit?.html ?? null };
		})
	);

	// The copy button lives in the header, so it copies whichever manager is active.
	const active = $derived(entries.find((m) => m.id === pm.value) ?? entries[0]);

	onMount(loadStoredPm);
	// persistPm reads pm.value, so this re-runs (and saves) whenever it changes.
	$effect(persistPm);
</script>

<Tabs.Root bind:value={pm.value} class="not-prose my-4 overflow-hidden rounded-xl border shadow-xs">
	<div class="flex items-center gap-2 border-b py-1.5 pr-1.5 pl-3">
		<Terminal class="size-4 text-muted-foreground" />

		<Tabs.List aria-label="Package manager" class="flex items-center gap-0.5">
			{#each entries as m (m.id)}
				<!-- Plain buttons: the `shadow` variant already reads `data-selected`
					     (which Tabs.Tab sets), so the active manager renders pressed —
					     sunken onto `--press-bg` — with no indicator to slide. -->
				<Tabs.Tab
					value={m.id}
					class={buttonVariants({ variant: 'shadow', size: 'sm', class: 'code' })}
				>
					{m.id}
				</Tabs.Tab>
			{/each}
		</Tabs.List>

		<CopyButton class="ml-auto" text={active.cmd} label="Copy {active.id} command" />
	</div>

	<!-- Only the command area is a <Surface>: the header keeps the ambient
	     surface, so the two read as separate planes rather than one tinted card.
	     The root clips, so this square-cornered box can't paint over the card's
	     rounded bottom edge. -->
	<Surface>
		{#each entries as m (m.id)}
			<Tabs.Panel
				value={m.id}
				class="px-3 py-1.5 ring-inset outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
			>
				{#if m.html}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time shiki output from our own commands -->
					<span class="code shiki block overflow-x-auto whitespace-pre">{@html m.html}</span>
				{:else}
					<span class="code block overflow-x-auto whitespace-pre">{m.cmd}</span>
				{/if}
			</Tabs.Panel>
		{/each}
	</Surface>
</Tabs.Root>
