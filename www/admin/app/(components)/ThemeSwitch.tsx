"use client";

import { Switch, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeSwitch({ size = "lg" }: { size?: "md" | "lg" }) {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();

	return (
		<Switch
			styles={{ track: { cursor: "pointer" } }}
			size={size}
			color={theme.colorScheme === "dark" ? "gray" : "dark"}
			checked={colorScheme === "dark"}
			onLabel={
				<MoonIcon className={`w-${size === "md" ? 4 : 5}`} color={theme.colors.blue[6]} />
			}
			offLabel={
				<SunIcon className={`w-${size === "md" ? 4 : 5}`} color={theme.colors.yellow[6]} />
			}
			onChange={() => toggleColorScheme()}
			wrapperProps={{ "data-testid": "theme-switch" }}
		/>
	);
}
