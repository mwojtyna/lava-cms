export interface CmsPage {
	name: string;
	components: CmsComponent[];
}
export interface CmsComponent {
	name: string;
	fields: Record<string, FieldContent>;
}
export type FieldContent = string | number | boolean | object | FieldContent[] | null;
