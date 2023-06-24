import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		reporters: process.env.CI ? ["default", "html"] : ["default"],
		dir: "./src",
	},
	resolve: {
		alias: {
			"@admin": ".",
		},
	},
});
