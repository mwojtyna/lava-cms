import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Menu from "./(components)/Menu";
import Header from "./(components)/Header";
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
	const url = headers().get("x-url")!.split("/admin")[1]!.split("?")[0]!;

	return (
		<div id="content">
			<Menu version={version} serverUrl={url} />

			<div className="flex max-h-screen flex-grow flex-col gap-4 overflow-visible md:overflow-auto">
				<Header serverUrl={url} user={user} />

				<main>
					{React.Children.map(children, (child, i) => {
						if (child) {
							return (
								<div key={i} className="p-4">
									{child}
								</div>
							);
						}
					})}
				</main>
			</div>
		</div>
	);
}
