export interface IDocumentView {
	view: HTMLCanvasElement;
	width: number;
	height: number;
};

export enum OverlayMappingEnum {
	'sourceOver' = 'normal',
	'lighter' = 'lighter color',
	'multiply' = 'multiply',
	'screen' = 'screen',
	'overlay' = 'overlay',
	'darken' = 'darken',
	'lighten' = 'lighten',
	'colorDodge' = 'color dodge',
	'colorBurn' = 'color burn',
	'hardLight' = 'hard light',
	'softLight' = 'soft light',
	'difference' = 'difference',
	'exclusion' = 'exclusion',
	'hue' = 'hue',
	'saturation' = 'saturation',
	'color' = 'color',
	'luminosity' = 'luminosity',
	'destinationOut' = 'destination out'
};

export enum OverlayMappingCodesEnum {
	'sourceOver' = 'source-over',
	'lighter' = 'lighter',
	'multiply' = 'multiply',
	'screen' = 'screen',
	'overlay' = 'overlay',
	'darken' = 'darken',
	'lighten' = 'lighten',
	'colorDodge' = 'color-dodge',
	'colorBurn' = 'color-burn',
	'hardLight' = 'hard-light',
	'softLight' = 'soft-light',
	'difference' = 'difference',
	'exclusion' = 'exclusion',
	'hue' = 'hue',
	'saturation' = 'saturation',
	'color' = 'color',
	'luminosity' = 'luminosity',
	'destinationOut' = 'destination-out'
}