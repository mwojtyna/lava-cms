import { notFound, redirect } from "next/navigation";
import { prisma } from "@/prisma/client";
import { validateRequest } from "@/src/auth";

export const dynamic = "force-dynamic";

export default async function Editor({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { pageId: string };
}) {
	const { session } = await validateRequest();
	if (!session) {
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
