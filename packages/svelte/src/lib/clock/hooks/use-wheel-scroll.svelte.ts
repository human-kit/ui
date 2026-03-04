export type WheelScrollBehavior = 'smooth' | 'instant';

export type WheelScrollApi = {
	scrollToIndex: (
		index: number,
		behavior?: WheelScrollBehavior,
		options?: { silent?: boolean }
	) => void;
	destroy: () => void;
};

/**
 * Manages scroll-based item selection for a wheel column.
 *
 * All snapping is handled in JavaScript (no CSS `scroll-snap-type`).
 * After scrolling settles (either short inactivity in `scroll` events
 * or browser `scrollend`), we find the nearest centered item and run
 * a fast 120 ms ease-out animation to align it.
 */
export function useWheelScroll(
	container: HTMLElement,
	onSnap: (centeredIndex: number) => number | null | void
): WheelScrollApi {
	let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
	let silentScrollTimer: ReturnType<typeof setTimeout> | null = null;
	let snapRafId: number | null = null;
	let isSnapping = false;
	let isSilentScroll = false;
	let isPointerInteracting = false;
	let hasPendingPointerReleaseSnap = false;
	const supportsScrollEnd = 'onscrollend' in window;
	const wheelDebugWindow = window as Window & { __HK_CLOCK_WHEEL_DEBUG__?: boolean };

	let lastScrollAt = 0;
	let gestureStartAt = 0;
	let scrollEventsInGesture = 0;
	let currentGestureId = 0;

	function isDebugEnabled(): boolean {
		return (
			wheelDebugWindow.__HK_CLOCK_WHEEL_DEBUG__ === true ||
			container.dataset.wheelDebug === 'true'
		);
	}

	function debugLog(event: string, details?: Record<string, unknown>) {
		if (!isDebugEnabled()) return;
		const timestamp = Number(performance.now().toFixed(1));
		console.info('[Clock.WheelDebug]', {
			event,
			t: timestamp,
			gestureId: currentGestureId,
			supportsScrollEnd,
			...details
		});
	}

	function clearSilentScroll() {
		isSilentScroll = false;
		if (silentScrollTimer) {
			clearTimeout(silentScrollTimer);
			silentScrollTimer = null;
		}
	}

	function startSilentScrollWindow() {
		isSilentScroll = true;
		if (silentScrollTimer) {
			clearTimeout(silentScrollTimer);
		}
		silentScrollTimer = setTimeout(() => {
			clearSilentScroll();
		}, 600);
	}

	function getItemElements(): HTMLElement[] {
		return Array.from(container.querySelectorAll<HTMLElement>('[data-wheel-item]'));
	}

	function getCenteredIndex(): number {
		const items = getItemElements();
		if (items.length === 0) return -1;

		const centerLine = container.scrollTop + container.clientHeight / 2;
		let closestIndex = -1;
		let closestDistance = Number.POSITIVE_INFINITY;

		for (let index = 0; index < items.length; index += 1) {
			const item = items[index];
			const itemCenter = item.offsetTop + item.offsetHeight / 2;
			const distance = Math.abs(itemCenter - centerLine);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		}

		return closestIndex;
	}

	/* ── snap animation ─────────────────────────────────────────────── */

	function cancelSnap() {
		if (snapRafId !== null) {
			cancelAnimationFrame(snapRafId);
			snapRafId = null;
		}
		isSnapping = false;
	}

	/**
	 * Run a 120 ms ease-out-cubic animation from the current scrollTop to
	 * `target`.  During the animation `isSnapping` is true so incoming
	 * scroll / scrollend events are ignored.
	 */
	function animateSnapTo(target: number) {
		cancelSnap();

		const start = container.scrollTop;
		const distance = target - start;
		if (Math.abs(distance) < 1) return;

		isSnapping = true;
		const duration = 120;
		const t0 = performance.now();
		debugLog('snap-animation-start', {
			start: Number(start.toFixed(2)),
			target: Number(target.toFixed(2)),
			distance: Number(distance.toFixed(2)),
			durationMs: duration
		});

		function frame(now: number) {
			const elapsed = now - t0;
			const t = Math.min(elapsed / duration, 1);
			const eased = 1 - (1 - t) ** 3; // ease-out cubic
			container.scrollTop = start + distance * eased;

			if (t < 1) {
				snapRafId = requestAnimationFrame(frame);
			} else {
				snapRafId = null;
				debugLog('snap-animation-end', {
					elapsedMs: Number((performance.now() - t0).toFixed(1)),
					finalScrollTop: Number(container.scrollTop.toFixed(2))
				});
				// Keep the flag only until next frame so trailing animation
				// events are ignored without creating a visible dead-zone.
				requestAnimationFrame(() => {
					isSnapping = false;
				});
			}
		}

		snapRafId = requestAnimationFrame(frame);
	}

	/* ── scroll settle ──────────────────────────────────────────────── */

	/**
	 * Called when the user's scroll gesture has finished.
	 * 1. Identify the closest item to the viewport centre.
	 * 2. Emit `onSnap` so the consumer can update the selected value.
	 * 3. Animate to perfectly centre the item (120 ms).
	 */
	function snapToCenter(
		source: 'scrollend' | 'fallback-timeout' | 'inactivity-timeout' | 'pointer-release'
	) {
		if (isSnapping || isSilentScroll) return;

		const now = performance.now();
		const idleBeforeSnapMs = lastScrollAt > 0 ? now - lastScrollAt : null;
		debugLog('snap-evaluate', {
			source,
			idleBeforeSnapMs: idleBeforeSnapMs === null ? null : Number(idleBeforeSnapMs.toFixed(1)),
			scrollEventsInGesture
		});

		const centeredIndex = getCenteredIndex();
		if (centeredIndex < 0) return;

		const resolvedIndex = onSnap(centeredIndex);
		const snapIndex = typeof resolvedIndex === 'number' ? resolvedIndex : centeredIndex;
		if (!Number.isInteger(snapIndex) || snapIndex < 0) return;

		const items = getItemElements();
		const target = items[snapIndex];
		if (!target) return;

		const idealScrollTop = target.offsetTop - (container.clientHeight - target.offsetHeight) / 2;
		const clamped = Math.max(0, idealScrollTop);
		const diff = Math.abs(container.scrollTop - clamped);

		debugLog('snap-target', {
			centeredIndex,
			snapIndex,
			diffPx: Number(diff.toFixed(2)),
			currentScrollTop: Number(container.scrollTop.toFixed(2)),
			targetScrollTop: Number(clamped.toFixed(2))
		});

		scrollEventsInGesture = 0;

		if (diff >= 2) {
			animateSnapTo(clamped);
		}
	}

	/* ── event wiring ───────────────────────────────────────────────── */

	function clearScrollEndTimer() {
		if (scrollEndTimer) {
			clearTimeout(scrollEndTimer);
			scrollEndTimer = null;
		}
	}

	function handleScroll() {
		const now = performance.now();
		if (scrollEventsInGesture === 0) {
			currentGestureId += 1;
			gestureStartAt = now;
			debugLog('gesture-start', {
				scrollTop: Number(container.scrollTop.toFixed(2))
			});
		}
		scrollEventsInGesture += 1;
		lastScrollAt = now;

		if (isSnapping) {
			debugLog('scroll-ignored-while-snapping');
			return;
		}

		if (isSilentScroll) {
			debugLog('scroll-ignored-while-silent-scroll');
			return;
		}

		if (isPointerInteracting) {
			hasPendingPointerReleaseSnap = true;
			clearScrollEndTimer();
			debugLog('scroll-deferred-until-pointer-release');
			return;
		}

		// Always debounce by scroll inactivity so we don't rely solely on
		// potentially late `scrollend` dispatch.
		clearScrollEndTimer();
		scrollEndTimer = setTimeout(
			() => snapToCenter(supportsScrollEnd ? 'inactivity-timeout' : 'fallback-timeout'),
			120
		);
	}

	function handleScrollEnd() {
		const now = performance.now();
		if (isSnapping) {
			debugLog('scrollend-ignored-while-snapping');
			return;
		}

		if (isSilentScroll) {
			debugLog('scrollend-ignored-while-silent-scroll');
			clearSilentScroll();
			return;
		}

		debugLog('scrollend-received', {
			sinceLastScrollMs: lastScrollAt > 0 ? Number((now - lastScrollAt).toFixed(1)) : null,
			gestureDurationMs: gestureStartAt > 0 ? Number((now - gestureStartAt).toFixed(1)) : null,
			scrollEventsInGesture
		});

		clearScrollEndTimer();
		snapToCenter('scrollend');
	}

	function handlePointerDown(event: MouseEvent) {
		if (event.button !== 0) return;
		isPointerInteracting = true;
		hasPendingPointerReleaseSnap = false;
	}

	function handlePointerRelease() {
		if (!isPointerInteracting) return;
		isPointerInteracting = false;

		if (hasPendingPointerReleaseSnap) {
			hasPendingPointerReleaseSnap = false;
			clearScrollEndTimer();
			snapToCenter('pointer-release');
		}
	}

	container.addEventListener('scroll', handleScroll, { passive: true });
	container.addEventListener('mousedown', handlePointerDown);
	if (supportsScrollEnd) {
		container.addEventListener('scrollend', handleScrollEnd as EventListener);
	}
	window.addEventListener('mouseup', handlePointerRelease);

	/* ── public API ─────────────────────────────────────────────────── */

	function scrollToIndex(
		index: number,
		behavior: WheelScrollBehavior = 'smooth',
		options?: { silent?: boolean }
	) {
		cancelSnap();
		clearScrollEndTimer();

		const shouldUseSilentScroll = options?.silent === true && behavior === 'smooth';
		if (shouldUseSilentScroll) {
			startSilentScrollWindow();
		} else {
			clearSilentScroll();
		}

		const items = getItemElements();
		if (index < 0 || index >= items.length) return;

		const target = items[index];
		const idealScrollTop = target.offsetTop - (container.clientHeight - target.offsetHeight) / 2;

		if (behavior === 'instant') {
			// Direct assignment – no animation.  Suppress the ensuing scrollend
			// so it doesn't trigger an unnecessary snapToCenter cycle.
			isSnapping = true;
			container.scrollTop = Math.max(0, idealScrollTop);
			requestAnimationFrame(() => {
				isSnapping = false;
			});
		} else {
			container.scrollTo({
				top: Math.max(0, idealScrollTop),
				behavior: 'smooth'
			});
		}
	}

	return {
		scrollToIndex,
		destroy: () => {
			cancelSnap();
			clearScrollEndTimer();
			clearSilentScroll();
			container.removeEventListener('scroll', handleScroll);
			container.removeEventListener('mousedown', handlePointerDown);
			if (supportsScrollEnd) {
				container.removeEventListener('scrollend', handleScrollEnd as EventListener);
			}
			window.removeEventListener('mouseup', handlePointerRelease);
		}
	};
}
