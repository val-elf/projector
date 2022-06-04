import { IRGB } from 'common/colors';
import { PictureDocument } from '../document/document';
import { Page } from '../page';

export interface IEditor {
	document: PictureDocument;
	page: Page;
}

export interface ICoordinates {
	x: number;
	y: number;
}

export interface IPointPosition extends ICoordinates{
	color: IRGB;
	size: number;
	hardness: number;
	roundness: number;
	rotate: number;
}

export interface IPictureEditorState {
	zoom: number;
	pan: ICoordinates;
}

export enum ActiveColorTypeEnum {
	fore,
	back
};
