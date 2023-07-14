declare module "virtual:lavacms-components" {
	const components: Record<string, import("astro/dist/runtime/server").AstroComponentFactory>;
	export = components;
}

declare module "virtual:lavacms-config" {
	const config: import("./adapter").ClientConfigAstro;
	export = config;
}
