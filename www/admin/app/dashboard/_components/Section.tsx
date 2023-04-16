"use client";

import { Card, Divider, Stack, Title } from "@mantine/core";

export function Section(props: React.ComponentPropsWithoutRef<"div">) {
	return (
		<Card component="section" withBorder {...props}>
			{props.children}
		</Card>
	);
}

Section.Title = function CardTitle({ children }: { children: React.ReactNode }) {
	return (
		<Stack spacing="0.5rem" mb={"sm"}>
			<Title order={4}>{children}</Title>
			<Divider />
		</Stack>
	);
};
