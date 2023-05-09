import {
	Avatar,
	AvatarFallback,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@admin/src/components/ui/client";
import { TypographyMuted } from "@admin/src/components/ui/server";
import { trpc } from "@admin/src/utils/trpc";
import { getServerSession } from "next-auth";
import { LogoutItem, ThemeSwitchItem } from "./UserMenuItems";
import { authOptions } from "@admin/src/pages/api/auth/[...nextauth]";
import { cn } from "@admin/src/utils/styling";

export async function UserMenu({ small }: { small: boolean }) {
	const { user } = await trpc.auth.getUser.query({
		// set to "empty" when null, because otherwise an ambiguous error is thrown
		id: (await getServerSession(authOptions))?.user?.id ?? "empty",
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex h-fit w-fit items-center gap-4 outline-none">
				<Avatar>
					<AvatarFallback>
						{user?.name.charAt(0).toUpperCase()}
						{user?.last_name.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className={cn("text-left", small && "hidden")}>
					<p>
						{user?.name} {user?.last_name}
					</p>
					<TypographyMuted>{user?.email}</TypographyMuted>
				</div>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				sideOffset={small ? 14 : 18}
				align="start"
				className="w-48 sm:ml-2 sm:scale-110"
			>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<ThemeSwitchItem />
				<LogoutItem />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
