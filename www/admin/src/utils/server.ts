import { headers } from "next/headers";

export function getPathname() {
	return headers().get("x-url")!.split("/admin")[1]!.split("?")[0]!;
}
