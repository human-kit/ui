/**
 * Mock for $app/navigation used in vitest tests
 */
export const goto = () => Promise.resolve();
export const invalidate = () => Promise.resolve();
export const invalidateAll = () => Promise.resolve();
export const prefetch = () => Promise.resolve();
export const prefetchRoutes = () => Promise.resolve();
export const beforeNavigate = () => {};
export const afterNavigate = () => {};
export const onNavigate = () => {};
