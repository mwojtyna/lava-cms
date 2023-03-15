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
	Skeleton,
} from "@mantine/core";
import { usePathname } from "next/navigation";
import { useMenuStore } from "@admin/src/stores/dashboard";
import { getCardBgColor } from "@admin/app/mantine";
import ThemeToggle from "@admin/app/(components)/ThemeToggle";

const useStyles = createStyles((theme) => ({
	breadcrumb: {
		color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.dark[5],
		fontSize: theme.fontSizes.xl,
		fontWeight: "bold",
	},
	separator: {
		color: theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[5],
		fontSize: theme.fontSizes.xl,
	},
}));

function Header() {
	const theme = useMantineTheme();

	const { classes } = useStyles();
	const menuStore = useMenuStore();

	interface Breadcrumb {
		path: string;
		name: string;
	}
	const path = usePathname()!;
	const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

	useEffect(() => {
		const segments = path.split("/").slice(2);
		const result: Breadcrumb[] = [];

		for (let i = 0; i < segments.length; i++) {
			let previousSegments = "";
			for (let j = 0; j < i; j++) {
				previousSegments += "/" + segments[j];
			}

			result.push({ name: segments[i]!, path: `${previousSegments}/${segments[i]}` });
		}

		setBreadcrumbs(result);
	}, [path]);

	return (
		<header className="sticky top-0 shadow-md">
			<Group bg={getCardBgColor(theme)} align={"center"} position={"apart"} p={"lg"}>
				<Group noWrap>
					<MediaQuery largerThan={"md"} styles={{ display: "none" }}>
						<Burger
							size={"md"}
							opened={menuStore.isOpen}
							onClick={() => menuStore.toggle()}
						/>
					</MediaQuery>

					<Skeleton width={200} height={20} visible={breadcrumbs.length === 0}>
						<Breadcrumbs
							classNames={{
								breadcrumb: classes.breadcrumb,
								separator: classes.separator,
							}}
						>
							{breadcrumbs.map((breadcrumb, i) => (
								<Anchor
									key={i}
									component={Link}
									href={breadcrumb.path}
									underline={false}
								>
									{breadcrumb.name}
								</Anchor>
							))}
						</Breadcrumbs>
					</Skeleton>
				</Group>

				<ThemeToggle />
			</Group>
		</header>
	);
}

export default Header;
