"use client";

import {
	Avatar,
	Group,
	UnstyledButton,
	Text,
	Menu,
	Flex,
	useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useElementSize } from "@mantine/hooks";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import ThemeSwitch from "@admin/app/(components)/ThemeSwitch";
import { useEffect, useState } from "react";
import { getCardBgColor } from "@admin/app/mantine";
import type { User } from "api/prisma/types";

export default function UserMenu({ user }: { user: Omit<User, User["password"]> | null }) {
	const [isOpen, { toggle }] = useDisclosure(false);
	const { toggleColorScheme } = useMantineColorScheme();

	const { ref, width } = useElementSize<HTMLButtonElement>();
	const [[paddingLeft, paddingRight], setPadding] = useState([0, 0]);

	useEffect(() => {
		const style = window.getComputedStyle(ref.current);
		setPadding([parseInt(style?.paddingLeft || "0"), parseInt(style?.paddingRight || "0")]);
	}, [ref]);

	return (
		<Menu
			opened={isOpen}
			width={width + paddingLeft + paddingRight + 1}
			radius={0}
			offset={0}
			transitionProps={{ transition: "scale-y", duration: 150 }}
			styles={(theme) => ({
				item: {
					backgroundColor: getCardBgColor(theme),
				},
			})}
		>
			<Menu.Target>
				<UnstyledButton
					ref={ref}
					p="md"
					sx={(theme) => ({
						borderLeft: `1px solid ${
							theme.colorScheme === "dark"
								? theme.colors.dark[4]
								: theme.colors.gray[2]
						}`,
						borderRight: 0,

						"&:hover": {
							transition: "background-color 150ms ease-in-out",
							backgroundColor:
								theme.colorScheme === "dark"
									? theme.colors.dark[7]
									: theme.colors.gray[2],
						},
					})}
					onClick={toggle}
				>
					<Group>
						<Avatar radius="sm" color={"blue"}>
							{user?.name[0]}
							{user?.last_name[0]}
						</Avatar>
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

			<Menu.Dropdown p={0}>
				<Menu.Item onClick={() => toggleColorScheme()}>
					<Flex justify={"space-between"} align={"center"}>
						Color scheme
						<ThemeSwitch size="md" />
					</Flex>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
