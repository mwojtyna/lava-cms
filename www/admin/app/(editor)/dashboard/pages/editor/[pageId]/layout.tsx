import { notFound, redirect } from "next/navigation";
import { prisma } from "@admin/prisma/client";
import { getCurrentUser } from "@admin/src/auth";

export const dynamic = "force-dynamic";

export default async function Editor({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { pageId: string };
}) {
	if (!(await getCurrentUser())) {
		redirect("/signin");
	}
	if (!(await prisma.page.findUnique({ where: { id: params.pageId } }))) {
		notFound();
	}

	return (
		<div id="content" className="h-screen">
			{children}
		</div>
	);
}
