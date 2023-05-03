"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Switch } from "./ui";
import { useColorThemeStore } from "@admin/src/data/stores/dashboard";

export function ThemeSwitch() {
	const store = useColorThemeStore();

	return (
		<Switch
			className="!bg-input"
			defaultChecked={store.colorTheme === "dark"}
			checked={store.colorTheme === "dark"} // For when theme automatically adapts to system preferences
			onCheckedChange={(checked) => store.set(checked ? "dark" : "light")}
			iconOff={<SunIcon className="text-primary" />}
			iconOn={<MoonIcon className="text-primary" />}
			data-testid="theme-switch"
		/>
	);
}
