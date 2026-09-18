<script lang="ts">
	import type { ProgressValueProps } from '../types.js';
	import { useProgressContext } from '../root/context';

	/**
	 * Progress.Value — the value as text, for the user.
	 *
	 * It is `aria-hidden`: the screen reader already gets the value from the progress bar, thus a
	 * second copy would read twice. Give it children to shape the text; without them, it shows
	 * the formatted value, and nothing while the progress is indeterminate.
	 */
	let { children, class: className = '', ...restProps }: ProgressValueProps = $props();

	const progress = useProgressContext('Progress.Value');
</script>

<span
	{...restProps}
	class={className}
	aria-hidden="true"
	data-progress-value="true"
	data-orientation={progress.orientation}
	data-progressing={progress.status === 'progressing' || undefined}
	data-complete={progress.status === 'complete' || undefined}
	data-indeterminate={progress.status === 'indeterminate' || undefined}
>
	{#if children}
		{@render children({
			formattedValue: progress.formattedValue,
			value: progress.value,
			status: progress.status
		})}
	{:else}
		{progress.formattedValue}
	{/if}
</span>
