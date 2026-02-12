<script lang="ts">
	import type { Snippet } from 'svelte';
	import { writable } from 'svelte/store';
	import { setLocaleContext } from './context';

	type LocaleProviderProps = {
		locale?: string;
		children?: Snippet;
	};

	let { locale, children }: LocaleProviderProps = $props();

	const localeStore = writable<string | undefined>(undefined);
	setLocaleContext({ locale: localeStore });

	$effect(() => {
		localeStore.set(locale);
	});
</script>

{#if children}
	{@render children()}
{/if}
