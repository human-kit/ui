/**
 * The telemetry of the docs site: what a reader opens, and what a reader does
 * with it.
 *
 * TWO LAYERS, AND WHY
 * The counts of the readers and of where they came from are collected by the
 * host of this site (see `src/routes/+layout.ts`). That script comes from this
 * domain, so a content blocker does not stop it, and it writes nothing to the
 * device of the reader.
 *
 * This file is the second layer, and it answers a different question: what a
 * reader touches on the page. It loads the client of an analytics vendor, which
 * records each click with the element behind it, and it gives the heat maps. It
 * goes through the proxy in `proxy.ts` for the same reason: a blocker matches
 * the host.
 *
 * NO COOKIE, AND NO CONSENT DIALOG
 * `persistence: 'memory'` keeps the identity of a reader in the tab, and writes
 * nothing to the device. Therefore the site needs no consent dialog, and a
 * reader who comes back tomorrow is a new reader. That is the cost, and the
 * first layer carries the counts that need an identity, so the cost is small.
 * A change of this line is a change of the privacy statement of the site.
 *
 * HOW TO TURN IT ON
 * See `README.md` in this directory. Without `VITE_POSTHOG_KEY` each function
 * here does nothing, thus a build with no key, and each test, send no events.
 */
import type { PostHog } from 'posthog-js';
import { browser, dev } from '$app/environment';
import { TELEMETRY_PROXY_PREFIX, TELEMETRY_UI_HOST } from './proxy';

/**
 * The events this site sends.
 *
 * Each one is here because it answers a question that decides work:
 * - `search`: what a reader looks for, and what a reader does not find. A
 *   search with 0 results is the name of the component that is missing.
 * - `copy`: which snippet a reader takes away. A page that is read and never
 *   copied is a page that did not answer.
 * - `demo_interact`: the reader touched the demo, and did not only read it.
 * - `github_click` and `theme_change`: the two other controls of the chrome.
 */
export type TelemetryEvent = 'search' | 'copy' | 'demo_interact' | 'github_click' | 'theme_change';

export type TelemetryProperties = Record<string, string | number | boolean | null>;

/**
 * The key of the analytics project, given to the build as
 * `VITE_POSTHOG_KEY`. It is a public key: it can only write events.
 */
const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

/** How many events wait while the client downloads. */
const MAX_PENDING = 20;

/** How long to wait for an idle moment before the client downloads. */
const IDLE_TIMEOUT_MS = 4000;

let client: PostHog | null = null;
let startRequested = false;
const pending: Array<{ event: string; properties?: TelemetryProperties }> = [];

/**
 * True when the events leave the browser.
 *
 * Development is off on purpose: a local page must not add noise to the numbers
 * of the site, and the tests run with `dev` true.
 */
export function telemetryIsOn(): boolean {
	return browser && !dev && typeof KEY === 'string' && KEY !== '';
}

/**
 * Downloads the client and starts it. Safe to call more than one time.
 *
 * The download waits for an idle moment. The demos on a component page hydrate
 * first, and telemetry must not take the main thread from them.
 */
export function startTelemetry(): void {
	if (!telemetryIsOn() || startRequested) return;
	startRequested = true;

	const start = () => {
		void import('posthog-js').then(({ default: posthog }) => {
			posthog.init(KEY as string, {
				// The proxy on this domain, not the vendor. See proxy.ts.
				api_host: TELEMETRY_PROXY_PREFIX,
				// The dashboard, for the links of the toolbar.
				ui_host: TELEMETRY_UI_HOST,
				defaults: '2025-05-24',
				// See "NO COOKIE" at the top of this file.
				persistence: 'memory',
				person_profiles: 'identified_only',
				disable_session_recording: true,
				// A page of this site is prerendered and the router swaps it without a
				// load, so the layout sends each view by hand.
				capture_pageview: false,
				capture_pageleave: true,
				autocapture: true
			});
			client = posthog;
			for (const item of pending) posthog.capture(item.event, item.properties);
			pending.length = 0;
		});
	};

	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(start, { timeout: IDLE_TIMEOUT_MS });
	} else {
		setTimeout(start, 2000);
	}
}

/** Sends one event, or holds it until the client is ready. */
export function track(event: TelemetryEvent, properties?: TelemetryProperties): void {
	capture(event, properties);
}

/**
 * Sends one view of a page.
 *
 * The router changes the URL without a load, so the client cannot see a view by
 * itself. `$current_url` is given by hand for the same reason: the client would
 * read the address of the page the reader came from.
 */
export function trackPageView(url: URL, route: string | null): void {
	capture('$pageview', {
		$current_url: url.href,
		$pathname: url.pathname,
		route: route ?? url.pathname
	});
}

function capture(event: string, properties?: TelemetryProperties): void {
	if (!telemetryIsOn()) return;
	if (client) {
		client.capture(event, properties);
		return;
	}
	// The client is still on its way. Hold the event, but do not grow without an
	// end if the download never finishes.
	if (pending.length < MAX_PENDING) pending.push({ event, properties });
}
