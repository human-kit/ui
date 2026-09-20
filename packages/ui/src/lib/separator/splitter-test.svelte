<script lang="ts">
	import Separator from './separator.svelte';
	import type { SeparatorOrientation } from './types.js';

	let {
		orientation = 'vertical',
		min = 0,
		max = 100,
		step = 1,
		largeStep = 10,
		disabled = false,
		dir = 'ltr',
		onValueChange
	}: {
		orientation?: SeparatorOrientation;
		min?: number;
		max?: number;
		step?: number;
		largeStep?: number;
		disabled?: boolean;
		dir?: 'ltr' | 'rtl';
		onValueChange?: (value: number) => void;
	} = $props();

	let value = $state(40);
</script>

<button type="button" data-testid="before">Before</button>
<div
	{dir}
	data-testid="container"
	style="display: flex; flex-direction: {orientation === 'vertical'
		? 'row'
		: 'column'}; width: 400px; height: 400px;"
>
	<div id="pane" style="flex: 0 0 {value}%;">Pane</div>
	<Separator
		{orientation}
		bind:value
		{min}
		{max}
		{step}
		{largeStep}
		{disabled}
		{onValueChange}
		aria-label="Resize the pane"
		aria-controls="pane"
		data-testid="splitter"
		style="flex: 0 0 8px; background: gray;"
	/>
	<div style="flex: 1;">Rest</div>
</div>
<span data-testid="value">{value}</span>
