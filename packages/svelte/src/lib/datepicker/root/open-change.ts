import type { DatePickerOpenChangeDetails, DatePickerOpenChangeReason } from './context';

export function createDatePickerOpenChangeDetails(details?: {
  reason?: DatePickerOpenChangeReason;
  event?: Event;
}): DatePickerOpenChangeDetails {
  let canceled = false;
  return {
    reason: details?.reason ?? 'none',
    event: details?.event,
    cancel: () => {
      canceled = true;
    },
    get isCanceled() {
      return canceled;
    }
  };
}
