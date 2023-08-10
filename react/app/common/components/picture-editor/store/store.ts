import { createContext } from 'react';
import { action, makeAutoObservable } from "mobx";
import { IRGB } from 'common/colors';
import { ICoordinates, ActiveColorTypeEnum } from '../models/editor.model';
import { Layer, Viewport } from '../document';
import { ILayerStore, LayerStorage } from './layer.store';

export interface IPictureEditorStore {
	zoom: number;
	pan: ICoordinates;
	color: IRGB;
	bgcolor: IRGB;
	activeColorType: ActiveColorTypeEnum;
	viewportWidth: number;
	viewportHeight: number;
	layers: LayerStorage[];
	toolClass?: Function;
	activeLayer?: LayerStorage;
	viewport?: Viewport;
}

export class PictureEditorStorage implements IPictureEditorStore {
	zoom = 1;
	pan = { x: 0, y: 0 };
	layers = [];
	viewportHeight = 0;
	viewportWidth = 0;
	color: IRGB = { r: 255, g: 255, b: 255, a: 1 };
	bgcolor: IRGB = { r: 0, g: 0, b: 0, a: 1 };
	activeColorType = ActiveColorTypeEnum.fore;
	activeLayer = null;
	viewport = null;
	toolClass = null;

	state: any = {};

	constructor() {
		makeAutoObservable(this);
	}

	setZoom(zf: number) { // zf - zoom factor, is a multiplyer of current zoom , less than 1 is for decrease zoom, more - for increase
		let nzoom = Math.round(this.zoom * zf * 100000) / 100000;
		if (nzoom > 0.9 && nzoom < 1.2) nzoom = 1;
		this.zoom = nzoom;
	}

	addLayer(layer: ILayerStore) {
		const { layers } = this;
		const layerStorage = new LayerStorage(layer, this);
		this.layers = [...layers, layerStorage];
		return layerStorage;
	}

	setPan(pan: ICoordinates) { this.pan = pan; }

	setViewportDimensions(width: number, height: number) {
		this.viewportWidth = width;
		this.viewportHeight = height;
	}

	setActiveLayer(layerStorage: LayerStorage) {
		this.activeLayer = layerStorage;
	}

	setViewport(viewport: Viewport) {
		this.viewport = viewport;
	}

	selectTool(toolClass: Function) {
		this.toolClass = toolClass;
	}

	temporarySelectTool(toolName: string) {	}

	setColor(color: IRGB) { this.color = color; }

	setBgColor(color: IRGB) { this.bgcolor = color; }

	setActiveColorType(type: ActiveColorTypeEnum) { this.activeColorType = type; }

	/**
	 * zoomPoint: mouse cursor point (by window coordinates)
	 * zoomFactor: zoom multyplier
	*/
	@action
	setViewpoint(zoomPoint: ICoordinates, zoomFactor?: number) { // set zoom at mouse cursor point (zoomPoint)
		const { x, y } = zoomPoint;
		const { x: px, y: py} = this.pan;
		const newPan = { ...this.pan };
		Object.assign(newPan, {
			x: x  * (1 - zoomFactor) + px * zoomFactor,
			y: y * (1 - zoomFactor) + py * zoomFactor
		});
		this.setPan(newPan);
		this.setZoom(zoomFactor);
	}

	subscribe(event: string, cb: any) {

	}
}

export const storage = new PictureEditorStorage();
