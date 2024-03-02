import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { settingsRoutes } from "@/src/data/routes/settings";

export function generateMetadata({ params }: { params: { setting: string } }): Metadata {
	const route = settingsRoutes.find((route) => route.path.split("/").at(-1) === params.setting);
	return {
		title: `${route?.label} settings - Lava CMS`,
	};
}
export const dynamic = "force-dynamic";

export default function Setting({ params }: { params: { setting: string } }) {
	const route = settingsRoutes.find((route) => route.path.split("/").at(-1) === params.setting);
	return route?.content ?? notFound();
}
