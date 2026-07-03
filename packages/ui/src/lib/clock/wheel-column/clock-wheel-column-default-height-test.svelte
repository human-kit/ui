<script lang="ts">
	import * as Clock from '../index.parts';

	let value = $state<string | null>('14:30');
</script>

<Clock.Root bind:value hourCycle={24} class="flex gap-2">
	{#snippet column(col)}
		<Clock.WheelColumn type={col.type} class="w-16" />
	{/snippet}
</Clock.Root>
