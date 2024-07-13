"use client";

import { useInterval } from "@mantine/hooks";
import { useEffect } from "react";
import { useAlertDialog } from "@/src/hooks/useAlertDialog";
import { env } from "../env/client.mjs";

export function DemoReset({ children }: { children: React.ReactNode }) {
	const alertDialog = useAlertDialog();
	const interval = useInterval(() => {
		const date = new Date();
		const minutes = date.getUTCMinutes();
		const seconds = date.getUTCSeconds();

		if (minutes == 0 && seconds >= 5 && seconds <= 6) {
			alertDialog.open(
				{
					title: "Refresh required",
					description: "This demo website resets data every hour. Refresh is required.",
					yesMessage: "Refresh",
					disableCloseOnBlur: true,
				},
				() => location.reload(),
			);
		}
	}, 1000);

	useEffect(() => {
		if (env.NEXT_PUBLIC_DEMO) {
			interval.start();
			return interval.stop;
		}
	}, [interval]);

	return children;
}
