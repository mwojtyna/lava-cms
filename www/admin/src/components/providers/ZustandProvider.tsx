"use client";

import { useRef } from "react";
import { colorThemeStore } from "@/src/data/stores/dashboard";
import type { ColorTheme } from "@/src/utils/cookies";

interface Props {
	colorTheme: ColorTheme | undefined;
	children: React.ReactNode;
}
export function ZustandProvider(props: Props) {
	const initialized = useRef(false);

	if (!initialized.current) {
		colorThemeStore.setState({ colorTheme: props.colorTheme });
		initialized.current = true;
	}

	return props.children;
}
