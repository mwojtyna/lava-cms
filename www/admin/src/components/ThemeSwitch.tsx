"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Switch } from "./ui/client";
import { useColorThemeStore } from "@admin/src/data/stores/dashboard";
import { cn } from "../utils/styling";

export const ThemeSwitch = React.forwardRef<
	HTMLButtonElement,
	React.ComponentPropsWithRef<typeof Switch>
>(({ className, ...props }, ref) => {
	const store = useColorThemeStore();

	return (
		<Switch
			ref={ref}
			className={cn("!bg-input", className)}
			checked={store.colorTheme === "dark"}
			onCheckedChange={(checked) => store.set(checked ? "dark" : "light")}
			iconOn={<MoonIcon className="text-primary" />}
			iconOff={<SunIcon className="text-primary" />}
			data-testid="theme-switch"
			aria-label="Toggle color theme"
			{...props}
		/>
	);
});
ThemeSwitch.displayName = "ThemeSwitch";
