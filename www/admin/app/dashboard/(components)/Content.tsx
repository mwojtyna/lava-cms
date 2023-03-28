"use client";

import { getCardColor } from "@admin/app/mantine";
import { Box } from "@mantine/core";
import { Children } from "react";

Content.Card = function Card({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
};

export default function Content({ children }: { children: React.ReactNode }) {
	return (
		<>
			{Children.map(children, (child) => (
				<Box
					component="section"
					m="md"
					p="md"
					sx={(theme) => ({
						backgroundColor: getCardColor(theme),
					})}
				>
					{child}
				</Box>
			))}
		</>
	);
}
