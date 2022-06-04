import { Component } from 'react';
import { CommonTool, CommonToolState } from '../common-tool.component';
import template from './picker.template.rt';

export class Picker<T extends { onChange?: Function }> extends CommonTool<T, CommonToolState> {

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
        const { color } = props;
        if (newState.color !== color) newState.color = color;
        return newState;
    }

	state = {};
	boundary: DOMRect;

	get canvas() { return this.viewport.canvas; }
	get ctx() { return this.viewport.ctx; }
	get name() { return 'Picker'; }

    movePointer = evt => {
		this.pickColor(evt);
	}

	fixPointer = evt => {
		this.canvas.addEventListener('pointermove', this.movePointer);
		this.canvas.addEventListener('pointerup', this.releasePointer);
	}

	releasePointer = evt => {
		this.canvas.removeEventListener('pointermove', this.movePointer);
		this.canvas.removeEventListener('pointerup', this.releasePointer);
	}

    pickColor = evt => {
		// if (this.paused) return;
        this.boundary = this.canvas.getBoundingClientRect() as DOMRect;
        const { x: ax, y: ay } = this.boundary;
        const { x, y } = { x: evt.pageX - ax, y: evt.pageY - ay };
        let cd = this.ctx.getImageData(x, y, 1, 1);
		const rgba = { r: cd.data[0], g: cd.data[1], b: cd.data[2], a: cd.data[3] };
		if (rgba.a === 0) return;
        if (this.props.onChange) this.props.onChange(rgba);
    }

    activate() {
		this.canvas.addEventListener('pointerdown', this.fixPointer);
		this.canvas.addEventListener('click', this.pickColor);
    }

    deactivate() {
		this.canvas.removeEventListener('pointermove', this.movePointer);
		this.canvas.removeEventListener('pointerdown', this.fixPointer);
		this.canvas.removeEventListener('click', this.pickColor);
    }

    render() {
        return template.call(this);
    }
}