"use client";

import type { NextFontWithVariable } from "next/dist/compiled/@next/font";
import * as React from "react";
import { cn } from "@/src/utils/styling";
import { useColorTheme } from "../data/stores/dashboard";

interface Props extends React.ComponentPropsWithRef<"body"> {
	fonts: NextFontWithVariable[];
}
export function Body({ children, fonts, ...props }: Props) {
	const { colorTheme, setColorTheme } = useColorTheme();

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
