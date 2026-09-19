<script lang="ts">
	import { untrack } from 'svelte';
	import type { AvatarImageProps } from '../types.js';
	import { useAvatarContext } from '../root/context';

	/**
	 * Avatar.Image — the picture.
	 *
	 * It loads the image off the screen first, and it renders the `<img>` once the image is
	 * there: a broken image icon, or a blank box, never shows. Without a `src`, or when the
	 * image fails, the status is `error` and `Avatar.Fallback` shows in its place. With
	 * `loading="lazy"`, the load waits for the root to come into view.
	 */
	let {
		src,
		alt,
		loading = 'eager',
		class: className = '',
		element = $bindable<HTMLImageElement | null>(null),
		crossorigin,
		referrerpolicy,
		...restProps
	}: AvatarImageProps = $props();

	const avatar = useAvatarContext('Avatar.Image');

	let imageRef: HTMLImageElement | null = $state(null);

	// The fallback takes the name of the image, thus a failed image is not a nameless avatar.
	$effect(() => {
		const name = alt;
		untrack(() => avatar.setAlt(name));
		return () => avatar.setAlt(undefined);
	});

	$effect(() => {
		element = imageRef;
		return () => {
			element = null;
		};
	});

	// A lazy image waits for the root to come into view. Without an observer, it loads at once.
	let inView = $state(false);
	$effect(() => {
		const root = avatar.element;
		if (loading !== 'lazy' || !root || typeof IntersectionObserver === 'undefined') {
			inView = true;
			return;
		}
		inView = false;
		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				inView = true;
				observer.disconnect();
			}
		});
		observer.observe(root);
		return () => observer.disconnect();
	});

	// The status is set in `untrack`: the setter reads the status to skip a repeat, and a read
	// here would make the load depend on its own result.
	$effect(() => {
		const source = src;
		if (!source) {
			untrack(() => avatar.setStatus('error'));
			return;
		}
		if (!inView) {
			untrack(() => avatar.setStatus('loading'));
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
