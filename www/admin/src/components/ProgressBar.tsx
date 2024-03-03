"use client";

import { AppProgressBar, type ProgressBarProps } from "next-nprogress-bar";

export function ProgressBar(props: ProgressBarProps) {
	return <AppProgressBar {...props} />;
}
