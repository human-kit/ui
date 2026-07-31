<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { Drawer } from '@human-kit/ui';
	import { Menu as MenuIcon, X } from '@lucide/svelte';
	import { buttonVariants } from '../button/recipe';
	import Sidebar from '../sidebar/sidebar.svelte';
	import ThemeToggle from '../theme-toggle/theme-toggle.svelte';
	import Github from '../icons/github.svelte';
	import type { NavGroup } from '../../nav.js';

	interface Props {
		nav: NavGroup[];
		basePath?: string;
		/** The header's own actions, which move in here on narrow screens. */
		actions?: Snippet;
		githubUrl?: string;
	}

	let { nav, basePath = '/docs', actions, githubUrl }: Props = $props();

	let open = $state(false);

	// Navigating is the whole point of the drawer, so it has to get out of the way
	// once it has been used. Tracking the pathname rather than hooking every link
	// keeps this correct for back/forward and for links added later.
	$effect(() => {
		void page.url.pathname;
		open = false;
	});
</script>

<!-- `githubUrl` is an external URL, so it doesn't go through SvelteKit's resolve()
     (which is for internal routes). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<Drawer.Root bind:open side="left">
	<!-- Edge swipe on touch devices; the trigger stays the accessible way in. -->
	<Drawer.SwipeArea size="20px" class="md:hidden" />

	<Drawer.Trigger
		class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'md:hidden' })}
		aria-label="Open navigation"
	>
		<MenuIcon />
	</Drawer.Trigger>

	<Drawer.Portal>
		<Drawer.Overlay
			class="transition-[opacity,background-color] duration-300 ease-out data-[state=closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none"
			style="background: rgb(0 0 0 / calc(0.5 * (1 - var(--drawer-swipe-progress))));"
		/>
		<Drawer.Content
			class="flex w-72 max-w-[85vw] flex-col border-r border-border bg-background transition-[translate] duration-300 ease-out data-[state=closed]:[--drawer-closed:-100%] data-[starting-style]:[--drawer-closed:-100%] data-[swiping]:transition-none"
			style="translate: calc(var(--drawer-swipe-movement-x) + var(--drawer-closed, 0px)) 0;"
		>
			<div class="flex shrink-0 items-center justify-between border-b border-border p-2.5">
				<Drawer.Title class="text-sm font-medium text-foreground">Navigation</Drawer.Title>
				<Drawer.Close
					class={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
					aria-label="Close navigation"
				>
					<X />
				</Drawer.Close>
			</div>

			<Drawer.Body class="docs-scrollbar min-h-0 flex-1 overflow-y-auto px-3">
				<Sidebar {nav} {basePath} />
			</Drawer.Body>

			<!-- The header's own icons, which it hides below `md`: three of them either
			     side of a centred logo leaves a phone header with no room for the logo.
			     They belong with the navigation rather than crammed next to it. -->
			<div class="flex shrink-0 items-center justify-between gap-1 border-t border-border p-2.5">
				<!-- Repository first, then the package version. -->
				<div class="flex min-w-0 items-center gap-1">
					{#if githubUrl}
						<a
							href={githubUrl}
							target="_blank"
							rel="noreferrer"
							aria-label="GitHub repository"
							class={buttonVariants({ variant: 'ghost', size: 'icon' })}
						>
							<Github />
						</a>
					{/if}
					{#if actions}
						{@render actions()}
					{/if}
				</div>
				<ThemeToggle />
			</div>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
