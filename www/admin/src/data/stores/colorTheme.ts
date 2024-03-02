import Cookies from "js-cookie";
import { createContext, useContext } from "react";
import { create, type StoreApi, useStore } from "zustand";
import { type ColorTheme, type CookieName, permanentCookieOptions } from "@/src/utils/cookies";

interface ColorThemeState {
	colorTheme: ColorTheme | null;
	setColorTheme: (theme: ColorTheme) => void;
}
const createColorThemeStore = (colorTheme: ColorTheme | null) =>
	create<ColorThemeState>((set) => ({
		colorTheme,
		setColorTheme: (theme) => {
			set({ colorTheme: theme });
			Cookies.set("color-theme" satisfies CookieName, theme, permanentCookieOptions);
		},
	}));

const ColorThemeStoreContext = createContext<StoreApi<ColorThemeState> | null>(null);
const useColorThemeStore = <T>(selector: (store: ColorThemeState) => T): T => {
	const colorThemeStoreContext = useContext(ColorThemeStoreContext);

	if (!colorThemeStoreContext) {
		throw new Error("useColorThemeStore must be use within ColorThemeStoreProvider");
	}

	return useStore(colorThemeStoreContext, selector);
};

export { createColorThemeStore, useColorThemeStore, ColorThemeStoreContext, type ColorThemeState };
