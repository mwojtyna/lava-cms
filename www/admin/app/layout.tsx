import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ColorScheme } from "@mantine/core";
import Mantine from "./mantine";
import TrpcProvider from "./trpcProvider";
import "@admin/src/styles/globals.css";

export const metadata: Metadata = {
	icons: ["/admin/favicon.ico"],
	robots: {
		index: false,
		follow: false,
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const colorScheme: ColorScheme | undefined = cookies().get("color-scheme")
		?.value as ColorScheme;

	return (
		<html lang="en-US">
			<body>
				<TrpcProvider>
					<Mantine colorScheme={colorScheme}>{children}</Mantine>
				</TrpcProvider>
			</body>
		</html>
	);
}
