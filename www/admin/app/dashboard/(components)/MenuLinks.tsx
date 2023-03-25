"use client";

import Link from "next/link";
import Image from "next/image";
import {
	Navbar,
	useMantineTheme,
	NavLink,
	Group,
	Code,
	createStyles,
	Title,
	Anchor,
} from "@mantine/core";
import { getBorderColor, getCardColor, getHoverColor } from "@admin/app/mantine";
import { useUrl } from "@admin/src/hooks/useUrl";
import { routes } from "@admin/src/data/menuRoutes";
import logo from "@admin/public/img/logo.png";
import { useMenuStore } from "@admin/src/data/stores/dashboard";
import { useRef } from "react";

const useStyles = createStyles((theme) => ({
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
const TRANSITION_TIME = 250;
const TRANSITION = `background-position ${TRANSITION_TIME}ms ease-in-out`;

export default function MenuLinks({ version }: { version: string }) {
	const theme = useMantineTheme();
	const { classes } = useStyles();

	const url = useUrl();
	const { toggle } = useMenuStore();
	const title = useRef<HTMLDivElement>(null);

	return (
		<>
			<Navbar.Section>
				<Group
					position="center"
					py={"2rem"}
					bg={getCardColor(theme)}
					sx={{
						borderBottom: `1px solid ${getBorderColor(theme)}`,
					}}
				>
					<Anchor
						component={Link}
						href={"/dashboard"}
						sx={{
							"&:hover": { textDecoration: "none" },
						}}
						onMouseOver={() => {
							if (title.current) {
								title.current.style.backgroundPosition = "center";
							}
						}}
						onMouseLeave={() => {
							if (title.current) {
								title.current.style.backgroundPosition = "left";

								setTimeout(() => {
									title.current!.style.transition = "none";
									title.current!.style.backgroundPosition = "right";

									setTimeout(() => {
										title.current!.style.transition = TRANSITION;
									}, TRANSITION_TIME);
								}, TRANSITION_TIME);
							}
						}}
					>
						<Group>
							<Image src={logo} alt={"logo"} width={35} />
							<Title
								ref={title}
								order={1}
								sx={{
									backgroundImage: `linear-gradient(120deg, ${
										theme.colors.orange[5]
									} 0%, ${theme.colors.orange[5]} 42.5%, ${theme.fn.lighten(
										theme.colors.orange[5],
										0.7
									)} 50%, ${theme.fn.lighten(theme.colors.orange[5], 0.7)} 50%, ${
										theme.colors.orange[5]
									} 57.5%, ${theme.colors.orange[5]} 100%)`,

									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundSize: "300% 100%",
									backgroundPosition: "right",
									transition: TRANSITION,
								}}
							>
								LAVA
							</Title>
						</Group>
					</Anchor>
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
						onClick={!item.children ? () => toggle() : undefined}
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
								onClick={toggle}
							/>
						))}
					</NavLink>
				))}
			</Navbar.Section>
		</>
	);
}
