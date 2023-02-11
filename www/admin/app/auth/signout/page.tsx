"use client";

import { Button } from "@mantine/core";
import { signOut } from "next-auth/react";

function SignIn() {
	return (
		<div className="flex h-[100vh] items-center justify-center">
			<Button onClick={() => signOut({ callbackUrl: "/admin/dashboard" })}>
				Wyloguj się
			</Button>
		</div>
	);
}

export default SignIn;
