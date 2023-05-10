import { create } from "zustand";
import { setCookie } from "cookies-next";
import { z } from "zod";

interface MenuState {
	isOpen: boolean;
	set: (value: boolean) => void;
}
export const useMenuStore = create<MenuState>((set) => ({
	isOpen: false,
	set: (value) => set(() => ({ isOpen: value })),
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
		setCookie("color-theme", theme, { expires: new Date(2999, 12), sameSite: "lax" });
	},
}));
