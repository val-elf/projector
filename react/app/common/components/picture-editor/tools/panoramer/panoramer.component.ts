import { CommonTool } from '../common-tool.component';
import template from './panoramer.template.rt';
import { ICoordinates } from '../../models/editor.model';
import { storage } from '../../store/store';

export class Panoramer extends CommonTool<{}, {}> {
	ancor: ICoordinates;

	get name() { return 'Panoramer'; }

	activate() {
		this.viewport.window.addEventListener('mousedown', this.startMove);
		this.viewport.window.addEventListener('pointerdown', this.startMove);
	}

	deactivate() {
		this.viewport.window.removeEventListener('mousedown', this.startMove);
		this.viewport.window.removeEventListener('pointerdown', this.startMove);
	}

	startMove = evt => {
		document.addEventListener('mousemove', this.move);
		document.addEventListener('pointermove', this.move);
		document.addEventListener('mouseup', this.endMove);
		document.addEventListener('pointerup', this.endMove);
		this.ancor = { x: evt.pageX, y: evt.pageY };
	}

	move = evt => {
		const { dx, dy } = { dx: evt.pageX - this.ancor.x, dy: evt.pageY - this.ancor.y };
		const { x, y } = this.viewport.pan;
		Object.assign(this.ancor, { x: evt.pageX, y: evt.pageY });
		storage.setPan({ x: x + dx, y: y + dy });
	}

	endMove = evt => {
		document.removeEventListener('mousemove', this.move);
		document.removeEventListener('mouseup', this.endMove);
		document.removeEventListener('pointermove', this.move);
		document.removeEventListener('poinerup', this.endMove);
	}

	render() {
		console.log('ACT', this.isActive);
		return template.call(this);
	}
}