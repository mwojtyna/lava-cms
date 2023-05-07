import type { Metadata } from "next";
import { NavMenu } from "./NavMenu";

export const metadata: Metadata = {
	title: "Lava CMS - Admin panel",
};

export default function Dashboard({ children }: { children: React.ReactNode }) {
	return (
		<div id="content" className="flex h-screen overflow-hidden">
			{/* <Menu version={version} />

			<div className="max-h-screen w-full overflow-visible md:overflow-auto">
				<Header user={user} />

				<main className="p-4">{children}</main>
			</div> */}

			<NavMenu />

			<main className="flex-1 overflow-auto p-6">{children}</main>
		</div>
	);
}
