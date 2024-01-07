import { setCookie } from "cookies-next";
import { create } from "zustand";
import { permanentCookieOptions, type ColorTheme, type CookieName } from "@/src/utils/cookies";
import "client-only";

interface MenuState {
	isOpen: boolean;
	setIsOpen: (value: boolean) => void;
}
export const useNavMenu = create<MenuState>((set) => ({
	isOpen: false,
	setIsOpen: (value) => set(() => ({ isOpen: value })),
}));

interface ColorThemeState {
	colorTheme?: ColorTheme;
	setColorTheme: (theme: ColorTheme) => void;
}
export const useColorTheme = create<ColorThemeState>((set) => ({
	colorTheme: undefined,
	setColorTheme: (theme) => {
		set({ colorTheme: theme });
		setCookie("color-theme" satisfies CookieName, theme, permanentCookieOptions);
	},
}));
