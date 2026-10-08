import type { Handle } from '@sveltejs/kit';
import { isTelemetryProxyPath, proxyTelemetry } from '$lib/docs/telemetry/proxy';

/**
 * Answers the telemetry path before the router sees it.
 *
 * The path is not a route of this site: it is the front of a proxy, and
 * `proxy.ts` says why the events do not go straight to the vendor. A request
 * that is not for the proxy goes on to the router, untouched.
 */
export const handle: Handle = async ({ event, resolve }) => {
	if (isTelemetryProxyPath(event.url.pathname)) {
		const method = event.request.method;
		const hasBody = method !== 'GET' && method !== 'HEAD';
		return proxyTelemetry({
			url: event.url,
			method,
			headers: event.request.headers,
			body: hasBody ? await event.request.arrayBuffer() : null,
			clientAddress: event.getClientAddress()
		});
	}

	return resolve(event);
};
