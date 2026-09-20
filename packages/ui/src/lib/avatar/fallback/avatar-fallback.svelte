<script lang="ts">
	import type { AvatarFallbackProps } from '../types.js';
	import { useAvatarContext } from '../root/context';

	/**
	 * Avatar.Fallback — what shows in place of the image: initials, an icon, a color.
	 *
	 * It shows while the image is not on the screen. `delay` holds it back while the image
	 * loads, thus a fast image does not flash a fallback first. It shows at once when the image
	 * fails, or when there is no image.
	 *
	 * It takes the name of the image: with an `alt` on `Avatar.Image`, the fallback is a
	 * `role="img"` with that `alt` as its name, thus a screen reader hears "Ada Lovelace" and not
	 * the letters of her initials. An empty `alt` makes the fallback decorative, the same as it
	 * makes the image.
	 */
	let {
		children,
		class: className = '',
		delay = 0,
		element = $bindable<HTMLSpanElement | null>(null),
		...restProps
	}: AvatarFallbackProps = $props();

	const avatar = useAvatarContext('Avatar.Fallback');

	let fallbackRef: HTMLSpanElement | null = $state(null);
	// True once `delay` has passed since the load started. It resets with each load.
	let delayPassed = $state(false);

	$effect(() => {
		element = fallbackRef;
		return () => {
			element = null;
		};
	});

	$effect(() => {
		if (avatar.status !== 'loading' || delay <= 0) return;
		delayPassed = false;
		const timer = setTimeout(() => {
			delayPassed = true;
		}, delay);
		return () => clearTimeout(timer);
	});

	const shown = $derived(
		avatar.status === 'error' || (avatar.status === 'loading' && (delay <= 0 || delayPassed))
	);
	// `undefined` without an image: the fallback is then the content, with no name of its own.
	const name = $derived(avatar.alt);
</script>

{#if shown}
	<span
		{...restProps}
		bind:this={fallbackRef}
		role={name ? 'img' : undefined}
		aria-label={name || undefined}
		aria-hidden={name === '' ? 'true' : undefined}
		class={className}
		data-avatar-fallback="true"
		data-status={avatar.status}
	>
		{@render children?.()}
	</span>
{/if}
