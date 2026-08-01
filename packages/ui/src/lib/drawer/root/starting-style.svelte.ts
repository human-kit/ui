/**
 * "Starting style" flag for enter transitions.
 *
 * A CSS transition needs two values to interpolate between, and a node inserted
 * straight into its final state never gets the first one — it simply appears.
 * Keyframe animations do not have this problem, which is why the rest of the
 * library gets away without it; a drawer animates with a `translate` transition,
 * so it does.
 *
 * The flag is `true` for the first painted frame, letting CSS say where the panel
 * comes FROM, and drops on the next frame so the transition runs. It has to start
 * `true` rather than being set in an effect: the attribute must already be in the
 * markup Svelte inserts, or the browser's first paint has the final value and
 * there is nothing to animate away from.
 */
export function createStartingStyle(): { readonly active: boolean } {
	let active = $state(true);

	$effect(() => {
		// Two frames, not one: the first fires BEFORE the paint that shows the
		// starting position, so clearing there would collapse the transition.
		let inner: number | undefined;
		const outer = requestAnimationFrame(() => {
			inner = requestAnimationFrame(() => {
				active = false;
			});
		});

		return () => {
			cancelAnimationFrame(outer);
			if (inner !== undefined) cancelAnimationFrame(inner);
		};
	});

	return {
		get active() {
			return active;
		}
	};
}
