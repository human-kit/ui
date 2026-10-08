# Telemetry

Two layers, because one script cannot answer both questions.

## Layer 1 — the counts

`src/routes/+layout.ts` starts the analytics and the speed report of the host.
They give the views of a page, where a reader came from, the country, the device,
and the speed of a page for real readers.

There is nothing to configure. The host turns the feature on for the project, and
the scripts come from this domain. A content blocker matches the host of a
request, so a script from this domain is not stopped, and the counts stay
correct. Neither script writes to the device of the reader.

## Layer 2 — the clicks

`telemetry.ts` loads the client of the analytics vendor after the page hydrates.
It records each click with the element behind it, and it gives the heat maps.
`proxy.ts` and `src/hooks.server.ts` put the requests on a path of this domain,
for the same reason as above.

The client writes nothing to the device (`persistence: 'memory'`), so the site
needs no consent dialog. The cost is that a reader who comes back tomorrow is a
new reader. Layer 1 carries the counts that need an identity.

### To turn it on

Give the build two variables. Both are public, and both are read at build time.

| Variable              | Value                                      |
| --------------------- | ------------------------------------------ |
| `VITE_POSTHOG_KEY`    | The project key. It can only write events. |
| `VITE_POSTHOG_REGION` | `eu` or `us`. The default is `eu`.         |

Set them in the project of the host, for Production and for Preview. To try the
site on a machine, put them in `docs/.env.local`.

**The region must be the region of the project.** A key of one region is unknown
in the other, and the vendor answers with an error that the browser does not
show. Telemetry then looks installed and collects nothing.

Without `VITE_POSTHOG_KEY` each function does nothing. Therefore a build with no
key, and each test, send no events. Development is also off: a local page must
not add noise to the numbers of the site.

## The events

| Event           | Properties         | The question it answers                              |
| --------------- | ------------------ | ---------------------------------------------------- |
| `$pageview`     | `route`            | Which page a reader opens.                           |
| `search`        | `query`, `results` | What a reader looks for. `results: 0` is a gap.      |
| `copy`          | `source`, `detail` | Which snippet a reader takes away.                   |
| `demo_interact` | —                  | The reader tried the demo, and did not only read it. |
| `github_click`  | —                  | How many readers go to the repository.               |
| `theme_change`  | `to`               | How many readers use the dark theme.                 |

Each click also arrives by itself, with the element behind it, because the client
records them without instructions. The six events above are the ones that are
named by hand, because a name makes a chart possible.

`search` with `results: 0` is the most valuable of them: the query is the name of
a component that is missing, or of a page that does not use the word the reader
knows.

To add an event, put its name in `TelemetryEvent` and call `track`. A name that
is not in that type is a build error.
