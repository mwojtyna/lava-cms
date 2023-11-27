import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import { lavaCmsAstro } from "@lavacms/astro";

const { CMS_TOKEN } = loadEnv(import.meta.env.MODE, process.cwd(), "") as ImportMetaEnv;

// https://astro.build/config
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
				Card: "/src/components/Card.astro",
				"Parent Card": "/src/components/ParentCard.astro",
			},
			enableFallbackComponent: true,
		}),
	],
});
