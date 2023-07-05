import { initApi } from "@lavacms/astro/dist/index";

export const cms = initApi({
	url: "http://localhost:3001/admin/api/public",
	token: import.meta.env.CMS_TOKEN,
});
