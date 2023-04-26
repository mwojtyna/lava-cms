"use client";

import { Burger, Group, MediaQuery, useMantineTheme } from "@admin/src/components";
import { useMenuStore } from "@admin/src/data/stores/dashboard";
import { getCardColor } from "@admin/src/utils/colors";
import UserMenu from "./UserMenu";
import type { User } from "api/prisma/types";
import CurrentPage from "./CurrentPage";

export default function Header({ user }: { user: Omit<User, "password"> | null }) {
	const theme = useMantineTheme();
	const menuStore = useMenuStore();

	return (
		<header className="sticky top-0 z-10 shadow-md">
			<Group bg={getCardColor(theme)} align={"center"} position={"apart"} spacing={0}>
				<Group noWrap p="lg">
					<MediaQuery largerThan={"md"} styles={{ display: "none" }}>
						<Burger size={"md"} opened={menuStore.isOpen} onClick={menuStore.toggle} />
					</MediaQuery>

					<CurrentPage theme={theme} />
				</Group>

				<UserMenu user={user} />
			</Group>
		</header>
	);
}
