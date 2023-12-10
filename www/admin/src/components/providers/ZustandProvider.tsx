"use client";

import { useRef } from "react";
import { useColorTheme } from "@admin/src/data/stores/dashboard";
import type { ColorTheme } from "@admin/src/utils/cookies";

interface Props {
	colorTheme: ColorTheme | undefined;
	children: React.ReactNode;
}
export function ZustandProvider(props: Props) {
	const initialized = useRef(false);

	if (!initialized.current) {
		useColorTheme.setState({ colorTheme: props.colorTheme });
		initialized.current = true;
	}

	return props.children;
}
