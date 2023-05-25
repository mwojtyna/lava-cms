import { useLocalStorage } from "@mantine/hooks";

export const usePagePreferences = (pageId: string) => {
	const [slugLocked, setSlugLocked] = useLocalStorage<Record<string, boolean | undefined>>({
		key: "slug-locked",
		defaultValue: {
			[pageId]: false,
		},
	});

	return [slugLocked, setSlugLocked] as const;
};
