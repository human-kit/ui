<script lang="ts">
	import Calendar from '../index';
</script>

<Calendar.Root defaultValue="2026-02-10" aria-label="Body custom test">
	<Calendar.Grid>
		<Calendar.GridBody>
			{#snippet children(date)}
				<Calendar.BodyCell {date}>{date}</Calendar.BodyCell>
			{/snippet}
		</Calendar.GridBody>
	</Calendar.Grid>
</Calendar.Root>
