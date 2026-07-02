<script lang="ts">
	import type { Snippet } from 'svelte';
	import { writable } from 'svelte/store';
	import { setLocaleContext } from './context';

	type LocaleProviderProps = {
		locale?: string;
		children?: Snippet;
	};

	let props: LocaleProviderProps = $props();

	// svelte-ignore state_referenced_locally
	const localeStore = writable<string | undefined>(props.locale);
	setLocaleContext({ locale: localeStore });

	$effect(() => {
		localeStore.set(props.locale);
	});
</script>

{#if props.children}
	{@render props.children()}
{/if}
