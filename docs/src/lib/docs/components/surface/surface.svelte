<script lang="ts" module>
	// Nesting-depth context. A Surface reads its parent's depth and paints itself
	// one step deeper, then exposes its own depth to descendants — so a card never
	// hand-picks `bg-depth-N`; the shade is derived from how deeply it is nested.
	const DEPTH_KEY = Symbol('docs.surface.depth');
	const MAX_DEPTH = 4;

	// Literal class list so Tailwind's scanner sees every depth utility (a computed
	// `bg-depth-${n}` string would be invisible to it and get purged).
	const DEPTH_BG = [
		'bg-depth-0',
		'bg-depth-1',
		'bg-depth-2',
		'bg-depth-3',
		'bg-depth-4'
	] as const;
</script>

<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		/** Override the auto-derived nesting depth (0 = top surface). */
		level?: number;
		class?: string;
		element?: HTMLDivElement | null;
		children: Snippet;
	}

	let { level, class: className = '', element = $bindable(null), children, ...rest }: Props =
		$props();

	// undefined at the top of the tree → this is depth 0. Each nested Surface is
	// its parent's depth + 1, clamped to the last available token.
	const parent = getContext<{ readonly depth: number } | undefined>(DEPTH_KEY);
	const depth = $derived(Math.min(level ?? (parent?.depth ?? -1) + 1, MAX_DEPTH));

	// Expose our depth to descendants via a getter so it stays reactive down the tree.
	setContext(DEPTH_KEY, {
		get depth() {
			return depth;
		}
	});
</script>

<div bind:this={element} class="{DEPTH_BG[depth]} {className}" data-depth={depth} {...rest}>
	{@render children()}
</div>
