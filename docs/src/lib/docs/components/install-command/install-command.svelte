<script lang="ts">
	import { onMount } from 'svelte';
	import { Tabs } from '../tabs';
	import CopyButton from '../copy-button/copy-button.svelte';
	import { pm, loadStoredPm, persistPm } from './package-manager.svelte';
	import commands from '$lib/docs/install-commands.json';

	// Renders a package-manager tabbed install snippet (pnpm / npm / yarn / bun).
	// The commands are pre-highlighted with shiki (see scripts/gen-install.mjs), so
	// they read exactly like the code blocks — no hand-picked colours. The selected
	// manager is shared across every InstallCommand on the page.
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

	onMount(loadStoredPm);
	// persistPm reads pm.value, so this re-runs (and saves) whenever it changes.
	$effect(persistPm);
</script>

<Tabs.Root bind:value={pm.value} class="not-prose my-4">
	<Tabs.List class="justify-start!">
		{#each entries as m (m.id)}
			<Tabs.Tab value={m.id}>{m.id}</Tabs.Tab>
		{/each}
	</Tabs.List>
	{#each entries as m (m.id)}
		<Tabs.Panel value={m.id} class="flex items-center justify-between gap-3 px-2.5 py-1.5 pr-1.5">
			{#if m.html}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time shiki output from our own commands -->
				<span class="code shiki overflow-x-auto whitespace-pre">{@html m.html}</span>
			{:else}
				<span class="code overflow-x-auto whitespace-pre">{m.cmd}</span>
			{/if}
			<CopyButton text={m.cmd} label="Copy {m.id} command" />
		</Tabs.Panel>
	{/each}
</Tabs.Root>
