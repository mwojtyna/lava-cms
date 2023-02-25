import type { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
	title: "Lava CMS - Zaloguj się",
};

function SignIn() {
	return (
		<div className="grid h-[100vh] place-items-center">
			<SignInForm />
		</div>
	);
}

export default SignIn;
