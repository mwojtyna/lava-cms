"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Switch } from "./ui/client";
import { useColorThemeStore } from "@admin/src/data/stores/dashboard";

export function ThemeSwitch() {
	const store = useColorThemeStore();

	return (
		<Switch
			className="!bg-input"
			checked={store.colorTheme === "dark"}
			onCheckedChange={(checked) => store.set(checked ? "dark" : "light")}
			iconOn={<MoonIcon className="text-primary" />}
			iconOff={<SunIcon className="text-primary" />}
			data-testid="theme-switch"
		/>
	);
}
