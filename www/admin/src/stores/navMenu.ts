import { create } from "zustand";
import "client-only";

interface MenuState {
	isOpen: boolean;
	setIsOpen: (value: boolean) => void;
}
const useNavMenuStore = create<MenuState>((set) => ({
	isOpen: false,
	setIsOpen: (value) => set(() => ({ isOpen: value })),
}));

export { useNavMenuStore };
