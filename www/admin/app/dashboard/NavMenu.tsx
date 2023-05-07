import * as React from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { getServerSession } from "next-auth";
import {
	ActionIcon,
	Avatar,
	AvatarFallback,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Separator,
	Sheet,
	SheetContent,
	SheetTrigger,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@admin/src/components/ui/client";
import { IconArrowBarRight, IconVolcano } from "@tabler/icons-react";
import { TypographyH1, TypographyMuted } from "@admin/src/components/ui/server";
import { routes } from "@admin/src/data/menuRoutes";
import { getPathname } from "@admin/src/utils/server";
import { cn } from "@admin/src/utils/styling";
import { authOptions } from "@admin/src/pages/api/auth/[...nextauth]";
import { trpc } from "@admin/src/utils/trpc";
import { LogoutItem, ThemeSwitchItem } from "./UserMenuItems";

const logoFont = Poppins({
	weight: ["600"],
	subsets: ["latin"],
});

interface MenuProps extends React.ComponentPropsWithRef<"nav"> {
	responsive?: boolean;
}
async function Menu({ className, responsive = true, ...props }: MenuProps) {
	const version = (await import("@admin/../package.json")).version;

	return (
		<nav
			className={cn(
				"flex h-full w-[275px] flex-col overflow-auto border-r border-r-border p-6 py-8",
				responsive && "w-fit p-3 py-4 sm:w-[275px] sm:p-6 sm:py-8",
				className
			)}
			{...props}
		>
			<Link
				href="/dashboard"
				className={cn(
					"mb-8 flex items-center justify-center gap-2",
					responsive && "hidden sm:flex"
				)}
				aria-label="Logo link"
			>
				<IconVolcano size={56} aria-label="Logo image" />
				<TypographyH1 className={cn("relative select-none text-4xl", logoFont.className)}>
					Lava
					<TypographyMuted className="absolute -right-5 -top-[3px] rotate-[20deg] font-sans text-xs font-bold tracking-normal">
						v{version}
					</TypographyMuted>
				</TypographyH1>
			</Link>

			{responsive && (
				<div className="mb-4 w-fit space-y-4 sm:hidden">
					<Tooltip>
						<TooltipTrigger asChild>
							<SheetTrigger asChild>
								<ActionIcon
									variant={"outline"}
									className="rounded-md p-3"
									aria-label="Expand menu"
								>
									<IconArrowBarRight size={20} />
								</ActionIcon>
							</SheetTrigger>
						</TooltipTrigger>

						<TooltipContent>Expand menu</TooltipContent>
					</Tooltip>

					<Separator />
				</div>
			)}

			<div className="flex flex-grow flex-col justify-between gap-8">
				<div className="flex flex-col gap-2">
					{routes.map((route, i) => (
						<React.Fragment key={i}>
							{i === 1 && (
								<Separator className={cn(responsive && "hidden sm:block")} />
							)}

							<Tooltip>
								<TooltipTrigger asChild>
									<Link href={route.path} tabIndex={-1}>
										<Button
											className={cn(
												"w-full justify-start",
												responsive && "w-fit p-3 sm:w-full sm:p-4",
												route.path === getPathname() && "bg-accent"
											)}
											variant={"ghost"}
											icon={route.icon}
											aria-label={route.label}
										>
											<span className={cn(responsive && "hidden sm:block")}>
												{route.label}
											</span>
										</Button>
									</Link>
								</TooltipTrigger>

								{responsive && (
									<TooltipContent className="sm:hidden">
										{route.label}
									</TooltipContent>
								)}
							</Tooltip>

							{i === 3 && (
								<Separator className={cn(responsive && "hidden sm:block")} />
							)}
						</React.Fragment>
					))}
				</div>

				{/* @ts-expect-error Async Server Component */}
				<UserMenu responsive={responsive} />
			</div>
		</nav>
	);
}

async function UserMenu({ responsive }: { responsive: boolean }) {
	const { user } = await trpc.auth.getUser.query({
		// set to "empty" when null, because otherwise an ambiguous error is thrown
		id: (await getServerSession(authOptions))?.user?.id ?? "empty",
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					"flex w-fit items-center gap-4 outline-none",
					responsive && "mx-auto sm:mx-0"
				)}
			>
				<Avatar>
					<AvatarFallback>
						{user?.name.charAt(0).toUpperCase()}
						{user?.last_name.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className={cn("text-left", responsive && "hidden sm:block")}>
					<p>
						{user?.name} {user?.last_name}
					</p>
					<TypographyMuted>{user?.email}</TypographyMuted>
				</div>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				sideOffset={18}
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

export function NavMenu() {
	return (
		<Sheet>
			{/* @ts-expect-error Async Server Component */}
			<Menu />

			<SheetContent
				position={"left"}
				size={"content"}
				className="h-full p-0"
				maxScreenWidth={640}
			>
				{/* @ts-expect-error Async Server Component */}
				<Menu className="w-screen" responsive={false} />
			</SheetContent>
		</Sheet>
	);
}
