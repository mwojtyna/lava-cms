"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { useColorTheme } from "@/src/data/stores/dashboard";
import { Switch } from "../../src/components/ui/client";
import { cn } from "../../src/utils/styling";

export const ThemeSwitch = React.forwardRef<
	HTMLButtonElement,
	React.ComponentPropsWithRef<typeof Switch>
>(({ className, ...props }, ref) => {
	const { colorTheme, setColorTheme } = useColorTheme();

	return (
		<Switch
			ref={ref}
			size="lg"
			className={cn("!bg-input", className)}
			checked={colorTheme === "dark"}
			onCheckedChange={(checked) => setColorTheme(checked ? "dark" : "light")}
			iconOn={<MoonIcon className="text-primary" />}
			iconOff={<SunIcon className="text-primary" />}
			data-testid="theme-switch"
			aria-label="Toggle color theme"
			{...props}
		/>
	);
});
ThemeSwitch.displayName = "ThemeSwitch";
