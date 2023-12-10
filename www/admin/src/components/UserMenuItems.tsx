"use client";

import { ArrowLeftOnRectangleIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/src/components/ui/client";
import { Loader } from "@/src/components/ui/server";
import { useColorTheme } from "@/src/data/stores/dashboard";
import { trpc } from "@/src/utils/trpc";

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
