import { redirect } from '@sveltejs/kit';

/**
 * The site has no landing page of its own — `/` is the docs.
 *
 * A 308 rather than a 307: the move is permanent, so browsers and crawlers can
 * cache it and stop asking. The redirect lives in a universal `load` so it also
 * applies to client-side navigations, which is what the header's home link does.
 */
export function load() {
	redirect(308, '/docs/quick-start');
}
