import { getCurrentUser } from "@/src/auth";
import { Avatar, AvatarFallback } from "@/src/components/ui/client/Avatar";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/src/components/ui/client/DropdownMenu";
import { TypographyMuted } from "@/src/components/ui/server/typography";
import { cn } from "@/src/utils/styling";
import { LogoutItem, ThemeSwitchItem } from "./UserMenuItems";

interface Props {
	className?: string;
	small?: boolean;
}
export async function UserMenu(props: Props) {
	const user = await getCurrentUser();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					"inline-flex h-fit w-fit items-center gap-4 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-8 focus-visible:ring-offset-background",
					props.className,
				)}
				data-testid="user-menu"
			>
				<Avatar>
					<AvatarFallback>
						{user?.name.charAt(0).toUpperCase()}
						{user?.lastName.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className={cn("text-left", props.small && "hidden")}>
					<p>
						{user?.name} {user?.lastName}
					</p>
					<TypographyMuted>{user?.email}</TypographyMuted>
				</div>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				sideOffset={props.small ? 14 : 18}
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
