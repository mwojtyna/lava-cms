"use client";

import { SessionProvider } from "next-auth/react";
import "@/src/styles/globals.css";

function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider
			basePath="/admin/api/auth"
			refetchOnWindowFocus={false}
		>
			{children}
		</SessionProvider>
	);
}

export default AuthLayout;
