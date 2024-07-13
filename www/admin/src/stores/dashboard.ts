import Cookies from "js-cookie";
import { create } from "zustand";
import { permanentCookieOptions, type ColorTheme, type CookieName } from "@/src/utils/cookies";
import "client-only";

interface MenuState {
	isOpen: boolean;
	setIsOpen: (value: boolean) => void;
}
const useNavMenuStore = create<MenuState>((set) => ({
	isOpen: false,
	setIsOpen: (value) => set(() => ({ isOpen: value })),
}));

interface ColorThemeState {
	colorTheme?: ColorTheme;
	setColorTheme: (theme: ColorTheme) => void;
}
const useColorThemeStore = create<ColorThemeState>((set) => ({
	colorTheme: undefined,
	setColorTheme: (theme) => {
		set({ colorTheme: theme });
		Cookies.set("color-theme" satisfies CookieName, theme, permanentCookieOptions);
	},
}));

export { useNavMenuStore, useColorThemeStore };
