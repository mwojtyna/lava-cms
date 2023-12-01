import * as React from "react";
import {
	useRouter,
	useSearchParams as useNextSearchParams,
	usePathname,
	type ReadonlyURLSearchParams,
} from "next/navigation";

interface Options {
	onChanged?: (value: URLSearchParams) => void;
	removeWhenValueIsEmptyString?: boolean;
}

export function useSearchParams(options?: Options): {
	searchParams: ReadonlyURLSearchParams;
	setSearchParams: (values: Record<string, unknown>) => void;
} {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useNextSearchParams()!;

	React.useEffect(
		() => {
			options?.onChanged?.(new URLSearchParams(searchParams.toString()));
		},
		// If we include callbacks in the dependency array, it will call it infinitely
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[searchParams],
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
			function createQueryString(values: Record<string, unknown>) {
				const params = new URLSearchParams(searchParams.toString());

				for (const [key, value] of Object.entries(values)) {
					if (value !== undefined) {
						if (options?.removeWhenValueIsEmptyString && value === "") {
							params.delete(key);
						} else {
							params.set(key, value as string);
						}
					} else {
						params.delete(key);
					}
				}

				return params.toString();
			}
		},
		[pathname, router, searchParams, options],
	);

	return { searchParams, setSearchParams };
}
