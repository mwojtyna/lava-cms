import { setCookie } from "cookies-next";
import { create } from "zustand";
import { permanentCookieOptions, type ColorTheme, type CookieName } from "@/src/utils/cookies";
import "client-only";

interface MenuState {
	isOpen: boolean;
	setIsOpen: (value: boolean) => void;
}
const navMenuStore = create<MenuState>((set) => ({
	isOpen: false,
	setIsOpen: (value) => set(() => ({ isOpen: value })),
}));
function useNavMenu() {
	const isOpen = navMenuStore((state) => state.isOpen);
	const setIsOpen = navMenuStore((state) => state.setIsOpen);
	return { isOpen, setIsOpen };
}

interface ColorThemeState {
	colorTheme?: ColorTheme;
	setColorTheme: (theme: ColorTheme) => void;
}
const colorThemeStore = create<ColorThemeState>((set) => ({
	colorTheme: undefined,
	setColorTheme: (theme) => {
		set({ colorTheme: theme });
		setCookie("color-theme" satisfies CookieName, theme, permanentCookieOptions);
	},
}));
function useColorTheme() {
	const colorTheme = colorThemeStore((state) => state.colorTheme);
	const setColorTheme = colorThemeStore((state) => state.setColorTheme);
	return { colorTheme, setColorTheme };
}

export { navMenuStore, useNavMenu, colorThemeStore, useColorTheme };
