"use client";

import {
	AppShell,
	Navbar,
	Header,
	Footer,
	Text,
	MediaQuery,
	Burger,
	useMantineTheme,
	Drawer,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function App() {
	const theme = useMantineTheme();
	const [opened, handlers] = useDisclosure(false);

	const navbarContent = (
		<>
			<Text>Application navbar</Text>
		</>
	);

	return (
		<AppShell
			styles={{
				main: {
					background:
						theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
				},
			}}
			navbarOffsetBreakpoint="sm"
			navbar={
				<>
					<MediaQuery smallerThan={"sm"} styles={{ display: "none" }}>
						<Navbar
							p="md"
							hiddenBreakpoint="sm"
							hidden={!opened}
							width={{ sm: 200, lg: 300 }}
						>
							{navbarContent}
						</Navbar>
					</MediaQuery>

					<MediaQuery largerThan={"sm"} styles={{ display: "none" }}>
						<Drawer opened={opened} onClose={() => handlers.close()} size={300}>
							<Navbar p="md" hiddenBreakpoint="sm" hidden={!opened}>
								{navbarContent}
							</Navbar>
						</Drawer>
					</MediaQuery>
				</>
			}
			footer={
				<Footer height={60} p="md">
					Application footer
				</Footer>
			}
			header={
				<Header height={{ base: 50, lg: 70 }} p="md">
					<div style={{ display: "flex", alignItems: "center", height: "100%" }}>
						<MediaQuery largerThan="sm" styles={{ display: "none" }}>
							<Burger
								opened={opened}
								onClick={() => handlers.open()}
								size="sm"
								color={theme.colors.gray[6]}
								mr="xl"
							/>
						</MediaQuery>

						<Text>Application header</Text>
					</div>
				</Header>
			}
		>
			<Text>Resize app to see responsive navbar in action</Text>
		</AppShell>
	);
}
