"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar, useMantineTheme, NavLink, Group, Code, createStyles } from "@mantine/core";
import { getBorderColor, getCardBgColor, getHoverColor } from "@admin/app/mantine";
import { useUrl } from "@admin/src/hooks/useUrl";
import logo from "@admin/public/img/logo.svg";
import { menuRoutes } from "@admin/src/data/routes";

const useStyles = createStyles((theme) => ({
	logo: {
		// TODO: Temporary, before we get a proper logo
		filter: theme.colorScheme === "dark" ? "none" : "contrast(200%) brightness(50%)",
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
					bg={getCardBgColor(theme)}
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

			<Navbar.Section bg={getCardBgColor(theme)}>
				{menuRoutes.map((item, index) => (
					<NavLink
						key={index}
						component={Link}
						childrenOffset="md"
						p="md"
						href={item.path}
						label={item.label}
						icon={item.icon}
						active={
							(item.startingRoute && url === item.path) ||
							(!item.startingRoute && url.startsWith(item.path))
						}
						variant="filled"
						styles={(theme) => ({
							root: {
								"&:hover": {
									backgroundColor: getHoverColor(theme),
								},
							},
						})}
					>
						{/* {drawChildren(item)} */}
					</NavLink>
				))}
			</Navbar.Section>
		</>
	);
}
