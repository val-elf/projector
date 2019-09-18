import { DefaultTool } from './default-tool';
import { Map, Shape, BoundaryCorner } from '../map';
import utils from '../map/2d-utils';
import template from './pan-tool.template';

export class PanTool extends DefaultTool {

	activate() {
		this.editor.boundary.show();
	}

	distance(pos) {
		return Math.sqrt((pos.x * pos.x) + (pos.y * pos.y));
	}

	selectTool(byButton) {
		super.selectTool();
		if (byButton) {
			const { selected } = this.editor.map;
			const shape = selected.length === 1 ? selected[0] : null;
			if (shape && shape instanceof Shape && !shape.closed) {
				shape.close();
				this.map.lockSelection = false;
			}
		}
	}

	processKey(items, keyCode) {
		const { selected } = this.map;
		switch(keyCode) {
			case 'Delete':
				this.map.deleteSelected();
				break;
			case 'Numpad9':
			case 'PageUp':
				selected.forEach(item => item.goUp());
				break;
			case 'Numpad3':
			case 'PageDown':
				selected.forEach(item => item.goDown());
				break;
		}
	}

	processClick(items, point, event) {
		if (!items.length) return;

		const { item } = items.shift();
		if (item !== this.map) {
			this.editor.map.selectItem(item, undefined, event.shiftKey);
		} else if (item === this.map && this.map.selected.length) this.map.clearSelected();
	}

	processDrag(items, deltas, shifts, ancors, event) {
		if (!deltas || !deltas.length) return;
		const shift = event.shiftKey;
		const ctrl = event.ctrlKey;
		const host = this.editor.mapHost;
		let item = items.shift();
		let subject = item.item;
		const isBoundary = subject instanceof BoundaryCorner;

		if (deltas.length === 1) { // move position
			const delta = deltas.shift();
			if (!isBoundary) {
				const { selected } = this.map;
				if (subject !== host && selected.some(item => item === subject)) {
					selected.forEach(item => item.setOffsetDelta(delta, ctrl, shift));
				} else {
					host.setOffsetDelta(delta, ctrl, shift);
				}
				host.getMap('boundary').fresh();
			} else
				subject.setOffsetDelta(delta, ctrl, shift);
		} else if (deltas.length === 2) { // zoom object
			const points = ancors.map((ancor, index) => ({
				x: ancor.ox + shifts[index].x,
				y: ancor.oy + shifts[index].y
			}));
			const point = {
				x: (points[0].x + points[1].x) / 2,
				y: (points[0].y + points[1].y) / 2,
				deltaX: (deltas[0].x + deltas[1].x) / 2,
				deltaY: (deltas[0].y + deltas[1].y) / 2
			}
			const distance = utils.getDistance(points[0], points[1]);
			const pdistance = utils.getDistance({
				x: points[0].x - deltas[0].x,
				y: points[0].y - deltas[0].y
			}, {
				x: points[1].x - deltas[1].x,
				y: points[1].y - deltas[1].y
			});

			const zoomFactor = distance / pdistance;
			this.map.moveZoom(point, zoomFactor, event.ctrlKey);
		}
	}

	render() {
		return template.call(this);
	}
}