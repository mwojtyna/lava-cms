import type { Metadata } from "next";
import { SeoTab } from "./tabs/SeoTab";

export const metadata: Metadata = {
	title: "SEO settings - Lava CMS",
};

export default function Settings() {
	return <SeoTab />;
}
