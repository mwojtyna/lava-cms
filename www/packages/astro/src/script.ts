import type { IframeMessage } from "@lavacms/types";
import config from "virtual:lavacms-config";

window.addEventListener("message", (e) => {
	const configOrigin = new URL(config.url).origin;
	if (e.origin !== configOrigin) {
		console.warn(`Message origin (${e.origin}) doesn't match CMS origin (${configOrigin})`);
		return;
	}

	switch ((e.data as IframeMessage).name) {
		case "init": {
			const all = document.querySelectorAll("*, *::before, *::after");
			all.forEach((el) => {
				el.addEventListener("click", (e) => {
					e.preventDefault();
				});
			});
		}
	}
});

// This is only for proper types when importing, this file gets converted to a string during build
export default "";
