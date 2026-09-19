<script lang="ts">
	import { Avatar } from '../index';
	import type { AvatarStatus } from '../index';

	let {
		src = undefined,
		alt = 'Ada Lovelace',
		delay = 0,
		onStatusChange
	}: {
		src?: string | null;
		alt?: string;
		delay?: number;
		onStatusChange?: (status: AvatarStatus) => void;
	} = $props();

	let image = $state<HTMLImageElement | null>(null);
	let fallback = $state<HTMLSpanElement | null>(null);
</script>

<Avatar.Root data-testid="root" class="avatar" {onStatusChange}>
	<Avatar.Image {src} {alt} data-testid="image" class="image" bind:element={image} />
	<Avatar.Fallback {delay} data-testid="fallback" class="fallback" bind:element={fallback}>
		AL
	</Avatar.Fallback>
</Avatar.Root>
<span data-testid="image-tag">{image?.tagName ?? 'none'}</span>
<span data-testid="fallback-tag">{fallback?.tagName ?? 'none'}</span>
