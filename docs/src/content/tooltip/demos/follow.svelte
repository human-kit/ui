<script lang="ts">
	import { Tooltip } from '@human-kit/ui';
</script>

<Tooltip.Root>
	<Tooltip.Trigger
		aria-label="Progress: 8 of 12 steps"
		class="block h-3 w-72 border border-neutral-300 bg-neutral-200 outline-none data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-700 dark:data-[focus-visible=true]:outline-white"
	>
		<span class="block h-full w-2/3 bg-neutral-900 dark:bg-white"></span>
	</Tooltip.Trigger>
	<Tooltip.Content
		followPointer="x"
		class="bg-neutral-900 px-2 py-1 text-xs whitespace-nowrap text-white dark:bg-white dark:text-neutral-900"
	>
		8 of 12 steps
	</Tooltip.Content>
</Tooltip.Root>
