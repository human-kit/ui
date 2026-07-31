<script lang="ts">
	import { Switch } from '@human-kit/ui';

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
	<Switch.Root
		id="notifications"
		{checked}
		onCheckedChange={(next) => (checked = next)}
		class="touch-target group inline-flex h-4.5 w-7.5 shrink-0 cursor-pointer items-center border border-neutral-300 bg-neutral-200 p-0.5 outline-none transition-colors data-[checked=true]:border-neutral-900 data-[checked=true]:bg-neutral-900 data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-700 dark:data-[checked=true]:border-white dark:data-[checked=true]:bg-white dark:data-[focus-visible=true]:outline-white"
	>
		<Switch.Thumb
			class="block size-3 bg-white transition-transform group-data-[checked=true]:translate-x-3 dark:bg-neutral-900"
		/>
	</Switch.Root>
	<label
		for="notifications"
		class="cursor-pointer text-sm text-neutral-900 select-none dark:text-white"
		>Enable notifications</label
	>
</div>
