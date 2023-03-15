"use client";

import { useServerInsertedHTML } from "next/navigation";
import {
	useEmotionCache,
	MantineProvider,
	type MantineTheme,
	ColorSchemeProvider,
	type ColorScheme,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { setCookie } from "cookies-next";

export function getCardBgColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0];
}
export function getBackgroundColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[2];
}

interface Props {
	children: React.ReactNode;
	colorScheme?: ColorScheme;
}
export default function Mantine(props: Props) {
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

	const preferred = useColorScheme();
	const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme ?? preferred);

	useEffect(() => {
		// Preferred color scheme is always 'light' the first time because of SSR
		// so we have to wait until the client takes over and only then set the theme automatically
		if (!props.colorScheme) {
			setColorScheme(preferred);
			setCookie("color-scheme", preferred);
		}
	}, [preferred, props.colorScheme]);

	const toggleColorScheme = () => {
		const newColor = colorScheme === "dark" ? "light" : "dark";

		setCookie("color-scheme", newColor);
		setColorScheme(newColor);
	};

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
				{props.children}
			</MantineProvider>
		</ColorSchemeProvider>
	);
}
