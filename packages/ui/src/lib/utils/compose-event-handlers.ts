/**
 * Composes an internal event handler with a consumer-provided one.
 *
 * The internal handler always runs first. By default the external handler
 * runs afterwards unconditionally; pass `skipExternalOnDefaultPrevented` to
 * skip it when the internal handler called `event.preventDefault()`.
 */
export function composeEventHandlers<TEvent extends Event>(
	internalHandler: ((event: TEvent) => void) | undefined,
	externalHandler: ((event: TEvent) => void) | undefined,
	options?: { skipExternalOnDefaultPrevented?: boolean }
): (event: TEvent) => void {
	return (event: TEvent) => {
		let preventDefaultCalled = false;
		const originalPreventDefault = event.preventDefault.bind(event);
		event.preventDefault = () => {
			preventDefaultCalled = true;
			originalPreventDefault();
		};
		internalHandler?.(event);
		event.preventDefault = originalPreventDefault;
		if (
			options?.skipExternalOnDefaultPrevented &&
			(event.defaultPrevented || preventDefaultCalled)
		) {
			return;
		}
		externalHandler?.(event);
	};
}
