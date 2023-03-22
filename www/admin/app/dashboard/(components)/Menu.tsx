"use client";

import { Navbar, Drawer, MediaQuery, useMantineTheme } from "@mantine/core";
import { useMenuStore } from "@admin/src/stores/dashboard";
import MenuLinks from "./MenuLinks";

export default function Menu({ version, serverUrl }: { version: string; serverUrl: string }) {
	const menuStore = useMenuStore();

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
					<MenuLinks version={version} serverUrl={serverUrl} />
				</Drawer>
			</MediaQuery>

			<MediaQuery smallerThan={"md"} styles={{ display: "none" }}>
				<Navbar
					sx={{
						width: 300,
						flexShrink: 0,
						height: "100vh",
						overflow: "auto",
					}}
				>
					<MenuLinks version={version} serverUrl={serverUrl} />
				</Navbar>
			</MediaQuery>
		</>
	);
}
