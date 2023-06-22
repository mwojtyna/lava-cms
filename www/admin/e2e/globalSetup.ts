import { start } from "./mocks/trpc";
import { init } from "api/server";

export default async function globalSetup() {
	await start(await init());
}
