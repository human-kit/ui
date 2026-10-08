/**
 * The reverse proxy behind the telemetry endpoint.
 *
 * WHY THE EVENTS DO NOT GO STRAIGHT TO THE VENDOR
 * The readers of these docs are developers, and many of them run a content
 * blocker. A blocker matches the host of a request, so a script and an event
 * that go to an analytics vendor are dropped before they leave the browser. The
 * loss is silent and it is not measurable, because the requests that a blocker
 * stops never arrive anywhere. The client in `telemetry.ts` therefore sends
 * everything to a path on this site, and `hooks.server.ts` gives the request to
 * the vendor from the server, where no blocker sees the host.
 *
 * This file holds the parts that have no server in them, so a test can drive
 * them with a fetch of its own.
 */

/** The path the client sends its events to. It must stay same-origin. */
export const TELEMETRY_PROXY_PREFIX = '/ph';

/**
 * The region of the analytics project, from `VITE_POSTHOG_REGION`.
 *
 * It MUST be the region the project was created in. A key from one region is
 * unknown in the other, and the vendor answers the events with a 401 that the
 * browser never shows: telemetry then looks installed and collects nothing.
 * Both the client and this proxy read this one constant, so the two cannot
 * disagree.
 */
const REGION = (import.meta.env.VITE_POSTHOG_REGION as string | undefined) === 'us' ? 'us' : 'eu';

/** Where the events go. */
export const TELEMETRY_EVENT_HOST = `${REGION}.i.posthog.com`;

/** Where the client script and the toolbar assets come from. */
export const TELEMETRY_ASSET_HOST = `${REGION}-assets.i.posthog.com`;

/**
 * The address of the dashboard. The client needs it to build the links of the
 * toolbar, which must point at the vendor and not at this proxy.
 */
export const TELEMETRY_UI_HOST = `https://${REGION}.posthog.com`;

/**
 * Headers that describe one hop of a connection, not the message.
 *
 * A proxy that copies these into its own request breaks it: `fetch` refuses a
 * `connection` or a `transfer-encoding` that it did not write itself, and the
 * failure reads as a fault of the destination. `host` and `content-length` are
 * here for the same reason — the new request has a new host and a new length.
 */
const REQUEST_HEADERS_TO_DROP = new Set([
	'connection',
	'keep-alive',
	'proxy-authenticate',
	'proxy-authorization',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'host',
	'content-length',
	// The answer is read and written again below, so it must not arrive
	// compressed with an encoding that the copied headers would then describe
	// wrongly.
	'accept-encoding',
	// Nothing on this site needs a session, and a cookie of this domain says
	// nothing to the vendor.
	'cookie'
]);

/** Answer headers that describe a body this proxy does not pass on unchanged. */
const RESPONSE_HEADERS_TO_DROP = new Set([
	'connection',
	'keep-alive',
	'transfer-encoding',
	'content-encoding',
	'content-length',
	// The vendor must not write a cookie of this domain.
	'set-cookie'
]);

/** True for a request this proxy answers instead of the router. */
export function isTelemetryProxyPath(pathname: string): boolean {
	return pathname === TELEMETRY_PROXY_PREFIX || pathname.startsWith(`${TELEMETRY_PROXY_PREFIX}/`);
}

/**
 * The address at the vendor for one request to the proxy.
 *
 * The assets are on a different host from the events, and the client asks for
 * both through this one path.
 */
export function telemetryTarget(url: URL): URL {
	const path = url.pathname.slice(TELEMETRY_PROXY_PREFIX.length) || '/';
	const isAsset = path.startsWith('/static/') || path.startsWith('/array/');
	const host = isAsset ? TELEMETRY_ASSET_HOST : TELEMETRY_EVENT_HOST;
	return new URL(`https://${host}${path}${url.search}`);
}

/**
 * The headers of the request to the vendor.
 *
 * `clientAddress` becomes `x-forwarded-for`: the vendor reads the country of a
 * reader from that header, and without it every event comes from the data
 * centre of this site.
 */
export function telemetryRequestHeaders(source: Headers, clientAddress: string): Headers {
	const headers = new Headers();
	for (const [name, value] of source) {
		if (REQUEST_HEADERS_TO_DROP.has(name.toLowerCase())) continue;
		headers.set(name, value);
	}
	headers.set('accept-encoding', 'identity');
	headers.set('x-forwarded-for', clientAddress);
	return headers;
}

/** The headers this proxy gives back to the browser. */
export function telemetryResponseHeaders(source: Headers): Headers {
	const headers = new Headers();
	for (const [name, value] of source) {
		if (RESPONSE_HEADERS_TO_DROP.has(name.toLowerCase())) continue;
		headers.set(name, value);
	}
	return headers;
}

/** Everything a request needs to reach the vendor, without a server object. */
export interface TelemetryProxyRequest {
	url: URL;
	method: string;
	headers: Headers;
	body: ArrayBuffer | null;
	clientAddress: string;
}

/**
 * Gives one request to the vendor and returns its answer.
 *
 * The body is read to the end first. A stream would be less work, but it needs
 * a `duplex` option that not each runtime has, and an event of this size is a
 * few hundred bytes.
 */
export async function proxyTelemetry(
	request: TelemetryProxyRequest,
	fetchImplementation: typeof fetch = fetch
): Promise<Response> {
	const response = await fetchImplementation(telemetryTarget(request.url), {
		method: request.method,
		headers: telemetryRequestHeaders(request.headers, request.clientAddress),
		body: request.body,
		redirect: 'follow'
	});

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: telemetryResponseHeaders(response.headers)
	});
}
