import type { Metadata } from "next";
import { NavMenu } from "./NavMenu";
import { PageTitle } from "@admin/src/components";

export const metadata: Metadata = {
	title: "Lava CMS - Admin panel",
};

export const dynamic = "force-dynamic";

export default function Dashboard({ children }: { children: React.ReactNode }) {
	return (
		<div
			id="content"
			className="grid h-screen grid-rows-[auto_1fr] overflow-hidden md:grid-cols-[275px_1fr]"
		>
			<NavMenu />
			<main className="flex flex-1 flex-col gap-6 overflow-auto p-4 md:gap-8 md:p-6">
				<PageTitle />
				{children}
			</main>
		</div>
	);
}
