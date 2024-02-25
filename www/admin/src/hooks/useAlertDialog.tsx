import { createContext, useContext } from "react";
import { type AlertDialogProps } from "../components/AlertDialog";
import "client-only";

type AlertDialogOptions = Pick<
	AlertDialogProps,
	| "className"
	| "title"
	| "description"
	| "yesMessage"
	| "noMessage"
	| "icon"
	| "disableCloseOnBlur"
>;
type AlertDialogState = AlertDialogOptions & {
	setOpen: (value: boolean) => void;
	setOnSubmit: (value: () => void) => void;
};

const AlertDialogContext = createContext<
	[AlertDialogState, React.Dispatch<React.SetStateAction<AlertDialogState>>] | null
>(null);

const defaultOptions: AlertDialogOptions = {
	className: undefined,
	title: "Title",
	description: "Description",
	yesMessage: "Yes",
	noMessage: undefined,
	icon: null,
	disableCloseOnBlur: undefined,
};

function useAlertDialog(): {
	open: (options: AlertDialogOptions | undefined, onYes: () => void) => void;
} {
	const context = useContext(AlertDialogContext);
	const state = context![0];
	const setState = context![1];

	return {
		open: (options, onYes) => {
			// Set dialog properties
			setState((state) => ({ ...state, ...defaultOptions, ...options }));

			state.setOpen(true);
			state.setOnSubmit(() => {
				return () => {
					state.setOpen(false);
					onYes();
				};
			});
		},
	};
}

export { useAlertDialog, AlertDialogContext, type AlertDialogState, defaultOptions };
