import { notFound } from "next/navigation";
import { settingsRoutes } from "@admin/src/data/routes/settings";

export const dynamic = "force-dynamic";

export default function Setting({ params }: { params: { setting: string } }) {
	const route = settingsRoutes.find((route) => route.path === params.setting);
	return route?.content ?? notFound();
}
