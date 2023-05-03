import type { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
	title: "Lava CMS - Sign in",
};

function SignIn() {
	return (
		<main className="grid h-screen place-items-center">
			<SignInForm />
		</main>
	);
}

export default SignIn;
