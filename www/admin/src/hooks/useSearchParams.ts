import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams as useNextSearchParams } from "next/navigation";
import { usePathname } from "./usePathname";

interface Callbacks {
	onChanged?: (value: URLSearchParams) => void;
}

export const useSearchParams = (callbacks?: Callbacks) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useNextSearchParams()!;

	React.useEffect(
		() => {
			callbacks?.onChanged?.(new URLSearchParams(searchParams.toString()));
		},
		// If we include callbacks in the dependency array, it will call it infinitely
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[searchParams]
	);

	const setSearchParams = React.useCallback(
		(values: Record<string, unknown>) => {
			const queryString = createQueryString(values);
			// If the query string is empty, remove it from the URL
			if (queryString === "") {
				router.push(pathname);
				return;
			}
			router.push(`${pathname}?${queryString}`);

			// Get a new searchParams string by merging the current
			// searchParams with a provided key/value pair
			function createQueryString(values: Record<string, unknown | undefined>) {
				const params = new URLSearchParams(searchParams.toString());

				for (const [key, value] of Object.entries(values)) {
					if (value !== undefined) params.set(key, value as string);
					else params.delete(key);
				}

				return params.toString();
			}
		},
		[pathname, router, searchParams]
	);

	return { searchParams, setSearchParams };
};
