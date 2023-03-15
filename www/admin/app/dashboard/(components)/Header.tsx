"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import ThemeSwitch from "@admin/app/(components)/ThemeSwitch";

const useStyles = createStyles((theme) => ({
	breadcrumb: {
		color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.dark[5],
		fontSize: theme.fontSizes.xl,
		fontWeight: "bold",
		transition: "opacity 100ms ease-in-out",

		"&:hover": {
			opacity: 0.8,
			textDecoration: "none",
		},
	},
	separator: {
		color: theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[5],
		fontSize: theme.fontSizes.xl,
		margin: "0 0.75rem",
	},
}));

export default function Header({ serverUrl }: { serverUrl: string | null }) {
	const theme = useMantineTheme();
	const { classes } = useStyles();
	const menuStore = useMenuStore();

	interface Breadcrumb {
		path: string;
		name: React.ReactNode;
	}
	const getBreadcrumbsFromPath = useCallback((path: string) => {
		const segments = path.split("/").slice(path.startsWith("http") ? 5 : 3);
		const result: Breadcrumb[] = [
			{ path: "/dashboard", name: <HomeIcon className="mt-1 w-6" /> },
		];

		for (let i = 0; i < segments.length; i++) {
			let previousSegments = "";
			for (let j = 0; j < i; j++) {
				previousSegments += "/" + segments[j];
			}

			result.push({ name: segments[i]!, path: `${previousSegments}/${segments[i]}` });
		}

		return result;
	}, []);
	const clientUrl = usePathname();
	const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>(
		getBreadcrumbsFromPath(serverUrl!)
	);

	useEffect(() => {
		// This is a workaround for the fact that usePathname() doesn't immediately return the url
		// We do this instead of displaying a loading state for the breadcrumbs
		const result = getBreadcrumbsFromPath(clientUrl ?? serverUrl!);
		setBreadcrumbs(result);
	}, [serverUrl, clientUrl, getBreadcrumbsFromPath]);

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

				<ThemeSwitch />
			</Group>
		</header>
	);
}
