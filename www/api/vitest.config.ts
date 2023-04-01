import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		reporters: process.env.CI ? ["default", "html"] : ["default"],
		dir: ".",
	},
	resolve: {
		alias: {
			"@api": ".",
		},
	},
});
