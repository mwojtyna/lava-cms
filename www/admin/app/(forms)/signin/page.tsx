import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
	title: "Lava CMS - Sign in",
};

export default function SignIn() {
	return <SignInForm />;
}
