"use client";

import { createStyles, Switch, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const useStyles = createStyles(() => ({
	track: {
		cursor: "pointer",
	},
}));

export default function ThemeToggle() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const { classes } = useStyles();

	return (
		<Switch
			classNames={{ track: classes.track }}
			size="md"
			color={theme.colorScheme === "dark" ? "gray" : "dark"}
			checked={colorScheme === "dark"}
			onLabel={<MoonIcon className="w-4" color={theme.colors.blue[6]} />}
			offLabel={<SunIcon className="w-4" color={theme.colors.yellow[4]} />}
			onChange={() => toggleColorScheme()}
		/>
	);
}
