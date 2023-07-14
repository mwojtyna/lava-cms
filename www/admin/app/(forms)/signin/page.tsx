import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";
import { redirect } from "next/navigation";
import { caller } from "@admin/src/trpc/routes/private/_private";
import { getCurrentUser } from "@admin/src/auth";

export const metadata: Metadata = {
	title: "Lava CMS - Sign in",
};

export default async function SignIn() {
	const { reason } = await caller.auth.setupRequired();

	if (reason) {
		redirect("/admin/setup");
	}
	if (await getCurrentUser()) {
		redirect("/admin/dashboard");
	}

	return <SignInForm />;
}
