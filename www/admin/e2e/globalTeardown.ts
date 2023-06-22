import { stop } from "./mocks/trpc";

export default async function globalTeardown() {
	await stop();
}
