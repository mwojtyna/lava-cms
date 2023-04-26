import { useLocalStorage } from "@mantine/hooks";

interface PagePreference {
	expanded: boolean;
	slugLocked: boolean;
}
const defaultValue: PagePreference = {
	expanded: true,
	slugLocked: false,
};

export function usePagePreferences(id: string) {
	const [pagePreferences, setPagePreferences] = useLocalStorage({
		key: "page-tree",
		defaultValue: {
			[id]: defaultValue,
		},
	});

	return {
		pagePreferences: pagePreferences[id] ?? defaultValue,
		setPagePreferences: (value: PagePreference) => {
			setPagePreferences({
				...pagePreferences,
				[id]: {
					...value,
				} satisfies PagePreference,
			});
		},
	};
}
