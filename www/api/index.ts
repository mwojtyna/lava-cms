import { App, init, PORT } from "./server";

let server: ReturnType<App["listen"]>;

// Don't export!
async function start() {
	const app = await init();
	server = app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
}
start();
