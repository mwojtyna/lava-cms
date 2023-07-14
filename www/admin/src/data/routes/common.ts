export interface Route {
	label: string;
	path: string;
	icon?: React.ReactNode;
	hasChildren?: boolean;
}

export function getRoute<T extends Route>(path: string, routes: T[]): T | undefined {
	for (const route of routes) {
		if (route.path === path) {
			return route;
		}

		if (route.hasChildren && path.startsWith(route.path)) {
			return route;
		}
	}
}
