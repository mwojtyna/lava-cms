import { usePathname } from "next/navigation";
import { useServerUrlStore } from "../data/stores/dashboard";

/**
 * Returns the url (after /admin, eg. /dashboard/one/two) passed down from a
 * server component while waiting for the client to load.
 * Once the client loads, it returns the url from the client.
 */
export function useUrl() {
	const { url: serverUrl } = useServerUrlStore();
	const clientUrl = usePathname()!.split("/admin")[1]!;

	return clientUrl ?? serverUrl;
}
