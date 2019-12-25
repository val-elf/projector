import { CommonTool } from '../common-tool.component';
import { clearSelection } from '~/common/utils';

export class Move extends CommonTool {

	activate() {
		this.viewport.window.addEventListener('mousedown', this.startMove);
		this.page.addEventListener('keydown', this.keyCheck);
		super.activate();
	}

	deactivate() {
		this.viewport.window.removeEventListener('mousedown', this.startMove);
		this.page.removeEventListener('keydown', this.keyCheck);
		super.deactivate();
	}

	startMove = evt => {
		document.addEventListener('mousemove', this.move);
		document.addEventListener('mouseup', this.endMove);
		this.ancor = { x: evt.pageX, y: evt.pageY };
	}

	keyCheck = evt => {
		const shift = evt.shiftKey ? 10 : 1;
		switch(evt.code) {
			case 'ArrowUp':
			case 'Numpad8':
				this.addOffset(0, -shift);
			break;
			case 'ArrowDown':
			case 'Numpad2':
				this.addOffset(0, shift);
			break;
			case 'ArrowLeft':
			case 'Numpad4':
				this.addOffset(-shift, 0);
			break;
			case 'ArrowRight':
			case 'Numpad6':
				this.addOffset(shift, 0);
			break;
		}
	}

	addOffset(dx, dy) {
		if (this.activeLayer && (dx !== 0 || dy !== 0)) {
			this.activeLayer.addOffset({ dx, dy });
			this.page.redraw();
		}
	}

	move = evt => {
		clearSelection();
		if (this.activeLayer) {
			const { pageX, pageY } = evt;
			const { zoom } = this.viewport;
			const { dx, dy } = {
				dx: Math.round((pageX - this.ancor.x) / zoom),
				dy: Math.round((pageY - this.ancor.y) / zoom)
			};
			this.addOffset(dx, dy);
			if (dx !== 0) this.ancor.x = pageX;
			if (dy !== 0) this.ancor.y = pageY;
		}
	}

	endMove = evt => {
		document.removeEventListener('mousemove', this.move);
		document.removeEventListener('mouseup', this.endMove);
	}

	render() {
		return null;
	}
}