<script lang="ts">
	import type { ProgressTrackProps } from '../types.js';
	import { useProgressContext } from '../root/context';

	/**
	 * Progress.Track — the full length of the task. The indicator fills a part of it.
	 *
	 * It is `position: relative` with `overflow: hidden`, thus the indicator takes its place in
	 * it with an inset, and an animated indeterminate indicator stays in it.
	 */
	let { children, class: className = '', style, ...restProps }: ProgressTrackProps = $props();

	const progress = useProgressContext('Progress.Track');
</script>

<div
	{...restProps}
	class={className}
	style="position: relative; overflow: hidden;{style ? ` ${style}` : ''}"
	data-progress-track="true"
	data-orientation={progress.orientation}
	data-progressing={progress.status === 'progressing' || undefined}
	data-complete={progress.status === 'complete' || undefined}
	data-indeterminate={progress.status === 'indeterminate' || undefined}
>
	{@render children?.()}
</div>
