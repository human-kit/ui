import { getContext, setContext } from 'svelte';
import type {
  TimePickerEditableSegmentType,
  TimePickerGranularity,
  TimePickerHourCycle,
  TimePickerSegmentPart,
  TimePickerSegmentType,
  TimePickerTimeValue
} from './time-utils';
import type { PopoverChangeReason, PopoverOpenChangeDetails } from '../../popover/root/context';

const KEY = Symbol('time-picker');

export type TimePickerOpenChangeReason = PopoverChangeReason;
export type TimePickerOpenChangeDetails = PopoverOpenChangeDetails;

export type TimePickerContext = {
  id: string;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  granularity: TimePickerGranularity;
  hourCycle: TimePickerHourCycle;
  open: boolean;
  focusVisible: boolean;
  focusWithin: boolean;
  isInvalidDraft: boolean;
  value: TimePickerTimeValue | null;
  locale: string;
  triggerRef: HTMLElement | null;
  activeSegment: Exclude<TimePickerSegmentType, 'literal'> | null;
  setTriggerRef: (element: HTMLElement | null) => void;
  setFocusVisible: (visible: boolean) => void;
  syncFocusWithin: () => void;
  setActiveSegment: (segment: Exclude<TimePickerSegmentType, 'literal'> | null) => void;
  openPopover: (reason?: TimePickerOpenChangeReason, event?: Event) => void;
  closePopover: (reason?: TimePickerOpenChangeReason, event?: Event) => void;
  togglePopover: (reason?: TimePickerOpenChangeReason, event?: Event) => void;
  onOpenChange: (open: boolean, details: TimePickerOpenChangeDetails) => void;
  setValue: (nextValue: TimePickerTimeValue | null) => void;
  getSegments: () => TimePickerSegmentPart[];
  getSegmentValue: (type: Exclude<TimePickerSegmentType, 'literal'>) => string;
  setSegmentValue: (type: Exclude<TimePickerSegmentType, 'literal'>, nextValue: string) => void;
  typeSegmentDigit: (type: Exclude<TimePickerSegmentType, 'literal'>, digit: string) => boolean;
  adjustSegmentValue: (type: Exclude<TimePickerSegmentType, 'literal'>, step: number) => void;
  getSegmentLabel: (type: TimePickerEditableSegmentType) => string;
  registerSegmentRef: (type: TimePickerEditableSegmentType, element: HTMLElement | null) => void;
  focusNextPlaceholderOrLastSegment: () => boolean;
  focusNextSegment: (type: TimePickerEditableSegmentType) => boolean;
  focusPreviousSegment: (type: TimePickerEditableSegmentType) => boolean;
  focusLastSegment: () => boolean;
  selectWheelValue: (type: TimePickerEditableSegmentType, value: string) => void;
  getSelectedWheelValue: (type: TimePickerEditableSegmentType) => string | null;
  getWheelOptions: (
    type: TimePickerEditableSegmentType
  ) => Array<{ value: string; label: string; disabled: boolean }>;
};

export function setTimePickerContext(context: TimePickerContext) {
  setContext(KEY, context);
}

export function getTimePickerContext(): TimePickerContext | undefined {
  return getContext<TimePickerContext | undefined>(KEY);
}

export function useTimePickerContext(): TimePickerContext {
  const context = getTimePickerContext();
  if (!context) {
    throw new Error('TimePicker components must be used within TimePicker.Root.');
  }
  return context;
}

export type { TimePickerSegmentPart, TimePickerSegmentType, TimePickerEditableSegmentType };
