import { PictureDocument } from '../document/document';
import { Page } from '../page';

export interface IEditor {
	document: PictureDocument;
	page: Page
	color: string;
}

export interface ICoordinates {
	x: number;
	y: number;
}

export interface IPointPosition extends ICoordinates{
	color: string;
	size: number;
	hardness: number;
	roundness: number;
	rotate: number;
}

