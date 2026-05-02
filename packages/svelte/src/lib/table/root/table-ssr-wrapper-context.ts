import { getContext, setContext } from 'svelte';

const TABLE_SSR_WRAPPER_KEY = Symbol('table-ssr-wrapper');

export type TableSsrWrapperColumn = {
  id: string;
  header: string;
};

type TableSsrWrapperRegistry = {
  upsertColumn: (token: string, column: TableSsrWrapperColumn) => void;
  removeColumn: (token: string) => void;
};

export function setTableSsrWrapperRegistry(registry: TableSsrWrapperRegistry) {
  setContext(TABLE_SSR_WRAPPER_KEY, registry);
  return registry;
}

export function useTableSsrWrapperRegistry() {
  const registry = getContext<TableSsrWrapperRegistry>(TABLE_SSR_WRAPPER_KEY);
  if (!registry) {
    throw new Error('Table SSR wrapper registry is not available.');
  }
  return registry;
}