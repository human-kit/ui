<script lang="ts">
	import { onMount } from 'svelte';
	import { Tabs } from '../tabs';
	import CopyButton from '../copy-button/copy-button.svelte';
	import { pm, loadStoredPm, persistPm } from './package-manager.svelte';

	// Renders a package-manager tabbed install snippet (pnpm / npm / yarn / bun).
	// The selected manager is shared across every InstallCommand on the page.
	let { pkg }: { pkg: string } = $props();

	const managers = $derived([
		{ id: 'pnpm', cmd: `pnpm add ${pkg}` },
		{ id: 'npm', cmd: `npm install ${pkg}` },
		{ id: 'yarn', cmd: `yarn add ${pkg}` },
		{ id: 'bun', cmd: `bun add ${pkg}` }
	]);

	onMount(loadStoredPm);
	// persistPm reads pm.value, so this re-runs (and saves) whenever it changes.
	$effect(persistPm);

	// Split "pnpm add <pkg>" into the command name and the rest (keeping the space),
	// so each can take the shiki bash colours the code blocks use.
	function split(cmd: string) {
		const i = cmd.indexOf(' ');
		return { name: cmd.slice(0, i), rest: cmd.slice(i) };
	}
</script>

<Tabs.Root bind:value={pm.value} class="not-prose my-4">
	<Tabs.List class="justify-start!">
		{#each managers as m (m.id)}
			<Tabs.Tab value={m.id}>{m.id}</Tabs.Tab>
		{/each}
	</Tabs.List>
	{#each managers as m (m.id)}
		{@const parts = split(m.cmd)}
		<Tabs.Panel value={m.id} class="flex items-center justify-between gap-3 px-2.5 py-1.5">
			<code class="install-code overflow-x-auto"
				><span class="tok-cmd">{parts.name}</span><span class="tok-arg">{parts.rest}</span></code
			>
			<CopyButton text={m.cmd} label="Copy {m.id} command" />
		</Tabs.Panel>
	{/each}
</Tabs.Root>

<style>
	.install-code {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.8125rem;
		white-space: pre;
	}
	/* Shiki github-theme colours for a bash command (command name / arguments), so
	   install snippets read exactly like the highlighted code blocks. */
	.tok-cmd {
		color: #6f42c1;
	}
	.tok-arg {
		color: #032f62;
	}
	:global(.dark) .tok-cmd {
		color: #b392f0;
	}
	:global(.dark) .tok-arg {
		color: #9ecbff;
	}
</style>
