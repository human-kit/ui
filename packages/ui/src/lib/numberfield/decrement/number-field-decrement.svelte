<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import NumberFieldStepper from '../internal/number-field-stepper.svelte';

	type NumberFieldDecrementProps = HTMLButtonAttributes & {
		class?: string;
		children?: Snippet;
	};

	let props: NumberFieldDecrementProps = $props();
</script>

<NumberFieldStepper {...props} direction={-1} />
