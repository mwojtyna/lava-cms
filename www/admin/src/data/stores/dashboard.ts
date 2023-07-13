import { create } from "zustand";
import { setCookie } from "cookies-next";
import { permanentCookieOptions, type ColorTheme, type CookieName } from "@admin/src/utils/cookies";
import "client-only";

interface MenuState {
	isOpen: boolean;
	set: (value: boolean) => void;
}
export const useMenuStore = create<MenuState>((set) => ({
	isOpen: false,
	set: (value) => set(() => ({ isOpen: value })),
}));

interface ColorThemeState {
	colorTheme?: ColorTheme;
	set: (theme: ColorTheme) => void;
}
export const useColorThemeStore = create<ColorThemeState>((set) => ({
	colorTheme: undefined,
	set: (theme) => {
		set({ colorTheme: theme });
		setCookie("color-theme" satisfies CookieName, theme, permanentCookieOptions);
	},
}));
