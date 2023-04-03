import type { Metadata } from "next";
import PageList from "./(components)/PageList";

export const metadata: Metadata = {
	title: "Lava CMS - Website pages",
};

export default function Pages() {
	return <PageList />;
}
