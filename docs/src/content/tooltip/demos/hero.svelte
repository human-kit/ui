<script lang="ts">
	import { Tooltip } from '@human-kit/ui';
</script>

<Tooltip.Root>
	<Tooltip.Trigger
		aria-label="Bold"
		class="inline-flex size-9 items-center justify-center border border-neutral-300 bg-white font-serif text-lg font-bold text-neutral-900 outline-none data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 data-[hovered=true]:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:data-[focus-visible=true]:outline-white dark:data-[hovered=true]:bg-neutral-800"
	>
		B
	</Tooltip.Trigger>
	<Tooltip.Content
		class="bg-neutral-900 px-2 py-1 text-xs text-white transition-opacity duration-150 data-[entering=true]:opacity-0 data-[exiting=true]:opacity-0 dark:bg-white dark:text-neutral-900"
	>
		Bold
		<Tooltip.Arrow
			class="size-2 rotate-45 bg-neutral-900 data-[placement=bottom]:-top-1 data-[placement=left]:-right-1 data-[placement=right]:-left-1 data-[placement=top]:-bottom-1 dark:bg-white"
		/>
	</Tooltip.Content>
</Tooltip.Root>
