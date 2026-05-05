<script lang="ts">
	import { browser } from '$app/environment';
	import AmountCell from '$lib/repros/purchase-requests/amount-cell.svelte';
	import type { PurchaseRequest } from '$lib/repros/purchase-requests/model';
	import RowCostProbe from '$lib/repros/purchase-requests/row-cost-probe.svelte';
	import StaticReproTable from '$lib/repros/purchase-requests/static-table.svelte';
	import type { StaticResolvedColumn } from '$lib/repros/purchase-requests/static-types';
	import type { TableSortDescriptor } from '@human-kit/svelte-components/table';
	import { tick } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	type BenchmarkPhase = 'hydrate' | 'remount';
	type TableVariant = 'current' | 'current-no-selection' | 'raw';

	type RowBenchmarkRun = {
		id: number;
		phase: BenchmarkPhase;
		variant: TableVariant;
		rowCount: number;
		startedAt: number;
		samples: number[];
		seenRows: Set<string | number>;
	};

	type RowBenchmarkMetrics = {
		id: number;
		phase: BenchmarkPhase;
		variant: TableVariant;
		rowCount: number;
		bootstrapMs: number;
		fanoutMs: number;
		incrementalRowMs: number;
		firstRowMs: number;
		medianRowMs: number;
		p95RowMs: number;
		totalMs: number;
		domNodesPerRow: number;
		cellsPerRow: number;
	};

	type SweepSummary = {
		interceptMs: number;
		slopeMsPerRow: number;
		minRows: number;
		maxRows: number;
	};

	type SandboxAutomationSnapshot = {
		generatedAt: string;
		activeVariant: TableVariant;
		activeRows: number;
		hydration: Record<TableVariant, RowBenchmarkMetrics | null>;
		remount: Record<TableVariant, RowBenchmarkMetrics | null>;
		lastMetric: RowBenchmarkMetrics | null;
		priorityHydrationBootstrapMs: number | null;
	};

	type SandboxWindow = Window & {
		__HK_SANDBOX_BENCHMARKS__?: SandboxAutomationSnapshot;
	};

	type RemountComparison = {
		rowCount: number;
		bootstrapDeltaMs: number;
		totalDeltaMs: number;
		incrementalDeltaMs: number;
		domNodesDelta: number;
	};

	type OptimizationTodo = {
		responsibility: string;
		why: string;
		plan: string[];
		measure: string[];
		files: string[];
	};

	const requesters = [
		'Ana Gomez',
		'Lucas Perez',
		'Mara Silva',
		'Juan Torres',
		'Sofia Rivas',
		'Martin Lopez',
		'Camila Diaz',
		'Tomas Herrera'
	] as const;

	const areas = [
		'Production',
		'Logistics',
		'Maintenance',
		'Quality',
		'Procurement',
		'Operations'
	] as const;

	const statuses: PurchaseRequest['status'][] = ['Pending', 'Review', 'Approved', 'Rejected'];
	const priorities: PurchaseRequest['priority'][] = ['Low', 'Medium', 'High'];
	const defaultRowCount = 100;
	const rowCountOptions = [10, 25, 50, 100, 250, 500] as const;
	const tableVariantOptions: Array<{
		id: TableVariant;
		label: string;
		description: string;
	}> = [
		{
			id: 'current',
			label: 'Static wrapper',
			description:
				'Wrapper con columns estatico: arma la tabla, pero sin registro dinamico hijo -> padre.'
		},
		{
			id: 'current-no-selection',
			label: 'Static wrapper no selection',
			description:
				'Mismo wrapper estatico y mismas columnas de datos, pero sin columna de seleccion ni checkbox stack.'
		},
		{
			id: 'raw',
			label: 'Raw table',
			description:
				'Tabla HTML cruda con la misma data y 7 celdas por fila, sin el stack del componente.'
		}
	] as const;
	const variantLabels = {
		current: 'Static wrapper',
		'current-no-selection': 'Static wrapper no selection',
		raw: 'Raw table'
	} satisfies Record<TableVariant, string>;
	const resolvedColumns: StaticResolvedColumn<PurchaseRequest>[] = [
		{
			id: 'requestNumber',
			header: 'Request',
			isRowHeader: true,
			resizable: true,
			defaultWidth: 350
		},
		{ id: 'requester', header: 'Requester', resizable: true },
		{ id: 'area', header: 'Area', resizable: true },
		{ id: 'status', header: 'Status', resizable: true },
		{ id: 'priority', header: 'Priority', resizable: true },
		{
			id: 'total',
			header: 'Total',
			align: 'right',
			sort: (item) => item.total,
			cell: AmountCell
		}
	];
	const optimizationTodos: OptimizationTodo[] = [
		{
			responsibility: 'Tab stop and focus resolution',
			why: 'Every cell asks the root context whether it is the current tab stop. That likely forces global focus bookkeeping while the grid is still mounting.',
			plan: [
				'Instrument or temporarily bypass isCellTabStop and getDefaultFocusKey during first mount.',
				'Prototype one root-owned initial tab stop instead of resolving it from every cell.',
				'Defer full roving-tabindex setup until after first paint and compare the bootstrap delta.'
			],
			measure: [
				'Watch bootstrap on Current row at 10, 100, and 500 rows.',
				'Confirm incremental per row does not regress after the defer/lazy setup.',
				'Check keyboard navigation still works after the first interaction.'
			],
			files: ['table/cell/table-cell.svelte', 'table/root/context.ts']
		},
		{
			responsibility: 'Row and cell registration',
			why: 'Each row and cell registers into the root context during mount, and body registration invalidates global caches repeatedly.',
			plan: [
				'Count how many registerRow and registerCell calls happen per render size.',
				'Prototype batched registration so body caches invalidate once per mount wave instead of once per cell.',
				'Separate mount-time collection from interactive runtime caches if batching alone is not enough.'
			],
			measure: [
				'Compare bootstrap before and after batching on 100 and 500 rows.',
				'Compare sweep slope to see whether the per-row tax falls.',
				'Confirm row selection and focus caches are still correct after remount.'
			],
			files: ['table/row/table-row.svelte', 'table/cell/table-cell.svelte', 'table/root/context.ts']
		},
		{
			responsibility: 'Cell order and per-row observer',
			why: 'Each row tracks child order and installs a MutationObserver, even though body cells are mostly static after render.',
			plan: [
				'Guard the MutationObserver behind a mode that only enables it where DOM order can truly change.',
				'Prototype passing the cell index from render order instead of discovering it from DOM children.',
				'Remove or narrow getCellIndex DOM lookups on the hot mount path.'
			],
			measure: [
				'Re-run remount at 100 and 500 rows to see if bootstrap drops without affecting slope too much.',
				'Check column order, hidden columns, and row-header semantics still map correctly.',
				'Check that header/body keyboard movement still lands on the right cells.'
			],
			files: ['table/row/table-row.svelte', 'table/cell/table-cell.svelte']
		},
		{
			responsibility: 'Derived state fan-out',
			why: 'Every cell subscribes to multiple global versions for layout, focus, selection, visibility, and disabled state, which amplifies mount and update work.',
			plan: [
				'List which derived values are truly needed on first paint versus only after interaction.',
				'Move row-level state to the row where possible and let cells inherit via data attributes or simpler props.',
				'Defer non-critical derived values such as actionability or selection descriptions until interaction.'
			],
			measure: [
				'Compare both bootstrap and incremental per row, because this responsibility can affect mount and later updates.',
				'Run a quick interaction sanity check for selection, focus-visible, and disabled rows.',
				'If possible later, add an update benchmark to quantify the win beyond remount.'
			],
			files: ['table/cell/table-cell.svelte', 'table/row/table-row.svelte', 'table/root/context.ts']
		},
		{
			responsibility: 'Selection and checkbox stack',
			why: 'The current body row mounts a custom checkbox subtree plus selection semantics, while the raw table uses native inputs with far fewer nodes.',
			plan: [
				'Create a sandbox variant that keeps the current table stack but swaps body checkboxes for lighter native inputs.',
				'Compare a version without the selection column to isolate pure row and cell cost from selection UI cost.',
				'If the delta is meaningful, consider a lighter checkbox path for dense body rows.'
			],
			measure: [
				'Compare DOM nodes per row and remount totals against the current variant.',
				'Check whether selection behavior and aria state still match expectations.',
				'Use the same row counts so the delta stays comparable to the raw table.'
			],
			files: [
				'docs/src/routes/sandbox/+page.svelte',
				'docs/src/lib/repros/purchase-requests/table.svelte',
				'table/checkbox/*'
			]
		}
	] as const;

	const purchaseRequests: PurchaseRequest[] = Array.from({ length: 5000 }, (_, index) => {
		const sequence = index + 1;
		const status = statuses[index % statuses.length];
		const priority = priorities[index % priorities.length];

		return {
			id: `pr-${String(sequence).padStart(3, '0')}`,
			requestNumber: `PR-${String(sequence).padStart(4, '0')}`,
			requester: requesters[index % requesters.length],
			area: areas[index % areas.length],
			status,
			priority,
			total: 850 + sequence * 137 + (index % 5) * 95
		};
	});

	let selectedPurchaseRequestIds = $state<Array<string | number>>([
		purchaseRequests[0].id,
		purchaseRequests[3].id,
		purchaseRequests[7].id
	]);
	let sortDescriptor = $state<TableSortDescriptor | undefined>(undefined);
	let tableVariant = $state<TableVariant>('current');
	let rowCount = $state<(typeof rowCountOptions)[number]>(defaultRowCount);
	let tableRunVersion = $state(0);
	let nextRunId = 1;
	let remountState = $state<'idle' | 'running'>('idle');
	let sweepState = $state<'idle' | 'running'>('idle');
	let hydrationMetricsByVariant = $state<Record<TableVariant, RowBenchmarkMetrics | null>>({
		current: null,
		'current-no-selection': null,
		raw: null
	});
	let remountMetricsByVariant = $state<Record<TableVariant, RowBenchmarkMetrics | null>>({
		current: null,
		'current-no-selection': null,
		raw: null
	});
	let benchmarkHistory = $state<RowBenchmarkMetrics[]>([]);
	let sweepResultsByVariant = $state<Record<TableVariant, RowBenchmarkMetrics[]>>({
		current: [],
		'current-no-selection': [],
		raw: []
	});
	let tableHost = $state<HTMLDivElement | undefined>(undefined);
	let activeRun = $state<RowBenchmarkRun | null>(
		browser
			? {
					id: nextRunId++,
					phase: 'hydrate',
					variant: 'current',
					rowCount: defaultRowCount,
					startedAt: performance.now(),
					samples: [],
					seenRows: new SvelteSet()
				}
			: null
	);
	const pendingRunResolvers = new SvelteMap<number, (metrics: RowBenchmarkMetrics) => void>();

	const visiblePurchaseRequests = $derived(purchaseRequests.slice(0, rowCount));
	const isBusy = $derived(remountState === 'running' || sweepState === 'running');
	const hydrationMetrics = $derived(hydrationMetricsByVariant[tableVariant]);
	const remountMetrics = $derived(remountMetricsByVariant[tableVariant]);
	const activeSweepSummary = $derived.by(() =>
		getSweepSummary(sweepResultsByVariant[tableVariant])
	);
	const remountComparison = $derived.by(() => {
		const current = remountMetricsByVariant.current;
		const raw = remountMetricsByVariant.raw;
		if (!current || !raw || current.rowCount !== raw.rowCount) return null;

		return {
			rowCount: current.rowCount,
			bootstrapDeltaMs: current.bootstrapMs - raw.bootstrapMs,
			totalDeltaMs: current.totalMs - raw.totalMs,
			incrementalDeltaMs: current.incrementalRowMs - raw.incrementalRowMs,
			domNodesDelta: current.domNodesPerRow - raw.domNodesPerRow
		} satisfies RemountComparison;
	});
	const selectionStackComparison = $derived.by(() => {
		const current = remountMetricsByVariant.current;
		const noSelection = remountMetricsByVariant['current-no-selection'];
		if (!current || !noSelection || current.rowCount !== noSelection.rowCount) return null;

		return {
			rowCount: current.rowCount,
			bootstrapDeltaMs: current.bootstrapMs - noSelection.bootstrapMs,
			totalDeltaMs: current.totalMs - noSelection.totalMs,
			incrementalDeltaMs: current.incrementalRowMs - noSelection.incrementalRowMs,
			domNodesDelta: current.domNodesPerRow - noSelection.domNodesPerRow
		} satisfies RemountComparison;
	});
	const sweepComparison = $derived.by(() => {
		const current = getSweepSummary(sweepResultsByVariant.current);
		const raw = getSweepSummary(sweepResultsByVariant.raw);
		if (!current || !raw) return null;

		return {
			interceptDeltaMs: current.interceptMs - raw.interceptMs,
			slopeDeltaMsPerRow: current.slopeMsPerRow - raw.slopeMsPerRow
		};
	});
	const selectionSweepComparison = $derived.by(() => {
		const current = getSweepSummary(sweepResultsByVariant.current);
		const noSelection = getSweepSummary(sweepResultsByVariant['current-no-selection']);
		if (!current || !noSelection) return null;

		return {
			interceptDeltaMs: current.interceptMs - noSelection.interceptMs,
			slopeDeltaMsPerRow: current.slopeMsPerRow - noSelection.slopeMsPerRow
		};
	});
	const automationSnapshot = $derived.by<SandboxAutomationSnapshot>(() => ({
		generatedAt: new Date().toISOString(),
		activeVariant: tableVariant,
		activeRows: rowCount,
		hydration: hydrationMetricsByVariant,
		remount: remountMetricsByVariant,
		lastMetric: benchmarkHistory[0] ?? null,
		priorityHydrationBootstrapMs: hydrationMetricsByVariant.current?.bootstrapMs ?? null
	}));
	const automationSnapshotJson = $derived(JSON.stringify(automationSnapshot));

	function percentile(sortedSamples: number[], ratio: number) {
		if (sortedSamples.length === 0) return 0;
		const index = Math.min(
			sortedSamples.length - 1,
			Math.max(0, Math.ceil(sortedSamples.length * ratio) - 1)
		);
		return sortedSamples[index];
	}

	function getIncrementalRowMs(firstRowMs: number, totalMs: number, rowCount: number) {
		if (rowCount <= 1) return 0;
		return Math.max(0, totalMs - firstRowMs) / (rowCount - 1);
	}

	function getSweepSummary(results: RowBenchmarkMetrics[]) {
		if (results.length < 2) return null;

		const xMean = results.reduce((sum, metrics) => sum + metrics.rowCount, 0) / results.length;
		const yMean = results.reduce((sum, metrics) => sum + metrics.totalMs, 0) / results.length;
		const numerator = results.reduce(
			(sum, metrics) => sum + (metrics.rowCount - xMean) * (metrics.totalMs - yMean),
			0
		);
		const denominator = results.reduce((sum, metrics) => sum + (metrics.rowCount - xMean) ** 2, 0);

		if (denominator === 0) return null;

		return {
			interceptMs: yMean - (numerator / denominator) * xMean,
			slopeMsPerRow: numerator / denominator,
			minRows: Math.min(...results.map((metrics) => metrics.rowCount)),
			maxRows: Math.max(...results.map((metrics) => metrics.rowCount))
		} satisfies SweepSummary;
	}

	function nextFrame() {
		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});
	}

	function createRun(
		phase: BenchmarkPhase,
		variant: TableVariant,
		currentRowCount: number
	): RowBenchmarkRun {
		return {
			id: nextRunId++,
			phase,
			variant,
			rowCount: currentRowCount,
			startedAt: performance.now(),
			samples: [],
			seenRows: new SvelteSet()
		};
	}

	function getRowFootprint() {
		const rowElement = tableHost?.querySelector<HTMLElement>('[data-purchase-request-row]');
		if (!rowElement) {
			return {
				domNodesPerRow: 0,
				cellsPerRow: 0
			};
		}

		return {
			domNodesPerRow: 1 + rowElement.querySelectorAll('*').length,
			cellsPerRow: rowElement.querySelectorAll('td,th').length
		};
	}

	function publishAutomationSnapshot(reason: 'hydrate' | 'remount') {
		if (!browser) return;

		(window as SandboxWindow).__HK_SANDBOX_BENCHMARKS__ = automationSnapshot;
		console.info('[sandbox-benchmarks]', automationSnapshot);

		if (reason === 'hydrate' && automationSnapshot.priorityHydrationBootstrapMs !== null) {
			console.info(
				`[sandbox-hydrate-bootstrap] current=${automationSnapshot.priorityHydrationBootstrapMs.toFixed(1)}ms rows=${automationSnapshot.activeRows}`
			);
		}
	}

	function recordMetrics(metrics: RowBenchmarkMetrics) {
		benchmarkHistory = [metrics, ...benchmarkHistory].slice(0, 18);
		if (metrics.phase === 'hydrate') {
			hydrationMetricsByVariant = {
				...hydrationMetricsByVariant,
				[metrics.variant]: metrics
			};
			publishAutomationSnapshot('hydrate');
			return;
		}

		remountMetricsByVariant = {
			...remountMetricsByVariant,
			[metrics.variant]: metrics
		};
		remountState = 'idle';
		publishAutomationSnapshot('remount');
	}

	async function finalizeRun(run: RowBenchmarkRun) {
		await tick();
		await nextFrame();

		const sortedSamples = [...run.samples].sort((left, right) => left - right);
		const footprint = getRowFootprint();
		const firstRowMs = sortedSamples[0] ?? 0;
		const totalMs = sortedSamples.at(-1) ?? 0;
		const metrics = {
			id: run.id,
			phase: run.phase,
			variant: run.variant,
			rowCount: run.rowCount,
			bootstrapMs: firstRowMs,
			fanoutMs: Math.max(0, totalMs - firstRowMs),
			incrementalRowMs: getIncrementalRowMs(firstRowMs, totalMs, run.rowCount),
			firstRowMs,
			medianRowMs: percentile(sortedSamples, 0.5),
			p95RowMs: percentile(sortedSamples, 0.95),
			totalMs,
			domNodesPerRow: footprint.domNodesPerRow,
			cellsPerRow: footprint.cellsPerRow
		} satisfies RowBenchmarkMetrics;

		recordMetrics(metrics);
		pendingRunResolvers.get(run.id)?.(metrics);
		pendingRunResolvers.delete(run.id);

		if (activeRun?.id === run.id) {
			activeRun = null;
		}
	}

	function handleRowMeasure(rowId: string | number, timestamp: number) {
		const run = activeRun;
		if (!run || run.seenRows.has(rowId)) return;

		const nextSeenRows = new SvelteSet(run.seenRows);
		nextSeenRows.add(rowId);
		const nextRun = {
			...run,
			seenRows: nextSeenRows,
			samples: [...run.samples, timestamp - run.startedAt]
		} satisfies RowBenchmarkRun;

		activeRun = nextRun;

		if (nextRun.samples.length === nextRun.rowCount) {
			void finalizeRun(nextRun);
		}
	}

	async function startRemountRun(
		targetVariant: TableVariant,
		targetRowCount: (typeof rowCountOptions)[number]
	) {
		tableVariant = targetVariant;
		rowCount = targetRowCount;
		await tick();

		remountState = 'running';
		activeRun = createRun('remount', targetVariant, targetRowCount);
		const runId = activeRun.id;
		const resultPromise = new Promise<RowBenchmarkMetrics>((resolve) => {
			pendingRunResolvers.set(runId, resolve);
		});
		tableRunVersion += 1;

		return await resultPromise;
	}

	function runRemountBenchmark() {
		if (!browser || isBusy) return;
		void startRemountRun(tableVariant, rowCount);
	}

	async function runSizeSweep() {
		if (!browser || isBusy) return;

		sweepState = 'running';
		const targetVariant = tableVariant;
		const previousRowCount = rowCount;
		const results: RowBenchmarkMetrics[] = [];
		sweepResultsByVariant = {
			...sweepResultsByVariant,
			[targetVariant]: []
		};

		try {
			for (const size of rowCountOptions) {
				const metrics = await startRemountRun(targetVariant, size);
				results.push(metrics);
				sweepResultsByVariant = {
					...sweepResultsByVariant,
					[targetVariant]: [...results]
				};
			}
		} finally {
			rowCount = previousRowCount;
			tableVariant = targetVariant;
			sweepState = 'idle';
		}
	}

	function selectVariant(variant: TableVariant) {
		if (isBusy) return;
		tableVariant = variant;
	}
