"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	Breadcrumbs,
	Burger,
	createStyles,
	Group,
	MediaQuery,
	useMantineTheme,
	Anchor,
} from "@mantine/core";
import { usePathname } from "next/navigation";
import { useMenuStore } from "@admin/src/stores/dashboard";
import { getCardBgColor } from "@admin/app/mantine";

const useStyles = createStyles((theme) => ({
	breadcrumb: {
		color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.dark[5],
		fontSize: theme.fontSizes.xl,
		fontWeight: "bold",
	},
	separator: {
		color: theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[5],
		fontSize: theme.fontSizes.lg,
		marginBottom: "2px",
	},
}));

function Header() {
	const theme = useMantineTheme();

	const { classes } = useStyles();
	const menuStore = useMenuStore();

	const path = usePathname()!;
	const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

	useEffect(() => {
		setBreadcrumbs(path.split("/").slice(2));
	}, [path]);

	return (
		<header className="sticky top-0 shadow-md">
			<Group bg={getCardBgColor(theme)} p={"lg"}>
				<MediaQuery largerThan={"md"} styles={{ display: "none" }}>
					<Burger
						size={"md"}
						opened={menuStore.isOpen}
						onClick={() => menuStore.toggle()}
					/>
				</MediaQuery>
				{/* // TODO: Implement loading state */}
				<Breadcrumbs
					classNames={{
						breadcrumb: classes.breadcrumb,
						separator: classes.separator,
					}}
				>
					{breadcrumbs.map((breadcrumb, i) => (
						<Anchor key={i} component={Link} href={"/" + breadcrumb} underline={false}>
							{breadcrumb}
						</Anchor>
					))}
				</Breadcrumbs>
			</Group>
		</header>
	);
}

export default Header;
