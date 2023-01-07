"use client";
import { SessionProvider } from "next-auth/react";

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
