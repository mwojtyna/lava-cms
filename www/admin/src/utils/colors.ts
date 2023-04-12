import type { MantineTheme } from "@mantine/core";

export function getBackgroundColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[1];
}

export function getCardColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white;
}

export function getHoverColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1];
}

export function getBorderColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2];
}
