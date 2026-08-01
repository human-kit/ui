<script lang="ts">
	import { flushSync, onMount, tick } from 'svelte';
	import {
		Table,
		type TableContext,
		type TableSelectionKey,
		type TableSortDescriptor
	} from '@human-kit/ui/table';
	import {
		LongTaskRecorder,
		describeCoverage,
		describeFrames,
		recordFrames,
		sampleCoverage,
		settle,
		timeSyncUpdate,
		type CoverageGeometry
	} from '$lib/bench/metrics';
	import type { ScenarioName, ScenarioResult, TableBenchConfig } from '$lib/bench/types';

	type BenchRow = Record<string, unknown> & { id: number };

	const DEFAULT_CONFIG: TableBenchConfig = {
		rows: 500,
		columns: 8,
		selectionMode: 'multiple',
		resizable: true,
		pinFirstColumn: false,
		virtualized: true,
		rowHeight: 32,
		overscan: undefined,
		cellVariant: 'rich',
		viewportHeight: 640
	};

	function readConfigFromLocation(): TableBenchConfig {
		if (typeof window === 'undefined') return DEFAULT_CONFIG;
		const params = new URLSearchParams(window.location.search);

		function int(key: string, fallback: number) {
			const raw = params.get(key);
			if (raw === null) return fallback;
			const parsed = Number.parseInt(raw, 10);
			return Number.isFinite(parsed) ? parsed : fallback;
		}

		function bool(key: string, fallback: boolean) {
			const raw = params.get(key);
			if (raw === null) return fallback;
			return raw !== '0' && raw !== 'false';
		}

		const overscanRaw = params.get('overscan');
		const selectionMode = params.get('selection');
		const cellVariant = params.get('cells');

		return {
			rows: int('rows', DEFAULT_CONFIG.rows),
			columns: int('columns', DEFAULT_CONFIG.columns),
			selectionMode:
				selectionMode === 'none' || selectionMode === 'single' || selectionMode === 'multiple'
					? selectionMode
					: DEFAULT_CONFIG.selectionMode,
			resizable: bool('resizable', DEFAULT_CONFIG.resizable),
			pinFirstColumn: bool('pin', DEFAULT_CONFIG.pinFirstColumn),
			virtualized: bool('virtualized', DEFAULT_CONFIG.virtualized),
			rowHeight: int('rowHeight', DEFAULT_CONFIG.rowHeight),
			overscan:
				overscanRaw === null ? DEFAULT_CONFIG.overscan : Number.parseInt(overscanRaw, 10) || 0,
			cellVariant: cellVariant === 'text' || cellVariant === 'rich' ? cellVariant : 'rich',
			viewportHeight: int('viewportHeight', DEFAULT_CONFIG.viewportHeight)
		};
	}

	let config = $state<TableBenchConfig>(readConfigFromLocation());
	let mounted = $state(true);
	let scrollContainer = $state<HTMLDivElement | undefined>(undefined);
	let tableContext = $state<TableContext | undefined>(undefined);
	let sortDescriptor = $state<TableSortDescriptor | undefined>(undefined);
	let selectedKeys = $state<Iterable<TableSelectionKey>>(new Set<TableSelectionKey>());
	let status = $state('idle');
	let lastResult = $state<ScenarioResult | undefined>(undefined);

	const SCENARIOS: ScenarioName[] = [
		'mount',
		'scroll-smooth',
		'scroll-fast',
		'scroll-jump',
		'resize-column',
		'select-all',
		'sort-toggle'
	];

	// Deterministic pseudo-random text so every run measures identical work.
	function lcg(seed: number) {
		let state = seed;
		return () => {
			state = (state * 1103515245 + 12345) % 2147483648;
			return state / 2147483648;
		};
	}

	const WORDS = [
		'ANA MARIA AGUDELO',
		'ISABELLA CADAVID',
		'PAULA CAROLINA',
		'NICOLLE VALENTINA',
		'YENI MARCELA',
		'KATHERINE DE LOS ANGELES',
		'LAURA NATALIA GONZALEZ',
		'WENDY NICOLLE CASTELLANOS'
	];

	// Derived (not `$state`) on purpose: the app hands the table plain arrays
	// straight from the query cache, so deep-proxying thousands of rows here
	// would measure Svelte's proxy overhead instead of the table's.
	const items = $derived.by<BenchRow[]>(() => {
		const random = lcg(42);
		const rows: BenchRow[] = [];
		for (let index = 0; index < config.rows; index += 1) {
			const row: BenchRow = { id: index };
			for (let column = 0; column < config.columns; column += 1) {
				row[`col${column}`] =
					column === 0
						? `${WORDS[Math.floor(random() * WORDS.length)]} ${index}`
						: column % 3 === 0
							? Math.round(random() * 100000)
							: `value-${Math.floor(random() * 1_000_000)}`;
			}
			rows.push(row);
		}
		return rows;
	});

	const columnIds = $derived(Array.from({ length: config.columns }, (_, index) => `col${index}`));
	const virtualizer = $derived(
		config.virtualized ? { rowHeight: config.rowHeight, overscan: config.overscan } : undefined
	);

	function countRenderedRows() {
		if (!scrollContainer) return 0;
		return scrollContainer.querySelectorAll('tbody tr:not([data-virtual-spacer])').length;
	}

	// Measured once per scenario rather than per sample: the coverage probe must
	// not force a layout on every frame it observes.
	function readCoverageGeometry(): CoverageGeometry {
		const header = scrollContainer?.querySelector<HTMLElement>('thead');
		return {
			rowHeight: config.rowHeight,
			headerHeight: header ? header.getBoundingClientRect().height : 0
		};
	}

	async function remount() {
		mounted = false;
		flushSync();
		await tick();
		mounted = true;
		flushSync();
		await settle();
	}

	async function scrollScenario(
		scenario: ScenarioName,
		frames: number,
		step: (frame: number, container: HTMLElement) => void
	): Promise<ScenarioResult> {
		const container = scrollContainer;
		if (!container) throw new Error('bench: scroll container is not mounted');

		container.scrollTop = 0;
		await settle();

		// How many times the table invalidated its layout/width caches during the
		// scenario. Scrolling should not need to rebuild the column layout at all,
		// so a non-zero count here separates "the table is re-deriving too much"
		// from "the browser is simply relaying out the mounted rows".
		const epochsBefore = {
			layout: tableContext?.layoutEpoch ?? 0,
			width: tableContext?.widthEpoch ?? 0,
			selection: tableContext?.selectionEpoch ?? 0
		};

		const longTasks = new LongTaskRecorder();
		longTasks.start();
		// No coverage sampling here on purpose. Programmatic `scrollTop` writes
		// can never leave rows unpainted — the body's scroll handler flushes
		// synchronously in the same frame — so the probe would only add its own
		// `querySelectorAll` cost to a pure frame-pacing measurement. Blank
		// coverage is measured by the wheel watch, where it can actually happen.
		const recording = await recordFrames(frames, (frame) => step(frame, container));
		const longTaskStats = longTasks.stop();

		return {
			scenario,
			config: { ...config },
			epochs: {
				layout: (tableContext?.layoutEpoch ?? 0) - epochsBefore.layout,
				width: (tableContext?.widthEpoch ?? 0) - epochsBefore.width,
				selection: (tableContext?.selectionEpoch ?? 0) - epochsBefore.selection
			},
			frames: describeFrames(recording.deltas),
			longTasks: longTaskStats,
			renderedRows: countRenderedRows(),
			durationMs: recording.durationMs
		};
	}

	async function runMount(): Promise<ScenarioResult> {
		mounted = false;
		flushSync();
		await settle();

		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const startedAt = performance.now();
		const syncMs = timeSyncUpdate(
			() => {
				mounted = true;
			},
			() => flushSync()
		);
		// Let layout effects (measurement, width resolution) finish before stopping.
		await settle();
		const longTaskStats = longTasks.stop();

		return {
			scenario: 'mount',
			config: { ...config },
			longTasks: longTaskStats,
			syncMs,
			renderedRows: countRenderedRows(),
			durationMs: performance.now() - startedAt
		};
	}

	function dispatchPointer(target: EventTarget, type: string, clientX: number, pointerId: number) {
		target.dispatchEvent(
			new PointerEvent(type, {
				bubbles: true,
				cancelable: true,
				composed: true,
				pointerId,
				pointerType: 'mouse',
				isPrimary: true,
				button: 0,
				buttons: type === 'pointerup' ? 0 : 1,
				clientX,
				clientY: 12
			})
		);
	}

	async function runResizeColumn(): Promise<ScenarioResult> {
		const container = scrollContainer;
		if (!container) throw new Error('bench: scroll container is not mounted');

		const resizer = container.querySelector<HTMLElement>('[data-table-column-resizer="true"]');
		if (!resizer) throw new Error('bench: no column resizer found (run with resizable=1)');

		await settle();

		const rect = resizer.getBoundingClientRect();
		const originX = rect.left + rect.width / 2;
		const pointerId = 1;

		const longTasks = new LongTaskRecorder();
		longTasks.start();
		dispatchPointer(resizer, 'pointerdown', originX, pointerId);

		// 120 frames of a slow drag out and back, one move per frame — the
		// resizer rAF-throttles moves, so this maps 1:1 onto its update loop.
		const recording = await recordFrames(120, (frame) => {
			const offset = frame < 60 ? frame * 3 : (120 - frame) * 3;
			dispatchPointer(window, 'pointermove', originX + offset, pointerId);
		});

		dispatchPointer(window, 'pointerup', originX, pointerId);
		await settle();
		const longTaskStats = longTasks.stop();

		return {
			scenario: 'resize-column',
			config: { ...config },
			frames: describeFrames(recording.deltas),
			longTasks: longTaskStats,
			renderedRows: countRenderedRows(),
			durationMs: recording.durationMs
		};
	}

	async function runSelectAll(): Promise<ScenarioResult> {
		const context = tableContext;
		if (!context) throw new Error('bench: table context is not available');

		selectedKeys = new Set<TableSelectionKey>();
		await settle();

		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const startedAt = performance.now();
		const syncMs = timeSyncUpdate(
			() => context.selectAllRows(),
			() => flushSync()
		);
		await settle();
		const longTaskStats = longTasks.stop();

		return {
			scenario: 'select-all',
			config: { ...config },
			longTasks: longTaskStats,
			syncMs,
			renderedRows: countRenderedRows(),
			durationMs: performance.now() - startedAt
		};
	}

	async function runSortToggle(): Promise<ScenarioResult> {
		sortDescriptor = undefined;
		await settle();

		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const startedAt = performance.now();
		const syncMs = timeSyncUpdate(
			() => {
				sortDescriptor = { column: 'col0', direction: 'ascending' };
			},
			() => flushSync()
		);
		await settle();
		const longTaskStats = longTasks.stop();

		return {
			scenario: 'sort-toggle',
			config: { ...config },
			longTasks: longTaskStats,
			syncMs,
			renderedRows: countRenderedRows(),
			durationMs: performance.now() - startedAt
		};
	}

	// Externally driven watch: the runner sends real wheel input over CDP while
	// this samples every frame. Only real input lets the compositor scroll ahead
	// of the main thread, which is what leaves rows unpainted.
	let watch:
		| {
				stop: boolean;
				startedAt: number;
				deltas: number[];
				coverage: ReturnType<typeof sampleCoverage>[];
				longTasks: LongTaskRecorder;
		  }
		| undefined;

	async function startWatch() {
		const container = scrollContainer;
		if (!container) throw new Error('bench: scroll container is not mounted');

		container.scrollTop = 0;
		await settle();

		const geometry = readCoverageGeometry();
		const longTasks = new LongTaskRecorder();
		longTasks.start();
		const session = {
			stop: false,
			startedAt: performance.now(),
			deltas: [] as number[],
			coverage: [] as ReturnType<typeof sampleCoverage>[],
			longTasks
		};
		watch = session;

		let previousTimestamp: number | undefined;
		const step = (timestamp: number) => {
			if (session.stop) return;
			if (previousTimestamp !== undefined) session.deltas.push(timestamp - previousTimestamp);
			previousTimestamp = timestamp;
			session.coverage.push(sampleCoverage(container, geometry));
			requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}

	function stopWatch(): ScenarioResult {
		const session = watch;
		if (!session) throw new Error('bench: no watch in progress');
		session.stop = true;
		watch = undefined;

		const samples = session.coverage.filter((sample) => sample !== null);

		return {
			scenario: 'scroll-fast',
			config: { ...config },
			frames: describeFrames(session.deltas),
			coverage: describeCoverage(samples),
			longTasks: session.longTasks.stop(),
			renderedRows: countRenderedRows(),
			durationMs: performance.now() - session.startedAt
		};
	}

	async function run(scenario: ScenarioName): Promise<ScenarioResult> {
		status = `running ${scenario}`;
		try {
			switch (scenario) {
				case 'mount':
					return await runMount();
				case 'scroll-smooth':
					// ~8 px/frame: a comfortable trackpad scroll.
					return await scrollScenario('scroll-smooth', 150, (frame, container) => {
						container.scrollTop = frame * 8;
					});
				case 'scroll-fast':
					// ~60 px/frame: flicking the wheel, where the gaps show up.
					return await scrollScenario('scroll-fast', 150, (frame, container) => {
						container.scrollTop = frame * 60;
					});
				case 'scroll-jump': {
					// Teleporting defeats every locality optimisation — worst case.
					const random = lcg(7);
					const maxScroll = config.rows * config.rowHeight;
					return await scrollScenario('scroll-jump', 80, (_frame, container) => {
						container.scrollTop = Math.floor(random() * maxScroll);
					});
				}
				case 'resize-column':
					return await runResizeColumn();
				case 'select-all':
					return await runSelectAll();
				case 'sort-toggle':
					return await runSortToggle();
				default:
					throw new Error(`bench: unknown scenario ${String(scenario)}`);
			}
		} finally {
			status = 'idle';
		}
	}

	onMount(() => {
		window.__tableBench = {
			version: 1,
			getConfig: () => ({ ...config }),
			configure: async (patch) => {
				config = { ...config, ...patch };
				await remount();
			},
			run: async (scenario) => {
				const result = await run(scenario);
				lastResult = result;
				return result;
			},
			probeCoverage: () =>
				scrollContainer ? sampleCoverage(scrollContainer, readCoverageGeometry()) : null,
			startWatch,
			stopWatch
		};

		return () => {
			delete window.__tableBench;
		};
	});
</script>

<svelte:head>
	<title>Table benchmark</title>
</svelte:head>

<div class="bench">
	<header class="bench-header">
		<h1>Table benchmark</h1>
		<p data-bench-status={status}>
			{config.rows} rows &times; {config.columns} columns &middot;
			{config.virtualized ? `virtualized @${config.rowHeight}px` : 'not virtualized'} &middot;
			{config.resizable ? 'resizable' : 'fixed'} &middot; selection: {config.selectionMode}
		</p>
	</header>

	<div
		bind:this={scrollContainer}
		class="bench-viewport"
		style:height={`${config.viewportHeight}px`}
	>
		{#if mounted}
			<Table.Root
				aria-label="Benchmark table"
				class="bench-table"
				selectionMode={config.selectionMode}
				bind:selectedKeys
				bind:sortDescriptor
				bind:context={tableContext}
			>
				<Table.Header>
					<Table.Row class="bench-header-row">
						{#if config.selectionMode !== 'none'}
							<Table.Column id="selection" textValue="Selection" width={44}>
								<Table.ColumnHeaderCell class="bench-header-cell bench-selection-cell">
									<Table.Checkbox>
										<Table.CheckboxIndicator />
									</Table.Checkbox>
								</Table.ColumnHeaderCell>
							</Table.Column>
						{/if}

						{#each columnIds as columnId, index (columnId)}
							<Table.Column
								id={columnId}
								textValue={`Column ${index}`}
								rowHeader={index === 0}
								minWidth={120}
								pin={config.pinFirstColumn && index === 0 ? 'left' : undefined}
							>
								<Table.ColumnHeaderCell class="bench-header-cell">
									<div class="bench-header-inner">
										<span class="bench-truncate">Column {index}</span>
										<Table.SortTrigger class="bench-sort">↕</Table.SortTrigger>
										{#if config.resizable}
											<Table.ColumnResizer class="bench-resizer">
												<span class="bench-resizer-line"></span>
											</Table.ColumnResizer>
										{/if}
									</div>
								</Table.ColumnHeaderCell>
							</Table.Column>
						{/each}
					</Table.Row>
				</Table.Header>

				<Table.Body {items} {virtualizer}>
					{#snippet children(item)}
						<Table.Row id={item.id} class="bench-row">
							{#if config.selectionMode !== 'none'}
								<Table.Cell class="bench-cell bench-selection-cell">
									<Table.Checkbox>
										<Table.CheckboxIndicator />
									</Table.Checkbox>
								</Table.Cell>
							{/if}

							{#each columnIds as columnId (columnId)}
								<Table.Cell class="bench-cell">
									{#if config.cellVariant === 'rich'}
										<div class="bench-cell-inner" title={String(item[columnId])}>
											<span class="bench-truncate">{item[columnId]}</span>
										</div>
									{:else}
										{item[columnId]}
									{/if}
								</Table.Cell>
							{/each}
						</Table.Row>
					{/snippet}
				</Table.Body>
			</Table.Root>
		{/if}
	</div>

	<footer class="bench-footer">
		<div class="bench-actions">
			{#each SCENARIOS as scenario (scenario)}
				<button
					type="button"
					onclick={async () => {
						lastResult = await run(scenario);
					}}
				>
					{scenario}
				</button>
			{/each}
		</div>
		{#if lastResult}
			<pre class="bench-output">{JSON.stringify(lastResult, null, 2)}</pre>
		{/if}
	</footer>
</div>

<style>
	.bench {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 13px;
	}

	.bench-header h1 {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
	}

	.bench-header p {
		margin: 4px 0 0;
		color: #666;
	}

	.bench-viewport {
		overflow: auto;
		border: 1px solid #d4d4d4;
		border-radius: 6px;
	}

	.bench-viewport :global(.bench-table) {
		border-collapse: separate;
		border-spacing: 0;
		width: 100%;
	}

	.bench-viewport :global(.bench-header-row) {
		position: sticky;
		top: 0;
		z-index: 2;
	}

	.bench-viewport :global(.bench-header-cell) {
		height: 32px;
		padding: 0 12px;
		background: #fafafa;
		border-bottom: 1px solid #e5e5e5;
		text-align: left;
		font-weight: 500;
		white-space: nowrap;
	}

	.bench-viewport :global(.bench-header-inner) {
		display: flex;
		align-items: center;
		gap: 2px;
		min-width: 0;
		height: 100%;
	}

	.bench-viewport :global(.bench-truncate) {
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bench-viewport :global(.bench-sort) {
		flex: none;
		border: 0;
		background: transparent;
		cursor: pointer;
		padding: 0 2px;
	}

	.bench-viewport :global(.bench-resizer) {
		flex: none;
		width: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: col-resize;
		touch-action: none;
	}

	.bench-viewport :global(.bench-resizer-line) {
		display: block;
		width: 1px;
		height: 18px;
		border-radius: 999px;
		background: #d4d4d4;
	}

	.bench-viewport :global(.bench-row) {
		height: 32px;
	}

	.bench-viewport :global(.bench-cell) {
		height: 32px;
		padding: 0 12px;
		border-bottom: 1px solid #f0f0f0;
		overflow: hidden;
		white-space: nowrap;
	}

	.bench-viewport :global(.bench-cell-inner) {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.bench-viewport :global(.bench-selection-cell) {
		padding: 0;
		text-align: center;
	}

	.bench-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.bench-actions button {
		border: 1px solid #d4d4d4;
		border-radius: 4px;
		background: #fff;
		padding: 4px 8px;
		font: inherit;
		cursor: pointer;
	}

	.bench-output {
		margin: 8px 0 0;
		max-height: 260px;
		overflow: auto;
		background: #fafafa;
		border: 1px solid #e5e5e5;
		border-radius: 4px;
		padding: 8px;
		font-size: 11px;
	}
</style>
