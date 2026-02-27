import type { PopoverCloseReason } from './context';
import {
  focusWithModality,
  resolveCloseInteractionModality
} from '../../primitives/input-modality';

export function clearTriggerFocusState(trigger: HTMLElement) {
  delete trigger.dataset.focused;
  delete trigger.dataset.focusVisible;
}

export function applyTriggerCloseFocusState(
  trigger: HTMLElement,
  reason: PopoverCloseReason,
  event?: Event
) {
  const closeModality = resolveCloseInteractionModality(reason, event);
  focusWithModality(trigger, closeModality);
  if (reason === 'outside-press' || reason === 'escape-key') {
    trigger.dataset.focused = 'true';
  } else {
    delete trigger.dataset.focused;
  }
  if (closeModality === 'keyboard') {
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