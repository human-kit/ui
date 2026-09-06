<script lang="ts">
	import { onMount } from 'svelte';
	import type MiniSearch from 'minisearch';
	import { Autocomplete, Dialog } from '@human-kit/ui';
	import { ChevronRight, Search as SearchIcon } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { buttonVariants } from '../button/recipe';
	import {
		groupHits,
		hitLabel,
		loadIndex,
		searchIndex,
		type SearchHit
	} from '../../search/search-engine.js';
	import type { SearchRecord } from '../../search/types.js';

	interface Props {
		/**
		 * Loads the index. The default downloads the prebuilt file; a test passes
		 * its own records instead of standing up the whole route.
		 */
		load?: () => Promise<MiniSearch<SearchRecord>>;
	}

	let { load = () => loadIndex() }: Props = $props();

	let open = $state(false);
	let query = $state('');
	let index = $state<MiniSearch<SearchRecord> | null>(null);
	let failed = $state(false);
	let isApplePlatform = $state(false);

	// Plain variables, not state: the effect below must not re-run when they change.
	let loadStarted = false;

	const results = $derived(index && query.trim() !== '' ? searchIndex(index, query) : []);
	const groups = $derived(groupHits(results));

	// The index is a separate download, so it waits for the reader to ask for it.
	$effect(() => {
		if (!open || loadStarted) return;
		loadStarted = true;
		load().then(
			(loaded) => (index = loaded),
			() => {
				failed = true;
				// Let the next open try again — the file may just have been unreachable.
				loadStarted = false;
			}
		);
	});

	// After mount rather than during render: the server has no platform to read,
	// and the label has to change once the client knows which key to name.
	onMount(() => {
		isApplePlatform = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
	});

	/** A shortcut must not fire while the reader is writing somewhere else. */
	function isTyping(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		return (
			target.isContentEditable ||
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			target instanceof HTMLSelectElement
		);
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			open = !open;
			return;
		}

		// The bare slash is the second way in, and the one that costs nothing to
		// discover. It stays out of the way of anyone who is writing.
		if (event.key === '/' && !open && !event.metaKey && !event.ctrlKey && !event.altKey) {
			if (isTyping(event.target)) return;
			event.preventDefault();
			open = true;
		}
	}

	async function goToHit(hit: SearchHit) {
		open = false;
		query = '';
		// The route goes through resolve(); only the fragment is added afterwards.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(`${resolve(`/docs/${hit.slug}`)}${hit.hash === '' ? '' : `#${hit.hash}`}`);
	}

	function onSelect(selection: Set<string | number>) {
		const id = String(Array.from(selection)[0] ?? '');
		const hit = results.find((result) => result.id === id);
		if (hit) void goToHit(hit);
	}

	// The dialog unmounts its content, so the query only has to be cleared for the
	// case where the reader closes without picking anything.
	$effect(() => {
		if (!open) query = '';
	});
</script>

<svelte:window onkeydown={onWindowKeydown} />

<Dialog.Root bind:open>
	<!-- No width of its own: the trigger is as wide as the words in it, so the
	     middle of the header stays as empty as it can. -->
	<Dialog.Trigger
		class={buttonVariants({
			variant: 'ghost',
			class: 'gap-1.5 pr-1 text-sm max-sm:size-6.5 max-sm:px-0'
		})}
		aria-label="Search the documentation"
	>
		<SearchIcon />
		<span class="hidden sm:inline">Search</span>
		<kbd
			class="hidden rounded border border-border px-1 font-sans text-[10px] text-muted-foreground sm:inline"
		>
			{isApplePlatform ? '⌘' : 'Ctrl '}K
		</kbd>
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 bg-black/50" />
		<!-- Near the top of the viewport rather than in the middle of it, and capped:
		     a panel that is centred and grows with the result count moves both of its
		     edges on every keystroke, and a full list of results takes over the
		     screen. This one only ever grows downwards, and past the cap it scrolls. -->
		<Dialog.Content
			class="flex max-h-[min(26rem,70vh)] w-[36rem] max-w-[92vw] flex-col self-start overflow-hidden rounded-lg border border-border bg-background shadow-lg mt-[12vh]"
		>
			<!-- The dialog takes its name from the title; the search box is not it. -->
			<Dialog.Title class="sr-only">Search the documentation</Dialog.Title>

			<!-- `filter={null}`: MiniSearch already ranked and cut the list, and the
			     local filter would hide most of it again by matching the query
			     against the row text. -->
			<Autocomplete.Root
				id="docs-search"
				inputValue={query}
				onInputChange={(value) => (query = value)}
				filter={null}
				aria-label="Search the documentation"
				class="flex min-h-0 flex-1 flex-col"
			>
				<!-- The two chrome rows sit one step deeper than the panel, so the
				     results read as the surface and the box and the hints frame them. -->
				<div class="flex shrink-0 items-center gap-2 border-b border-border bg-depth-1 px-3">
					<SearchIcon class="size-4 shrink-0 text-muted-foreground" />
					<Autocomplete.Input
						placeholder="Search documentation…"
						aria-label="Search the documentation"
						class="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
					/>
				</div>

				<Autocomplete.Status
					formatMessage={(count) =>
						count === 0 ? 'No results' : `${count} result${count === 1 ? '' : 's'}`}
				/>

				<Autocomplete.List
					aria-label="Search results"
					selectionBehavior="replace"
					onChange={onSelect}
					class="docs-scrollbar min-h-0 flex-1 overflow-y-auto p-1.5"
				>
					{#each groups as group, position (group.label)}
						{@const labelId = `docs-search-group-${position}`}
						<div role="group" aria-labelledby={labelId}>
							<div id={labelId} class="px-2.5 pt-2 pb-1 text-xs text-muted-foreground">
								{group.label}
							</div>
							{#each group.hits as hit (hit.id)}
								{@const path = hitLabel(hit)}
								<!-- `data-focused`, not `data-focus-visible`: the DOM focus stays in the
								     input, and the row the arrow keys are on is the virtually focused one. -->
								<Autocomplete.Item
									id={hit.id}
									textValue={path.join(' ')}
									class="flex cursor-default items-center gap-1 rounded-md px-2.5 py-1.5 text-sm outline-none data-[focused=true]:bg-accent data-[hovered=true]:bg-accent"
								>
									<!-- Keyed by the position: a section whose heading repeats the page
									     title would give two steps the same key. -->
									{#each path as step, depth (depth)}
										{#if depth > 0}
											<ChevronRight class="size-3.5 shrink-0 text-muted-foreground" />
										{/if}
										<span
											class="truncate {depth === path.length - 1
												? 'text-foreground'
												: 'text-muted-foreground'}"
										>
											{step}
										</span>
									{/each}
								</Autocomplete.Item>
							{/each}
						</div>
					{/each}

					<Autocomplete.Empty class="px-3 py-10 text-center text-sm text-muted-foreground">
						{#if failed}
							The search index did not load. Close this and try again.
						{:else if query.trim() === ''}
							Write to search the components and the guides.
						{:else if index === null}
							Loading…
						{:else}
							No results for "{query}"
						{/if}
					</Autocomplete.Empty>
				</Autocomplete.List>
			</Autocomplete.Root>

			<div
				class="flex shrink-0 items-center gap-3 border-t border-border bg-depth-1 px-3 py-2 text-xs text-muted-foreground"
			>
				<span class="flex items-center gap-1.5">
					<kbd class="rounded border border-border px-1 font-sans">↵</kbd>
					Go to page
				</span>
				<span class="flex items-center gap-1.5">
					<kbd class="rounded border border-border px-1 font-sans">↑↓</kbd>
					Move
				</span>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
