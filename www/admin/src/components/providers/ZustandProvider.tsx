"use client";

import { useRef } from "react";
import type { ColorTheme } from "@admin/src/utils/cookies";
import { useColorThemeStore } from "@admin/src/data/stores/dashboard";

interface Props {
	colorTheme: ColorTheme | undefined;
	children: React.ReactNode;
}
export function ZustandProvider(props: Props) {
	const initialized = useRef(false);

	if (!initialized.current) {
		useColorThemeStore.setState({ colorTheme: props.colorTheme });
		initialized.current = true;
	}

	return <>{props.children}</>;
}
