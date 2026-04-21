import { createContext } from 'svelte';

import type { ResolvedColumn } from './types';

export type TableColumnRegistry<T> = {
	upsertColumn: (token: string, column: ResolvedColumn<T>) => void;
	removeColumn: (token: string) => void;
};

export const [useTableColumnRegistry, setTableColumnRegistry] =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	createContext<TableColumnRegistry<any>>();