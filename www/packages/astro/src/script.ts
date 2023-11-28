import config from "virtual:lavacms-config";

window.addEventListener("message", (e) => {
	const origin = new URL(config.url).origin;
	if (e.origin == origin) {
		console.log(config);
	}
});

// This is only for proper types when importing, this file gets converted to a string during build
export default "";
