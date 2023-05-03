import { create } from "zustand";
import { setCookie } from "cookies-next";
import { z } from "zod";

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
 * Use the `useUrl` hook instead.
 */
export const useServerUrlStore = create<UrlState>((set) => ({
	url: "",
	set: (url) => set({ url }),
}));

export const colorThemeSchema = z.enum(["dark", "light"]);
export type ColorTheme = z.infer<typeof colorThemeSchema>;

interface ColorThemeState {
	colorTheme?: ColorTheme;
	set: (theme: ColorTheme) => void;
}
export const useColorThemeStore = create<ColorThemeState>((set) => ({
	colorTheme: undefined,
	set: (theme) => {
		set({ colorTheme: theme });
		setCookie("color-theme", theme, { expires: new Date(2999, 12) });
	},
}));
