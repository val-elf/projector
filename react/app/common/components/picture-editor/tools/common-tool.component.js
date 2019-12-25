import React from 'react';
import PropTypes from 'prop-types';
import { EventEmitter } from '../document/event-emitter';
import './common-tool.component.less';

class EventComponent extends React.Component {
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

export class CommonTool extends EventComponent {
    static contextTypes = {
        editor: PropTypes.object.isRequired
    }

    state = {
        active: false,
	}

	paused = false;

	get editor() { return this.context.editor; }
	get page() { return this.context.editor.page; }
	get viewport() { return this.page.viewport; }
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

	temporaryActivate() {
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