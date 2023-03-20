import type { Metadata } from "next";
import Content from "./(components)/Content";

export const metadata: Metadata = {
	title: "Lava CMS - Sign up",
};

export default function SignIn() {
	return (
		<main className="flex h-screen justify-center p-10">
			<Content />
		</main>
	);
}
