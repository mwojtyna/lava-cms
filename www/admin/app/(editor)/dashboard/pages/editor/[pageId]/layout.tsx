import { redirect } from "next/navigation";
import { getCurrentUser } from "@admin/src/auth";

export const dynamic = "force-dynamic";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
	if (!(await getCurrentUser())) {
		redirect("/signin");
	}

	return <>{children}</>;
}
