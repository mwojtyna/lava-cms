"use client";

import { useRef } from "react";
import { type ColorTheme, useServerUrlStore } from "@admin/src/data/stores/dashboard";
import { useColorThemeStore } from "@admin/src/data/stores/dashboard";

interface Props {
	url: string;
	colorTheme?: ColorTheme;
	children: React.ReactNode;
}
export function ZustandProvider(props: Props) {
	const initialized = useRef(false);

	if (!initialized.current) {
		useServerUrlStore.setState({ url: props.url });
		useColorThemeStore.setState({ colorTheme: props.colorTheme });

		initialized.current = true;
	}

	return <>{props.children}</>;
}
