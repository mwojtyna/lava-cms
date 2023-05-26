import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { cookies, headers } from "next/headers";
import { TrpcProvider } from "@admin/src/components/providers";
import { Body } from "@admin/src/components";
import { ZustandProvider } from "@admin/src/components/providers";
import { colorThemeSchema } from "@admin/src/data/stores/dashboard";
import { Toaster, TooltipProvider } from "@admin/src/components/ui/client";
import type { CookieName } from "@admin/src/utils/cookies";
import "@admin/src/styles/globals.css";

export const metadata: Metadata = {
	icons: ["/admin/favicon.ico"],
	robots: {
		index: false,
		follow: false,
	},
};

const regularFont = Inter({
	weight: "variable",
	subsets: ["latin"],
	variable: "--font-sans",
});
const headerFont = Poppins({
	weight: "700",
	subsets: ["latin"],
	variable: "--font-heading",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const colorTheme = await colorThemeSchema
		.optional()
		.parseAsync(cookies().get("color-theme" as CookieName)?.value);

	const url = headers().get("x-url")!.split("/admin")[1]!.split("?")[0]!;

	return (
		<html lang="en-US">
			<ZustandProvider colorTheme={colorTheme} url={url}>
				<Body fonts={[regularFont, headerFont]}>
					<TooltipProvider delayDuration={400}>
						<TrpcProvider>{children}</TrpcProvider>
					</TooltipProvider>

					<Toaster />
				</Body>
			</ZustandProvider>
		</html>
	);
}
