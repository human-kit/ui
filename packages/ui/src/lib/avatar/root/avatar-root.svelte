<script lang="ts">
	import type { AvatarRootProps } from '../types.js';
	import { getAvatarGroupContext } from '../group/context';
	import { setAvatarContext, type AvatarContext, type AvatarStatus } from './context';

	/**
	 * Avatar.Root — a picture of a person or a thing, with a fallback for when the picture is
	 * not there.
	 *
	 * It holds the status of the image and gives it to the parts: `Avatar.Image` shows once the
	 * image is on the screen, and `Avatar.Fallback` shows while it is not. The root is a plain
	 * `<span>` with no role: the name is on the image as `alt`, or on the fallback as text.
	 *
	 * In an `Avatar.Group`, it takes a place in the order, and it renders nothing past the
	 * `max` of the group: a hidden avatar loads no image.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLSpanElement | null>(null),
		onStatusChange,
		...restProps
	}: AvatarRootProps = $props();

	let rootRef: HTMLSpanElement | null = $state(null);
	let status = $state<AvatarStatus>('loading');
	let alt = $state<string | undefined>(undefined);

	// Registered at creation, not in an effect: the place in the group must be known before the
	// first render, or an avatar past the limit would paint once and go.
	const group = getAvatarGroupContext();
	const groupId = $props.id();
	const unregister = group?.register(groupId);
	$effect(() => () => unregister?.());
	const index = $derived(group ? group.indexOf(groupId) : -1);
	const hidden = $derived(group !== undefined && index >= group.max);

	const context: AvatarContext = {
		get status() {
			return status;
		},
		setStatus(next) {
			if (status === next) return;
			status = next;
			onStatusChange?.(next);
		},
		get alt() {
			return alt;
		},
		setAlt(next) {
			alt = next;
		},
		get element() {
			return rootRef;
		}
	};

	setAvatarContext(context);

	$effect(() => {
		element = rootRef;
		return () => {
			element = null;
		};
	});
</script>

{#if !hidden}
	<span
		{...restProps}
		bind:this={rootRef}
		class={className}
		data-avatar-root="true"
		data-status={status}
		data-index={index < 0 ? undefined : index}
	>
		{@render children?.()}
	</span>
{/if}
