import type { IframeMessage } from "@lavacms/types";
import config from "virtual:lavacms-config";

window.addEventListener("message", (e) => {
	const configOrigin = new URL(config.url).origin;
	if (e.origin !== configOrigin) {
		console.warn(`Message origin (${e.origin}) doesn't match CMS origin (${configOrigin})`);
		return;
	}

	const data = e.data as IframeMessage;
	if (data.name === "init") {
		const all = document.querySelectorAll("*, *::before, *::after");
		all.forEach((el) => {
			el.addEventListener("click", (e) => {
				e.preventDefault();
			});
		});
	} else if (data.name === "update") {
		location.reload();
	}
});

// This is only for proper types when importing, this file gets converted to a string during build
export default "";
