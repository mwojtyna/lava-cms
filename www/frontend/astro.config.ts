import { defineConfig } from "astro/config";
import deno from "@astrojs/deno";
import { URL } from "node:url";

// https://astro.build/config
export default defineConfig({
	server: {
		host: true,
	},
	output: "server",
	adapter: deno({
		port: 3000,
	}),
	vite: {
		resolve: {
			alias: {
				"@frontend": new URL(".", import.meta.url).pathname,
			},
		},
	},
});
