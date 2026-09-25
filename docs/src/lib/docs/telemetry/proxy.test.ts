import { describe, expect, it } from 'vitest';
import {
	TELEMETRY_ASSET_HOST,
	TELEMETRY_EVENT_HOST,
	isTelemetryProxyPath,
	proxyTelemetry,
	telemetryRequestHeaders,
	telemetryResponseHeaders,
	telemetryTarget
} from './proxy';

/** Records the request the proxy made, and answers it. */
function spyFetch(answer?: Response) {
	const calls: Array<{ url: URL; init: RequestInit }> = [];
	const fetchImplementation = (async (url: URL, init: RequestInit) => {
		calls.push({ url, init });
		return answer ?? new Response('ok', { status: 200 });
	}) as unknown as typeof fetch;
	return { calls, fetchImplementation };
}

describe('the telemetry proxy', () => {
	it('answers its own path, and nothing else', () => {
		expect(isTelemetryProxyPath('/ph')).toBe(true);
		expect(isTelemetryProxyPath('/ph/e/')).toBe(true);
		expect(isTelemetryProxyPath('/docs/slider')).toBe(false);
		// A route that only starts with the same letters is not the proxy.
		expect(isTelemetryProxyPath('/photos')).toBe(false);
	});

	it('sends the events to the event host, and keeps the query', () => {
		const target = telemetryTarget(new URL('https://human-kit.dev/ph/e/?ip=0&v=2'));

		expect(target.host).toBe(TELEMETRY_EVENT_HOST);
		expect(target.pathname).toBe('/e/');
		expect(target.search).toBe('?ip=0&v=2');
	});

	it('sends the script to the asset host', () => {
		const script = telemetryTarget(new URL('https://human-kit.dev/ph/static/array.js'));
		const array = telemetryTarget(new URL('https://human-kit.dev/ph/array/key/config.js'));

		expect(script.host).toBe(TELEMETRY_ASSET_HOST);
		expect(array.host).toBe(TELEMETRY_ASSET_HOST);
	});

	it('drops the headers of one hop, which a copied request must not carry', () => {
		const headers = telemetryRequestHeaders(
			new Headers({
				connection: 'keep-alive',
				'transfer-encoding': 'chunked',
				'content-length': '12',
				cookie: 'theme=dark',
				'content-type': 'application/json'
			}),
			'203.0.113.7'
		);

		expect(headers.get('connection')).toBeNull();
		expect(headers.get('transfer-encoding')).toBeNull();
		expect(headers.get('content-length')).toBeNull();
		expect(headers.get('cookie')).toBeNull();
		// The message itself survives.
		expect(headers.get('content-type')).toBe('application/json');
	});

	it('names the reader as the sender, so the country is the country of the reader', () => {
		const headers = telemetryRequestHeaders(new Headers(), '203.0.113.7');

		expect(headers.get('x-forwarded-for')).toBe('203.0.113.7');
		// The answer is read and written again, so it must not arrive compressed.
		expect(headers.get('accept-encoding')).toBe('identity');
	});

	it('gives back no cookie of this domain, and no length it did not measure', () => {
		const headers = telemetryResponseHeaders(
			new Headers({
				'set-cookie': 'ph_id=1',
				'content-encoding': 'gzip',
				'content-length': '4',
				'content-type': 'application/json'
			})
		);

		expect(headers.get('set-cookie')).toBeNull();
		expect(headers.get('content-encoding')).toBeNull();
		expect(headers.get('content-length')).toBeNull();
		expect(headers.get('content-type')).toBe('application/json');
	});

	it('passes a post with its body, and answers with the status of the vendor', async () => {
		const body = new TextEncoder().encode('{"event":"copy"}').buffer as ArrayBuffer;
		const { calls, fetchImplementation } = spyFetch(new Response('1', { status: 202 }));

		const response = await proxyTelemetry(
			{
				url: new URL('https://human-kit.dev/ph/e/'),
				method: 'POST',
				headers: new Headers({ 'content-type': 'application/json' }),
				body,
				clientAddress: '198.51.100.4'
			},
			fetchImplementation
		);

		expect(calls).toHaveLength(1);
		expect(calls[0].url.href).toBe(`https://${TELEMETRY_EVENT_HOST}/e/`);
		expect(calls[0].init.method).toBe('POST');
		expect(calls[0].init.body).toBe(body);
		expect(response.status).toBe(202);
		expect(await response.text()).toBe('1');
	});
});
