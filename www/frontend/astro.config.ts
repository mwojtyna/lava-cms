import { defineConfig } from "astro/config";

import deno from "@astrojs/deno";

// https://astro.build/config
export default defineConfig({
	server: {
		host: true,
	},
	output: "server",
	adapter: deno({
		port: 3000,
	}),
});
