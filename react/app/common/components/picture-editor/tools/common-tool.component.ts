import * as React from 'react';
import * as PropTypes from 'prop-types';
import { EventEmitter } from '../document/event-emitter';
import './common-tool.component.less';
import { IEditor } from '../models/editor.model';

class EventComponent<P = {}, S = {}> extends React.Component<P, S> {
	_callbacks = {};
	on(event, cb) {
		let procs = this._callbacks[event];
		if (!procs) {
			procs = [];
			this._callbacks[event] = procs;
		}
		if (!procs.includes(cb)) procs.push(cb);
	}

	off(event, cb) {
		let procs = this._callbacks[event];
		if (procs && procs.includes(cb)) {
			const ind = procs.indexOf(cb);
			procs.splice(ind, 1);
		}
	}

	trigger(event, ...args) {
		let procs = this._callbacks[event] || [];
		procs.forEach(cb => cb(...args));
	}
}

export interface CommonToolState {
	active?: boolean | undefined;
	temporary?: boolean | undefined;
}

export class CommonTool<P, S extends CommonToolState>
			extends EventComponent<P, S> {
    static contextTypes = {
        editor: PropTypes.object.isRequired
    }

    state: S = {
		active: false,
		temporary: false
	} as S;

	paused = false;
	locked: boolean;
	context: any;

	get editor(): IEditor { return this.context.editor; }
	get page() { return this.editor.page; }
	get viewport() { return this.document.viewport; }
	get isActive() { return this.state.active; }
	get document() { return this.editor.document; }
	get activeLayer() { return this.document.activeLayer; }

    getOptionsControl() { return null; }
    activate() {
		this.paused = false;
	}
	deactivate() {
		this.setState({ active: false, temporary: false });
	}

	getCursor() {}
	refreshCursor() {}

	temporaryActivate(evt: any) {
		this.activate();
		this.setState({ active: true, temporary: true });
	}

	freeze() {}
	unfreeze() {}
	lock() { this.locked = true; }
	unlock() { this.locked = false; }

	pause() {
		this.paused = true;
		this.freeze();
	}

	restore() {
		this.paused = false;
		this.unfreeze();
	}

    setActive() {
		this.page.focus();
        this.context.editor.selectTool(this);
        this.activate();
        this.setState({ active: true });
    }

    release() {
        this.deactivate();
        this.setState({ active: false });
    }
}

Object.assign(CommonTool, EventEmitter);