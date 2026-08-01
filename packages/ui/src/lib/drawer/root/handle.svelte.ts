/**
 * Detached trigger handles.
 *
 * Normally a `Drawer.Trigger` lives inside the `Drawer.Root` it opens. That breaks
 * down when the openers are scattered — a row action in every line of a table, say,
 * each needing to open the same drawer with a different record. Duplicating the
 * whole drawer per row is wasteful and puts several modal panels in the DOM at once.
 *
 * A handle is the shared object in between: triggers push into it, one root reads
 * from it, and the value the trigger carried arrives as the root's `payload`.
 *
 * ```svelte
 * <script>
 *   const profile = createDrawerHandle();
 * </script>
 *
 * {#each users as user}
 *   <Drawer.Trigger handle={profile} payload={user}>{user.name}</Drawer.Trigger>
 * {/each}
 *
 * <Drawer.Root handle={profile}>
 *   {#snippet children({ payload })}…{/snippet}
 * </Drawer.Root>
 * ```
 */

export type DrawerHandle<Payload = unknown> = {
	readonly isOpen: boolean;
	/** Value carried by the trigger that opened the drawer. */
	readonly payload: Payload | undefined;
	/** Element that opened the drawer, so focus can return to the right one. */
	readonly trigger: HTMLElement | null;
	/** Opens the drawer, optionally carrying a payload. */
	open: (payload?: Payload, trigger?: HTMLElement | null) => void;
	close: () => void;
	toggle: (payload?: Payload, trigger?: HTMLElement | null) => void;
	/** Used by `Drawer.Root` to mirror its own state changes back into the handle. */
	setOpen: (open: boolean) => void;
};

export function createDrawerHandle<Payload = unknown>(): DrawerHandle<Payload> {
	let isOpen = $state(false);
	let payload = $state<Payload | undefined>(undefined);
	let trigger = $state<HTMLElement | null>(null);

	return {
		get isOpen() {
			return isOpen;
		},
		get payload() {
			return payload;
		},
		get trigger() {
			return trigger;
		},
		open(nextPayload?: Payload, nextTrigger?: HTMLElement | null) {
			// The payload is only replaced when one is supplied, so an imperative
			// `handle.open()` reopens with whatever the last trigger carried instead of
			// blanking the drawer's contents.
			if (nextPayload !== undefined) payload = nextPayload;
			if (nextTrigger !== undefined) trigger = nextTrigger;
			isOpen = true;
		},
		close() {
			isOpen = false;
		},
		toggle(nextPayload?: Payload, nextTrigger?: HTMLElement | null) {
			if (isOpen) {
				isOpen = false;
				return;
			}
			this.open(nextPayload, nextTrigger);
		},
		setOpen(next: boolean) {
			isOpen = next;
		}
	};
}
