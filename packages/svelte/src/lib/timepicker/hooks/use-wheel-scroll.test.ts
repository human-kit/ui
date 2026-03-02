import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWheelScroll } from './use-wheel-scroll.svelte';

function getExpectedCenteredIndex(container: HTMLElement): number {
  const items = Array.from(container.querySelectorAll<HTMLElement>('[data-wheel-item]'));
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

function createWheelFixture() {
  const container = document.createElement('div');
  container.dataset.wheelDebug = 'false';
  document.body.appendChild(container);
  let currentScrollTop = 0;

  Object.defineProperty(container, 'clientHeight', {
    configurable: true,
    value: 100
  });

  Object.defineProperty(container, 'scrollTop', {
    configurable: true,
    get: () => currentScrollTop,
    set: (value: number) => {
      currentScrollTop = value;
    }
  });

  Object.defineProperty(container, 'scrollTo', {
    configurable: true,
    value: vi.fn(({ top }: { top: number }) => {
      container.scrollTop = top;
    })
  });

  for (let index = 0; index < 4; index += 1) {
    const item = document.createElement('div');
    item.setAttribute('data-wheel-item', 'true');
    Object.defineProperty(item, 'offsetTop', {
      configurable: true,
      value: index * 40
    });
    Object.defineProperty(item, 'offsetHeight', {
      configurable: true,
      value: 40
    });
    container.appendChild(item);
  }

  return { container };
}

describe('useWheelScroll', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('snaps to centered item after scroll inactivity timeout', () => {
    vi.useFakeTimers();
    const { container } = createWheelFixture();
    const onSnap = vi.fn();
    useWheelScroll(container, onSnap);

    container.scrollTop = 30;
    container.dispatchEvent(new Event('scroll'));

    vi.advanceTimersByTime(120);

    expect(onSnap).toHaveBeenCalledTimes(1);
    expect(onSnap).toHaveBeenCalledWith(1);
  });

  it('suppresses snap while smooth silent scroll window is active', () => {
    vi.useFakeTimers();
    const { container } = createWheelFixture();
    const onSnap = vi.fn();
    const api = useWheelScroll(container, onSnap);

    api.scrollToIndex(2, 'smooth', { silent: true });
    container.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(200);

    expect(onSnap).not.toHaveBeenCalled();
  });

  it('allows snap again after silent scroll window expires', () => {
    vi.useFakeTimers();
    const { container } = createWheelFixture();
    const onSnap = vi.fn();
    const api = useWheelScroll(container, onSnap);

    api.scrollToIndex(2, 'smooth', { silent: true });
    vi.advanceTimersByTime(601);

    container.scrollTop = 70;
    container.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(120);

    expect(onSnap).toHaveBeenCalledTimes(1);
    expect(onSnap).toHaveBeenCalledWith(getExpectedCenteredIndex(container));
  });

  it('scrolls instantly to centered target when behavior is instant', () => {
    const { container } = createWheelFixture();
    const onSnap = vi.fn();
    const api = useWheelScroll(container, onSnap);
    const items = container.querySelectorAll<HTMLElement>('[data-wheel-item]');
    const target = items[2];
    const expectedTop = Math.max(
      0,
      target.offsetTop - (container.clientHeight - target.offsetHeight) / 2
    );

    api.scrollToIndex(2, 'instant');

    expect(container.scrollTop).toBe(expectedTop);
    expect(onSnap).not.toHaveBeenCalled();
  });

  it('removes listeners on destroy', () => {
    vi.useFakeTimers();
    const { container } = createWheelFixture();
    const onSnap = vi.fn();
    const api = useWheelScroll(container, onSnap);

    api.destroy();
    container.scrollTop = 30;
    container.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(200);

    expect(onSnap).not.toHaveBeenCalled();
  });
});
