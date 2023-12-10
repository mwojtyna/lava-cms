import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@admin/src/auth";
import { caller } from "@admin/src/trpc/routes/private/_private";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
	title: "Sign in - Lava CMS",
};

export default async function SignIn() {
	const { reason } = await caller.auth.setupRequired();

	if (reason) {
		redirect("/setup");
	}
	if (await getCurrentUser()) {
		redirect("/dashboard");
	}

	return <SignInForm />;
}
