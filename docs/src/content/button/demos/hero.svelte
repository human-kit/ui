<script lang="ts">
	import { Button } from '@human-kit/ui';

	let count = $state(0);
</script>

<Button.Root
	onclick={() => count++}
	class="inline-flex h-8 items-center justify-center gap-2 px-3 text-sm font-medium text-white outline-none transition-colors data-hovered:bg-neutral-700 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:data-hovered:bg-neutral-200 dark:data-focus-visible:outline-white bg-black"
>
	Clicked {count}
	{count === 1 ? 'time' : 'times'}
</Button.Root>
