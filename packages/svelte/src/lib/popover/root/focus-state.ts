import type { PopoverCloseReason } from './context';

export function clearTriggerFocusState(trigger: HTMLElement) {
  delete trigger.dataset.focused;
  delete trigger.dataset.focusVisible;
}

export function applyTriggerCloseFocusState(trigger: HTMLElement, reason: PopoverCloseReason) {
  trigger.focus();
  if (reason === 'outside-press' || reason === 'escape-key') {
    trigger.dataset.focused = 'true';
  } else {
    delete trigger.dataset.focused;
  }
  if (reason === 'escape-key') {
    trigger.dataset.focusVisible = 'true';
  } else {
    delete trigger.dataset.focusVisible;
  }
}

export function addTriggerBlurCleanup(trigger: HTMLElement, once = false) {
  const handleBlur = () => {
    clearTriggerFocusState(trigger);
    if (once) {
      trigger.removeEventListener('blur', handleBlur);
    }
  };

  trigger.addEventListener('blur', handleBlur);

  return () => {
    trigger.removeEventListener('blur', handleBlur);
  };
}