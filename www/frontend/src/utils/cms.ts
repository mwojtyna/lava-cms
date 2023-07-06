import { initApi } from "@lavacms/astro";

export const cms = initApi({
	url: "http://localhost:3001/admin",
	token: import.meta.env.CMS_TOKEN,
	log: import.meta.env.DEV,
});
