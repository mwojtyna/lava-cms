"use client";

import { ArrowLeftOnRectangleIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { DropdownMenuItem } from "@admin/src/components/ui/client";
import { useColorThemeStore } from "@admin/src/data/stores/dashboard";
import { signOut } from "next-auth/react";

export const ThemeSwitchItem = () => {
	const store = useColorThemeStore();

	return (
		<DropdownMenuItem
			onSelect={() => store.set(store.colorTheme === "dark" ? "light" : "dark")}
		>
			{store.colorTheme === "dark" ? (
				<MoonIcon className="w-4" />
			) : (
				<SunIcon className="w-4" />
			)}
			<span>Switch theme</span>
		</DropdownMenuItem>
	);
};

export const LogoutItem = () => (
	<DropdownMenuItem className="text-destructive" onSelect={() => signOut()}>
		<ArrowLeftOnRectangleIcon className="w-4" />
		<span>Log out</span>
	</DropdownMenuItem>
);
