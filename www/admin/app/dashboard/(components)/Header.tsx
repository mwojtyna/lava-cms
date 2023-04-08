"use client";

import { useCallback, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
	Breadcrumbs,
	Burger,
	createStyles,
	Group,
	MediaQuery,
	useMantineTheme,
	Anchor,
	Text,
} from "@mantine/core";
import { useMenuStore } from "@admin/src/data/stores/dashboard";
import { poppins } from "@admin/app/mantine";
import { getCardColor } from "@admin/src/utils/colors";
import UserMenu from "./UserMenu";
import type { User } from "api/prisma/types";
import { useUrl } from "@admin/src/hooks";
import { getRoute } from "@admin/src/data/menuRoutes";

const useStyles = createStyles((theme) => ({
	breadcrumb: {
		fontFamily: poppins.style.fontFamily,
		fontSize: theme.fontSizes.xl,
		fontWeight: 700,
		transition: "opacity 150ms ease-in-out",

		"& svg": {
			width: "1.5rem",
		},
		"&:hover": {
			textDecoration: "none",
		},
	},
	separator: {
		color: theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[5],
		fontFamily: poppins.style.fontFamily,
		fontSize: theme.fontSizes.lg,
		fontWeight: 700,
		margin: "0 0.75rem",
	},
}));

export default function Header({ user }: { user: Omit<User, "password"> | null }) {
	const theme = useMantineTheme();
	const { classes } = useStyles();
	const menuStore = useMenuStore();
	const url = useUrl();

	interface Breadcrumb {
		path: Route;
		name: React.ReactNode;
		hasChildren: boolean;
	}
	const getBreadcrumbsFromPath = useCallback((path: string) => {
		const segments = path.split("/").filter((segment) => segment !== "");
		const result: Breadcrumb[] = [];

		for (let i = 0; i < segments.length; i++) {
			let previousSegments = "";
			for (let j = 0; j < i; j++) {
				previousSegments += "/" + segments[j];
			}

			const route = getRoute(`${previousSegments}/${segments[i]}`);
			if (route) {
				// If the route is a starting (/dashboard) route, only show it if it's the only segment
				if (
					(!route.startingRoute && segments.length >= 1) ||
					(route.startingRoute && segments.length === 1)
				) {
					result.push({
						name: (
							<Group spacing={"xs"}>
								{route.icon}
								{route.label}
							</Group>
						),
						path: route.path,
						hasChildren: !!route.children || i === segments.length - 1,
					});
				}
			} else {
				result.push({
					name: segments[i]!,
					path: `${previousSegments}/${segments[i]}` as Route,
					hasChildren: false,
				});
			}
		}

		return result;
	}, []);
	const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>(getBreadcrumbsFromPath(url));

	useEffect(() => {
		setBreadcrumbs(getBreadcrumbsFromPath(url));
	}, [url, getBreadcrumbsFromPath]);

	return (
		<header className="sticky top-0 z-10 shadow-md">
			<Group bg={getCardColor(theme)} align={"center"} position={"apart"} spacing={0}>
				<Group noWrap p="lg">
					<MediaQuery largerThan={"md"} styles={{ display: "none" }}>
						<Burger size={"md"} opened={menuStore.isOpen} onClick={menuStore.toggle} />
					</MediaQuery>

					<Breadcrumbs
						classNames={{
							breadcrumb: classes.breadcrumb,
							separator: classes.separator,
						}}
					>
						{breadcrumbs.map((breadcrumb, i) => {
							if (breadcrumb.hasChildren || i === breadcrumbs.length - 1) {
								return <Text key={i}>{breadcrumb.name}</Text>;
							} else {
								return (
									<Anchor
										key={i}
										component={Link}
										href={breadcrumb.path}
										underline={false}
										sx={{
											"&:hover": {
												opacity: 0.8,
											},
										}}
									>
										{breadcrumb.name}
									</Anchor>
								);
							}
						})}
					</Breadcrumbs>
				</Group>

				<UserMenu user={user} />
			</Group>
		</header>
	);
}
