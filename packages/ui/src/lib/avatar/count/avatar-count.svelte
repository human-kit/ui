<script lang="ts">
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import type { AvatarCountProps } from '../types.js';
	import { useAvatarGroupContext } from '../group/context';

	/**
	 * Avatar.Count — the count of avatars past the `max` of the group, such as `+3`.
	 *
	 * It renders only while the group has more avatars than it shows. The screen reader hears
	 * "3 more", in the locale of `LocaleProvider`, and not "plus three".
	 */
	let {
		children,
		class: className = '',
		'aria-label': ariaLabelProp,
		element = $bindable<HTMLSpanElement | null>(null),
		...restProps
	}: AvatarCountProps = $props();

	const group = useAvatarGroupContext('Avatar.Count');

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;
	const ariaLabel = $derived(
		ariaLabelProp ?? resolveLocalizedString($localeStore, 'avatar.more', { count: group.overflow })
	);

	let countRef: HTMLSpanElement | null = $state(null);

	$effect(() => {
		element = countRef;
		return () => {
			element = null;
		};
	});
</script>

{#if group.overflow > 0}
	<span
		{...restProps}
		bind:this={countRef}
		role="img"
		aria-label={ariaLabel}
		class={className}
		data-avatar-count="true"
	>
		{#if children}
			{@render children({ overflow: group.overflow, count: group.count, max: group.max })}
		{:else}
			+{group.overflow}
		{/if}
	</span>
{/if}
