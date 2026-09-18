<script lang="ts">
	import type { ProgressIndicatorProps } from '../types.js';
	import { useProgressContext } from '../root/context';

	/**
	 * Progress.Indicator — the part of the track that the task has done.
	 *
	 * It sizes itself to the percentage: the width from the start edge of a horizontal track, and
	 * the height from the bottom of a vertical one. The start edge follows the direction of the
	 * text, thus a right-to-left page fills from the right. An indeterminate progress gets no
	 * size: your CSS animates it.
	 */
	let { children, class: className = '', style, ...restProps }: ProgressIndicatorProps = $props();

	const progress = useProgressContext('Progress.Indicator');

	const sizeStyle = $derived.by(() => {
		if (progress.percent === null) return '';
		if (progress.orientation === 'vertical') {
			return `position: absolute; inset-inline: 0; bottom: 0; height: ${progress.percent}%;`;
		}
		return `position: absolute; inset-block: 0; inset-inline-start: 0; width: ${progress.percent}%;`;
	});
</script>

<div
	{...restProps}
	class={className}
	style="{sizeStyle}{style ? ` ${style}` : ''}"
	data-progress-indicator="true"
	data-orientation={progress.orientation}
	data-progressing={progress.status === 'progressing' || undefined}
	data-complete={progress.status === 'complete' || undefined}
	data-indeterminate={progress.status === 'indeterminate' || undefined}
>
	{@render children?.()}
</div>
