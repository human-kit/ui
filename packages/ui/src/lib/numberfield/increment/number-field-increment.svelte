<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import NumberFieldStepper from '../internal/number-field-stepper.svelte';

	type NumberFieldIncrementProps = HTMLButtonAttributes & {
		class?: string;
		children?: Snippet;
	};

	let props: NumberFieldIncrementProps = $props();
</script>

<NumberFieldStepper {...props} direction={1} />
