"use client";

import { ArrowLeftOnRectangleIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { DropdownMenuItem } from "@admin/src/components/ui/client";
import { useColorTheme } from "@admin/src/data/stores/dashboard";
import { trpc } from "@admin/src/utils/trpc";
import { useRouter } from "next/navigation";
import { Loader } from "@admin/src/components/ui/server";

export const ThemeSwitchItem = () => {
	const { colorTheme, setColorTheme } = useColorTheme();

	return (
		<DropdownMenuItem onSelect={() => setColorTheme(colorTheme === "dark" ? "light" : "dark")}>
			{colorTheme === "dark" ? <MoonIcon className="w-4" /> : <SunIcon className="w-4" />}
			<span>Switch theme</span>
		</DropdownMenuItem>
	);
};

export const LogoutItem = () => {
	const mutation = trpc.auth.signOut.useMutation();
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
