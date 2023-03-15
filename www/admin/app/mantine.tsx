"use client";

import { CacheProvider } from "@emotion/react";
import { useEmotionCache, MantineProvider, type MantineTheme } from "@mantine/core";
import { useServerInsertedHTML } from "next/navigation";

export function getCardBgColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0];
}
export function getBackgroundColor(theme: MantineTheme) {
	return theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[1];
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

	return (
		<CacheProvider value={cache}>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				theme={{
					colorScheme: "light",
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
		</CacheProvider>
	);
}
