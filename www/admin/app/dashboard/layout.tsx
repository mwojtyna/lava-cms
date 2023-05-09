import type { Metadata } from "next";
import { NavMenu } from "./NavMenu";
import { PageTitle } from "@admin/src/components";

export const metadata: Metadata = {
	title: "Lava CMS - Admin panel",
};

export const dynamic = "force-dynamic";

export default function Dashboard({ children }: { children: React.ReactNode }) {
	return (
		<div id="content" className="flex h-screen overflow-hidden">
			<NavMenu />
			<main className="flex flex-1 flex-col gap-8 overflow-auto p-4 sm:p-6">
				<PageTitle />
				{children}
			</main>
		</div>
	);
}
