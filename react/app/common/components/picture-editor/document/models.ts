export interface ILayerData {
	composite?: GlobalCompositeOperation;
	opacity?: number;
	offsetX?: number;
	offsetY?: number;
	active?: boolean;
	width?: number;
	height?: number;
	isVisible?: boolean;
	img?: string;
	source?: ImageData;
	working?: boolean;
	name: string;
	id: string;
}