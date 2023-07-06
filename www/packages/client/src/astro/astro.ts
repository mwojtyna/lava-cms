import { LavaApiClientBase, type ClientConfigBase } from "../base";

interface ClientConfigAstro extends ClientConfigBase {
	/** Docs */
	components: Record<string, string>;
}

class LavaApiClientAstro extends LavaApiClientBase {
	private readonly components;

	constructor(config: ClientConfigAstro) {
		super(config);
		this.components = config.components;
	}

	public async getPage(url: string) {
		const page = await this.connection.getPage.query({ url });
		if (!page) {
			return null;
		}

		// TODO: Get from CMS
		const components = [
			{
				name: "Card",
				props: { title: "Admin", body: "Manage your site", href: "/admin" },
			},
		];
		console.log(this.components);

		return { page, components };
	}
}

export const createAstroClient = (config: ClientConfigAstro) => new LavaApiClientAstro(config);
