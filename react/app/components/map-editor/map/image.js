import { MapItem } from './map-item';
import { apiUrl } from '~/index';

export class Image extends MapItem {
	constructor(map, data) {
		if (data.image instanceof Object) { // for back compatibility
			data = {
				image: data.image._file,
				offset: data.image.offset,
				zoom: data.image.zoom
			}
		}
		const image = typeof(data.image) === 'string' ? data.image : data.image._file;

		super(map,
			data.offset,
			data.zoom,
			group => group.image(`${apiUrl}file/${image}`, data.width, data.height)
		);

		this.file = image;
		this.width = data.width;
		this.height = data.height;
		this.fresh();
	}

	get name() {
		if (this._name) return this._name;
		const pos = this.map.items.indexOf(this);
		const index = this.map.items.reduce((res, item, index) => {
			if (index < pos && item instanceof Image) res ++;
			return res;
		}, 1);
		return `Image ${index}`;
	}

	toJson() {
		return {
			image: this.file,
			offset: this.offset,
			width: this.width,
			height: this.height,
			zoom: this.zoom
		}
	}

	fresh() {
		super.fresh();
		this.group.attr({
			opacity: this.selected ? 1 : 0.5
		})
	}
}