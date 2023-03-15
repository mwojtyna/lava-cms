"use client";

import { Switch, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();

	return (
		<Switch
			size="md"
			color={theme.colorScheme === "dark" ? "gray" : "dark"}
			checked={colorScheme === "dark"}
			onLabel={<MoonIcon className="w-4" color={theme.colors.blue[6]} />}
			offLabel={<SunIcon className="w-4" color={theme.colors.yellow[4]} />}
			onChange={() => toggleColorScheme()}
		/>
	);
}
