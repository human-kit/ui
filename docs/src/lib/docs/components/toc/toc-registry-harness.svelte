<script lang="ts">
	// Test harness reproducing the docs shell: it provides the TOC registry (as a
	// layout would — surviving "navigation") and renders a reader (the TOC) plus a
	// single swappable content component. Clicking a "go-*" button swaps the page,
	// which — via `{#key}` — destroys the old registrant and creates the new one,
	// mirroring how `<data.content />` swaps on client-side navigation.
	import { untrack } from 'svelte';
	import {
		provideTocRegistry,
		getRegisteredHeadings,
		type RegisteredHeading
	} from './toc-registry.svelte.js';
	import Registrant from './toc-registry-registrant.svelte';

	interface Page {
		id: string;
		headings: RegisteredHeading[];
	}

	let { pages }: { pages: Page[] } = $props();

	provideTocRegistry();
	const readRegistered = getRegisteredHeadings();
	const registered = $derived(readRegistered());

	let currentId = $state(untrack(() => pages[0].id));
	const current = $derived(pages.find((p) => p.id === currentId) ?? pages[0]);
</script>

{#each pages as page (page.id)}
	<button type="button" onclick={() => (currentId = page.id)}>go-{page.id}</button>
{/each}

<ul data-testid="toc">
	{#each registered as heading (heading.id)}
		<li>{heading.text}</li>
	{/each}
</ul>

{#key current.id}
	<Registrant headings={current.headings} />
{/key}
