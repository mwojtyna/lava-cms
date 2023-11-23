import type { Metadata } from "next";
import Link from "next/link";
import { PagePreview } from "./PagePreview";
import { prisma } from "@admin/prisma/client";
import { Inspector } from "./Inspector";
import { UserMenu } from "@admin/src/components/UserMenu";
import { ActionIcon } from "@admin/src/components/ui/client";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

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
			<nav className="flex w-full items-center justify-between border-b border-border p-5 py-3">
				<Link href={"/dashboard/pages"}>
					<ActionIcon variant={"outline"} aria-label="Go back to dashboard">
						<ArrowUturnLeftIcon className="w-5" />
						Pages
					</ActionIcon>
				</Link>

				<UserMenu />
			</nav>

			<main className="grid h-full w-full flex-1 grid-cols-1 lg:grid-cols-[3fr_22.5rem]">
				<PagePreview url={"http://localhost:8080" + page.url} />
				<Inspector />
			</main>
		</div>
	);
}
