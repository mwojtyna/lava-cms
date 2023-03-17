import type { Metadata } from "next";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
	title: "Lava CMS - Sign up",
};

function SignIn() {
	return (
		<main className="grid h-[100svh] place-items-center">
			<SignUpForm />
		</main>
	);
}

export default SignIn;
