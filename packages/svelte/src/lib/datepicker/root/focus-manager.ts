export function applyTriggerSelectionCloseState(triggerRef: HTMLElement | null) {
  if (!triggerRef) return;
  requestAnimationFrame(() => {
    if (!triggerRef || !triggerRef.isConnected) return;
    triggerRef.focus();
    triggerRef.dataset.focused = 'true';
    delete triggerRef.dataset.focusVisible;

    const clearFocusData = () => {
      if (!triggerRef) return;
      delete triggerRef.dataset.focused;
      delete triggerRef.dataset.focusVisible;
    };

    triggerRef.addEventListener('blur', clearFocusData, { once: true });
  });
}

export function computeFocusWithin(rootId: string): boolean {
  const root = document.getElementById(rootId);
  const activeElement = document.activeElement;
  return !!root && !!activeElement && root.contains(activeElement);
}