</script>

<svelte:head>
	<title>Sandbox 2 | Static Wrapper</title>
</svelte:head>

<div class="flex h-full min-h-[calc(100svh-8px)] min-w-0 flex-col gap-3">
	<header class="rounded-xl border border-border bg-depth-1 px-5 py-4 shadow-sm">
		<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
			Sandbox Route 2
		</p>
		<h2 class="mt-2 text-2xl font-semibold text-foreground">Purchase Requests - Static Wrapper</h2>
		<p class="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
			This sandbox keeps the same benchmark harness as the original route, but uses the
			static-columns wrapper instead of the dynamic child-registration wrapper.
		</p>
		<div
			class="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-background/80 px-4 py-3 text-sm"
		>
			<div class="flex flex-wrap items-center gap-2">
				<span class="font-medium text-foreground">Variant</span>
				{#each tableVariantOptions as option (option.id)}
					<button
						type="button"
						class={`rounded-md border px-3 py-1.5 font-medium transition ${tableVariant === option.id ? 'border-foreground bg-depth-2 text-foreground' : 'border-border bg-background text-muted-foreground hover:bg-depth-2'}`}
						onclick={() => selectVariant(option.id)}
						disabled={isBusy}
					>
						{option.label}
					</button>
				{/each}
			</div>
			<label class="flex items-center gap-2 text-sm text-foreground">
				<span class="font-medium">Rows</span>
				<select
					class="rounded-md border border-border bg-depth-2 px-3 py-1.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
					bind:value={rowCount}
					disabled={isBusy}
				>
					{#each rowCountOptions as option (option)}
						<option value={option}>{option} rows</option>
					{/each}
				</select>
			</label>
			<button
				type="button"
				class="rounded-md border border-border bg-depth-2 px-3 py-1.5 font-medium text-foreground transition hover:bg-depth-3 disabled:cursor-wait disabled:opacity-60"
				onclick={runRemountBenchmark}
				disabled={isBusy}
			>
				{remountState === 'running' ? 'Running remount…' : 'Run remount benchmark'}
			</button>
			<button
				type="button"
				class="rounded-md border border-border bg-depth-2 px-3 py-1.5 font-medium text-foreground transition hover:bg-depth-3 disabled:cursor-wait disabled:opacity-60"
				onclick={runSizeSweep}
				disabled={isBusy}
			>
				{sweepState === 'running' ? 'Running size sweep…' : 'Run size sweep'}
			</button>
			<p class="text-muted-foreground">
				Bootstrap is the time until the first row appears. Incremental row cost only measures the
				fan-out after that first row.
			</p>
		</div>
		<div class="mt-3 grid gap-3 text-sm text-foreground md:grid-cols-3 xl:grid-cols-5">
			<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
				<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Scenario</p>
				<p class="mt-1 text-lg font-semibold">{variantLabels[tableVariant]}</p>
				<p class="mt-1 text-xs text-muted-foreground">
					{tableVariantOptions.find((option) => option.id === tableVariant)?.description}
				</p>
			</div>
			<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
				<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Rows loaded</p>
				<p class="mt-1 text-lg font-semibold">{rowCount}</p>
			</div>
			<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
				<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
					Hydration bootstrap
				</p>
				<p class="mt-1 text-lg font-semibold">
					{hydrationMetrics ? `${hydrationMetrics.bootstrapMs.toFixed(1)} ms` : 'Pending'}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Only available for the variant loaded from SSR
				</p>
			</div>
			<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
				<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
					Remount bootstrap
				</p>
				<p class="mt-1 text-lg font-semibold">
					{remountMetrics ? `${remountMetrics.bootstrapMs.toFixed(1)} ms` : 'Run benchmark'}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">Time until first row mounts</p>
			</div>
			<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
				<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
					Remount incremental
				</p>
				<p class="mt-1 text-lg font-semibold">
					{remountMetrics
						? `${remountMetrics.incrementalRowMs.toFixed(2)} ms/row`
						: 'Run benchmark'}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					{remountMetrics
						? `${remountMetrics.fanoutMs.toFixed(1)} ms after first row`
						: 'Run benchmark'}
				</p>
			</div>
			<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
				<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
					Active sweep intercept
				</p>
				<p class="mt-1 text-lg font-semibold">
					{activeSweepSummary
						? `${activeSweepSummary.interceptMs.toFixed(1)} ms`
						: 'Run size sweep'}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Estimated fixed cost for {variantLabels[tableVariant]}
				</p>
			</div>
			<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
				<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
					Active sweep slope
				</p>
				<p class="mt-1 text-lg font-semibold">
					{activeSweepSummary
						? `${activeSweepSummary.slopeMsPerRow.toFixed(3)} ms/row`
						: 'Run size sweep'}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					{activeSweepSummary
						? `${activeSweepSummary.minRows}-${activeSweepSummary.maxRows} rows fitted`
						: 'Estimated from remount totals across several sizes'}
				</p>
			</div>
			<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
				<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">DOM nodes/row</p>
				<p class="mt-1 text-lg font-semibold">
					{(remountMetrics ?? hydrationMetrics)?.domNodesPerRow ?? 0}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					{(remountMetrics ?? hydrationMetrics)?.cellsPerRow ?? 0} cells per row
				</p>
			</div>
			{#if remountComparison}
				<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3 xl:col-span-2">
					<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						Current vs raw remount
					</p>
					<p class="mt-1 text-lg font-semibold">{remountComparison.rowCount} rows</p>
					<p class="mt-1 text-xs text-muted-foreground">
						Current - raw bootstrap: {remountComparison.bootstrapDeltaMs.toFixed(1)} ms, total: {remountComparison.totalDeltaMs.toFixed(
							1
						)} ms, incremental: {remountComparison.incrementalDeltaMs.toFixed(2)} ms/row, DOM: {remountComparison.domNodesDelta}
					</p>
				</div>
			{/if}
			{#if selectionStackComparison}
				<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3 xl:col-span-2">
					<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						Current vs no selection remount
					</p>
					<p class="mt-1 text-lg font-semibold">{selectionStackComparison.rowCount} rows</p>
					<p class="mt-1 text-xs text-muted-foreground">
						Current - no selection bootstrap: {selectionStackComparison.bootstrapDeltaMs.toFixed(1)} ms,
						total: {selectionStackComparison.totalDeltaMs.toFixed(1)} ms, incremental: {selectionStackComparison.incrementalDeltaMs.toFixed(
							2
						)} ms/row, DOM: {selectionStackComparison.domNodesDelta}
					</p>
				</div>
			{/if}
			{#if sweepComparison}
				<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3 xl:col-span-2">
					<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						Current vs raw sweep
					</p>
					<p class="mt-1 text-lg font-semibold">Multi-size fit delta</p>
					<p class="mt-1 text-xs text-muted-foreground">
						Current - raw intercept: {sweepComparison.interceptDeltaMs.toFixed(1)} ms, slope: {sweepComparison.slopeDeltaMsPerRow.toFixed(
							3
						)} ms/row
					</p>
				</div>
			{/if}
			{#if selectionSweepComparison}
				<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3 xl:col-span-2">
					<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						Current vs no selection sweep
					</p>
					<p class="mt-1 text-lg font-semibold">Multi-size fit delta</p>
					<p class="mt-1 text-xs text-muted-foreground">
						Current - no selection intercept: {selectionSweepComparison.interceptDeltaMs.toFixed(1)} ms,
						slope: {selectionSweepComparison.slopeDeltaMsPerRow.toFixed(3)} ms/row
					</p>
				</div>
			{/if}
		</div>
		<div
			class="mt-3 rounded-lg border border-border/70 bg-background/70 px-4 py-4 text-sm text-foreground"
		>
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div>
					<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						Optimization TODO
					</p>
					<h3 class="mt-1 text-lg font-semibold text-foreground">
						Attack one responsibility at a time
					</h3>
				</div>
				<p class="max-w-2xl text-xs leading-5 text-muted-foreground">
					For each responsibility: keep the same row counts, change one thing, rerun remount and
					size sweep, then record the delta before moving to the next item.
				</p>
			</div>
			<div class="mt-4 grid gap-3 xl:grid-cols-2">
				{#each optimizationTodos as todo (todo.responsibility)}
					<article class="rounded-lg border border-border/60 bg-depth-1/60 px-4 py-4">
						<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
							Responsibility
						</p>
						<h4 class="mt-1 text-base font-semibold text-foreground">{todo.responsibility}</h4>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">{todo.why}</p>

						<div class="mt-4">
							<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Mini plan</p>
							<ul class="mt-2 space-y-2 text-sm text-foreground">
								{#each todo.plan as step (step)}
									<li class="flex items-start gap-2">
										<input type="checkbox" aria-hidden="true" tabindex="-1" class="mt-1 size-3.5" />
										<span>{step}</span>
									</li>
								{/each}
							</ul>
						</div>

						<div class="mt-4">
							<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
								Measure after
							</p>
							<ul class="mt-2 space-y-2 text-sm text-muted-foreground">
								{#each todo.measure as check (check)}
									<li>{check}</li>
								{/each}
							</ul>
						</div>

						<div class="mt-4">
							<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
								Touch points
							</p>
							<p class="mt-2 text-xs leading-5 text-muted-foreground">{todo.files.join(' - ')}</p>
						</div>
					</article>
				{/each}
			</div>
		</div>
		{#if hydrationMetrics || remountMetrics}
			<div class="mt-3 grid gap-3 text-sm text-foreground md:grid-cols-2">
				<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
					<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						Hydration breakdown
					</p>
					<p class="mt-1 text-lg font-semibold">
						{hydrationMetrics ? `${hydrationMetrics.medianRowMs.toFixed(1)} ms median` : 'Pending'}
					</p>
					<p class="mt-1 text-xs text-muted-foreground">
						{hydrationMetrics
							? `${hydrationMetrics.bootstrapMs.toFixed(1)} ms bootstrap, ${hydrationMetrics.fanoutMs.toFixed(1)} ms fan-out, ${hydrationMetrics.incrementalRowMs.toFixed(2)} ms incremental/row`
							: 'Reload on this variant if you need hydration data.'}
					</p>
				</div>
				<div class="rounded-lg border border-border/70 bg-background/70 px-4 py-3">
					<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						Remount breakdown
					</p>
					<p class="mt-1 text-lg font-semibold">
						{remountMetrics
							? `${remountMetrics.medianRowMs.toFixed(1)} ms median`
							: 'No remount run yet'}
					</p>
					<p class="mt-1 text-xs text-muted-foreground">
						{remountMetrics
							? `${remountMetrics.bootstrapMs.toFixed(1)} ms bootstrap, ${remountMetrics.fanoutMs.toFixed(1)} ms fan-out, ${remountMetrics.incrementalRowMs.toFixed(2)} ms incremental/row`
							: 'Use the button to force a fresh client-side mount of the current rows.'}
					</p>
				</div>
			</div>
		{/if}
		{#if benchmarkHistory.length > 0}
			<div class="mt-3 overflow-hidden rounded-lg border border-border/70 bg-background/70">
				<table class="min-w-full text-left text-sm text-foreground">
					<thead
						class="border-b border-border/70 bg-depth-2/70 text-xs uppercase tracking-[0.18em] text-muted-foreground"
					>
						<tr>
							<th class="px-4 py-3 font-medium">Variant</th>
							<th class="px-4 py-3 font-medium">Run</th>
							<th class="px-4 py-3 font-medium">Rows</th>
							<th class="px-4 py-3 font-medium">Bootstrap</th>
							<th class="px-4 py-3 font-medium">Fan-out</th>
							<th class="px-4 py-3 font-medium">Incremental/row</th>
							<th class="px-4 py-3 font-medium">Median</th>
							<th class="px-4 py-3 font-medium">P95</th>
							<th class="px-4 py-3 font-medium">Total</th>
							<th class="px-4 py-3 font-medium">DOM/row</th>
						</tr>
					</thead>
					<tbody>
						{#each benchmarkHistory as metrics (metrics.id)}
							<tr class="border-b border-border/60 last:border-b-0">
								<td class="px-4 py-3 font-medium">{variantLabels[metrics.variant]}</td>
								<td class="px-4 py-3 font-medium capitalize">{metrics.phase}</td>
								<td class="px-4 py-3">{metrics.rowCount}</td>
								<td class="px-4 py-3">{metrics.bootstrapMs.toFixed(1)} ms</td>
								<td class="px-4 py-3">{metrics.fanoutMs.toFixed(1)} ms</td>
								<td class="px-4 py-3">{metrics.incrementalRowMs.toFixed(2)} ms</td>
								<td class="px-4 py-3">{metrics.medianRowMs.toFixed(1)} ms</td>
								<td class="px-4 py-3">{metrics.p95RowMs.toFixed(1)} ms</td>
								<td class="px-4 py-3">{metrics.totalMs.toFixed(1)} ms</td>
								<td class="px-4 py-3">{metrics.domNodesPerRow}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
		<pre
			hidden
			data-sandbox-benchmarks
			data-priority-hydration-bootstrap={automationSnapshot.priorityHydrationBootstrapMs?.toFixed(
				1
			) ?? undefined}>{automationSnapshotJson}</pre>
	</header>

	<div bind:this={tableHost}>
		{#key `${tableVariant}-${tableRunVersion}`}
			{#if tableVariant === 'current' || tableVariant === 'current-no-selection'}
				<StaticReproTable
					aria-label="Purchase requests"
					items={visiblePurchaseRequests}
					columns={resolvedColumns}
					class="max-h-[calc(100vh-140px)] w-full"
					selectionMode={tableVariant === 'current' ? 'multiple' : 'none'}
					bind:selectedKeys={selectedPurchaseRequestIds}
					bind:sortDescriptor
				>
					{#snippet rowProbe(item: PurchaseRequest)}
						<RowCostProbe rowId={item.id} onMeasure={handleRowMeasure} />
					{/snippet}
				</StaticReproTable>
			{:else}
				<div
					class="max-h-[calc(100vh-140px)] overflow-auto rounded-xl border border-border bg-background shadow-sm"
				>
					<table class="min-w-full border-collapse text-sm text-foreground">
						<thead class="sticky top-0 z-10 bg-depth-1">
							<tr class="border-b border-border/70 text-left">
								<th class="w-11 px-3 py-2 text-center font-medium text-muted-foreground">
									<input type="checkbox" aria-label="Select all rows" />
								</th>
								<th class="px-3 py-2 font-medium text-muted-foreground">Request</th>
								<th class="px-3 py-2 font-medium text-muted-foreground">Requester</th>
								<th class="px-3 py-2 font-medium text-muted-foreground">Area</th>
								<th class="px-3 py-2 font-medium text-muted-foreground">Status</th>
								<th class="px-3 py-2 font-medium text-muted-foreground">Priority</th>
								<th class="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
							</tr>
						</thead>
						<tbody>
							{#each visiblePurchaseRequests as item (item.id)}
								<tr
									class="border-b border-border/50 bg-background hover:bg-depth-2/40"
									data-purchase-request-row={item.id}
								>
									<td class="px-3 py-2 text-center align-middle">
										<RowCostProbe rowId={item.id} onMeasure={handleRowMeasure} />
										<input type="checkbox" aria-label={`Select ${item.requestNumber}`} />
									</td>
									<th scope="row" class="px-3 py-2 font-medium text-foreground">
										{item.requestNumber}
									</th>
									<td class="px-3 py-2">{item.requester}</td>
									<td class="px-3 py-2">{item.area}</td>
									<td class="px-3 py-2">{item.status}</td>
									<td class="px-3 py-2">{item.priority}</td>
									<td class="px-3 py-2 text-right">${item.total.toLocaleString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/key}
	</div>
</div>
