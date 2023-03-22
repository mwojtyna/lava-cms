"use client";

import { Navbar, Drawer, MediaQuery, useMantineTheme } from "@mantine/core";
import { useMenuStore } from "@admin/src/stores/dashboard";
import MenuLinks from "./MenuLinks";

export default function Menu({ version }: { version: string }) {
	const menuStore = useMenuStore();
	const WIDTH = 300;

	return (
		<>
			<MediaQuery largerThan={"md"} styles={{ display: "none" }}>
				<Drawer
					size={WIDTH}
					withCloseButton={false}
					opened={menuStore.isOpen}
					onClose={() => menuStore.toggle()}
					padding={0}
				>
					<MenuLinks version={version} />
				</Drawer>
			</MediaQuery>

			<MediaQuery smallerThan={"md"} styles={{ display: "none" }}>
				<Navbar
					sx={{
						width: WIDTH,
						flexShrink: 0,
						height: "100vh",
						overflow: "auto",
					}}
				>
					<MenuLinks version={version} />
				</Navbar>
			</MediaQuery>
		</>
	);
}
