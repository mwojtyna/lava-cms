"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import {
	Breadcrumbs,
	Burger,
	createStyles,
	Group,
	MediaQuery,
	useMantineTheme,
	Anchor,
} from "@mantine/core";
import { HomeIcon } from "@heroicons/react/24/solid";
import { useMenuStore } from "@admin/src/stores/dashboard";
import { getCardBgColor } from "@admin/app/mantine";
import UserMenu from "./UserMenu";
import type { User } from "api/prisma/types";
import { useUrl } from "@admin/src/hooks/useUrl";

const poppins = Poppins({ weight: "700", subsets: ["latin"] });
const useStyles = createStyles((theme) => ({
	breadcrumb: {
		color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.dark[4],
		fontFamily: poppins.style.fontFamily,
		fontSize: theme.fontSizes.lg,
		fontWeight: 700,
		transition: "opacity 150ms ease-in-out",

		"&:hover": {
			opacity: 0.8,
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
	const url = useUrl().split("/dashboard")[1]!;

	interface Breadcrumb {
		path: string;
		name: React.ReactNode;
	}
	const getBreadcrumbsFromPath = useCallback((path: string) => {
		const segments = path.split("/").filter((segment) => segment !== "");
		const result: Breadcrumb[] = [{ path: "/dashboard", name: <HomeIcon className="w-6" /> }];

		for (let i = 0; i < segments.length; i++) {
			let previousSegments = "/dashboard";
			for (let j = 0; j < i; j++) {
				previousSegments += "/" + segments[j];
			}

			result.push({ name: segments[i]!, path: `${previousSegments}/${segments[i]}` });
		}

		return result;
	}, []);
	const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>(getBreadcrumbsFromPath(url));

	useEffect(() => {
		// This is a workaround for the fact that usePathname() doesn't immediately return the url
		// We do this instead of displaying a loading state for the breadcrumbs
		setBreadcrumbs(getBreadcrumbsFromPath(url));
	}, [url, getBreadcrumbsFromPath]);

	return (
		<header className="sticky top-0 shadow-md">
			<Group bg={getCardBgColor(theme)} align={"center"} position={"apart"}>
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
				</Group>

				<UserMenu user={user} />
			</Group>
		</header>
	);
}
