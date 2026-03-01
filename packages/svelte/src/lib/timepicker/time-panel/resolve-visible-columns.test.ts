import { describe, it, expect } from 'vitest';
import { resolveVisibleColumns } from './resolve-visible-columns';

describe('resolveVisibleColumns', () => {
  it('returns hour and minute for minute granularity with 24h cycle', () => {
    const columns = resolveVisibleColumns('minute', 24);
    expect(columns.map((column) => column.type)).toEqual(['hour', 'minute']);
  });

  it('returns hour, minute, second for second granularity with 24h cycle', () => {
    const columns = resolveVisibleColumns('second', 24);
    expect(columns.map((column) => column.type)).toEqual(['hour', 'minute', 'second']);
  });

  it('returns hour, minute, dayPeriod for minute granularity with 12h cycle', () => {
    const columns = resolveVisibleColumns('minute', 12);
    expect(columns.map((column) => column.type)).toEqual(['hour', 'minute', 'dayPeriod']);
  });

  it('returns hour, minute, second, dayPeriod for second granularity with 12h cycle', () => {
    const columns = resolveVisibleColumns('second', 12);
    expect(columns.map((column) => column.type)).toEqual(['hour', 'minute', 'second', 'dayPeriod']);
  });

  it('returns localized labels when getSegmentLabel is provided', () => {
    const columns = resolveVisibleColumns('minute', 24, (type) => `label-${type}`);
    expect(columns).toEqual([
      { type: 'hour', label: 'label-hour' },
      { type: 'minute', label: 'label-minute' }
    ]);
  });
});
