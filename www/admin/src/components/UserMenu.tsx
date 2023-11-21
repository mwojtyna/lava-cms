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
import { LogoutItem, ThemeSwitchItem } from "./UserMenuItems";
import { cn } from "@admin/src/utils/styling";
import { getCurrentUser } from "@admin/src/auth";

export async function UserMenu({ small }: { small?: boolean }) {
	const user = await getCurrentUser();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className="inline-flex h-fit w-fit items-center gap-4 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-8 focus-visible:ring-offset-background"
				data-testid="user-menu"
			>
				<Avatar>
					<AvatarFallback>
						{user?.name.charAt(0).toUpperCase()}
						{user?.lastName.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className={cn("text-left", small && "hidden")}>
					<p>
						{user?.name} {user?.lastName}
					</p>
					<TypographyMuted>{user?.email}</TypographyMuted>
				</div>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				sideOffset={small ? 14 : 18}
				align="start"
				className="w-48 md:ml-2 md:scale-110"
				data-testid="user-menu-dropdown"
			>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<ThemeSwitchItem />
				<LogoutItem />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
