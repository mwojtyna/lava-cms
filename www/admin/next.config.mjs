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
	},
	// Fix for `import type` not working
	transpilePackages: ["api"],

	async redirects() {
		return [
			{
				source: "/",
				destination: "/dashboard",
				permanent: true,
			},
		];
	},
};
export default config;
