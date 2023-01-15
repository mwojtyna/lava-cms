import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { client } from "api/trpc";

export default withAuth(
	async (request) => {
		const url = request.nextUrl.clone();
		const firstTime = await client.firstTime.query();

		if (firstTime && url.pathname !== "/auth/signup") {
			// Redirect to sign up page if opening the dashboard for the first time
			url.pathname = "/auth/signup";
			return NextResponse.redirect(url);
		}
		if (!firstTime && url.pathname === "/auth/signup") {
			// Redirect to dashboard if already signed up
			url.pathname = "/dashboard";
			return NextResponse.redirect(url);
		}
		if (!firstTime && !request.nextauth.token && url.pathname !== "/auth/signin") {
			// Redirect to sign in page if not signed in
			url.pathname = "/auth/signin";
			return NextResponse.redirect(url);
		}
		if (!firstTime && request.nextauth.token && url.pathname === "/auth/signin") {
			// Redirect to dashboard if already signed in
			url.pathname = "/dashboard";
			return NextResponse.redirect(url);
		}

		return NextResponse.next();
	},

	// Required for the `withAuth` middleware to work
	{
		callbacks: {
			// Set to return true to always run the callback event if the user is not signed in
			authorized: () => true,
		},
	}
);

export const config = { matcher: ["/dashboard/:path*", "/auth/:path*"] };
