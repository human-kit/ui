<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Checkbox } from '@human-kit/ui';

	let checked = $state(true);
	// Controlled: passing `checked` makes the primitive controlled, so it reports
	// changes through onCheckedChange rather than writing back. A bare `bind:checked`
	// with a defined initial value looks two-way but freezes — the component treats
	// the initial value as "controlled" and never self-updates.
</script>

<!-- Label is a sibling tied by `for`, NOT a wrapper. Wrapping the control in a
     <label> double-toggles it: the control clicks its own hidden input, and the
     enclosing label forwards a second click to that same input, so the two cancel. -->
<div class="flex items-center gap-2">
	<Checkbox.Root
		id="terms"
		{checked}
		onCheckedChange={(next) => (checked = next)}
		class="touch-target inline-flex size-4 shrink-0 items-center justify-center border border-neutral-300 bg-white text-white outline-none transition-colors data-[checked=true]:border-neutral-900 data-[checked=true]:bg-neutral-900 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-900 dark:data-[checked=true]:border-white dark:data-[checked=true]:bg-white dark:data-[focus-visible=true]:outline-white"
	>
		<Checkbox.Indicator class="contents">
			<CheckIcon class="size-3" />
		</Checkbox.Indicator>
	</Checkbox.Root>
	<label for="terms" class="cursor-pointer text-sm text-neutral-900 select-none dark:text-white"
		>Accept terms and conditions</label
	>
</div>
