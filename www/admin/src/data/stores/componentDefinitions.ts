import { create } from "zustand";

interface ComponentDefEditDialogState {
	open: boolean;
	id: string;
}
export const useComponentDefEditDialog = create<ComponentDefEditDialogState>(() => ({
	open: false,
	id: "",
}));
