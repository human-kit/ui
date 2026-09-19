<script lang="ts">
	import { untrack } from 'svelte';
	import type { AvatarImageProps } from '../types.js';
	import { useAvatarContext } from '../root/context';

	/**
	 * Avatar.Image — the picture.
	 *
	 * It loads the image off the screen first, and it renders the `<img>` once the image is
	 * there: a broken image icon, or a blank box, never shows. Without a `src`, or when the
	 * image fails, the status is `error` and `Avatar.Fallback` shows in its place.
	 */
	let {
		src,
		alt,
		class: className = '',
		element = $bindable<HTMLImageElement | null>(null),
		crossorigin,
		referrerpolicy,
		...restProps
	}: AvatarImageProps = $props();

	const avatar = useAvatarContext('Avatar.Image');

	let imageRef: HTMLImageElement | null = $state(null);

	$effect(() => {
		element = imageRef;
		return () => {
			element = null;
		};
	});

	// The status is set in `untrack`: the setter reads the status to skip a repeat, and a read
	// here would make the load depend on its own result.
	$effect(() => {
		const source = src;
		if (!source) {
			untrack(() => avatar.setStatus('error'));
			return;
		}
		// The same request the `<img>` makes, thus the browser serves the `<img>` from its cache.
		const loader = new Image();
		if (crossorigin !== undefined && crossorigin !== null) loader.crossOrigin = crossorigin;
		if (referrerpolicy) loader.referrerPolicy = referrerpolicy;
		loader.onload = () => avatar.setStatus('loaded');
		loader.onerror = () => avatar.setStatus('error');
		loader.src = source;
		// An image from the cache is complete at once: no `loading` frame for the fallback.
		untrack(() => {
			if (loader.complete && loader.naturalWidth > 0) avatar.setStatus('loaded');
			else avatar.setStatus('loading');
		});
		return () => {
			loader.onload = null;
			loader.onerror = null;
		};
	});
</script>

{#if avatar.status === 'loaded' && src}
	<img
		{...restProps}
		bind:this={imageRef}
		{src}
		{alt}
		{crossorigin}
		{referrerpolicy}
		class={className}
		data-avatar-image="true"
	/>
{/if}
