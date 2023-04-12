"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
	Avatar,
	Group,
	UnstyledButton,
	Text,
	Menu,
	useMantineColorScheme,
	MediaQuery,
} from "@mantine/core";
import { useClickOutside, useDisclosure, useElementSize, useHotkeys } from "@mantine/hooks";
import { ChevronRightIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/solid";
import ThemeSwitch from "@admin/app/_components/ThemeSwitch";
import { getBorderColor, getCardColor, getHoverColor } from "@admin/src/utils/colors";
import type { User } from "api/prisma/types";

export default function UserMenu({ user }: { user: Omit<User, "password"> | null }) {
	const [isOpen, { toggle, close }] = useDisclosure(false);
	const { toggleColorScheme } = useMantineColorScheme();
	const menu = useClickOutside(close);
	useHotkeys([["Escape", close]]);

	const { ref: button, width } = useElementSize<HTMLButtonElement>();
	const [[paddingLeft, paddingRight], setPadding] = useState([0, 0]);

	useEffect(() => {
		const style = window.getComputedStyle(button.current);
		setPadding([parseInt(style?.paddingLeft || "0"), parseInt(style?.paddingRight || "0")]);
	}, [button]);

	return (
		<div ref={menu}>
			<Menu
				opened={isOpen}
				width={width + paddingLeft + paddingRight + 1}
				radius={0}
				offset={0}
				transitionProps={{ transition: "scale-y", duration: 150 }}
				styles={(theme) => ({
					item: {
						backgroundColor: getCardColor(theme),
						borderRadius: theme.radius.sm,
						height: "2.5rem",
					},
				})}
				data-testid="user-menu"
			>
				<Menu.Target>
					<UnstyledButton
						ref={button}
						p="md"
						sx={(theme) => ({
							borderLeft: `1px solid ${getBorderColor(theme)}`,
							borderRight: 0,
							"&:hover": {
								backgroundColor: getHoverColor(theme),
							},
						})}
						onClick={toggle}
					>
						<Group>
							<MediaQuery smallerThan={"xs"} styles={{ display: "none" }}>
								<Avatar radius="sm" color={"blue"}>
									{user?.name[0]}
									{user?.last_name[0]}
								</Avatar>
							</MediaQuery>
							<div>
								<Text>
									{user?.name} {user?.last_name}
								</Text>
								<Text size="xs" color="dimmed">
									{user?.email}
								</Text>
							</div>
							<ChevronRightIcon
								className="ml-2 w-4 transition-transform"
								style={{
									transform: `rotate(${isOpen ? "90deg" : "0"})`,
								}}
							/>
						</Group>
					</UnstyledButton>
				</Menu.Target>

				<Menu.Dropdown
					className="shadow-md"
					sx={(theme) => ({
						borderBottomLeftRadius: theme.radius.sm,
						borderBottomRightRadius: theme.radius.sm,
					})}
					data-testid="user-menu-dropdown"
				>
					<Menu.Item onClick={() => toggleColorScheme()}>
						<Group position="apart">
							Color scheme
							<ThemeSwitch size="md" />
						</Group>
					</Menu.Item>

					<Menu.Divider />

					<Menu.Item
						color={"red"}
						icon={<ArrowLeftOnRectangleIcon className="w-4" />}
						onClick={() => signOut()}
					>
						Sign out
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</div>
	);
}
