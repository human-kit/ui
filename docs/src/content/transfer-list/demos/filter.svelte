<script lang="ts">
	import { TransferList } from '@human-kit/ui';

	type Person = { id: string; name: string };

	const people: Person[] = [
		{ id: 'ada', name: 'Ada Lovelace' },
		{ id: 'alan', name: 'Alan Turing' },
		{ id: 'barbara', name: 'Barbara Liskov' },
		{ id: 'edsger', name: 'Edsger Dijkstra' },
		{ id: 'grace', name: 'Grace Hopper' },
		{ id: 'katherine', name: 'Katherine Johnson' },
		{ id: 'margaret', name: 'Margaret Hamilton' },
		{ id: 'radia', name: 'Radia Perlman' }
	];

	let value = $state<(string | number)[]>([]);
	let availableQuery = $state('');
	let selectedQuery = $state('');

	const matches = (query: string) => (person: Person) =>
		query === '' || person.name.toLowerCase().includes(query.trim().toLowerCase());

	const listClass =
		'flex h-44 flex-col gap-0.5 overflow-y-auto border border-neutral-200 p-1 outline-none ' +
		'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 ' +
		'focus-visible:outline-neutral-900 dark:border-neutral-800 dark:focus-visible:outline-white';

	const itemClass =
		'flex cursor-default items-center px-2 py-1.5 text-sm text-neutral-700 outline-none select-none ' +
		'data-hovered:bg-neutral-100 data-selected:bg-neutral-900 data-selected:text-white ' +
		'data-focus-visible:outline-solid data-focus-visible:outline-2 ' +
		'data-focus-visible:-outline-offset-2 data-focus-visible:outline-neutral-900 ' +
		'data-selected:data-focus-visible:outline-white ' +
		'dark:text-neutral-200 dark:data-hovered:bg-neutral-800 dark:data-selected:bg-white ' +
		'dark:data-selected:text-neutral-900 dark:data-focus-visible:outline-white ' +
		'dark:data-selected:data-focus-visible:outline-neutral-900';

	const inputClass =
		'mb-2 w-full border border-neutral-200 px-2 py-1 text-sm outline-none ' +
		'focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 ' +
		'focus-visible:outline-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 ' +
		'dark:text-neutral-200 dark:focus-visible:outline-white';

	const buttonClass =
		'inline-flex h-8 w-8 items-center justify-center border border-neutral-200 text-sm ' +
		'text-neutral-700 transition-colors hover:bg-neutral-100 aria-disabled:cursor-not-allowed ' +
		'aria-disabled:opacity-40 aria-disabled:hover:bg-transparent outline-none focus-visible:outline-solid ' +
		'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ' +
		'dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800 ' +
		'dark:focus-visible:outline-white';
</script>

<TransferList.Root
	items={people}
	bind:value
	class="grid w-full grid-cols-[1fr_auto_1fr] items-start gap-4"
>
	<div>
		<input
			class={inputClass}
			type="search"
			placeholder="Filter available…"
			aria-label="Filter available people"
			bind:value={availableQuery}
		/>
		<TransferList.Source label="Available" filter={matches(availableQuery)} class={listClass}>
			{#snippet children(person: Person)}
				<TransferList.Item item={person} class={itemClass}>{person.name}</TransferList.Item>
			{/snippet}
		</TransferList.Source>
	</div>

	<div class="flex flex-col gap-2 pt-11">
		<TransferList.MoveSelected to="target" class={buttonClass}>→</TransferList.MoveSelected>
		<TransferList.MoveAll to="target" class={buttonClass}>⇥</TransferList.MoveAll>
		<TransferList.MoveAll to="source" class={buttonClass}>⇤</TransferList.MoveAll>
		<TransferList.MoveSelected to="source" class={buttonClass}>←</TransferList.MoveSelected>
	</div>

	<div>
		<input
			class={inputClass}
			type="search"
			placeholder="Filter selected…"
			aria-label="Filter selected people"
			bind:value={selectedQuery}
		/>
		<TransferList.Target label="Selected" filter={matches(selectedQuery)} class={listClass}>
			{#snippet children(person: Person)}
				<TransferList.Item item={person} class={itemClass}>{person.name}</TransferList.Item>
			{/snippet}
		</TransferList.Target>
	</div>

	<TransferList.Status />
</TransferList.Root>
