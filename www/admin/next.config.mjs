// @ts-check
import "./src/env/client.mjs";
import "./src/env/server.mjs";

/** @type {import("next").NextConfig} */
const config = {
	basePath: "/admin",
	reactStrictMode: true,
	swcMinify: true,
	modularizeImports: {
		"@heroicons/react/24/outline": {
			transform: "@heroicons/react/24/outline/{{member}}",
		},
		"@heroicons/react/24/solid": {
			transform: "@heroicons/react/24/solid/{{member}}",
		},
		"@heroicons/react/20/solid": {
			transform: "@heroicons/react/20/solid/{{member}}",
		},
		"@tabler/icons-react": {
			transform: "@tabler/icons-react/dist/esm/icons/{{member}}",
		},
	},
	redirects: async () => [
		{
			source: "/",
			destination: "/dashboard",
			permanent: true,
		},
	],
};
export default config;
