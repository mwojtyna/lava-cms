import { Card, Divider, Stack, TypographyH1 } from "@admin/src/components";

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
			<TypographyH1 order={4}>{children}</TypographyH1>
			<Divider />
		</Stack>
	);
};
