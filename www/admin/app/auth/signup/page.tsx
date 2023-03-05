import type { Metadata } from "next";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
	title: "Lava CMS - Zarejestruj się",
};

function SignIn() {
	return (
		<div className="grid h-[100vh] place-items-center">
			<SignUpForm />
		</div>
	);
}

export default SignIn;
