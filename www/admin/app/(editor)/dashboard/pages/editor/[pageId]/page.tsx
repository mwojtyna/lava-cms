import type { Metadata } from "next";
import { PagePreview } from "./PagePreview";
import { prisma } from "@admin/prisma/client";
import { Inspector } from "./Inspector";
import { TopBar } from "./TopBar";

export async function generateMetadata({
	params,
}: {
	params: { pageId: string };
}): Promise<Metadata> {
	const page = await prisma.page.findUniqueOrThrow({ where: { id: params.pageId } });
	return {
		title: `"${page.name}" - Page editor - Lava CMS`,
	};
}

export default async function Editor({ params }: { params: { pageId: string } }) {
	const page = await prisma.page.findUniqueOrThrow({ where: { id: params.pageId } });

	return (
		<div className="flex h-full flex-col">
			<TopBar />
			<main className="grid h-full w-full flex-1 grid-cols-1 lg:grid-cols-[3fr_22.5rem]">
				<PagePreview url={"http://localhost:8080" + page.url} />
				<Inspector />
			</main>
		</div>
	);
}
