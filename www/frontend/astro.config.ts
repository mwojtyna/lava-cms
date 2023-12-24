import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import { lavaCmsAstro } from "@lavacms/astro";

const { CMS_TOKEN } = loadEnv(import.meta.env.MODE, process.cwd(), "") as ImportMetaEnv;

export default defineConfig({
	server: {
		host: true,
	},
	integrations: [
		lavaCmsAstro({
			url: "http://localhost:8080/admin",
			token: CMS_TOKEN,
			log: import.meta.env.DEV,
			components: {
				Button: "./src/components/Button.astro",
				Random: "./src/components/Random.astro",
				Quote: "./src/components/Quote.astro",
			},
			enableFallbackComponent: true,
		}),
	],
});
