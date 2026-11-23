/**
 * The field names of `T` that hold a value of the type `V`. The value can be missing: a row
 * without a valid value has no point.
 */
export type FieldOf<T, V> = {
	[K in keyof T]-?: T[K] extends V | null | undefined ? K : never;
}[keyof T] &
	string;

/**
 * A channel: the name of a field of the row, or a function that reads the value from the row.
 */
export type Channel<T, V> = FieldOf<T, V> | ((row: T, index: number) => V | null | undefined);

/** Reads the value of a channel from a row. The value can be missing. */
export function read<T, V>(channel: Channel<T, V>, row: T, index: number): V | null | undefined {
	return typeof channel === 'function' ? channel(row, index) : (row[channel] as V);
}

/** The text that names a channel: the field name, or `fallback` for a function. */
export function channelName(channel: unknown, fallback: string): string {
	return typeof channel === 'string' ? channel : fallback;
}
