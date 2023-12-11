import { create } from "zustand";
import "client-only";

interface ComponentDefEditDialogState {
	open: boolean;
	id: string;
}
export const useComponentDefEditDialog = create<ComponentDefEditDialogState>(() => ({
	open: false,
	id: "",
}));
