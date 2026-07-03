<script lang="ts">
	import * as Clock from '../index.parts';

	let value = $state<string | null>('14:30');
</script>

<Clock.Root bind:value hourCycle={24} class="flex gap-2">
	{#snippet column(col)}
		<Clock.WheelColumn type={col.type} class="h-44 w-16" />
	{/snippet}
</Clock.Root>

<p data-testid="bind-value">{value}</p>
<button type="button" data-testid="set-value-16-45" onclick={() => (value = '16:45')}
	>Set value</button
>
