import { untrack } from 'svelte';

type TypedElement = HTMLInputElement | HTMLTextAreaElement;

type Typed = { value: unknown };

/** A keystroke the owner has not answered yet, and the owner's value it arrived over. */
type Echo = { value: unknown; over: unknown };

/**
 * Keeps what a person types into a server-rendered field before the page hydrates.
 *
 * The server's markup is on screen, and answers typing, before the script that owns it runs.
 * A field that writes its value one way (`value={…}`) then has hydration write the server's
 * value over what was typed, and the state never hears of it. A native `bind:value` doesn't:
 * on hydration it finds the element's value different from the one it was rendered with
 * (`defaultValue`) and adopts it.
 *
 * This lends a field that native path without changing who owns its value. Pass `read` and
 * `adopt` to a function binding (`bind:value={() => typed.read(value), typed.adopt}`): before
 * the field mounts, `adopt` keeps what hydration found, and `read` shows it instead of the
 * owner's value, so nothing is written over it. Once the element is there, the typed text is
 * replayed as an `input` event, so it reaches the owner by the same path as a keystroke —
 * the field's own handler, the consumer's `oninput`, a form listening above.
 *
 * After that the field's `oninput` is still what writes. The binding hears each keystroke
 * first, and checks the value again a microtask later, which comes before the field's own
 * handler (a delegated one, on the root). Until the owner answers, `read` shows the keystroke,
 * so that check finds nothing to undo; once the owner's value moves, it is the owner's again,
 * whatever it made of the keystroke. An owner that ignores a keystroke leaves it on screen, as
 * a one-way `value` always did.
 */
export class TypedBeforeHydration {
	#typed = $state<Typed | null>(null);
	#settled = false;
	#echo: Echo | null = null;
	#owned: unknown = undefined;

	constructor(element: () => TypedElement | null) {
		$effect(() => {
			const node = element();
			if (!node || this.#settled) return;

			this.#settled = true;
			untrack(() => this.#replay(node));
		});
	}

	/** The value the element shows: the owner's, or what was typed while the owner catches up. */
	read = (owned: unknown): unknown => {
		if (this.#typed) return this.#typed.value;
		if (this.#echo && Object.is(owned, this.#echo.over)) return this.#echo.value;

		this.#echo = null;
		this.#owned = owned;
		return owned;
	};

	/**
	 * Called by the binding with what the element holds. Before mount that is hydration finding
	 * typed text; after it, a keystroke on its way to the field's own handler.
	 */
	adopt = (value: unknown) => {
		if (this.#settled) {
			this.#echo = { value, over: this.#owned };
			return;
		}

		this.#typed = { value };
	};

	#replay(node: TypedElement) {
		if (!this.#typed) return;

		node.dispatchEvent(new Event('input', { bubbles: true }));
		this.#typed = null;
	}
}
