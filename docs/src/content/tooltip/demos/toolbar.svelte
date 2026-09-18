<script lang="ts">
	import { Tooltip } from '@human-kit/ui';

	const tools = [
		{ label: 'Bold', glyph: 'B', class: 'font-bold' },
		{ label: 'Italic', glyph: 'I', class: 'italic' },
		{ label: 'Underline', glyph: 'U', class: 'underline' },
		{ label: 'Strikethrough', glyph: 'S', class: 'line-through' }
	];
</script>

<Tooltip.Provider delay={400}>
	<div class="flex gap-1" role="toolbar" aria-label="Text format">
		{#each tools as tool (tool.label)}
			<Tooltip.Root>
				<Tooltip.Trigger
					aria-label={tool.label}
					class="inline-flex size-9 items-center justify-center border border-neutral-300 bg-white font-serif text-lg text-neutral-900 outline-none data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 data-[hovered=true]:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:data-[focus-visible=true]:outline-white dark:data-[hovered=true]:bg-neutral-800 {tool.class}"
				>
					{tool.glyph}
				</Tooltip.Trigger>
				<Tooltip.Content
					placement="bottom"
					class="bg-neutral-900 px-2 py-1 text-xs text-white transition-opacity duration-150 data-[entering=true]:opacity-0 data-[exiting=true]:opacity-0 dark:bg-white dark:text-neutral-900"
				>
					{tool.label}
				</Tooltip.Content>
			</Tooltip.Root>
		{/each}
	</div>
</Tooltip.Provider>
