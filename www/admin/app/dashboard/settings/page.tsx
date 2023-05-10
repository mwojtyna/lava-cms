import { trpc } from "@admin/src/utils/trpc";
import { SeoForm } from "./SeoForm";

export default async function Settings() {
	const initialData = await trpc.config.getConfig.query();
	return <SeoForm initialData={initialData} />;
}
