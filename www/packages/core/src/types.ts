import type { ApiClient } from "./client";

declare global {
	// eslint-disable-next-line no-var
	var client: ApiClient | undefined;
}

export interface ClientConfigBase {
	/**
	 * URL of your self-hosted CMS
	 * @example "https://lavacms.com/admin"
	 */
	url: string;
	/** Token copied from `Settings > Connection` */
	token: string;
	/** Log requests and responses to console */
	log?: boolean;
}

export type ContentType = string | number | boolean | object;

export interface Component {
	name: string;
	data: ComponentData;
}
export interface ComponentData {
	[fieldName: string]: ContentType;
}
