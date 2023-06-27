import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";
import { redirect } from "next/navigation";
import { trpc } from "@admin/src/utils/trpc";
import { getCurrentUser } from "@admin/src/auth";

export const metadata: Metadata = {
	title: "Lava CMS - Sign in",
};

export default async function SignIn() {
	const { reason } = await trpc.auth.setupRequired.query();
	if (reason) {
		redirect("/admin/setup");
	}
	if ((await getCurrentUser()) !== null) {
		redirect("/admin/dashboard");
	}

	return <SignInForm />;
}
