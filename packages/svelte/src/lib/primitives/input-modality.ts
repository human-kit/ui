export type InputModality = 'keyboard' | 'pointer' | 'virtual';

let currentModality: InputModality = 'virtual';

const listenedWindows = new WeakSet<Window>();

let forcedFocusTarget: HTMLElement | null = null;
let forcedFocusModality: InputModality | null = null;

function isModifierOnlyKey(event: KeyboardEvent): boolean {
  return event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt' || event.key === 'Meta';
}

function isKeyboardModalityKey(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if (isModifierOnlyKey(event)) return false;
  return true;
}

function ensureWindowListeners(win: Window | null | undefined) {
  if (!win) return;
  if (listenedWindows.has(win)) return;

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isKeyboardModalityKey(event)) return;
    currentModality = 'keyboard';
  };

  const onPointerDown = () => {
    currentModality = 'pointer';
  };

  const onFocusIn = () => {
    if (currentModality === 'pointer' || currentModality === 'keyboard') return;
    currentModality = 'virtual';
  };

  win.addEventListener('keydown', onKeyDown, true);
  win.addEventListener('pointerdown', onPointerDown, true);
  win.addEventListener('mousedown', onPointerDown, true);
  win.addEventListener('focusin', onFocusIn, true);

  listenedWindows.add(win);
}

export function initInputModality(target?: HTMLElement | null) {
  const ownerWindow = target?.ownerDocument?.defaultView;
  if (ownerWindow) {
    ensureWindowListeners(ownerWindow);
    return;
  }
  if (typeof window !== 'undefined') {
    ensureWindowListeners(window);
  }
}

function inferModalityFromEvent(event: Event | undefined): InputModality | undefined {
  if (!event) return undefined;
  if (event instanceof KeyboardEvent) {
    return isKeyboardModalityKey(event) ? 'keyboard' : undefined;
  }
  if (event instanceof MouseEvent && event.type === 'click' && event.detail === 0) {
    return 'keyboard';
  }
  if (event instanceof PointerEvent || event instanceof MouseEvent) {
    return 'pointer';
  }
  return undefined;
}

function resolveModalityForTarget(target: HTMLElement | null): InputModality {
  if (target && forcedFocusTarget === target && forcedFocusModality) {
    const modality = forcedFocusModality;
    forcedFocusTarget = null;
    forcedFocusModality = null;
    return modality;
  }

  return currentModality;
}

export function trackInteractionModality(event?: Event, target?: HTMLElement | null): void {
  initInputModality(target);

  const inferred = inferModalityFromEvent(event);
  if (inferred) {
    currentModality = inferred;
  }

}

export function getInteractionModality(): InputModality {
  return currentModality;
}

export function shouldShowFocusVisible(target: HTMLElement | null): boolean {
  if (!target) return false;

  const modality = resolveModalityForTarget(target);
  if (modality === 'pointer') return false;

  return target.matches(':focus-visible');
}

export function focusWithModality(
  target: HTMLElement,
  modality: InputModality,
  options?: FocusOptions
) {
  initInputModality(target);
  // The forced target/modality pair is a synchronous safety net so a focus handler that runs
  // immediately after target.focus() can resolve the intended modality without racing async timing.
  // If it is consumed later, currentModality still preserves the same modality as fallback.
  forcedFocusTarget = target;
  forcedFocusModality = modality;
  currentModality = modality;

  target.focus(options);

  queueMicrotask(() => {
    if (forcedFocusTarget !== target) return;
    forcedFocusTarget = null;
    forcedFocusModality = null;
  });
}

export function resolveCloseInteractionModality(
  reason: string,
  event?: Event
): InputModality {
  if (reason === 'escape-key') return 'keyboard';
  if (event instanceof KeyboardEvent) return 'keyboard';
  if (event instanceof PointerEvent || event instanceof MouseEvent) return 'pointer';
  if (reason === 'outside-press') return 'pointer';
  return 'virtual';
}
