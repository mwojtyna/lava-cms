import { notFound } from "next/navigation";
import { routes } from "@admin/src/data/routes/settings";

export const dynamic = "force-dynamic";

export default async function Setting({ params }: { params: { setting: string } }) {
	const route = routes.find((route) => route.slug === params.setting);
	return route?.content ?? notFound();
}
