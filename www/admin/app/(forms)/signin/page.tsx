import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { validateRequest } from "@/src/auth";
import { caller } from "@/src/trpc/routes/private/_private";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
	title: "Sign in - Lava CMS",
};

export default async function SignIn() {
	const { reason } = await caller.auth.setupRequired();
	if (reason) {
		redirect("/setup");
	}

	const { session } = await validateRequest();
	if (session) {
		redirect("/dashboard");
	}

	return <SignInForm />;
}
