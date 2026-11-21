<script lang="ts">
	import Calendar from '../index.js';
</script>

<Calendar.Root defaultValue="2026-02-10" aria-label="Header custom test">
	<Calendar.Grid>
		<Calendar.GridHeader>
			{#snippet children(day)}
				<Calendar.HeaderCell>DAY-{day}</Calendar.HeaderCell>
			{/snippet}
		</Calendar.GridHeader>
	</Calendar.Grid>
</Calendar.Root>
