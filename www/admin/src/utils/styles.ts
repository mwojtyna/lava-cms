// import type { MantineTheme } from "@admin/src/components";

// export function getBackgroundColor(theme: MantineTheme) {
// 	return theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[1];
// }

// export function getCardColor(theme: MantineTheme) {
// 	return theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white;
// }

// export function getHoverColor(theme: MantineTheme) {
// 	return theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1];
// }

// export function getBorderColor(theme: MantineTheme) {
// 	return theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2];
// }

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
