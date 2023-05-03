import type { Metadata } from "next";
import Menu from "./_components/Menu";
import Header from "./_components/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@admin/src/pages/api/auth/[...nextauth]";
import { trpc } from "@admin/src/utils/trpc";

export const metadata: Metadata = {
	title: "Lava CMS - Admin dashboard",
};

export default async function Dashboard({ children }: { children: React.ReactNode }) {
	const version = (await import("@admin/../package.json")).version;
	const { user } = await trpc.auth.getUser.query({
		// set to "empty" when null, because otherwise an ambiguous error is thrown
		id: (await getServerSession(authOptions))?.user?.id ?? "empty",
	});

	return (
		<div id="content">
			<Menu version={version} />

			<div className="max-h-screen w-full overflow-visible md:overflow-auto">
				<Header user={user} />

				<main className="p-4">{children}</main>
			</div>
		</div>
	);
}
