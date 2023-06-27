"use client";

import { ArrowLeftOnRectangleIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { DropdownMenuItem } from "@admin/src/components/ui/client";
import { useColorThemeStore } from "@admin/src/data/stores/dashboard";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { useRouter } from "next/navigation";
import { Loader } from "@admin/src/components/ui/server";

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

export const LogoutItem = () => {
	const mutation = trpcReact.auth.signOut.useMutation();
	const router = useRouter();

	return (
		<DropdownMenuItem
			className="text-destructive"
			onClick={async (e) => {
				e.preventDefault();
				await mutation.mutateAsync();
				router.replace("/signin");
			}}
		>
			{mutation.isLoading || mutation.isSuccess ? (
				<Loader className="w-4" />
			) : (
				<ArrowLeftOnRectangleIcon className="w-4" />
			)}
			<span>Sign out</span>
		</DropdownMenuItem>
	);
};
