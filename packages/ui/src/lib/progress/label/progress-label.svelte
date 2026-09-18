<script lang="ts">
	import type { ProgressLabelProps } from '../types.js';
	import { useProgressContext } from '../root/context';

	/**
	 * Progress.Label — the name of the task.
	 *
	 * It registers its id with the root, which gives it to the progress bar as `aria-labelledby`.
	 * A bare text beside the bar leaves the bar unnamed: a `role="progressbar"` takes its name
	 * from `aria-labelledby` or `aria-label`, never from the text near it. It renders a `<span>`
	 * and not a `<label>`, because a `<label>` names a form control, and a progress bar is none.
	 */
	let { children, class: className = '', id: idProp, ...restProps }: ProgressLabelProps = $props();

	const progress = useProgressContext('Progress.Label');
	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => progress.registerLabel(id));
</script>

<span
	{...restProps}
	{id}
	class={className}
	data-progress-label="true"
	data-orientation={progress.orientation}
	data-progressing={progress.status === 'progressing' || undefined}
	data-complete={progress.status === 'complete' || undefined}
	data-indeterminate={progress.status === 'indeterminate' || undefined}
>
	{@render children?.()}
</span>
