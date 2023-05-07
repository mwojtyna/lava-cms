import type { Route } from "next";
import { Anchor, Breadcrumbs, Group, Text, type MantineTheme } from "@admin/src/components";
import { getRoute } from "@admin/src/data/menuRoutes";
import { poppins } from "@admin/app/_providers/mantine";
import Link from "next/link";
import { usePathname } from "@admin/src/hooks";

export default function CurrentPage({ theme }: { theme: MantineTheme }) {
	interface Breadcrumb {
		path: Route;
		name: React.ReactNode;
		hasChildren: boolean;
	}

	const url = usePathname();
	const segments = url.split("/").filter((segment) => segment !== "");
	const breadcrumbs: Breadcrumb[] = [];

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
				breadcrumbs.push({
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
			breadcrumbs.push({
				name: segments[i]!,
				path: `${previousSegments}/${segments[i]}` as Route,
				hasChildren: false,
			});
		}
	}

	return (
		<Breadcrumbs
			styles={{
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
					color:
						theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[5],
					fontFamily: poppins.style.fontFamily,
					fontSize: theme.fontSizes.lg,
					fontWeight: 700,
					margin: "0 0.75rem",
				},
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
	);
}
