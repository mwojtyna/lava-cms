import type { Metadata } from "next";
import App from "./(components)/App";

export const metadata: Metadata = {
	title: "Lava CMS - Panel administracyjny",
};

export default function Dashboard() {
	return <App />;
}
