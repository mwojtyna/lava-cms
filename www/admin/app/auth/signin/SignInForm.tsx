"use client";

import { Button } from "@mantine/core";
import { signIn } from "next-auth/react";

function SignInForm() {
	return (
		<Button
			onClick={() =>
				signIn("credentials", {
					callbackUrl: "/admin/dashboard",
				})
			}
		>
			Zaloguj się
		</Button>
	);
}

export default SignInForm;
