"use client";

import Link from "next/link";
import Image from "next/image";
import {
	Navbar,
	Header,
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

function Menu({ version }: { version: string }) {
	const menuStore = useMenuStore();
	const theme = useMantineTheme();
	const { classes } = useStyles();

	const navbarContent = (
		<>
			<Navbar.Section>
				<Header height={100}>
					<Flex
						justify={"center"}
						align={"center"}
						gap={"md"}
						h={"100%"}
						bg={getCardBgColor(theme)}
					>
						<Link href={"/"}>
							<Image className={classes.logo} src={logo} alt={"logo"} width={150} />
						</Link>
						<Code
							bg={
								theme.colorScheme === "light"
									? theme.colors.gray[1]
									: theme.colors.dark[5]
							}
						>
							v{version}
						</Code>
					</Flex>
				</Header>
			</Navbar.Section>

			<Navbar.Section p={"md"} bg={getCardBgColor(theme)}>
				<Anchor component={Link} href={"/dashboard/one"} onClick={() => menuStore.toggle()}>
					One
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
				<Navbar
					className="h-screen overflow-auto"
					// sx={{ height: "100vh", overflow: "auto" }}
					width={{
						base: 300,
					}}
				>
					{navbarContent}
				</Navbar>
			</MediaQuery>
		</>
	);
}

export default Menu;
