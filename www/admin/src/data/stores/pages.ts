import { create } from "zustand";
import type { Page } from "api/prisma/types";

interface ModalState {
	isOpen: boolean;
	page?: Page;
}
interface ModalActions {
	open: (page: Page) => void;
	close: () => void;
}

export const useNewPageModal = create<ModalState & ModalActions>((set) => ({
	isOpen: false,
	page: undefined,

	open: (page) => set({ isOpen: true, page: page }),
	close: () => set((state) => ({ ...state, isOpen: false })),
}));
export const useEditPageModal = create<ModalState & ModalActions>((set) => ({
	isOpen: false,
	page: undefined,

	open: (page) => set({ isOpen: true, page: page }),
	close: () => set((state) => ({ ...state, isOpen: false })),
}));
export const useDeletePageModal = create<ModalState & ModalActions>((set) => ({
	isOpen: false,
	page: undefined,

	open: (page) => set({ isOpen: true, page: page }),
	close: () => set((state) => ({ ...state, isOpen: false })),
}));
