export interface ApiProp {
	name: string;
	type: string;
	required: boolean;
	default: string | null;
	description: string;
}

export interface ApiDataAttribute {
	name: string;
	description: string;
}

export interface ApiPart {
	name: string;
	description: string;
	props: ApiProp[];
	dataAttributes: ApiDataAttribute[];
}

export interface ComponentApi {
	component: string;
	parts: ApiPart[];
}
