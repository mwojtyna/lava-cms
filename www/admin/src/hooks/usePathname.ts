import { usePathname as useNextPathname } from "next/navigation";

export function usePathname() {
	const serverUrl = useNextPathname()!;
	const clientUrl = useNextPathname()!.split("/admin")[1]!;

	return typeof window === "undefined" ? serverUrl : clientUrl;
}
