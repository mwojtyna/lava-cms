import Link from "next/link";
import { Poppins } from "next/font/google";
import {
	Button,
	Separator,
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@admin/src/components/ui/client";
import { TypographyH1 } from "@admin/src/components/ui/server";
import { routes } from "@admin/src/data/menuRoutes";
import { getPathname } from "@admin/src/utils/server";
import { cn } from "@admin/src/utils/styling";

const logoFont = Poppins({
	weight: ["600"],
	subsets: ["latin"],
});

const LogoSVG = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={56}
		height={56}
		viewBox="0 0 24 24"
		strokeWidth={2}
		stroke="currentColor"
		fill="none"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-label="Logo"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M9 8v-1a2 2 0 1 0 -4 0" />
		<path d="M15 8v-1a2 2 0 1 1 4 0" />
		<path d="M4 20l3.472 -7.812a2 2 0 0 1 1.828 -1.188h5.4a2 2 0 0 1 1.828 1.188l3.472 7.812" />
		<path d="M6.192 15.064a2.14 2.14 0 0 1 .475 -.064c.527 -.009 1.026 .178 1.333 .5c.307 .32 .806 .507 1.333 .5c.527 .007 1.026 -.18 1.334 -.5c.307 -.322 .806 -.509 1.333 -.5c.527 -.009 1.026 .178 1.333 .5c.308 .32 .807 .507 1.334 .5c.527 .007 1.026 -.18 1.333 -.5c.307 -.322 .806 -.509 1.333 -.5c.161 .003 .32 .025 .472 .064" />
		<path d="M12 8v-4" />
	</svg>
);

const Menu = ({ className, version }: { className?: string; version: string }) => (
	<nav className={cn("w-[275px] overflow-auto border-r border-r-border p-6", className)}>
		<Link href="/dashboard" className="mb-8 mt-2 flex items-center justify-center gap-2">
			<LogoSVG />

			<TypographyH1 className={cn("relative select-none text-4xl", logoFont.className)}>
				Lava
				<p className="absolute -right-5 -top-[3px] rotate-[20deg] font-sans text-xs font-bold tracking-normal text-muted-foreground">
					v{version}
				</p>
			</TypographyH1>
		</Link>

		<div className="flex flex-col gap-2">
			{routes.map((route, i) => (
				<>
					{i === 1 && <Separator />}
					<Link href={route.path} tabIndex={-1}>
						<Button
							key={i}
							className={cn(
								"w-full justify-start",
								route.path === getPathname() && "bg-accent"
							)}
							variant={"ghost"}
							icon={route.icon}
						>
							{route.label}
						</Button>
					</Link>
					{i === 3 && <Separator />}
				</>
			))}
		</div>
	</nav>
);

export async function NavMenu() {
	const version = (await import("@admin/../package.json")).version;

	return (
		<>
			<Menu className="hidden sm:block" version={version} />

			<Sheet>
				<SheetTrigger className="sm:hidden">Open</SheetTrigger>
				<SheetContent
					position={"left"}
					size={"content"}
					className="p-0"
					maxScreenWidth={640}
				>
					<Menu className="w-screen" version={version} />
				</SheetContent>
			</Sheet>
		</>
	);
}
