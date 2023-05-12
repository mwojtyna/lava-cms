import { trpc } from "@admin/src/utils/trpc";

export default async function Pages() {
	const page = await trpc.pages.getTopLevelPages.query();

	return <div>{JSON.stringify(page)}</div>;
}
