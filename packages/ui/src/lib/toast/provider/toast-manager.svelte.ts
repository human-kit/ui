import { untrack } from 'svelte';
import type { ExtendedPlacement } from '../../primitives/floating';

export type ToastPriority = 'low' | 'high';
export type ToastStatus = 'open' | 'ending';

/** The default time a toast stays, in milliseconds. `0` keeps a toast until a close. */
export const DEFAULT_TOAST_TIMEOUT = 5000;
/** The default count of toasts on the screen. The older ones wait behind. */
export const DEFAULT_TOAST_LIMIT = 3;

export type ToastOptions<Data = unknown> = {
	/** The id of the toast. With the id of a toast that is on the screen, `add` updates it. */
	id?: string;
	/** The title. It names the toast, and it is the first part of the announcement. */
	title?: string;
	/** The description. It is the message when there is no title. */
	description?: string;
	/**
	 * A kind of your own, such as `success` or `error`, for `data-type` on the toast. A `loading`
	 * toast stays until an update, because a task that runs has no end that a timer knows.
	 */
	type?: string;
	/** The time the toast stays, in milliseconds. `0` keeps it until a close. */
	timeout?: number;
	/**
	 * How the screen reader hears it. `low` is announced when the user is idle, and `high`
	 * interrupts, thus the toast is `alertdialog`. Use `high` only for a message that cannot wait.
	 */
	priority?: ToastPriority;
	/** Data of your own, for the content you render. */
	data?: Data;
	/**
	 * An element the toast sits against, in place of the viewport. `Toast.Positioner` puts the
	 * toast there. The toast is out of the stack: it has no place in the corner to take.
	 */
	anchor?: HTMLElement | null;
	/** The side of the anchor for the toast. `top` by default. */
	placement?: ExtendedPlacement;
	/** The gap between the anchor and the toast, in pixels. 8 by default. */
	offset?: number;
	/** Runs when the toast starts to close. */
	onClose?: () => void;
	/** Runs when the toast leaves the DOM, after its exit animation. */
	onRemove?: () => void;
};

export type ToastItem<Data = unknown> = {
	readonly id: string;
	readonly title: string | undefined;
	readonly description: string | undefined;
	readonly type: string | undefined;
	readonly timeout: number;
	readonly priority: ToastPriority;
	readonly data: Data | undefined;
	readonly anchor: HTMLElement | null | undefined;
	readonly placement: ExtendedPlacement | undefined;
	readonly offset: number | undefined;
	/** `open` on the screen, `ending` through the exit animation. */
	readonly status: ToastStatus;
	/** The toast is past the limit of the viewport. It waits, hidden and inert. */
	readonly limited: boolean;
	/** Goes up on each update. Replay an attention animation from it. */
	readonly updateKey: number;
	readonly onClose: (() => void) | undefined;
	readonly onRemove: (() => void) | undefined;
};

export type ToastUpdate<Data = unknown> =
	Omit<ToastOptions<Data>, 'id'> | ((toast: ToastItem<Data>) => Omit<ToastOptions<Data>, 'id'>);

export type ToastPromiseOptions<Value, Data = unknown> = {
	loading: string | Omit<ToastOptions<Data>, 'id'>;
	success:
		| string
		| Omit<ToastOptions<Data>, 'id'>
		| ((value: Value) => string | Omit<ToastOptions<Data>, 'id'>);
	error:
		| string
		| Omit<ToastOptions<Data>, 'id'>
		| ((error: unknown) => string | Omit<ToastOptions<Data>, 'id'>);
};

export type ToastManager<Data = unknown> = {
	/** The toasts, the newest first. Render them in `Toast.Viewport`. */
	readonly toasts: readonly ToastItem<Data>[];
	/** The toasts on the screen: the newest ones, up to the limit. */
	readonly visibleToasts: readonly ToastItem<Data>[];
	/**
	 * The toasts that take a place in the stack of the viewport: the ones on the screen, without
	 * an anchor, and not on their way out. A toast through its exit keeps the place it had, and
	 * the ones behind it move up at once.
	 */
	readonly stackedToasts: readonly ToastItem<Data>[];
	/** Adds a toast, and answers its id. */
	add: (options: ToastOptions<Data>) => string;
	/** Updates a toast. The options replace the fields they name. */
	update: (id: string, update: ToastUpdate<Data>) => void;
	/** Starts the close of one toast, or of all of them. */
	close: (id?: string) => void;
	/** Takes a toast out of the list. `Toast.Root` calls it after the exit animation. */
	remove: (id: string) => void;
	/** Adds a `loading` toast that turns into `success` or `error` with the promise. */
	promise: <Value>(
		promise: Promise<Value>,
		options: ToastPromiseOptions<Value, Data>
	) => Promise<Value>;
	/** Stops every timer, for example while the pointer rests on the viewport. */
	pauseTimers: () => void;
	/** Starts the timers again, with the time each toast had left. */
	resumeTimers: () => void;
	/** Whether the timers are stopped. */
	readonly paused: boolean;
};

