"use client";

import { Children } from "react";
import { getCardColor } from "@admin/src/utils/colors";
import { Box, Divider, Stack, Title } from "@mantine/core";

export default function Content({ children }: { children: React.ReactNode }) {
	return (
		<>
			{Children.map(children, (child) => (
				<Box
					className="shadow"
					component="section"
					p="md"
					sx={(theme) => ({
						backgroundColor: getCardColor(theme),
						borderRadius: theme.radius.sm,
					})}
				>
					{child}
				</Box>
			))}
		</>
	);
}

Content.Card = function Card({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
};

Content.Title = function CardTitle({ children }: { children: React.ReactNode }) {
	return (
		<Stack spacing="0.5rem" mb={"sm"}>
			<Title order={4}>{children}</Title>
			<Divider />
		</Stack>
	);
};
