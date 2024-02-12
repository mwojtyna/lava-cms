import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/auth";
import { PageTitle } from "@/src/components/PageTitle";
import { navMenuRoutes } from "@/src/data/routes/navMenu";
import { NavMenu } from "./NavMenu";

export const dynamic = "force-dynamic";

export default async function Dashboard({ children }: { children: React.ReactNode }) {
	if (!(await getCurrentUser())) {
		redirect("/signin");
	}

	return (
		<div
			id="content"
			className="grid h-screen grid-rows-[auto_1fr] overflow-hidden md:grid-cols-[275px_1fr]"
		>
			<NavMenu />
			<main className="flex flex-1 flex-col gap-6 overflow-auto p-4 md:gap-8 md:p-6">
				<PageTitle routes={navMenuRoutes} />
				<div className="max-w-[1280px]">{children}</div>
			</main>
		</div>
	);
}
