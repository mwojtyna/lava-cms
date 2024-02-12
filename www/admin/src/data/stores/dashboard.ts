import { setCookie } from "cookies-next";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import { env } from "@/src/env/client.mjs";
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
		setCookie("color-theme" satisfies CookieName, theme, permanentCookieOptions);
	},
}));

if (env.NEXT_PUBLIC_DEV) {
	mountStoreDevtool("ColorThemeStore", useColorThemeStore);
	mountStoreDevtool("NavMenuStore", useNavMenuStore);
}

export { useNavMenuStore, useColorThemeStore };
