"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar, useMantineTheme, NavLink, Group, Code, createStyles } from "@mantine/core";
import { getBorderColor, getCardBgColor, getHoverColor } from "@admin/app/mantine";
import { ChartBarIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import { useUrl } from "@admin/src/hooks/useUrl";
import logo from "@admin/public/img/logo.svg";

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

	interface Data {
		label: string;
		path: string;
		icon?: React.ReactNode;
		children?: Data[];
	}
	const data: Data[] = [
		{
			label: "Dashboard",
			path: "/dashboard",
			icon: <ChartBarIcon className="w-5" />,
		},
		{
			label: "Settings",
			path: "/settings",
			icon: <Cog6ToothIcon className="w-5" />,
		},
	];

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
			<Navbar.Section bg={getCardBgColor(theme)} grow>
				{data.map((item, index) => (
					<NavLink
						key={index}
						component={Link}
						childrenOffset="md"
						p="md"
						href={item.path}
						label={item.label}
						icon={item.icon}
						active={url.includes(item.path)}
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
