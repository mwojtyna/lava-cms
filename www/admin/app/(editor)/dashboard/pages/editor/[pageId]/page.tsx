import type { Metadata } from "next";
import Link from "next/link";
import { PagePreview } from "./PagePreview";
import { prisma } from "@admin/prisma/client";
import { Inspector } from "./Inspector";
import { UserMenu } from "@admin/src/components/UserMenu";
import { ActionIcon, Button } from "@admin/src/components/ui/client";
import { ArrowDownTrayIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { caller } from "@admin/src/trpc/routes/private/_private";
import { RedirectType, redirect } from "next/navigation";

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
		redirect(
			`/dashboard/pages/editor/${params.pageId}?path=${encodeURIComponent(pageUrl)}`,
			RedirectType.replace,
		);
	}

	const components = await caller.pages.getPageComponents({ id: params.pageId });

	return (
		<div className="flex h-full flex-col">
			<nav className="relative flex w-full items-center justify-between border-b border-border p-5 py-3">
				<Link href={"/dashboard/pages"}>
					<ActionIcon variant={"outline"} aria-label="Go back to dashboard">
						<ArrowUturnLeftIcon className="w-5" />
						Return
					</ActionIcon>
				</Link>

				<UserMenu className="absolute left-1/2 -translate-x-1/2" responsive />

				<div className="flex gap-4">
					<Button
						className="flex-row-reverse"
						icon={<ArrowDownTrayIcon className="w-5" />}
						// disabled={!dirty}
					>
						Save
					</Button>
				</div>
			</nav>

			<main className="grid h-full w-full flex-1 grid-cols-1 lg:grid-cols-[3fr_22.5rem]">
				<PagePreview baseUrl={baseUrl} pageUrl={pageUrl} />
				<Inspector page={page} components={components} />
			</main>
		</div>
	);
}
