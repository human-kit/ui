export type DialogStateHelpers = {
	/** Close the dialog */
	close: () => void;
	/** Open the dialog */
	open: () => void;
	/** Toggle the dialog open state */
	toggle: () => void;
	/** Whether the dialog is currently open */
	isOpen: boolean;
};
