<script lang="ts">
	import { Avatar } from '@human-kit/ui';

	// A drawn portrait, thus the demo needs no file and no person.
	const portrait =
		'data:image/svg+xml;utf8,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#c7d2fe"/><circle cx="40" cy="32" r="14" fill="#4338ca"/><path d="M12 80c0-16 12-26 28-26s28 10 28 26z" fill="#4338ca"/></svg>'
		);

	const rootClass =
		'inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-neutral-200 align-middle dark:bg-neutral-800';
	const fallbackClass = 'text-sm font-medium text-neutral-700 dark:text-neutral-200';
</script>

<div class="flex items-center gap-4">
	<Avatar.Root class={rootClass}>
		<Avatar.Image src={portrait} alt="Ada Lovelace" class="size-full object-cover" />
		<Avatar.Fallback delay={600} class={fallbackClass}>AL</Avatar.Fallback>
	</Avatar.Root>

	<Avatar.Root class={rootClass}>
		<Avatar.Image src="/no-such-portrait.jpg" alt="Grace Hopper" class="size-full object-cover" />
		<Avatar.Fallback class={fallbackClass}>GH</Avatar.Fallback>
	</Avatar.Root>

	<Avatar.Root class={rootClass}>
		<Avatar.Image src={null} alt="Katherine Johnson" />
		<Avatar.Fallback class={fallbackClass}>KJ</Avatar.Fallback>
	</Avatar.Root>
</div>
