import { createAstroClient } from "@lavacms/client";

export const cms = createAstroClient({
	url: "http://localhost:3001/admin",
	token: import.meta.env.CMS_TOKEN,
	log: import.meta.env.DEV,
	components: {},
});
