declare module "virtual:lavacms-components" {
	const components: Record<string, import("astro/dist/runtime/server").AstroComponentFactory>;
	export default components;
}

declare module "virtual:lavacms-config" {
	const config: import("./integration").ClientConfigAstro;
	export default config;
}
