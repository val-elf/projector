import { Brush } from '../brush/brush.component';
import { EraserOptions } from '../options/eraser-options.component';
import template from './eraser.template.rt';
import { OverlayMappingEnum } from 'controls/picture-editor/document';

export class Eraser extends Brush {
	composite = OverlayMappingEnum.destinationOut;
	isEraser = true;

	get name() { return Eraser; }

	finishDraw() {
		const { temporary } = this.state as any;
		if (temporary) this.context.editor.deactivateTemporary();
	}

	temporaryActivate(evt) {
		// super.temporaryActivate(evt);
		this.startDraw(evt);
	}

	getOptionsControl() {
		return EraserOptions;
	}

	render() {
		return template.call(this);
	}


}