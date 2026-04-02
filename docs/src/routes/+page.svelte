<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-white">
	<div class="text-center">
		<h1 class="mb-4 text-5xl font-bold">Svelte Components</h1>
		<p class="mb-8 text-lg text-neutral-400">
			A collection of accessible, customizable Svelte 5 UI components.
		</p>
		<nav class="flex flex-wrap justify-center gap-4">
			<a
				href={resolve('/docs/calendar')}
				class="rounded-lg bg-neutral-800 px-4 py-2 transition-colors hover:bg-neutral-700"
			>
				Calendar
			</a>
			<a
				href={resolve('/docs/datepicker')}
				class="rounded-lg bg-neutral-800 px-4 py-2 transition-colors hover:bg-neutral-700"
			>
				DatePicker
			</a>
			<a
				href={resolve('/docs/timepicker')}
				class="rounded-lg bg-neutral-800 px-4 py-2 transition-colors hover:bg-neutral-700"
			>
				TimePicker
			</a>
			<a
				href={resolve('/docs/clock')}
				class="rounded-lg bg-neutral-800 px-4 py-2 transition-colors hover:bg-neutral-700"
			>
				Clock
			</a>
			<a
				href={resolve('/docs/combobox')}
				class="rounded-lg bg-neutral-800 px-4 py-2 transition-colors hover:bg-neutral-700"
			>
				Combobox
			</a>
			<a
				href={resolve('/docs/listbox')}
				class="rounded-lg bg-neutral-800 px-4 py-2 transition-colors hover:bg-neutral-700"
			>
				Listbox
			</a>
			<a
				href={resolve('/docs/popover')}
				class="rounded-lg bg-neutral-800 px-4 py-2 transition-colors hover:bg-neutral-700"
			>
				Popover
			</a>
			<a
				href={resolve('/docs/dialog')}
				class="rounded-lg bg-neutral-800 px-4 py-2 transition-colors hover:bg-neutral-700"
			>
				Dialog
			</a>
			<a
				href={resolve('/docs/table')}
				class="rounded-lg bg-neutral-800 px-4 py-2 transition-colors hover:bg-neutral-700"
			>
				Table
			</a>
		</nav>
	</div>
</main>
