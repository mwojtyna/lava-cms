"use client";

import type { NextFontWithVariable } from "next/dist/compiled/@next/font";
import * as React from "react";
import { useColorThemeStore } from "@/src/data/stores/colorTheme";
import { cn } from "@/src/utils/styling";

interface Props extends React.ComponentPropsWithRef<"body"> {
	fonts: NextFontWithVariable[];
}
export function Body({ children, fonts, ...props }: Props) {
	const { colorTheme, setColorTheme } = useColorThemeStore((state) => ({
		colorTheme: state.colorTheme,
		setColorTheme: state.setColorTheme,
	}));

	React.useEffect(() => {
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
		if (!colorTheme) {
			setColorTheme(prefersDark.matches ? "dark" : "light");
		}

		const onPreferenceChanged: (e: MediaQueryListEvent) => void = (e) => {
			setColorTheme(e.matches ? "dark" : "light");
		};
		prefersDark.addEventListener("change", onPreferenceChanged);

		return () => prefersDark.removeEventListener("change", onPreferenceChanged);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<body
			className={cn(
				colorTheme,
				fonts.map((font) => font.variable),
				"antialiased selection:bg-brand selection:text-background",
			)}
			{...props}
		>
			{children}
		</body>
	);
}
