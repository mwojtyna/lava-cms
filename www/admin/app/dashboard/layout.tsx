import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@admin/src/pages/api/auth/[...nextauth]";
import { trpc } from "@admin/src/utils/trpc";
import { NavMenu } from "./NavMenu";

export const metadata: Metadata = {
	title: "Lava CMS - Admin panel",
};

export default async function Dashboard({ children }: { children: React.ReactNode }) {
	const { user } = await trpc.auth.getUser.query({
		// set to "empty" when null, because otherwise an ambiguous error is thrown
		id: (await getServerSession(authOptions))?.user?.id ?? "empty",
	});

	return (
		<div id="content" className="flex h-screen overflow-hidden">
			{/* <Menu version={version} />

			<div className="max-h-screen w-full overflow-visible md:overflow-auto">
				<Header user={user} />

				<main className="p-4">{children}</main>
			</div> */}

			{/* @ts-expect-error Async Server Component */}
			<NavMenu />

			<main className="flex-1 overflow-auto p-6">{children}</main>
		</div>
	);
}
