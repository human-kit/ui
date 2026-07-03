type ImportMetaWithEnv = ImportMeta & {
	readonly env?: {
		readonly DEV?: boolean;
	};
};

export const browser = typeof window !== 'undefined' && typeof document !== 'undefined';
export const dev = (import.meta as ImportMetaWithEnv).env?.DEV ?? false;
