<script lang="ts">
	import { DocsShell } from '$lib/docs/components/index.js';
	import Logo from '$lib/docs/components/icons/logo.svelte';
	import Npm from '$lib/docs/components/icons/npm.svelte';
	import { buttonVariants } from '$lib/docs/components/button/recipe';
	import { npmUrl, packageName, packageVersion } from '$lib/docs/package-meta.js';
	import { nav } from '$lib/docs/nav.js';

	let { children } = $props();
</script>

<!-- The npm href is an external URL, so it doesn't go through SvelteKit's
     resolve() (which is for internal routes). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<!-- `title` is no longer painted — with a brand snippet it becomes the home
     link's accessible name. -->
<DocsShell {nav} title="@human-kit/ui" githubUrl="https://github.com/human-kit/ui">
	{#snippet brand()}
		<Logo class="h-4 w-auto" />
	{/snippet}
	{#snippet actions()}
		<a
			href={npmUrl}
			target="_blank"
			rel="noreferrer"
			aria-label="{packageName} on npm — version {packageVersion}"
			class={buttonVariants({ variant: 'ghost', size: 'sm', class: 'font-mono' })}
		>
			<Npm />
			{packageVersion}
		</a>
	{/snippet}
	{@render children()}
</DocsShell>
