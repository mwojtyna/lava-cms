import type { Metadata } from "next";
import { trpc } from "@admin/src/utils/trpc";
import Content from "./Content";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = {
	title: "Lava CMS - Setup",
};
export const revalidate = 0;

export default async function SetupLayout() {
	const { reason } = await trpc.auth.setupRequired.query();

	return (
		<main className="flex h-screen flex-col items-center">
			{/* <Content stage={reason === "no-config" ? 1 : 0} /> */}
			STEPPER
			{reason === "no-user" ? <SignUpForm /> : "configure"}
		</main>
	);
}
