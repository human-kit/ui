<script lang="ts">
	import { Calendar, LocaleProvider } from '@human-kit/ui';

	let locale = $state('es-ES');
	let value = $state('');

	const locales = ['en-US', 'es-ES', 'pt-BR', 'fr-FR', 'de-DE'];
</script>

<div class="space-y-4">
	<select
		bind:value={locale}
		aria-label="Locale"
		class="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
	>
		{#each locales as option (option)}
			<option value={option}>{option}</option>
		{/each}
	</select>

	<LocaleProvider {locale}>
		<Calendar.Root bind:value class="space-y-4">
			<div class="flex items-center justify-between gap-3">
				<Calendar.TriggerPrevious
					class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
				>
					←
				</Calendar.TriggerPrevious>
				<Calendar.Heading class="text-lg font-semibold text-gray-900 dark:text-white" />
				<Calendar.TriggerNext
					class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
				>
					→
				</Calendar.TriggerNext>
			</div>

			<Calendar.Grid weekdayStyle="narrow" class="text-gray-900 dark:text-gray-100">
				<Calendar.GridHeader>
					{#snippet children(day)}
						<Calendar.HeaderCell
							class="px-2 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300"
						>
							{day}
						</Calendar.HeaderCell>
					{/snippet}
				</Calendar.GridHeader>
				<Calendar.GridBody>
					{#snippet children(date)}
						<Calendar.BodyCell
							{date}
							class="p-1 text-center text-gray-900 data-outside-month:opacity-45 data-selected:rounded data-selected:bg-blue-600 data-selected:text-white dark:text-gray-100"
						/>
					{/snippet}
				</Calendar.GridBody>
			</Calendar.Grid>
		</Calendar.Root>
	</LocaleProvider>
</div>
