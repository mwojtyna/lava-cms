import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { trpc } from "@admin/src/utils/trpc";

export default withAuth(
	async (request) => {
		const url = request.nextUrl.clone();
		const { reason } = await trpc.auth.setupRequired.query();

		if (reason) {
			if (url.pathname !== "/setup") {
				// Redirect to sign up page if opening the dashboard for the first time
				url.pathname = "/setup";
				return NextResponse.redirect(url);
			}
		} else {
			if (url.pathname === "/setup") {
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

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
