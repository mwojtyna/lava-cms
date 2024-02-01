// NOTE: Remember to restart the frontend dev server after changing this file

import type { IframeMessage } from "@lavacms/types";
import config from "virtual:lavacms-config";

function postMessage(message: IframeMessage, targetOrigin: string) {
	window.parent.postMessage(message, { targetOrigin });
}

const beforeUnloadListener = (e: BeforeUnloadEvent) => e.preventDefault();

window.addEventListener("message", (e) => {
	const configOrigin = new URL(config.url).origin;
	if (e.origin !== configOrigin) {
		console.warn(
			`Message origin (${e.origin}) doesn't match CMS origin (${configOrigin}). Ignoring message.`,
			e.data,
		);
		return;
	}

	const data = e.data as IframeMessage;
	if (data.name === "init") {
		postMessage({ name: "urlChanged", url: window.location.href }, configOrigin);

		// Prompt the user editing the page to confirm leaving the page
		window.addEventListener("beforeunload", beforeUnloadListener);
	} else if (data.name === "update") {
		// Otherwise the user will be prompted to confirm leaving the page when the page is refreshed
		window.removeEventListener("beforeunload", beforeUnloadListener);
		location.reload();
	}
});

// This is only for proper types when importing, this file gets converted to a string during build
export default "";
