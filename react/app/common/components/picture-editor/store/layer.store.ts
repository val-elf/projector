import { Storage, mutator } from '~/services/state-management/state.manager';
import { Layer } from '../document/layer';
import { OverlayMappingEnum } from '../document/models';
import { ICoordinates } from '../models/editor.model';
import { PictureEditorStorage } from './store';

export interface ILayerStore {
	composite?: OverlayMappingEnum;
	opacity?: number;
	offset?: ICoordinates;
	active?: boolean;
	width?: number;
	height?: number;
	isVisible?: boolean;
	img?: string;
	source?: ImageData;
	name: string;
	id: string;
}

export class LayerStorage extends Storage<ILayerStore> {
	constructor(initial: ILayerStore, private owner: PictureEditorStorage) {
		super(initial);
	}

	@mutator()
	setComposite(value: OverlayMappingEnum) { this.$state.composite = value; }

	@mutator()
	setOpacity(value: number) { this.$state.opacity = value; }

	@mutator()
	setOffset(pos: ICoordinates) { this.$state.offset = { ...pos }; }

	@mutator()
	addOffset(delta: ICoordinates) {
		const { offset } = this.$state;
		this.$state.offset = {
			x: offset.x + delta.x,
			y: offset.y + delta.y
		};
	}

	@mutator()
	setActive(active: boolean) {
		this.$state.active = active;
		this.owner.setActiveLayer(this);
	}

	@mutator()
	setWidth(width: number) { this.$state.width = width; }

	@mutator()
	setHeight(height: number) { this.$state.height = height; }

	@mutator()
	setDimensions(width: number, height: number) {
		this.$state.width = width;
		this.$state.height = height;
	}

	@mutator()
	setVisible(value: boolean) { this.$state.isVisible = value; }

	@mutator()
	setImage(image: string) { this.$state.img = image; }

	@mutator()
	setSource(data: ImageData) { this.$state.source = data; }

	@mutator()
	setName(name: string) { this.$state.name = name; }

	@mutator()
	setId(id: string) { this.$state.id = id; }

	@mutator()
	putImageData(imageData: ImageData) {}

	@mutator()
	update() { }

	@mutator()
	apply() { }
}

