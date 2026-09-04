# LocaleProvider

## Description

`LocaleProvider` distributes a BCP 47 locale (e.g. `"es-AR"`, `"en-US"`) through Svelte
context so locale-aware components (Calendar, DatePicker, DateRangePicker, Clock,
NumberField, …) format and parse consistently without per-component `locale` props. It
renders no markup of its own.

## Anatomy

- `LocaleProvider`

```svelte
<LocaleProvider locale="es-AR">
	<Calendar.Root />
	<NumberField.Root />
</LocaleProvider>
```

## Usage guidelines

- Wrap the app (or the subtree that needs it) once; nested providers override the outer
  locale for their subtree.
- When `locale` is omitted, consumers fall back to the runtime default
  (`Intl`/`navigator.language`), which differs between environments — see the SSR note.
- Read the context from your own components with `getLocaleContext()` (returns
  `LocaleContext | undefined`) or `useLocaleContext()` (throws without a provider).
  `useLocaleContextOptional()` is a deprecated alias of `getLocaleContext()`.

## SSR and hydration

In server-rendered apps an explicit `locale` is effectively **required**. Without it, the server uses the locale of the Node process and the client uses `navigator.language`. When the two are different, the HTML of the server and the first render of the client do not agree. The sequence of the date segments changes (`dd/MM` or `MM/dd`), and so do the hour cycle (12h or 24h) and the number format. The result is a hydration error and a flash of different content.

Resolve the locale on the server (typically from the `Accept-Language` request header, or
the user's saved preference) and pass it explicitly so both passes agree:

```ts
// hooks.server.ts / +layout.server.ts
export const load = ({ request }) => ({
	locale: request.headers.get('accept-language')?.split(',')[0] ?? 'en-US'
});
```

```svelte
<!-- +layout.svelte -->
<LocaleProvider locale={data.locale}>
	{@render children()}
</LocaleProvider>
```

## API reference

`LocaleProvider` supports:

- `locale?: string` — BCP 47 tag shared with descendants. Reactive: updating it
  re-renders locale-aware consumers.
- `children?: Snippet`

Context helpers:

- `getLocaleContext(): LocaleContext | undefined` — primary read API.
- `useLocaleContext(): LocaleContext` — throws when no provider wraps the tree.
- `useLocaleContextOptional()` — **deprecated**, use `getLocaleContext()`.
- `setLocaleContext(context: LocaleContext)` — advanced: provide a custom context.
- `LocaleContext = { locale: Readable<string | undefined> }`
