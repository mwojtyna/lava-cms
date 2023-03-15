"use client";

import {
	useEmotionCache,
	MantineProvider,
	type MantineTheme,
	ColorSchemeProvider,
	type ColorScheme,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useServerInsertedHTML } from "next/navigation";

export function getCardBgColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0];
}
export function getBackgroundColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[2];
}

export default function RootStyleRegistry({ children }: { children: React.ReactNode }) {
	const cache = useEmotionCache();
	cache.compat = true;

	useServerInsertedHTML(() => (
		<style
			data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(" ")}`}
			dangerouslySetInnerHTML={{
				__html: Object.values(cache.inserted).join(" "),
			}}
		/>
	));

	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: "color-scheme",
		defaultValue: "light",
		getInitialValueInEffect: true,
	});
	const toggleColorScheme = () => setColorScheme(colorScheme === "dark" ? "light" : "dark");

	return (
		<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				emotionCache={cache}
				theme={{
					colorScheme: colorScheme,
					globalStyles: (theme) => ({
						"#content": {
							backgroundColor: getBackgroundColor(theme),
							display: "flex",
							height: "100vh",
						},
					}),
				}}
			>
				{children}
			</MantineProvider>
		</ColorSchemeProvider>
	);
}
