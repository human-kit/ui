<script lang="ts">
	import { page } from '$app/state';
	import { Drawer } from '@human-kit/ui';
	import { List, X } from '@lucide/svelte';
	import { buttonVariants } from '../button/recipe';
	import Toc from '../toc/toc.svelte';

	interface Heading {
		id: string;
		text: string;
		depth: number;
	}

	interface Props {
		headings?: Heading[];
	}

	let { headings }: Props = $props();

	let open = $state(false);

	$effect(() => {
		void page.url.pathname;
		open = false;
	});
</script>

<!-- Anchored to the right, mirroring the rail it stands in for — and the navigation
     drawer on the other side. A sheet coming up from the bottom for the right-hand
     rail made the two menus feel like different mechanisms. -->
<Drawer.Root bind:open side="right">
	<Drawer.Trigger
		class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'xl:hidden' })}
		aria-label="On this page"
	>
		<List />
	</Drawer.Trigger>

	<Drawer.Portal>
		<Drawer.Overlay
			class="transition-[opacity,background-color] duration-300 ease-out data-[state=closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none"
			style="background: rgb(0 0 0 / calc(0.5 * (1 - var(--drawer-swipe-progress))));"
		/>
		<Drawer.Content
			class="flex w-72 max-w-[85vw] flex-col border-l border-border bg-background transition-[translate] duration-300 ease-out data-[state=closed]:[--drawer-closed:100%] data-[starting-style]:[--drawer-closed:100%] data-[swiping]:transition-none"
			style="translate: calc(var(--drawer-swipe-movement-x) + var(--drawer-closed, 0px)) 0;"
		>
			<div class="flex shrink-0 items-center justify-between border-b border-border p-2.5">
				<Drawer.Title class="text-sm font-medium text-foreground">On this page</Drawer.Title>
				<Drawer.Close
					class={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
					aria-label="Close outline"
				>
					<X />
				</Drawer.Close>
			</div>

			<!-- The anchors inside scroll the page rather than navigating, so the pathname
			     effect above never fires for them; closing on the click that bubbles up
			     here covers both cases without wiring every link. -->
			<Drawer.Body
				class="docs-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-6"
				onclick={(event: MouseEvent) => {
					if ((event.target as HTMLElement).closest('a')) open = false;
				}}
			>
				<Toc {headings} showLabel={false} />
			</Drawer.Body>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
