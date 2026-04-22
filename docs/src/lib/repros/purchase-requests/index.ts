import TableColumn from './column.svelte';
import TableRoot from './table.svelte';

type CompoundReproTable = typeof TableRoot & {
	Column: typeof TableColumn;
};

export const ReproTable = Object.assign(TableRoot, {
	Column: TableColumn
}) as CompoundReproTable;

export default ReproTable;
