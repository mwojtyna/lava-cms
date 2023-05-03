import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { trpc } from "@admin/src/utils/trpc";

export default withAuth(
	async (request) => {
		const url = request.nextUrl.clone();
		const { setupRequired } = await trpc.auth.setupRequired.query();

		if (!url.pathname.startsWith("/api/trpc")) {
			if (setupRequired) {
				if (url.pathname !== "/signup") {
					// Redirect to sign up page if opening the dashboard for the first time
					url.pathname = "/signup";
					return NextResponse.redirect(url);
				}
			} else {
				if (url.pathname === "/signup") {
					// Redirect to dashboard if already signed up
					url.pathname = "/dashboard";
					return NextResponse.redirect(url);
				}
				if (!request.nextauth.token && url.pathname !== "/signin") {
					// Redirect to sign in page if not signed in
					url.pathname = "/signin";
					return NextResponse.redirect(url);
				}
				if (request.nextauth.token && url.pathname === "/signin") {
					// Redirect to dashboard if already signed in
					url.pathname = "/dashboard";
					return NextResponse.redirect(url);
				}
			}
		} else {
			// Return 401 if not signed in, there is a user in the db
			// and trying to access the api
			if (!request.nextauth.token && !setupRequired) {
				return new NextResponse("Unauthorized", { status: 401 });
			}
		}

		// Add the url to the request headers
		// so it can be used in server components
		const headers = new Headers(request.headers);
		headers.set("x-url", request.url);

		return NextResponse.next({
			request: {
				headers: headers,
			},
		});
	},

	// Required for the `withAuth` middleware to work
	{
		callbacks: {
			// Set to return true to always run the callback event if the user is not signed in
			authorized: () => true,
		},
	}
);

export const config = { matcher: ["/:path*"] };
