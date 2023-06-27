import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });
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
