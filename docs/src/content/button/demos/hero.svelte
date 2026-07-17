<script lang="ts">
	import { Button } from '@human-kit/ui';

	let count = $state(0);
</script>

<Button.Root
	onclick={() => count++}
	class="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 text-sm font-medium text-white outline-none transition-colors data-[hovered=true]:bg-neutral-700 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:data-[hovered=true]:bg-neutral-200 dark:data-[focus-visible=true]:outline-white"
>
	Clicked {count}
	{count === 1 ? 'time' : 'times'}
</Button.Root>
