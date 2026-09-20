<script lang="ts">
	import { Avatar, type AvatarStatus } from '@human-kit/ui';

	const portrait =
		'data:image/svg+xml;utf8,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#fde68a"/><circle cx="40" cy="32" r="14" fill="#b45309"/><path d="M12 80c0-16 12-26 28-26s28 10 28 26z" fill="#b45309"/></svg>'
		);

	let status = $state<AvatarStatus>('loading');
	let src = $state<string | null>(portrait);

	const buttonClass =
		'border border-neutral-300 px-3 py-1 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800';
</script>

<div class="flex flex-wrap items-center gap-4 text-sm text-neutral-900 dark:text-white">
	<Avatar.Root
		class="inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-neutral-200 align-middle data-[status=error]:bg-red-100 dark:bg-neutral-800 dark:data-[status=error]:bg-red-950"
		onStatusChange={(next) => (status = next)}
	>
		<Avatar.Image {src} alt="Mary Jackson" class="size-full object-cover" />
		<Avatar.Fallback delay={600} class="font-medium text-neutral-700 dark:text-neutral-200">
			MJ
		</Avatar.Fallback>
	</Avatar.Root>
	<span class="w-28 tabular-nums">status: {status}</span>
	<button type="button" class={buttonClass} onclick={() => (src = portrait)}>Good source</button>
	<button type="button" class={buttonClass} onclick={() => (src = '/no-such-portrait.jpg')}>
		Bad source
	</button>
</div>
