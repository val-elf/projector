import { Component } from 'react';
import { object } from 'prop-types';
import './common-tool.component.less';
import { PictureDocument } from '../document/document';
import { IEditor } from '../models/editor.model';
import { storage } from '../store/store';
import { observer } from '~/services/state-management';

export interface CommonToolState {
	active?: boolean | undefined
}

export abstract class CommonTool<P, S extends CommonToolState> extends Component<P, S> {

    static contextTypes = {
        editor: object.isRequired
    }

	get isActive() { return storage.state.toolClass === this.constructor; }
	get activeLayer() { return storage.state.activeLayer; }
	get layerState() { return storage.state.activeLayer; }
	get viewport() { return storage.state.viewport; }

    getOptionsControl() { return null; }

	abstract activate();
	abstract deactivate();

	stash() {

	}


	getCursor() {}
	refreshCursor() {}

    setActive() {
		storage.selectTool(this.constructor);
		// this.page.focus(); - todo: subscribe by page on tool selection
		this.activate();
		this.setState({});
    }

    release() {
        this.deactivate();
    }
}
