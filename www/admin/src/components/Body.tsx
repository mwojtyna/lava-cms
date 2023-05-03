"use client";

import * as React from "react";
import type { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { cn } from "@admin/src/utils/styles";
import { useColorThemeStore } from "../data/stores/dashboard";

interface Props extends React.ComponentPropsWithRef<"body"> {
	fonts: NextFontWithVariable[];
}
export function Body({ children, fonts, ...props }: Props) {
	const store = useColorThemeStore();

	React.useEffect(() => {
		if (!store.colorTheme) {
			store.set(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
		}
		// Disable because we only want it to run when component mounts first
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<body
			className={cn(
				store.colorTheme,
				fonts.map((font) => font.variable)
			)}
			{...props}
		>
			{children}
		</body>
	);
}
