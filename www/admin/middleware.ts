import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
	// Add url to the request headers so it can be used in server components
	const headers = request.headers;
	headers.set("x-url", request.url);

	return NextResponse.next({
		request: {
			headers: headers,
		},
	});
}

export const config = {
	matcher: ["/:path*"],
};
