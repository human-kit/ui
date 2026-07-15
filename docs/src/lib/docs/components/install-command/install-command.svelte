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

	// Split "pnpm add <pkg>" so the command and the package can be coloured apart.
	function split(cmd: string) {
		const i = cmd.lastIndexOf(' ');
		return { command: cmd.slice(0, i), pkg: cmd.slice(i + 1) };
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
			<span class="overflow-x-auto text-[0.8125rem] whitespace-nowrap">
				<span class="text-muted-foreground">{parts.command} </span><span
					class="text-blue-600 dark:text-blue-400">{parts.pkg}</span
				>
			</span>
			<CopyButton text={m.cmd} label="Copy {m.id} command" />
		</Tabs.Panel>
	{/each}
</Tabs.Root>
