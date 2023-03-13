import type React from "react";
import type { Metadata } from "next";
import RootStyleRegistry from "./emotion";
import TrpcProvider from "./trpcProvider";
import "@admin/src/styles/globals.css";

export const metadata: Metadata = {
	icons: ["/admin/favicon.ico"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html>
			<body>
				<TrpcProvider>
					<RootStyleRegistry>{children}</RootStyleRegistry>
				</TrpcProvider>
			</body>
		</html>
	);
}
