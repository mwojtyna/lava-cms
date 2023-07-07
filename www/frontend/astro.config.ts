import { defineConfig } from "astro/config";
import deno from "@astrojs/deno";
import { URL } from "node:url";
import { loadEnv } from "vite";
import { lavaCmsAstro } from "@lavacms/client";

const { CMS_TOKEN } = loadEnv(import.meta.env.MODE, process.cwd(), "") as ImportMetaEnv;

// https://astro.build/config
export default defineConfig({
	server: {
		host: true,
	},
	output: "server",
	adapter: deno({
		port: 3000,
	}),
	integrations: [
		lavaCmsAstro({
			url: "http://localhost:3001/admin",
			token: CMS_TOKEN,
			log: import.meta.env.DEV,
			components: {},
		}),
	],
	vite: {
		resolve: {
			alias: {
				"@frontend": new URL(".", import.meta.url).pathname,
			},
		},
	},
});
