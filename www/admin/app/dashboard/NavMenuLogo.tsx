"use client";

import Link from "next/link";
import type { NextFont } from "next/dist/compiled/@next/font";
import { IconVolcano } from "@tabler/icons-react";
import { TypographyH1, TypographyMuted } from "@admin/src/components/ui/server";
import { useMenuStore } from "@admin/src/data/stores/dashboard";
import { cn } from "@admin/src/utils/styling";

export function NavMenuLogo({ version, font }: { version: string; font: NextFont }) {
	const menu = useMenuStore();

	return (
		<Link
			onClick={() => setTimeout(() => menu.set(false))}
			href="/dashboard"
			className="mb-8 flex items-center justify-center gap-2"
			aria-label="Logo link"
		>
			<IconVolcano size={56} aria-label="Logo image" />
			<TypographyH1 className={cn("relative select-none text-4xl", font.className)}>
				Lava
				<TypographyMuted className="absolute -right-5 -top-[3px] rotate-[20deg] font-sans text-xs font-bold tracking-normal">
					v{version}
				</TypographyMuted>
			</TypographyH1>
		</Link>
	);
}
