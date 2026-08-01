<script lang="ts">
	import { Calendar } from '@human-kit/ui';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let value = $state('');
</script>

<div class="flex flex-col items-center gap-3">
	<!-- Mirrors the DatePicker popover calendar exactly (same nav, grid, and cells),
	     just standalone inside its own card. -->
	<Calendar.Root
		bind:value
		selectionMode="single"
		class="w-fit border border-neutral-200 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-900"
	>
		<div class="flex items-center justify-between gap-2 p-2 [&_h2]:m-0">
			<Calendar.TriggerPrevious
				class="inline-flex size-8 items-center justify-center text-neutral-600 outline-none transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
			>
				<ChevronLeft class="size-4" />
			</Calendar.TriggerPrevious>
			<Calendar.Heading class="text-sm font-medium text-neutral-900 dark:text-white" />
			<Calendar.TriggerNext
				class="inline-flex size-8 items-center justify-center text-neutral-600 outline-none transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
			>
				<ChevronRight class="size-4" />
			</Calendar.TriggerNext>
		</div>
		<!-- Resets what this inline calendar inherits from .hd-prose (the DatePicker
		     calendar escapes it via its portal): cell padding, which was blowing each
		     cell up to 56px, and the td/th bottom borders, which drew a rule under
		     every week. The header's `[&_h2]:m-0` kills the prose h2 margin that was
		     pushing the month title below the nav buttons. -->
		<Calendar.Grid
			class="border-separate border-spacing-1 px-2 pb-2 [&_td]:border-0 [&_td]:p-0 [&_th]:border-0 [&_th]:p-0"
		>
			<Calendar.GridHeader>
				{#snippet children(day)}
					<Calendar.HeaderCell
						class="size-8 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
					>
						{day}
					</Calendar.HeaderCell>
				{/snippet}
			</Calendar.GridHeader>
			<Calendar.GridBody>
				{#snippet children(date)}
					<Calendar.BodyCell
						{date}
						class="inline-flex size-8 items-center justify-center align-middle text-sm text-neutral-900 outline-none transition-colors hover:bg-neutral-100 data-outside-month:opacity-40 data-selected:bg-neutral-900 data-selected:text-white dark:text-neutral-100 dark:hover:bg-neutral-800 dark:data-selected:bg-white dark:data-selected:text-neutral-900"
					/>
				{/snippet}
			</Calendar.GridBody>
		</Calendar.Grid>
	</Calendar.Root>
</div>
