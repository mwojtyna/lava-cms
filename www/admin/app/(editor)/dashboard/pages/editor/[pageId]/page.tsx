import type { Metadata } from "next";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { RedirectType, redirect } from "next/navigation";
import { prisma } from "@/prisma/client";
import { ActionIcon } from "@/src/components/ui/client";
import { UserMenu } from "@/src/components/UserMenu";
import { caller } from "@/src/trpc/routes/private/_private";
import { Inspector } from "./Inspector";
import { PagePreview } from "./PagePreview";
import { ResetButton } from "./ResetButton";
import { SaveButton } from "./SaveButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
	params,
}: {
	params: { pageId: string };
}): Promise<Metadata> {
	const page = await prisma.page.findUniqueOrThrow({ where: { id: params.pageId } });
	return {
		title: `Editing "${page.name}" - Lava CMS`,
	};
}

export default async function Editor({
	params,
	searchParams,
}: {
	params: { pageId: string };
	searchParams: { path?: string };
}) {
	const page = await prisma.page.findUniqueOrThrow({ where: { id: params.pageId } });
	const { developmentUrl: baseUrl } = await caller.settings.getConnectionSettings();
	const pageUrl = page.url.slice(1);

	if (searchParams.path === undefined) {
		const search = new URLSearchParams({ path: pageUrl });
		redirect(
			`/dashboard/pages/editor/${params.pageId}?${search.toString()}`,
			RedirectType.replace,
		);
	}

	const components = await caller.pages.getPageComponents({ id: params.pageId });

	return (
		<div className="flex h-full flex-col">
			<nav className="flex w-full items-center justify-between border-b border-border p-5 py-3">
				<Link href={"/dashboard/pages"}>
					<ActionIcon variant={"outline"} aria-label="Go back to dashboard">
						<ArrowUturnLeftIcon className="w-5" />
						Return
					</ActionIcon>
				</Link>

				<div className="flex items-center gap-4">
					<UserMenu small />
					<ResetButton />
					<SaveButton pageId={params.pageId} />
				</div>
			</nav>

			<main className="grid h-full w-full flex-1 grid-cols-1 overflow-auto md:grid-cols-[3fr_22.5rem]">
				<PagePreview baseUrl={baseUrl} pageUrl={pageUrl} />
				<Inspector page={page} components={components} />
			</main>
		</div>
	);
}
