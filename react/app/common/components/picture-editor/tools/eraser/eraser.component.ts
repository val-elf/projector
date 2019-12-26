import { Brush } from '../brush/brush.component';
import { EraserOptions } from '../options/eraser-options.component';
import template from './eraser.template.rt';

export class Eraser extends Brush {
	composite = 'destination-out';
	isEraser = true;

	get color() { return "#FFFFFF"; }

	finishDraw() {
		const { temporary } = this.state as any;
		if (temporary) this.context.editor.deactivateTemporary();
	}

	temporaryActivate(evt) {
		super.temporaryActivate(evt);
		this.startDraw(evt);
	}

	getOptionsControl() {
		return EraserOptions;
	}

	render() {
		return template.call(this);
	}


}