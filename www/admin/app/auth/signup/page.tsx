import type { Metadata } from "next";
import { trpc } from "@admin/src/utils/trpc";
import Content from "./_components/Content";

export const metadata: Metadata = {
	title: "Lava CMS - Sign up",
};
export const revalidate = 0;

export default async function SignIn() {
	const { reason } = await trpc.auth.setupRequired.query();

	return (
		<main className="flex h-screen justify-center p-10">
			<Content stage={reason === "no-config" ? 1 : 0} />
		</main>
	);
}
