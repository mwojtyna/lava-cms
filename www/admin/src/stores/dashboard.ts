import { create } from "zustand";

interface MenuState {
	isOpen: boolean;
	toggle: () => void;
}
export const useMenuStore = create<MenuState>((set) => ({
	isOpen: false,
	toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

interface UrlState {
	url: string;
	set: (url: string) => void;
}
/**
 * This is for internal use only.
 * Use the useUrl hook instead.
 */
export const useServerUrlStore = create<UrlState>((set) => ({
	url: "",
	set: (url) => set({ url }),
}));
