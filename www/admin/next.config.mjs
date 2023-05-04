// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
	basePath: "/admin",
	reactStrictMode: true,
	swcMinify: true,
	experimental: {
		appDir: true,
		typedRoutes: true,
	},
	// Fix for `import type` not working
	transpilePackages: ["api"],
	compress: true,

	redirects: async () => {
		return [
			{
				source: "/",
				destination: "/dashboard",
				permanent: true,
			},
		];
	},
	rewrites: async () => {
		return [
			{
				source: "/api/trpc/:path*",
				destination: "http://localhost:4000/trpc/:path*",
			},
		];
	},
};
export default config;
