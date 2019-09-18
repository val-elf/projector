import { DefaultTool } from './default-tool.js';
import { Shape, ControlPoint } from '../map';
import utils from '../map/2d-utils';
import template from './pen-tool.template';

export class PenTool extends DefaultTool {

	setPointHolder = (point, event) => this.setPoint(point, event);
	drawHolder = (delta, position, ancor, event) => this.draw(delta, position, ancor, event);
	checkPointHolder = event => this.checkNearestShapes(event);
	counter = null;

	activate() {
		this.editor.boundary.hide();
		this.editor.on('mousemove', this.checkPointHolder);
		this.map.selected.forEach(item => item instanceof Shape && item.showControls());
		if (this.currentShape && this.currentShape.closed)
			this.currentShape = null;
	}

	deactivate() {
		this.editor.off('mousemove', this.checkPointHolder);
		this.map.selected.forEach(item => item instanceof Shape && item.hideControls());
	}

	get editMode() {
		return this.currentShape && !this.currentShape.closed && !!this.currentShape.selected;
	}

	processClick(items, point) {
		const { item } = items.shift();

		if (!item) return;
		if (item.type === 'wandering') {
			item.owner.addPointAt(item.segment.point, item.segment.rind);
			return;
		} else if (item instanceof ControlPoint &&
			this.currentShape &&
			item === this.currentShape.firstPoint)
		{
			this.currentShape.close();
			this.map.lockSelection = false;
			this.currentShape = null;
			return;
		} else if (item instanceof Shape && item.selected && !this.currentShape) {
			return;
		} else if (item instanceof Shape && !this.currentShape) {
			item.select();
			item.showControls();
			return;
		}
		this.drawPoint(items, point);
	}

	drawPoint(items, point) {
		if (!this.currentShape) {
			this.currentShape = this.map.createShape();
			this.map.lockSelection = true;
			this.map.selectItem(this.currentShape);
			this.currentShape.showControls();
		}
		this.currentShape.addPoint(point);
	}

	drawLine(items, deltas, positions, ancors, event) {
		const { item } = items.shift();
		const delta = deltas.shift();
		const position = positions[0];
		const ancor = ancors[0];

		if (item && item instanceof ControlPoint) {
			item.setOffsetDelta(delta);
			return;
		}
		if (event.type === 'mouseup') {
			this.counter = null;
			return;
		}

		const point = { x: position.x + ancor.ox, y: position.y + ancor.oy };
		const dist = this.counter ? utils.getDistance(this.counter, point) : 10;

		if (dist >= 10) {
			this.counter = point;
			this.drawPoint(items, point);
		}
	}

	zoomAndOffset(items, deltas, positions, ancors, event) {

	}

	getPropertiesComponent() { return null; }

	processKey(items, keyCode) {
		switch(keyCode) {
			case 'Delete':
				if (this.currentShape && !this.currentShape.closed) {
					if (this.currentShape.points.length > 1)
						this.currentShape.removePoint();
					else {
						this.currentShape.delete();
						this.currentShape = null;
						this.map.lockSelection = false;
					}
				}
				break;
		}
	}

	processDrag(items, deltas, positions, ancors, event) {
		if (deltas.length === 1) {
			this.drawLine(items, deltas, positions, ancors, event);
		} else if (deltas.length === 2) {
			this.zoomAndOffset(items,deltas, positions, ancors, event);
		}

	}

	checkNearestShapes(event) {
		const { selected } = this.map;
		selected.forEach(item => {
			if (item && item instanceof Shape) {
				const point = { x: event.offsetX, y: event.offsetY };
				item.detectNearestPoint(point, 10);
			}
		})
	}

	render() {
		return template.call(this);
	}

}