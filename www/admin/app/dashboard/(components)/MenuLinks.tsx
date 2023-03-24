"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar, useMantineTheme, NavLink, Group, Code, createStyles } from "@mantine/core";
import { getBorderColor, getCardColor, getHoverColor } from "@admin/app/mantine";
import { useUrl } from "@admin/src/hooks/useUrl";
import { routes } from "@admin/src/data/menuRoutes";
import logo from "@admin/public/img/logo.svg";

const useStyles = createStyles((theme) => ({
	logo: {
		// TODO: Temporary, before we get a proper logo
		filter: theme.colorScheme === "dark" ? "none" : "contrast(200%) brightness(50%)",
	},
	navLink: {
		"&:hover": {
			color: theme.colorScheme === "dark" ? theme.white : theme.black,
		},
		"&[data-active], &[data-active]:hover": {
			color: theme.colorScheme === "dark" ? theme.white : theme.black,
			backgroundColor: getHoverColor(theme),
			boxShadow: `-100px 0 0 0 ${
				theme.colorScheme === "dark" ? theme.colors.blue[8] : theme.colors.blue[5]
			}`,
		},
	},
}));

export default function MenuLinks({ version }: { version: string }) {
	const theme = useMantineTheme();
	const { classes } = useStyles();
	const url = useUrl();

	return (
		<>
			<Navbar.Section>
				<Group
					position="center"
					py={"xl"}
					bg={getCardColor(theme)}
					sx={{
						borderBottom: `1px solid ${getBorderColor(theme)}`,
					}}
				>
					<Link href={"/dashboard"}>
						<Image className={classes.logo} src={logo} alt={"logo"} width={150} />
					</Link>
					<Code bg={getBorderColor(theme)}>v{version}</Code>
				</Group>
			</Navbar.Section>

			<Navbar.Section bg={getCardColor(theme)} pl="5px">
				{routes.map((item, index) => (
					<NavLink
						key={index}
						component={Link}
						childrenOffset={0}
						px="md"
						py="sm"
						href={item.path}
						label={item.label}
						icon={item.icon}
						active={
							(item.startingRoute && url === item.path) ||
							(!item.startingRoute && url.startsWith(item.path))
						}
						defaultOpened={url.startsWith(item.path)}
						classNames={{ root: classes.navLink }}
					>
						{item.children?.map((child, index) => (
							<NavLink
								key={index}
								component={Link}
								px="md"
								py="sm"
								href={child.path}
								label={child.label}
								icon={child.icon ?? <span className="w-5" />}
								active={url === child.path}
								classNames={{ root: classes.navLink }}
							/>
						))}
					</NavLink>
				))}
			</Navbar.Section>
		</>
	);
}
