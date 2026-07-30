# Benchmarks

Reproducible performance measurement for the components whose cost shows up in
real apps. Today that means the table.

## Why this exists

"The table feels slow" is not actionable. This harness turns it into numbers
that survive a refactor: frame pacing, dropped frames, how much of the viewport
goes blank while scrolling, and — via a CPU profile — which functions burned the
time. Every optimisation is judged by re-running it, not by reasoning about it.

## Layout

| Path                              | Role                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `docs/src/lib/bench/metrics.ts`    | Measurement primitives: frame recorder, long-task observer, blank-viewport probe |
| `docs/src/lib/bench/types.ts`      | Config, scenario names, the `window.__tableBench` contract                        |
| `docs/src/routes/bench/table/`     | The benchmark page — a table shaped like a real app list                          |
| `scripts/bench-table.mjs`          | Playwright runner: drives scenarios, collects CPU profiles, writes/compares JSON  |
| `bench-results/`                   | Committed baselines, so regressions are visible in review                         |

The bench page uses the same `@human-kit/ui` source alias as the rest of the
docs app, so edits to the table are measurable without repackaging.

## Running

```sh
# Baseline against a dev server the runner starts and stops itself
pnpm bench:table --label baseline

# Against a server you already have running (fastest iteration loop)
pnpm bench:table --label baseline --url http://localhost:5173

# Production build, which is what users actually run
pnpm bench:table --label baseline-prod --mode preview

# Compare two runs
pnpm bench:table --compare bench-results/baseline.json bench-results/after.json
```

Useful flags: `--throttle <n>` (CDP CPU throttling, default `4`, keeps results
stable across machines), `--repeat <n>` (median run wins, default `3`),
`--rows` / `--columns`, `--scenarios a,b`, `--no-profile`, `--headed`.

**Do not edit files under `docs/` or `packages/ui/` while a run is in flight** —
Vite's HMR reloads the page and the run dies with "execution context destroyed".

## Scenarios

| Scenario        | What it drives                                        | Primary metric          |
| --------------- | ----------------------------------------------------- | ----------------------- |
| `mount`         | First render of the table, forced synchronous          | `syncMs`                |
| `scroll-smooth` | 8 px/frame, programmatic                               | frame p95               |
| `scroll-fast`   | 60 px/frame, programmatic                              | frame p95               |
| `scroll-wheel`  | Real wheel bursts over CDP                             | blank-frame ratio       |
| `scroll-jump`   | Random teleports — defeats every locality optimisation | frame p95               |
| `resize-column` | 120 frames of pointer drag on a resizer                | frame p95               |
| `select-all`    | Select-all propagation to every rendered row           | `syncMs`                |
| `sort-toggle`   | Sort descriptor change                                 | `syncMs`                |

`scroll-wheel` is the one that reproduces the "white gaps while scrolling"
report. Programmatic `scrollTop` writes cannot: the virtualizer's scroll handler
runs synchronously within the same frame, so the gap never becomes visible. Only
real input lets the compositor scroll ahead of a busy main thread.

## Reading the output

### Trust the spread before the delta

Every scenario reports a `spread` — how much slower the worst run was than the
best. A developer machine only ever makes a run *slower*, so the headline is the
**best** run, and `--compare` marks any delta smaller than the spread as
`inconclusive` rather than printing a ✔ that means nothing.

This is not theoretical. Measured on one session: `resize-column` and
`scroll-wheel` settle at 3–10% spread and can resolve a 20% change, while
`mount` reached 65% and `select-all` 185% — at which point their numbers say
nothing at all about a code change. Two rules follow:

- **Compare within one session.** Build once, start one server, and measure both
  sides against it. Cross-session deltas of 20% are routine and mean nothing. To
  A/B a change, `git stash` it and re-run rather than comparing to yesterday's
  JSON.
- **When wall-clock is too noisy, compare profiles instead.** A function
  disappearing from `profile.top` is solid evidence even when the total is not.

### Metrics

- **frame p95 / dropped** — frame-to-frame deltas. Above ~25 ms at p95 the
  scroll visibly stutters.
- **blank frames** — share of sampled frames where the band below the header was
  not fully covered by rendered rows, with more list still to show. This is the
  user-visible symptom, measured directly.
- **long tasks** — main-thread blocks over 50 ms; these are what make the page
  feel unresponsive rather than merely choppy.
- **profile.top** — per-function self time from the CDP sampling profiler. This
  is the attribution: optimise what is at the top, re-measure, repeat.

## What the first round found

A cost model for the virtualized table, measured at 4x CPU throttle on a
production build (5000 rows x 8 resizable columns, 640px viewport):

| Operation                       | Cost                                     |
| ------------------------------- | ---------------------------------------- |
| Relayout after a DOM change     | **~1.16 ms per mounted row** (~62% of a frame) |
| Creating one row (9 cells)      | ~18 ms                                   |
| Updating one row's contents     | ~3 ms                                    |

The decisive insight: **inserting or removing a single `<tr>` relayouts the whole
table**, so the cost of a scroll frame is driven by how many rows are mounted,
not by how many rows changed. At 8 px/frame the frame distribution is bimodal —
p50 14 ms, p95 100 ms, with exactly 25% of frames expensive, matching the 1-in-4
frames where the window actually shifts.

Two changes followed, both measured against an in-build control:

- **Quantized window** (`table-body.svelte`) — snap the window edges to blocks of
  `overscan / 4` so scrolling within a block leaves the DOM untouched. Safe by
  construction: `from` only rounds down and `to` only rounds up, so the retained
  margin never falls below `overscan`. `scroll-fast` p50 125 → 26.5 ms (−79%),
  `scroll-smooth` p95 128.5 → 61.8 ms (−52%), `scroll-wheel` p95 −14%.
- **No overscan during a column drag** — the buffer absorbs *scrolling*, and the
  pointer cannot scroll while dragging a resizer. `resize-column` p50 87.7 →
  48.5 ms (−45%).

Both keep `overscan` at 18 and blank coverage at 0%.

Things that were tried and **did not** work, so they are not worth retrying
blindly:

- **Lowering `overscan`** — cheaper frames, but it spends the buffer that hides
  row render cost, and fast scrolling then shows a blank band. This is the trap:
  it looks like a large win in every frame-time metric.
- **`content-visibility: auto` on rows** — inert. CSS Containment does not apply
  to elements with internal table display types.
- **Recycling rows** (keying by slot instead of id) — 2.5x *worse*. It trades 2
  row creations for updating every mounted row.
- **Indexing cells by row / plain `Map` for token counters** — correct in
  principle and kept, but no measurable effect in production.

## Adding a component

Add `docs/src/routes/bench/<component>/+page.svelte` exposing a
`window.__<component>Bench` object with the same `run(scenario)` shape, then
teach the runner its scenario list. The metrics module is component-agnostic.
