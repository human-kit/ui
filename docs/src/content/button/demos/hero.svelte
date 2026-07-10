<script lang="ts">
	import { Button } from '@human-kit/ui';

	let count = $state(0);
</script>

<Button.Root
	onclick={() => count++}
	class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors data-[hovered=true]:bg-blue-700 data-[pressed=true]:bg-blue-800 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[focus-visible=true]:ring-offset-2 dark:data-[focus-visible=true]:ring-offset-neutral-900"
>
	Clicked {count}
	{count === 1 ? 'time' : 'times'}
</Button.Root>
