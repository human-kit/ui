<script lang="ts">
	import type { AvatarRootProps } from '../types.js';
	import { setAvatarContext, type AvatarContext, type AvatarStatus } from './context';

	/**
	 * Avatar.Root — a picture of a person or a thing, with a fallback for when the picture is
	 * not there.
	 *
	 * It holds the status of the image and gives it to the parts: `Avatar.Image` shows once the
	 * image is on the screen, and `Avatar.Fallback` shows while it is not. The root is a plain
	 * `<span>` with no role: the name is on the image as `alt`, or on the fallback as text.
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

<span
	{...restProps}
	bind:this={rootRef}
	class={className}
	data-avatar-root="true"
	data-status={status}
>
	{@render children?.()}
</span>
