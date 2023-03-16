"use client";

import Link from "next/link";
import Image from "next/image";
import {
	Navbar,
	Text,
	Flex,
	Code,
	Drawer,
	MediaQuery,
	useMantineTheme,
	createStyles,
	Anchor,
} from "@mantine/core";
import logo from "@admin/public/img/logo.svg";
import { useMenuStore } from "@admin/src/stores/dashboard";
import { getCardBgColor } from "@admin/app/mantine";

const useStyles = createStyles((theme) => ({
	logo: {
		// TODO: Temporary, before we get a proper logo
		filter: theme.colorScheme === "dark" ? "none" : "contrast(200%) brightness(50%)",
	},
}));

export default function Menu({ version }: { version: string }) {
	const menuStore = useMenuStore();
	const theme = useMantineTheme();
	const { classes } = useStyles();

	const navbarContent = (
		<>
			<Navbar.Section>
				<Flex
					justify={"center"}
					align={"center"}
					py={"xl"}
					gap={"md"}
					h={"100%"}
					bg={getCardBgColor(theme)}
					sx={{
						borderBottom: `1px solid ${
							theme.colorScheme === "light"
								? theme.colors.gray[2]
								: theme.colors.dark[5]
						}`,
					}}
				>
					<Link href={"/"}>
						<Image className={classes.logo} src={logo} alt={"logo"} width={150} />
					</Link>
					<Code
						bg={
							theme.colorScheme === "light"
								? theme.colors.gray[2]
								: theme.colors.dark[4]
						}
					>
						v{version}
					</Code>
				</Flex>
			</Navbar.Section>

			<Navbar.Section p={"md"} bg={getCardBgColor(theme)} grow>
				<Anchor component={Link} href={"/dashboard/one"} onClick={menuStore.toggle}>
					One
				</Anchor>
				<br />
				<Anchor component={Link} href={"/dashboard/one/two"} onClick={menuStore.toggle}>
					Two
				</Anchor>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
				<Text>Links here...</Text>
			</Navbar.Section>
		</>
	);

	return (
		<>
			<MediaQuery largerThan={"md"} styles={{ display: "none" }}>
				<Drawer
					size={300}
					withCloseButton={false}
					opened={menuStore.isOpen}
					onClose={() => menuStore.toggle()}
					padding={0}
				>
					{navbarContent}
				</Drawer>
			</MediaQuery>

			<MediaQuery smallerThan={"md"} styles={{ display: "none" }}>
				<Navbar sx={{ width: 300, flexShrink: 0, height: "100vh", overflow: "auto" }}>
					{navbarContent}
				</Navbar>
			</MediaQuery>
		</>
	);
}
