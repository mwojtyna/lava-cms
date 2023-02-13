import React from "react";
import RootStyleRegistry from "./emotion";
import TrpcProvider from "./trpcProvider";
import "@admin/src/styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html>
			<head />
			<body>
				<TrpcProvider>
					<RootStyleRegistry>{children}</RootStyleRegistry>
				</TrpcProvider>
			</body>
		</html>
	);
}
