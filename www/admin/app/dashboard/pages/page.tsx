import type { Metadata } from "next";
import PageTree from "./(components)/PageTree";
import { trpc } from "@admin/src/utils/trpc";

export const metadata: Metadata = {
	title: "Lava CMS - Website pages",
};
export const revalidate = 0;

export default async function Pages() {
	const pages = await trpc.pages.getPages.query();

	return <PageTree initialData={pages} />;
}
