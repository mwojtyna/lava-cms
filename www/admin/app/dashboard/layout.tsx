import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Menu from "./(components)/Menu";
import Header from "./(components)/Header";

export const metadata: Metadata = {
	title: "Lava CMS - Panel administracyjny",
};

async function Dashboard({ children }: { children: React.ReactNode }) {
	const version = (await import("@admin/../package.json")).version;
	const url = headers().get("x-url");

	return (
		<div id="content">
			<Menu version={version} />

			<div className="flex max-h-screen flex-grow flex-col gap-4 overflow-visible md:overflow-auto">
				<Header serverUrl={url} />

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

export default Dashboard;