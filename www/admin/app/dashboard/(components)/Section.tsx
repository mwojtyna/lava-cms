"use client";

import { getCardColor } from "@admin/app/mantine";
import { Box } from "@mantine/core";

export default function Section({ children }: { children: React.ReactNode }) {
	return (
		<Box
			component="section"
			p="md"
			m="md"
			sx={(theme) => ({
				backgroundColor: getCardColor(theme),
			})}
		>
			{children}
		</Box>
	);
}