export type CreateToastManagerOptions = {
	/** The default time a toast stays, in milliseconds. */
	timeout?: () => number;
	/** The count of toasts on the screen. */
	limit?: () => number;
};

type Timer = {
	timeoutId: ReturnType<typeof setTimeout> | null;
	remaining: number;
	startedAt: number;
};

let toastCounter = 0;

function nextToastId() {
	toastCounter += 1;
	return `toast-${toastCounter}`;
}

function resolveText<Value>(
	source: string | Omit<ToastOptions, 'id'> | ((value: Value) => string | Omit<ToastOptions, 'id'>),
	value: Value
): Omit<ToastOptions, 'id'> {
	const resolved = typeof source === 'function' ? source(value) : source;
	return typeof resolved === 'string' ? { description: resolved } : resolved;
}

/**
 * The list of toasts and their timers. `Toast.Provider` makes one, and gives it to the parts
 * and to the page through `useToastManager`. The timers live here and not in the toasts,
 * thus one pause stops all of them, and a resume gives each one the time it had left.
 */
export function createToastManager<Data = unknown>(
	options: CreateToastManagerOptions = {}
): InternalToastManager<Data> {
	let toasts = $state<ToastItem<Data>[]>([]);
	let paused = $state(false);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- the timers are bookkeeping, not state: nothing renders from them.
	const timers = new Map<string, Timer>();

	const getTimeout = options.timeout ?? (() => DEFAULT_TOAST_TIMEOUT);
	const getLimit = options.limit ?? (() => DEFAULT_TOAST_LIMIT);

	const visibleToasts = $derived(toasts.filter((toast) => !toast.limited));
	const stackedToasts = $derived(
		visibleToasts.filter((toast) => !toast.anchor && toast.status !== 'ending')
	);

	function setToasts(next: ToastItem<Data>[]) {
		toasts = applyLimit(next);
	}

	// The newest toasts stay on the screen; the older ones past the limit wait, inert. A toast on
	// its way out no longer takes a place.
	function applyLimit(list: ToastItem<Data>[]): ToastItem<Data>[] {
		const limit = Math.max(0, untrack(getLimit));
		let active = 0;
		return list.map((toast) => {
			if (toast.status === 'ending') return toast.limited ? { ...toast, limited: false } : toast;
			const limited = active >= limit;
			active += 1;
			return toast.limited === limited ? toast : { ...toast, limited };
		});
	}

	function hasTimer(toast: ToastItem<Data>) {
		return toast.timeout > 0 && toast.type !== 'loading' && toast.status !== 'ending';
	}

	function clearTimer(id: string) {
		const timer = timers.get(id);
		if (!timer) return;
		if (timer.timeoutId !== null) clearTimeout(timer.timeoutId);
		timers.delete(id);
	}

	function startTimer(id: string, duration: number) {
		clearTimer(id);
		const timer: Timer = { timeoutId: null, remaining: duration, startedAt: Date.now() };
		timers.set(id, timer);
		if (!paused) run(id, timer);
	}

	function run(id: string, timer: Timer) {
		timer.startedAt = Date.now();
		timer.timeoutId = setTimeout(() => {
			timers.delete(id);
			close(id);
		}, timer.remaining);
	}

	// A timer runs only for a toast the user can see. A hidden one that closes on its own is a
	// message nobody read.
	function syncTimers() {
		for (const toast of untrack(() => toasts)) {
			const wants = hasTimer(toast) && !toast.limited;
			const has = timers.has(toast.id);
			if (wants && !has) startTimer(toast.id, toast.timeout);
			if (!wants && has) clearTimer(toast.id);
		}
	}

	function pauseTimers() {
		if (paused) return;
		paused = true;
		for (const timer of timers.values()) {
			if (timer.timeoutId === null) continue;
			clearTimeout(timer.timeoutId);
			timer.timeoutId = null;
			timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
		}
	}

	function resumeTimers() {
		if (!paused) return;
		paused = false;
		for (const [id, timer] of timers) {
			if (timer.timeoutId === null) run(id, timer);
		}
	}

	function add(options: ToastOptions<Data>): string {
		const id = options.id ?? nextToastId();
		const existing = untrack(() => toasts.find((toast) => toast.id === id));
		if (existing && existing.status !== 'ending') {
			update(id, options);
			return id;
		}
		const toast: ToastItem<Data> = {
			id,
			title: options.title,
			description: options.description,
			type: options.type,
			timeout: options.timeout ?? untrack(getTimeout),
			priority: options.priority ?? 'low',
			data: options.data,
			anchor: options.anchor,
			placement: options.placement,
			offset: options.offset,
			status: 'open',
			limited: false,
			updateKey: 0,
			onClose: options.onClose,
			onRemove: options.onRemove
		};
		setToasts([toast, ...untrack(() => toasts).filter((candidate) => candidate.id !== id)]);
		syncTimers();
		return id;
	}

	function update(id: string, incoming: ToastUpdate<Data>) {
		const current = untrack(() => toasts.find((toast) => toast.id === id));
		if (!current || current.status === 'ending') return;
		const changes = typeof incoming === 'function' ? incoming(current) : incoming;
		const next: ToastItem<Data> = {
			...current,
			...changes,
			timeout:
				changes.timeout ??
				(Object.hasOwn(changes, 'timeout') ? untrack(getTimeout) : current.timeout),
			priority: changes.priority ?? current.priority,
			updateKey: current.updateKey + 1
		};
		setToasts(untrack(() => toasts).map((toast) => (toast.id === id ? next : toast)));
		// An update is a new message: the toast gets its full time again.
		clearTimer(id);
		syncTimers();
	}

	function close(id?: string) {
		const targets = untrack(() =>
			toasts.filter((toast) => (id === undefined || toast.id === id) && toast.status !== 'ending')
		);
		if (targets.length === 0) return;
		for (const toast of targets) clearTimer(toast.id);
		setToasts(
			untrack(() => toasts).map((toast) =>
				targets.includes(toast) ? { ...toast, status: 'ending' as const } : toast
			)
		);
		syncTimers();
		for (const toast of targets) toast.onClose?.();
	}

	function remove(id: string) {
		const target = untrack(() => toasts.find((toast) => toast.id === id));
		if (!target) return;
		clearTimer(id);
		setToasts(untrack(() => toasts).filter((toast) => toast.id !== id));
		syncTimers();
		target.onRemove?.();
	}

	async function promise<Value>(
		task: Promise<Value>,
		promiseOptions: ToastPromiseOptions<Value, Data>
	): Promise<Value> {
		const loading = resolveText(promiseOptions.loading as never, undefined) as Omit<
			ToastOptions<Data>,
			'id'
		>;
		const id = add({ type: 'loading', ...loading, timeout: 0 });
		try {
			const value = await task;
			const success = resolveText(promiseOptions.success as never, value) as Omit<
				ToastOptions<Data>,
				'id'
			>;
			update(id, { type: 'success', timeout: undefined, ...success });
			return value;
		} catch (error) {
			const failure = resolveText(promiseOptions.error as never, error) as Omit<
				ToastOptions<Data>,
				'id'
			>;
			update(id, { type: 'error', timeout: undefined, ...failure });
			throw error;
		}
	}

	function syncLimit() {
		toasts = applyLimit(untrack(() => toasts));
		syncTimers();
	}

	return {
		get toasts() {
			return toasts;
		},
		get visibleToasts() {
			return visibleToasts;
		},
		get stackedToasts() {
			return stackedToasts;
		},
		get paused() {
			return paused;
		},
		add,
		update,
		close,
		remove,
		promise,
		pauseTimers,
		resumeTimers,
		syncLimit
	};
}

/** The manager with the calls that only the parts make. */
export type InternalToastManager<Data = unknown> = ToastManager<Data> & {
	/** `Toast.Provider` applies a new limit. */
	syncLimit: () => void;
};
